import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../pages/context";
import { toast, Toaster } from "react-hot-toast";
import {
  FaCalendarCheck,
  FaListAlt,
  FaTicketAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaUserCircle,
} from "react-icons/fa";

function StickyNavbar() {
  const { isLogin, userName, profilePic, setIsLogin } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  // console.log("🛠️ Profile Pic in Navbar:", profilePic);
  const userProfileImage =
    profilePic || localStorage.getItem("profilePic") || "";
  const handleLogout = () => {
    setIsLogin(false);
    localStorage.removeItem("authToken");
    setIsDropdownOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const getUserInitials = (name) => {
    if (!name) return "";

    const nameParts = name.split(" ");
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
    const lastInitial =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1]?.charAt(0).toUpperCase()
        : "";

    return `${firstInitial}${lastInitial}`; // ✅ Returns "UJ" for "Ujjwal Jain"
  };

  const initials = getUserInitials(userName);

  return (
    <div className="w-full">
      <Toaster position="top-center" />
      <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
        <div className="flex items-center justify-between px-16 py-8">
          {/* Logo */}
          <Link
            to="/"
            className="text-pink-600 font-bold text-3xl tracking-widest hover:scale-105 transition-transform pl-8"
          >
            Swap Tickets
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-12">
            <Link
              to="/resell-tickets"
              className="text-black font-semibold text-lg hover:underline hover:text-pink-600 transition-colors"
            >
              Re-sell tickets
            </Link>

            <Link
              to="/create-event"
              className="bg-pink-600 text-white text-lg font-semibold rounded-full px-8 py-4 shadow-md hover:shadow-lg hover:bg-pink-700 transition-all"
            >
              Create an event
            </Link>

            {!isLogin ? (
              <Link
                to="/login-signup"
                className="border border-black text-black text-lg font-semibold rounded-full px-8 py-4 hover:bg-gray-100 hover:border-pink-600 hover:text-pink-600 transition-all"
              >
                Login/Signup
              </Link>
            ) : (
              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={() => {
                  clearTimeout(timeoutRef.current);
                  setIsDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(() => {
                    setIsDropdownOpen(false);
                  }, 100);
                }}
              >
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-4 py-2 transition duration-200"
                >
                  {userProfileImage && !imageLoadError ? (
                    <img
                      src={userProfileImage}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-lg font-semibold text-gray-700">
                      {initials}
                    </div>
                  )}
                  <FaChevronDown
                    className={`text-gray-500 text-base transform transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
                    <ul className="py-2">
                      <li>
                        <Link
                          to="/manage-event"
                          className="flex items-center gap-3 px-6 py-3 text-gray-800 hover:bg-gray-100 transition text-base"
                        >
                          <FaCalendarCheck className="text-pink-600" />
                          Manage Events
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/my-listings"
                          className="flex items-center gap-3 px-6 py-3 text-gray-800 hover:bg-gray-100 transition text-base"
                        >
                          <FaListAlt className="text-pink-600" />
                          My Listings
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/my-bookings"
                          className="flex items-center gap-3 px-6 py-3 text-gray-800 hover:bg-gray-100 transition text-base"
                        >
                          <FaTicketAlt className="text-pink-600" />
                          My Bookings
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-gray-100 transition text-base"
                        >
                          <FaSignOutAlt />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default StickyNavbar;
