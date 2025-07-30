import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createEvent,
  getAllEvents,
  getUserEvents,
  getEventById,
} from "../controllers/event.controller.js";

const router = Router();

// Route to create an event
router.post("/create", verifyJWT, createEvent);

// Route to get all events
router.get("/all", getAllEvents);

// Route to get events for the logged-in user
router.get("/myevents", verifyJWT, getUserEvents);

// Route to get a single event by ID
router.get("/:id", getEventById);

export default router;
