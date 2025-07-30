import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { useMyListingsContext } from "../MyListingsContext";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const MyListings = () => {
  const { listings, fetchListings, removeListing, loading } = useMyListingsContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDeleteListing = async (ticketId) => {
    try {
      await axios.delete(`http://localhost:8000/ticket/resell/${ticketId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        withCredentials: true,
      });

      removeListing(ticketId);
      toast.success("Listing deleted successfully!", { position: "top-right", autoClose: 2000 });
    } catch (err) {
      console.error("❌ Error deleting listing:", err);
      toast.error("Failed to delete listing. Please try again.", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleMovieClick = (movie) => {
    if (movie?.title) navigate("/movie-form", { state: { movie } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ToastContainer />

      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-gray-800 mb-8 tracking-tight text-center"
      >
        🎟️ My Listed Tickets
      </motion.h1>

      {loading ? (
        <div className="text-center text-gray-500 text-xl mt-6">Loading your listings...</div>
      ) : listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-gray-600 text-xl mt-6"
        >
          ❌ No listed tickets remaining.
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((ticket) => {
            if (!ticket.movie || !ticket.movie.title) {
              console.warn(`⚠️ Movie details missing for ticket ${ticket._id}`);
              return null;
            }
            const movie = ticket.movie || { title: "Unknown", poster_path: "" }; 
            const { poster_path, title } = ticket.movie;

            return (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white p-4 rounded-xl shadow-md flex flex-col items-center hover:cursor-pointer transition-transform transform hover:scale-105"
              >
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteListing(ticket._id)}
                >
                  <FaTrash size={20} />
                </button>

                {poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${poster_path}`}
                    alt={title}
                    className="rounded-xl w-48 mb-4"
                    onClick={() => handleMovieClick(ticket.movie)}
                  />
                ) : (
                  <div className="w-48 h-72 bg-gray-300 rounded-xl mb-4 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                <h3 className="text-xl font-semibold text-center text-gray-800">{title}</h3>
                <p className="text-lg mt-2 text-gray-600">Price: ₹{ticket.price}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyListings;
