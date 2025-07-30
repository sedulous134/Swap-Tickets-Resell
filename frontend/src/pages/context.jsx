import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log("🔁 AuthProvider mounted");
  const [isLogin, setIsLogin] = useState(false);
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const clearAuth = () => {
    setIsLogin(false);
    setUserName("");
    setProfilePic("");
  };

 const checkUserSession = async () => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("⚠️ No auth token found, clearing session.");
      clearAuth();
      return;
    }

    const res = await axios.get("http://localhost:8000/auth/session", {
      headers: { Authorization: `Bearer ${token}` }, 
      withCredentials: true,
    });

    console.log("✅ API Response:", res.data); // 🔥 Debug full response

    // ✅ Extract the correct user object
    const user = res.data.data?.user; 

    if (user) {
      console.log("🛠️ Extracted User Data:", user); // 🔥 Debug user object
      setIsLogin(true);
      setUserName(user.userName);
      setProfilePic(user.profilePic || "");
      setUserEmail(user.email);
    } else {
      console.warn("⚠️ No user data received. Clearing auth.");
      clearAuth();
    }
  } catch (error) {
    console.error("❌ Session API Error:", error);
    clearAuth();
    toast.error("Session expired. Please log in again.");
  }
};

  useEffect(() => {
    const localPic = localStorage.getItem("profilePic");
    const localName = localStorage.getItem("userName");
    const localEmail = localStorage.getItem("userEmail");

    if (localPic || localName) {
      setIsLogin(true);
      setProfilePic(localPic);
      setUserName(localName);
      setUserEmail(localEmail);
    }

    checkUserSession(); // Always try server-side validation too
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLogin,
        setIsLogin,
        userName,
        setUserName,
        profilePic,
        userEmail,
        setProfilePic,
        refreshSession: checkUserSession,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
