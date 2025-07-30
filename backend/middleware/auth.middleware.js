import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"; 
import { refreshAccessToken } from "../controllers/user.controller.js"; 

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // console.log("🛠️ Headers Received:", req.headers);
  const accessToken = req.header("Authorization")?.replace("Bearer ", ""); // ✅ Use headers only

  // const accessToken =
  //   req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    
  // console.log("🔑 Received Token:", accessToken); // ✅ Debugging

  if (!accessToken) {
    console.log("❌ No access token found in cookies or headers");
    throw new apiError(401, "Authorization failed or unauthorized access.");
  }

  try {
    // ✅ Verify JWT token
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // console.log("🔍 Decoded JWT Payload:", decoded);
    
    // ✅ Attach user details from DB
    req.user = await User.findById(decoded._id).select("-password");

    if (!req.user) {
      throw new apiError(401, "Unauthorized: User not found.");
    }

    return next();
  } catch (err) {
    console.log("⚠️ Token verification failed:", err.message);

    // 🔹 Handle expired token by attempting refresh
    if (err.name === "TokenExpiredError") {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        console.log("❌ No refresh token found.");
        throw new apiError(401, "Session expired. Please log in again.");
      }

      try {
        const newAccessToken = await refreshAccessToken(refreshToken);

        if (!newAccessToken) {
          throw new apiError(401, "Refresh failed. Please log in again.");
        }

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        const refreshedDecoded = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN_SECRET); // ✅ Verify refreshed token
        req.user = await User.findById(refreshedDecoded._id).select("-password");

        if (!req.user) {
          throw new apiError(401, "Unauthorized: Refreshed user not found.");
        }

        return next();
      } catch (refreshErr) {
        console.log("❌ Refresh token failed:", refreshErr.message);
        throw new apiError(401, "Session expired. Please log in again.");
      }
    }

    throw new apiError(401, "Invalid or expired token.");
  }
});
