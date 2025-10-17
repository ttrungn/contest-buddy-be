import { v4 as uuidv4 } from "uuid";
import CalendarEvents, { EVENT_TYPES } from "../models/calendarEvents.js";

// These functions are now only used internally by the system
// and not exposed via public API endpoints
const createEvent = async (userId, payload) => {
  const {
    title,
    start_date,
    end_date,
    type,
    description,
    location,
    competition_id,
  } = payload;

  if (!title || !start_date || !end_date || !type) {
    throw new Error("title, start_date, end_date, type are required");
  }

  if (!Object.values(EVENT_TYPES).includes(type)) {
    throw new Error("Invalid event type");
  }

  const event = await CalendarEvents.create({
    id: uuidv4(),
    user_id: userId,
    competition_id: competition_id || undefined,
    title,
    start_date: new Date(start_date),
    end_date: new Date(end_date),
    type,
    description: description || "",
    location: location || "",
  });

  return event.toObject();
};

const getEventById = async (userId, eventId) => {
  const event = await CalendarEvents.findOne({
    id: eventId,
    user_id: userId,
  }).lean();
  if (!event) throw new Error("Event not found");
  return event;
};

export const listUserEvents = async (userId, { from, to, type } = {}) => {
  const query = { user_id: userId };
  if (from || to) {
    query.start_date = {};
    if (from) query.start_date.$gte = new Date(from);
    if (to) query.start_date.$lte = new Date(to);
  }
  if (type && Object.values(EVENT_TYPES).includes(type)) {
    query.type = type;
  }
  const events = await CalendarEvents.find(query)
    .sort({ start_date: 1 })
    .lean();
  return events;
};

// These functions are now only used internally by the system
// and not exposed via public API endpoints
const updateEvent = async (userId, eventId, updates) => {
  const allowed = [
    "title",
    "start_date",
    "end_date",
    "type",
    "description",
    "location",
    "competition_id",
    "reminder_set",
  ];

  const payload = {};
  for (const key of allowed) {
    if (key in updates) {
      payload[key] = updates[key];
    }
  }

  if (payload.type && !Object.values(EVENT_TYPES).includes(payload.type)) {
    throw new Error("Invalid event type");
  }
  if (payload.start_date) payload.start_date = new Date(payload.start_date);
  if (payload.end_date) payload.end_date = new Date(payload.end_date);

  const updated = await CalendarEvents.findOneAndUpdate(
    { id: eventId, user_id: userId },
    payload,
    { new: true }
  ).lean();
  if (!updated) throw new Error("Event not found");
  return updated;
};

const deleteEvent = async (userId, eventId) => {
  const result = await CalendarEvents.findOneAndDelete({
    id: eventId,
    user_id: userId,
  }).lean();
  if (!result) throw new Error("Event not found");
  return { success: true };
};

export const findUpcomingEventsNeedingReminders = async (now, windowMs) => {
  const from = new Date(now.getTime());
  const to = new Date(now.getTime() + windowMs);
  const events = await CalendarEvents.find({
    start_date: { $gte: from, $lte: to },
    reminder_set: { $ne: true }, // Only get events that haven't had reminders sent
  }).lean();
  return events;
};

export default {
  listUserEvents,
  findUpcomingEventsNeedingReminders,
  // Keep these internal functions available for internal system use
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
};
