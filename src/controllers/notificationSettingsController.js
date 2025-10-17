import {
  getSettingsForUser,
  updateSettingsForUser,
} from "../services/notificationSettingsService.js";

export const handleGetNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await getSettingsForUser(userId);
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const handleUpdateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await updateSettingsForUser(userId, req.body);

    // If user is disabling email notifications, we should mark all events as having had reminders sent
    // to prevent further emails for existing events
    if (
      req.body.hasOwnProperty("email_notifications") &&
      req.body.email_notifications === false
    ) {
      const CalendarEvents = (await import("../models/calendarEvents.js"))
        .default;
      await CalendarEvents.updateMany(
        { user_id: userId, reminder_set: { $ne: true } },
        { reminder_set: true }
      );
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
