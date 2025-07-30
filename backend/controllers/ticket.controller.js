import { Ticket } from "../models/ticket.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

// 🟢 1. List a ticket for resale
const listTicketForResale = async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      numberOfTickets,
      date,
      time,
      price,
      description,
    } = req.body;

    if (!movieId || !movieTitle || !price) {
      throw new apiError(400, "❌ Missing required fields.");
    }

    const ticket = await Ticket.create({
      owner: req.user._id,
      movieId,
      movieTitle,
      numberOfTickets,
      availableTickets: numberOfTickets,
      date,
      time,
      price,
      description,
      status: "available", // Set status to 'available' for listing
    });

    console.log("🎟️ Incoming resale ticket data:", req.body);
    console.log("👤 Authenticated user:", req.user);

    return res
      .status(201)
      .json(new apiResponse(201, ticket, "✅ Ticket listed for resale"));
  } catch (error) {
    console.error("❌ Error listing ticket:", error.message);
    return res
      .status(500)
      .json(new apiResponse(500, {}, "Internal Server Error"));
  }
};

// 🟢 2. Get all listed tickets (available to all)
const getAllResellTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: "available" }).sort({ createdAt: -1 });
    return res.status(200).json(new apiResponse(200, tickets, "🎟️ Tickets retrieved"));
  } catch (error) {
    console.error("❌ Error fetching tickets:", error.message);
    return res.status(500).json(new apiResponse(500, {}, "Internal Server Error"));
  }
};


const getUserResellTickets = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: User not found!" });
    }

    const userId = req.user._id;
    console.log("Fetching listings for user:", userId);

    const userTickets = await Ticket.find({ owner: userId });
    res.status(200).json(new apiResponse(200, userTickets, "🎟️ User-specific tickets retrieved"));
  } catch (err) {
    console.error("❌ Error fetching user tickets:", err);
    res.status(500).json({ error: "Failed to fetch listings." });
  }
};



// 🟢 3. Get all available tickets for a specific movie
const getResellTicketsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;  // Get movieId from the URL
    console.log("Fetching tickets for movieId:", movieId); // Log movieId to check
    const tickets = await Ticket.find({ movieId, status: 'available' });

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "No tickets available for this movie" });
    }

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Server error while fetching tickets." });
  }
};



const buyResellTicket = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: User not found!" });
    }

    const { ticketId } = req.params;
    const userId = req.user._id;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new apiError(404, "❌ Ticket not found.");
    }

    if (ticket.availableTickets <= 0) {
      throw new apiError(400, "❌ Ticket not available for purchase.");
    }

    ticket.availableTickets -= 1;

    if (ticket.availableTickets === 0) {
      ticket.status = "sold";
      ticket.buyer = userId; // 🔥 Store the buyer ID
    }

    await ticket.save();

    return res.status(200).json(new apiResponse(200, ticket, "✅ Ticket purchased successfully"));
  } catch (error) {
    console.error("❌ Error buying ticket:", error.message);
    return res.status(500).json(new apiResponse(500, {}, "Internal Server Error"));
  }
};


export { buyResellTicket, getAllResellTickets, listTicketForResale ,getUserResellTickets ,getResellTicketsByMovie};
