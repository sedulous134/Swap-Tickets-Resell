import { Event } from "../models/event.models.js";
import { Ticket } from "../models/ticket.models.js";

// Create a new event
export const createEvent = async (req, res, next) => {
  const { name, eventDate, description } = req.body;

  if (!name || !eventDate || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const event = new Event({
      owner: req.user._id, // Link event to logged-in user
      name,
      eventDate,
      description,
    });

    await event.save();
    return res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event:", error);
    next(error); // Pass error to the error handling middleware
  }
};

// Get all events
export const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate("owner", "name email"); // Populate owner info
    return res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    next(error);
  }
};

// Get events for the logged-in user
export const getUserEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ owner: req.user._id }).populate("owner", "name email");
    return res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching user events:", error);
    next(error);
  }
};

// Get a single event by ID
export const getEventById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id).populate("owner", "name email");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    next(error);
  }
};
