import NotificationSettings, {
  REMINDER_TIMINGS,
} from "../models/notificationSettings.js";
import { findUpcomingEventsNeedingReminders } from "./calendarEventsService.js";
import { sendMail, isEmailEnabled } from "./mailerService.js";
import User from "../models/user.js";
import CompetitionParticipants, {
  PARTICIPANT_STATUSES,
} from "../models/competitionParticipants.js";
import CalendarEvents from "../models/calendarEvents.js";

// Múi giờ Việt Nam (UTC+7)
const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

// Convert reminder timing to milliseconds
const timingToMs = (timing) => {
  switch (timing) {
    case REMINDER_TIMINGS.ONE_HOUR:
      return 60 * 60 * 1000;
    case REMINDER_TIMINGS.THREE_HOURS:
      return 3 * 60 * 60 * 1000;
    case REMINDER_TIMINGS.ONE_DAY:
      return 24 * 60 * 60 * 1000;
    case REMINDER_TIMINGS.THREE_DAYS:
      return 3 * 24 * 60 * 60 * 1000;
    case REMINDER_TIMINGS.ONE_WEEK:
      return 7 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
};

// Chuyển đổi milliseconds thành chuỗi đếm ngược dễ đọc
const formatCountdown = (msRemaining) => {
  const seconds = Math.floor((msRemaining / 1000) % 60);
  const minutes = Math.floor((msRemaining / (1000 * 60)) % 60);
  const hours = Math.floor((msRemaining / (1000 * 60 * 60)) % 24);
  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));

  let result = "";
  if (days > 0) result += `${days} ngày `;
  if (hours > 0 || days > 0) result += `${hours} giờ `;
  if (minutes > 0 || hours > 0 || days > 0) result += `${minutes} phút`;

  return result.trim();
};

const emitReminder = async (io, event, windowMs) => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: VIETNAM_TIMEZONE })
  );
  const eventTime = new Date(event.start_date);
  const msRemaining = eventTime.getTime() - now.getTime();
  const countdown = formatCountdown(msRemaining);

  io.to(`user:${event.user_id}`).emit("calendar:reminder", {
    eventId: event.id,
    title: event.title,
    startDate: event.start_date,
    type: event.type,
    location: event.location,
    countdown: countdown,
  });
};

const sendEmailReminderIfEnabled = async (event, userSettings, user) => {
  if (!userSettings?.email_notifications) return;
  if (!isEmailEnabled()) return;
  if (!user?.email) return;

  // Tính toán thời gian còn lại
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: VIETNAM_TIMEZONE })
  );
  const eventTime = new Date(event.start_date);
  const msRemaining = eventTime.getTime() - now.getTime();
  const countdown = formatCountdown(msRemaining);

  const subject = `Nhắc lịch: ${event.title}`;
  // Sử dụng múi giờ Việt Nam (UTC+7) cho thời gian
  const start = new Date(event.start_date).toLocaleString("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
  });
  const location = event.location ? ` tại ${event.location}` : "";
  const text = `Sự kiện sắp diễn ra: ${event.title} vào ${start}${location}. Còn ${countdown} nữa.`;
  const html = `<p>Sự kiện sắp diễn ra: <strong>${event.title}</strong></p>
  <p>Thời gian: ${start} (còn <strong>${countdown}</strong> nữa)</p>
  ${event.location ? `<p>Địa điểm: ${event.location}</p>` : ""}
  ${event.description ? `<p>Mô tả: ${event.description}</p>` : ""}
  <p>Cám ơn bạn đã sử dụng Trang thông tin của chúng tôi!</p>`;

  try {
    await sendMail({ to: user.email, subject, text, html });
  } catch (e) {
    // ignore failures; socket reminder already sent
  }
};

export const startReminderScheduler = (io) => {
  const INTERVAL_MS = 60 * 1000; // check every minute

  const tick = async () => {
    // Sử dụng múi giờ Việt Nam (UTC+7) cho thời gian hiện tại
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: VIETNAM_TIMEZONE })
    );

    // Load users' settings
    const settingsByUser = new Map();
    const settingsList = await NotificationSettings.find({}).lean();
    for (const s of settingsList) {
      settingsByUser.set(s.user_id, s);
    }

    // Gather all windows to check (union of all reminder timings)
    const uniqueWindows = new Set();
    for (const s of settingsList) {
      const timings =
        s.reminder_timings && s.reminder_timings.length
          ? s.reminder_timings
          : [REMINDER_TIMINGS.ONE_DAY];
      for (const t of timings) uniqueWindows.add(timingToMs(t));
    }

    // If no settings yet, default to 1-day window
    if (uniqueWindows.size === 0)
      uniqueWindows.add(timingToMs(REMINDER_TIMINGS.ONE_DAY));

    // For each window, find upcoming events and emit to respective users who opted in
    for (const windowMs of uniqueWindows) {
      const upcoming = await findUpcomingEventsNeedingReminders(now, windowMs);

      // Preload users for these events to get emails
      const userIds = Array.from(new Set(upcoming.map((e) => e.user_id)));
      const users = await User.find({ id: { $in: userIds } })
        .select({ id: 1, email: 1 })
        .lean();
      const userById = new Map(users.map((u) => [u.id, u]));

      for (const ev of upcoming) {
        // Skip events that already have reminders set
        if (ev.reminder_set) {
          continue;
        }

        // Only send reminders for competition-linked events where the user is registered
        if (!ev.competition_id) {
          // Skip non-competition events per requirement
          continue;
        }

        const isRegistered = await CompetitionParticipants.findOne({
          competition_id: ev.competition_id,
          user_id: ev.user_id,
          status: PARTICIPANT_STATUSES.REGISTERED,
        })
          .select({ id: 1 })
          .lean();
        if (!isRegistered) continue;

        const userSettings = settingsByUser.get(ev.user_id);
        const timings = userSettings?.reminder_timings?.length
          ? userSettings.reminder_timings
          : [REMINDER_TIMINGS.ONE_DAY];
        const acceptedWindows = new Set(timings.map(timingToMs));
        if (acceptedWindows.has(windowMs)) {
          await emitReminder(io, ev, windowMs);
          // Attempt email if enabled
          await sendEmailReminderIfEnabled(
            ev,
            userSettings,
            userById.get(ev.user_id)
          );

          // Mark the event as having had reminders sent
          await CalendarEvents.findOneAndUpdate(
            { id: ev.id },
            { reminder_set: true }
          );
        }
      }
    }
  };

  // Start interval
  const interval = setInterval(() => {
    tick().catch(() => {});
  }, INTERVAL_MS);

  return () => clearInterval(interval);
};

export default { startReminderScheduler };
