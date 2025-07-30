import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
// import imaps from 'imap-simple';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate Refresh & Access Tokens
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateaccesstoken();
    const refreshToken = user.generaterefreshtoken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); 

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Failed to generate tokens.");
  }
};

// Register User
const registeredUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if ([userName, password, email].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required.");
  }

  const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existingUser) {
    throw new apiError(409, "User with email or username already exists.");
  }

  const user = await User.create({ email, password, userName: userName.toLowerCase() });
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new apiError(500, "Server error, user not registered.");
  }

  return res.status(201).json(new apiResponse(201, createdUser, "User successfully registered."));
});
 
// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!(email || userName)) {
    throw new apiError(400, "Email or username is required.");
  }

  const user = await User.findOne({ $or: [{ userName }, { email }] });
  if (!user) {
    throw new apiError(404, "User not found, please register.");
  }

  const isPasswordValid = await user.ispasswordcorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Incorrect password, try again!");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const cookieOptions = { httpOnly: true, secure: true, sameSite: "Strict" };
  
  console.log("Setting Cookies: accessToken =", accessToken, "refreshToken =", refreshToken);

  return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully."));
});

// Google Login

// const googleOneTapLogin = async (req, res) => {
//   const { credential } = req.body;

//   if (!credential) {
//     return res.status(400).json({ message: "No credential received." });
//   }

//   if (!process.env.GOOGLE_CLIENT_ID) {
//     return res.status(500).json({ message: "Server misconfiguration: Missing Google Client ID" });
//   }

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     console.log("Google user:", payload);

//     const { email, name, picture, sub } = payload;

//     // 🔹 Find or create user in DB
//     let user = await User.findOne({ email });
//     if (!user) {
//       user = await User.create({ email, name, picture, googleId: sub });
//     }

//     // 🔥 Generate JWT token for authentication
//     const token = jwt.sign(
//       { _id: user._id },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "1h" } // Token valid for 1 hour
//     );

//     console.log("✅ Generated Token:", token);

//     // Send token + user info to frontend
//     res.status(200).json({ message: "Google login successful!", user, token });
//   } catch (err) {
//     console.error("❌ Google login failed:", err);
//     res.status(403).json({ message: "Invalid token or origin." });
//   }
// };

const googleOneTapLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "No credential received." });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "Missing Google Client ID" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Google user:", payload);

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      let userName = name?.trim() || email.split("@")[0];

      // Ensure unique username
      let existingUserName = await User.findOne({ userName });
      let counter = 1;
      while (existingUserName) {
        userName = `${userName}${counter}`;
        existingUserName = await User.findOne({ userName });
        counter++;
      }

      user = await User.create({
        email,
        userName,
        profilePic: picture,
        googleId: sub,
      });
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      message: "Google login successful!",
      user,
      token,
    });

  } catch (err) {
    console.error("❌ Google login failed:", err);
    res.status(403).json({ message: "Invalid token or origin." });
  }
};


// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined }, { new: true });

  const cookieOptions = { httpOnly: true, secure: true, sameSite: "Strict" };

  return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new apiResponse(200, {}, "User logged out successfully."));
});

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request. Refresh token is missing.");
  }

  try {
    // Verify the refresh token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Fetch user from the database
    const user = await User.findById(decodedToken?._id);
    
    if (!user) {
      throw new apiError(401, "User not found.");
    }

    // Validate that the incoming refresh token matches the stored refresh token
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Invalid or expired refresh token.");
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id);

    // Set new tokens in cookies (make sure secure and sameSite are properly set for production)
    return res.status(200)
      .cookie("refreshToken", newRefreshToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",  // Secure only in production
        sameSite: "None",  // Allows cross-site cookie use
        maxAge: 24 * 60 * 60 * 1000  // Set expiry to 1 day
      })
      .cookie("accessToken", accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "None", 
        maxAge: 24 * 60 * 60 * 1000  // Set expiry to 1 day
      })
      .json(new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully."));
    
  } catch (error) {
    console.error("❌ Error refreshing access token:", error.message);
    throw new apiError(401, "Access token refresh failed.");
  }
});



// Check User Session (Persistent Login)
// const checkUserSession = asyncHandler(async (req, res) => {
//   const token = req.cookies?.token;

//   if (!token) {
//     return res.status(401).json(new apiResponse(401, {}, "No token provided."));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     const user = await User.findById(decoded._id).select("-password");

//     if (!user) {
//       return res.status(401).json(new apiResponse(401, {}, "User not found."));
//     }

//     return res.status(200).json(new apiResponse(200, {
//       user: {
//         userName: user.userName,
//         email: user.email,
//         profilePic: user.profilePic
//       }
//     }, "User is logged in."));
//   } catch (err) {
//     console.error("❌ Token verification failed:", err);
//     return res.status(401).json(new apiResponse(401, {}, "Invalid or expired token."));
//   }
// });

const checkUserSession = asyncHandler(async (req, res) => {
  // ✅ Check for token in both cookies & Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json(new apiResponse(401, {}, "No token provided."));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json(new apiResponse(401, {}, "User not found."));
    }

    return res.status(200).json(new apiResponse(200, {
      user: {
        userName: user.userName,
        email: user.email,
        profilePic: user.profilePic
      }
    }, "User is logged in."));
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    return res.status(401).json(new apiResponse(401, {}, "Invalid or expired token."));
  }
});
 

// Change Current Password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.ispasswordcorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Incorrect old password.");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, {}, "Password changed successfully."));
});

