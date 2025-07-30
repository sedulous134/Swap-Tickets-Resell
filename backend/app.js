import express from "express";
import cors from "cors";
// import router from "./routes/user.route.js";
import authRouter from "./routes/user.route.js";
import ticketrouter from "./routes/ticket.route.js";
import razorpayRoutes from "./routes/razorpay.route.js";
import dotenv from "dotenv";
import expressSession from 'express-session'; // Import express-session
import cookieParser from 'cookie-parser';
import eventRoutes from "./routes/event.route.js"; // ⬅️ add this
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const port = 8000;
app.use(cookieParser()); 

dotenv.config({ path: './.env' });

console.log(process.env.CORS_ORIGIN); // Optional logging, be cautious about sensitive data

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,  // Allow credentials (cookies)
  methods: ['GET', 'POST' , 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Session management setup for Passport
app.use(expressSession({
  secret: process.env.SESSION_SECRET || 'fallback-secret', 
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure:false,  
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "16kb" }));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});


// Routes
app.use('/auth', authRouter);
app.use("/ticket", ticketrouter);
app.use('/api/razorpay', razorpayRoutes);
app.use("/event", eventRoutes);   

// Server setup
export default app;
 