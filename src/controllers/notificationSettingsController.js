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
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