// const verifyTicketForwarded = asyncHandler(async (req, res) => {
//   console.log("Incoming request:", req.method, req.originalUrl);
//   const { email } = req.body;

//   if (!email) {
//     console.log("No email provided.");
//     return res.status(400).json(new apiResponse(400, {}, "❌ Email is required."));
//   }


//   const imapConfig = {
//     user: process.env.EMAIL_USERNAME,
//     password: process.env.EMAIL_APP_PASSWORD, // Use Gmail App Password here
//     host: "imap.gmail.com",
//     port: 993,
//     tls: true,
//     tlsOptions: { rejectUnauthorized: false },
//   };

//   try {
//     const emailFound = await new Promise((resolve, reject) => {
//       const imap = new Imap(imapConfig);

//       imap.once("ready", () => {
//         imap.openBox("INBOX", true, (err, box) => {
//           if (err) {
//             imap.end();
//             return reject(new apiError(500, "Error opening inbox."));
//           }

//           const searchCriteria = ["UNSEEN", ["SINCE", "20-Apr-2025"]]; 
//           const fetchOptions = {
//             bodies: ["HEADER", "TEXT"], // ⬅️ ensure headers are fetched
//             struct: true,
//           };


//           imap.search(searchCriteria, (err, results) => {
//             if (err) {
//               imap.end();
//               return reject(new apiError(500, "Error searching emails."));
//             }

//             if (!results.length) {
//               imap.end();
//               return resolve(false); // No emails found
//             }

//             const fetch = imap.fetch(results, fetchOptions);
//             const parsePromises = [];

//             fetch.on("message", (msg) => {
//               parsePromises.push(
//                 new Promise((resolve) => {
//                   msg.on("body", (stream) => {
//                     simpleParser(stream, (err, parsed) => {
//                       if (err) {
//                           console.log("❌ simpleParser error:", err);
//                           return resolve(false);
//                       }

//                       const isToAppEmail = parsed.to?.value?.some(
//                         (recipient) => recipient.address.toLowerCase() === "swaptickets001@gmail.com"
//                       );
//                       const isFromUserEmail = parsed.from?.value?.some(
//                         (sender) => sender.address.toLowerCase() === email.toLowerCase()
//                       );
                      

//                       const keywords = [
//                         "ticket",
//                         "confirmation",
//                         "booking",
//                         "Booking ID",
//                         "Event",
//                         "Seat No",
//                       ];
//                       const body = parsed.text || parsed.html || "";

//                       const containsKeyword = keywords.some((keyword) =>
//                         body.toLowerCase().includes(keyword.toLowerCase())
//                       );

//                       console.log("From:", parsed.from?.text);
//                       console.log("To:", parsed.to?.text);
//                       console.log("Subject:", parsed.subject);
//                       console.log("Body:", body.slice(0, 200)); // Print first 200 chars

//                       resolve(isToAppEmail && isFromUserEmail && containsKeyword);
//                     });
//                   });
//                 })
//               );
//             });

//             fetch.once("end", async () => {
//               const matches = await Promise.all(parsePromises);
//               const found = matches.includes(true);
//               imap.end();
//               resolve(found);
//             });
//           });
//         });
//       });

//       imap.once("error", (err) => {
//         reject(new apiError(500, `IMAP connection error: ${err.message}`));
//       });

//       imap.once("end", () => {
//         console.log("📨 IMAP connection closed.");
//       });

//       imap.connect();
//     });

//     if (emailFound) {
//       return res.status(200).json(new apiResponse(200, {}, "✅ Ticket forwarded successfully."));
//     } else {
//       return res.status(404).json(new apiResponse(404, {}, "❌ No valid ticket found in forwarded emails."));
//     }
//   } catch (error) {
//     console.error("Error verifying ticket:", error);
//     throw new apiError(500, "Error verifying the ticket. Please try again later.");
//   }
// });

const verifyTicketForwarded = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(400, "Email is required.");
  }

  // Mocked email data simulating parsed email from Gmail
  const mockedEmails = [
    {
      from: [{ address: "itsmeuj8766@gmail.com" }],
      to: [{ address: "swaptickets001@gmail.com" }],
      subject: "Ticket Forwarded",
      text: "Here is your Booking ID: 12345\nSeat No: A1\nEvent: Avengers",
    },
    {
      from: [{ address: "randomuser@example.com" }],
      to: [{ address: "someoneelse@gmail.com" }],
      subject: "Not Relevant",
      text: "Some random message",
    }
  ];

  const emailFound = mockedEmails.some(emailObj => {
    const isToAppEmail = emailObj.to.some(
      recipient => recipient.address.toLowerCase() === "swaptickets001@gmail.com"
    );
    const isFromUserEmail = emailObj.from.some(
      sender => sender.address.toLowerCase() === email.toLowerCase()
    );

    const keywords = [
      "ticket",
      "confirmation",
      "booking",
      "Booking ID",
      "Event",
      "Seat No",
    ];

    const body = emailObj.text || "";
    const containsKeyword = keywords.some(keyword =>
      body.toLowerCase().includes(keyword.toLowerCase())
    );

    return isToAppEmail && isFromUserEmail && containsKeyword;
  });

  if (emailFound) {
    return res
      .status(200)
      .json(new apiResponse(200, {}, "✅ Ticket forwarded successfully."));
  } else {
    return res
      .status(404)
      .json(new apiResponse(404, {}, "❌ No valid ticket found in forwarded emails."));
  }
});



export { registeredUser, loginUser, logoutUser, refreshAccessToken, checkUserSession, changeCurrentPassword , googleOneTapLogin ,verifyTicketForwarded};
