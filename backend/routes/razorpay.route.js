import express from 'express';
import razorpayInstance from '../razorpayConfig.js'; // Import the razorpayInstance from config
import crypto from 'crypto';
const router = express.Router();
import { sendConfirmationEmail } from "../services/emailService.js"; // Import the email service

// Endpoint to create an order
router.post('/create-order', async (req, res) => {
  const { amount } = req.body; // Amount should be passed from frontend in rupees

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid or missing amount' });
  }

  const options = {
    amount: amount * 100, // Razorpay expects the amount in paise (1 INR = 100 paise)
    currency: 'INR',
    receipt: `receipt_${Math.floor(Math.random() * 1000000)}`, // Dynamic receipt ID generation
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    return res.status(201).json(order); // Send the order details back to the frontend
  } catch (error) {
    console.error("Error creating Razorpay order: ", error);
    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// router.post("/verify-payment", async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, ticket } = req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
//     .update(body.toString())
//     .digest("hex");

//   const isAuthentic = expectedSignature === razorpay_signature;

//   if (isAuthentic) {
//     // Save order info to DB if needed
//     return res.status(200).json({ success: true, message: "Payment verified" });
//   } else {
//     return res.status(400).json({ success: false, message: "Invalid signature" });
//   }
// });

router.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userEmail, movieDetails } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userEmail || !movieDetails) {
    return res.status(400).json({ success: false, message: "Missing payment or user details" });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  try {
    // ✉️ **Send Ticket Confirmation Email**
    await sendConfirmationEmail(userEmail, {
      title: movieDetails.title,
      date: movieDetails.date,
      poster: movieDetails.poster || "https://via.placeholder.com/150", // Fallback poster if not provided
      time: movieDetails.time || "7:00 PM",
      venue: "PVR Cinemas",
      seats: [movieDetails.seat || "General"],
    });

    console.log(`✅ Payment verified & confirmation email sent to ${userEmail}`);
    return res.status(200).json({ success: true, message: "Payment verified & email sent!" });

  } catch (error) {
    console.error("❌ Error processing payment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
