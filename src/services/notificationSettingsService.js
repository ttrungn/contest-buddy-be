import NotificationSettings, {
  REMINDER_TIMINGS,
} from "../models/notificationSettings.js";

export const getSettingsForUser = async (userId) => {
  let settings = await NotificationSettings.findOne({ user_id: userId }).lean();
  if (!settings) {
    settings = await NotificationSettings.create({ user_id: userId });
    settings = settings.toObject();
  }
  return settings;
};

export const updateSettingsForUser = async (userId, updates) => {
  const allowed = [
    "email_notifications",
    "push_notifications",
    "reminder_timings",
    "competition_updates",
    "collaboration_requests",
    "achievement_sharing",
  ];
  const payload = {};
  for (const key of allowed) {
    if (key in updates) payload[key] = updates[key];
  }
  if (payload.reminder_timings) {
    const valid =
      Array.isArray(payload.reminder_timings) &&
      payload.reminder_timings.every((v) =>
        Object.values(REMINDER_TIMINGS).includes(v)
      );
    if (!valid) throw new Error("Invalid reminder_timings");
  }
  const settings = await NotificationSettings.findOneAndUpdate(
    { user_id: userId },
    { $set: payload },
    { new: true, upsert: true }
  ).lean();
  return settings;
};

export default { getSettingsForUser, updateSettingsForUser };
