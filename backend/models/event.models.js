import mongoose from "mongoose"

const eventSchema = new mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // typo fix: Type -> Types
      required: true, // Important to ensure each event is tied to a user
    },
    eventDate: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    ticketAvailablity: {
      type: Boolean,
      required: true,
      default: true,
    },
    description: {
      type: String,
      required: true,
    },
  }, { timestamps: true });
  

export const Event = mongoose.model("Event",eventSchema);