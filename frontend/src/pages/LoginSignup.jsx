import React, { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./context";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
// import { useGoogleOneTapLogin } from '@react-oauth/google';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-200 via-green-100 to-blue-100 px-4 overflow-hidden">
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-white p-8 rounded-3xl animate__animated animate__fadeIn">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 text-center tracking-wide">
          {isLogin ? "Login to Your Account" : "Create an Account"}
        </h2>

        {isLogin ? <Login /> : <Signup />}

        <div className="mt-6 text-center">
          <button
            className="text-teal-500 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Signup"
              : "Already have an account? Login"}
          </button>
        </div>
        <div className="mt-6 text-center">
          <button
            className="bg-gray-300 text-indigo-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-600 hover:text-white transition duration-300"
            onClick={() => navigate("/home")}
          >
            ⬅ Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLogin,refreshSession } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    axios
      .post(
        "http://localhost:8000/ticket/login",
        { email, password },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Login successful!");
        setIsLogin(true);
        if (res.data.token) {
          localStorage.setItem("authToken", res.data.token); // ✅ Store token
          // localStorage.setItem("profilePic", data.user.profilePic)
          toast.success("Login successful!");
        } else {
          toast.error("Login failed: No token received.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Invalid credentials. Please try again.");
      });
  };

  const handleGoogleLogin = (credentialResponse) => {
    axios
      .post("http://localhost:8000/auth/google/onetap", {
        credential: credentialResponse.credential, // ✅ Send Google credential
      })
      .then((res) => {
        console.log("🔍 Google Login Response:", res.data); // ✅ Debugging
  
        if (res.data.token) {
          localStorage.setItem("authToken", res.data.token); // ✅ Store token
          localStorage.setItem("profilePic", res.data.user.profilePic || "")
          console.log("🛠️ Stored Profile Pic in LocalStorage:", localStorage.getItem("profilePic")); // 🔥 Debug log
          toast.success("Login successful!");
          // setIsLogin(true);
           if (refreshSession) refreshSession();
        } else {
          console.error("❌ No token received from backend.");
          toast.error("Login failed: No token received.");
        }
      })
      .catch((err) => {
        console.error("❌ Google login failed:", err);
        toast.error("Google login failed.");
      });
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-gray-700 text-lg font-semibold mb-2">
          Email
        </label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-lg font-semibold mb-2">
          Password
        </label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition duration-200"
      >
        Login
      </button>

      <div className="mt-4 text-center">
        <GoogleLogin
          clientId="806279261028-mmoc8fdjpfnr89tqe0quiac9v4nporrc.apps.googleusercontent.com"
          onSuccess={handleGoogleLogin}
          onError={() => toast.error("Google login failed!")}
          cookiePolicy="single_host_origin" // Important for localhost origins
          useOneTap // Enables Google One Tap
        />

        {/* <button onClick={()=>login()}>Sign in </button> */}
      </div>
    </form>
  );
};

// Signup Component
const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  const isPasswordValid = Object.values(requirements).every(Boolean);

  useEffect(() => {
    if (isPasswordValid) setShowTooltip(false);
  }, [isPasswordValid]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Please meet all password requirements.");
      return;
    }

    axios
      .post("http://localhost:8000/auth/register", {
        userName: name,
        email,
        password,
      })
      .then(() => {
        toast.success("Signup successful! You can now log in.");
        setTimeout(() => {
          window.location.href = "/login-signup";
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
        toast.error("An error occurred. Please try again.");
      });
  };

  const handlePasswordFocus = () => setShowTooltip(true);
  const handlePasswordBlur = () => {
    if (!isPasswordValid) {
      setTimeout(() => setShowTooltip(false), 200);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="mb-6">
        <label className="block text-gray-700 text-lg font-semibold mb-2">
          Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-lg font-semibold mb-2">
          Email
        </label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>

      <div className="mb-6 relative">
        <label className="block text-gray-700 text-lg font-semibold mb-2">
          Password
        </label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={handlePasswordFocus}
          onBlur={handlePasswordBlur}
          placeholder="Create a strong password"
        />

        {showTooltip && (
          <div
            ref={tooltipRef}
            className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-md p-4 z-10 w-full"
          >
            <p className="text-gray-700 mb-2 font-semibold">
              Password must include:
            </p>
            <ul className="text-sm space-y-1">
              <li
                className={`flex items-center ${
                  requirements.length ? "text-green-600" : "text-red-500"
                }`}
              >
                <span className="mr-2">
                  {requirements.length ? "✅" : "❌"}
                </span>{" "}
                At least 8 characters
              </li>
              <li
                className={`flex items-center ${
                  requirements.uppercase ? "text-green-600" : "text-red-500"
                }`}
              >
                <span className="mr-2">
                  {requirements.uppercase ? "✅" : "❌"}
                </span>{" "}
                An uppercase letter (A–Z)
              </li>
              <li
                className={`flex items-center ${
                  requirements.lowercase ? "text-green-600" : "text-red-500"
                }`}
              >
                <span className="mr-2">
                  {requirements.lowercase ? "✅" : "❌"}
                </span>{" "}
                A lowercase letter (a–z)
              </li>
              <li
                className={`flex items-center ${
                  requirements.number ? "text-green-600" : "text-red-500"
                }`}
              >
                <span className="mr-2">
                  {requirements.number ? "✅" : "❌"}
                </span>{" "}
                A number (0–9)
              </li>
            </ul>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition duration-200"
      >
        Signup
      </button>
    </form>
  );
};

export default LoginSignup;