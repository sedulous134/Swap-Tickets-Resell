import { Router } from "express";
import { Ticket } from "../models/ticket.models.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  listTicketForResale,
  getAllResellTickets,
  buyResellTicket,
  getUserResellTickets,
  getResellTicketsByMovie
} from "../controllers/ticket.controller.js";

const router = Router();

// List ticket for resale (requires login)
router.post("/resell/list", verifyJWT, listTicketForResale);

//  Get all resell tickets (open to all users)
router.get("/resell/all", getAllResellTickets);

//user specific tickets 
router.get("/resell/mine", verifyJWT, getUserResellTickets);

router.get("/resell/movie/:movieId", getResellTicketsByMovie);

// Buy a listed resell ticket (requires login)
router.post("/resell/:ticketId/buy", verifyJWT, buyResellTicket);

// router.delete("/resell/:id", verifyJWT, async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ error: "Unauthorized: User not found!" });
//     }

//     const userId = req.user._id;
//     const ticketId = req.params.id;

//     console.log("🛠️ Deleting Ticket with ID:", ticketId); // ✅ Debugging

//     const ticket = await Ticket.findById(ticketId);

//     if (!ticket) {
//       console.error("❌ Ticket not found in database.");
//       return res.status(404).json({ error: "Ticket not found!" });
//     }

//     if (ticket.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ error: "You can't delete this ticket!" });
//     }

//     await Ticket.findByIdAndDelete(ticketId);
//     res.json({ message: "Listing deleted successfully!" });
//   } catch (err) {
//     console.error("❌ Error deleting ticket:", err);
//     res.status(500).json({ error: "Failed to delete listing due to server error." });
//   }
// });



router.delete("/resell/:id", verifyJWT, async (req, res) => {
  try {
    const ticketId = req.params.id;
    console.log("🛠️ Attempting to delete Ticket ID:", ticketId);

    const deletedTicket = await Ticket.findById(ticketId);

    if (!deletedTicket) {
      console.error(`❌ Ticket with ID ${ticketId} not found.`);
      return res.status(404).json({ error: "Ticket not found!" });
    }

    // 🔥 Ensure ALL tickets for the same movie & user are removed  
    await Ticket.deleteMany({ movieId: deletedTicket.movieId, owner: req.user._id });

    const remainingTickets = await Ticket.find({ movieId: deletedTicket.movieId });

    console.log("✅ Remaining Tickets for Movie AFTER Full Deletion:", remainingTickets);

    res.json({ message: "Listing deleted successfully!", remainingTickets });
  } catch (err) {
    console.error("❌ Error deleting ticket:", err);
    res.status(500).json({ error: "Failed to delete listing due to server error." });
  }
});



router.get("/bookings", verifyJWT, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: User not found!" });
    }

    const userId = req.user._id;

    // 🔹 Fetch tickets bought by the user (uses `buyer` now)
    const purchasedTickets = await Ticket.find({ buyer: userId }).populate("owner buyer");
    console.log("✅ Fetched user bookings with movie details:", purchasedTickets); // 🚀 Debugging

    res.json(purchasedTickets);
  } catch (err) {
    console.error("❌ Error fetching user bookings:", err);
    res.status(500).json({ error: "Failed to load bookings." });
  }
});

// POST /ticket/book
router.post("/book", verifyJWT, async (req, res) => {
  try {
    const { movieId, movieTitle, price,seat, date, time } = req.body;

    const newTicket = new Ticket({
      owner: req.user.id,   
      buyer: req.user.id,
      movieId,
      movieTitle,
      seat: seat || "General",
      price,
      date,
      time,
    });

    await newTicket.save();
    console.log("✅ New booking saved:", newTicket)
    res.status(201).json({ success: true, ticket: newTicket });
  } catch (error) {
    console.error("Error booking ticket:", error);
    res.status(500).json({ success: false, message: "Booking failed." });
  }
});





export default router;
