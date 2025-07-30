import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true, // Ensures a ticket has an owner
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // 🔥 Buyer is null until someone buys the ticket
    },
    seat:{
      type: String, // Seat number or type (e.g., General, VIP)
      default: "General", // Default to General if not specified
    },
    movieId: {
      type: String, // Assuming movie ID from external API (like TMDB)
      required: true, 
    },
    movieTitle: {
      type: String, 
      required: true, // Movie title for display
    },
    numberOfTickets: {
      type: Number,
      required: true,
      default: 0, // Default to 1 ticket if not specified
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null, // Null means it's not tied to a custom event
    },
    availableTickets: {
      type: Number,
      required: true,
      default: 1, // Initially, all tickets are available
    },
    date: {
      type: String, // Date when tickets are available
      // required: true,
    },
    time: {
      type: String, // Time of the event or movie screening
      // required: true,
    },
    price: {
      type: Number, // Price per ticket
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["listed", "available", "sold"], 
      default: "available", // Initially, the ticket status is pending
    },
    description: {
      type: String, // Optional field for any additional details about the ticket
      default: "",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
