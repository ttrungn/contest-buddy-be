import { listUserEvents } from "../services/calendarEventsService.js";

export const handleListUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to, type } = req.query;
    const events = await listUserEvents(userId, { from, to, type });
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
