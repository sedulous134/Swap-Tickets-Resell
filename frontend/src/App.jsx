import React, { useContext } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/Mainlayout";
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";
import CreateEvent from "./pages/CreateEvent";
import ResellTickets from "./pages/ResellTickets";
// Import the MovieForm component
import { AuthContext } from "./pages/context";
// import GoogleRedirectHandler from "./pages/GoogleRedirectHandler.jsx";
import MovieForm from "./components/Movieform.jsx";
import MyListings from "./pages/Mylistings.jsx";
import ThankYou from "./pages/Thankyou.jsx";
import ManageEvent from "./pages/ManageEvent.jsx";
import MyBookings from "./pages/Mybooking.jsx";

// PrivateRoute component for handling authentication
const PrivateRoute = ({ children }) => {
  const { isLogin } = useContext(AuthContext);
  return isLogin ? children : <Navigate to="/login-signup" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect from / to /home */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* MainLayout wrapper for all pages */}
        <Route path="/" element={<MainLayout />}>
          {/* Home route */}
          <Route path="/home" element={<Home />} />
          <Route
            path="/my-listings"
            element={
              <PrivateRoute>
                <MyListings />
              </PrivateRoute>
            }
          />

          <Route
            path="/manage-event"
            element={
              <PrivateRoute>
                <ManageEvent />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            }
          />

          {/* Private routes */}
          <Route
            path="/resell-tickets"
            element={
              <PrivateRoute>
                <ResellTickets />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Public routes (Login and Signup) */}
        <Route
          path="/login-signup"
          element={
            <AuthContext.Consumer>
              {({ isLogin }) =>
                isLogin ? <Navigate to="/home" /> : <LoginSignup />
              }
            </AuthContext.Consumer>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthContext.Consumer>
              {({ isLogin }) =>
                !isLogin ? <LoginSignup /> : <Navigate to="/home" />
              }
            </AuthContext.Consumer>
          }
        />

        {/* MovieForm route for displaying movie details */}
        <Route path="/movie-form" element={<MovieForm />} />

        {/* Google OAuth callback route */}
        {/* <Route
          path="/auth/google/callback"
          element={<GoogleRedirectHandler />} // Handle OAuth callback here
        /> */}
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </BrowserRouter>
  );
}
