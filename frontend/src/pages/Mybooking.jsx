import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Session expired. Please log in again.");
        toast.error("Session expired. Please log in again.");
        return;
      }

      console.log("📡 Fetching booked tickets...");
      
      const { data: bookedTickets } = await axios.get("http://localhost:8000/ticket/bookings", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log("✅ API Response for booked tickets:", bookedTickets);

      if (!bookedTickets.length) {
        setMyTickets([]);
        return;
      }

      // 🔥 Fetch movie details for each ticket
      const movieIds = [...new Set(bookedTickets.map(ticket => ticket.movieId))];

      const movieDetails = await Promise.all(
        movieIds.map(async (id) => {
          try {
            const { data: movie } = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
              params: { api_key: import.meta.env.VITE_TMDB_API_KEY },
            });
            console.log(`✅ Movie details for ${id}:`, movie);
            return { id, ...movie };
          } catch (err) {
            console.error(`❌ Error fetching movie details for ${id}:`, err);
            return { id, title: "Unknown Movie", poster_path: "" }; // Fallback
          }
        })
      );

      const movieMap = Object.fromEntries(movieDetails.map(movie => [movie.id, movie]));

      const updatedTickets = bookedTickets.map(ticket => ({
        ...ticket,
        movie: movieMap[ticket.movieId] || { title: "Unknown Movie", poster_path: "" },
      }));

      setMyTickets(updatedTickets);
    } catch (error) {
      console.error("❌ Error fetching user bookings:", error);
      setError("Failed to load your bookings. Please try again.");
      toast.error("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-gray-800 mb-8 tracking-tight"
      >
        🎟️ My Booked Tickets
      </motion.h1>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-100 text-red-700 px-6 py-4 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-lg mt-10"
        >
          Loading tickets...
        </motion.div>
      ) : (
        <div className="w-full max-w-6xl">
          <AnimatePresence>
            {myTickets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-xl text-center mt-20"
              >
                ❌ No booked tickets available.  
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {myTickets.map((ticket) => {
                  const movie = ticket.movie || { title: "Unknown", poster_path: "" };

                  return (
                    <motion.div
                      key={ticket._id}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                      {movie.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                          alt={movie.title}
                          className="rounded-xl w-48 mb-4"
                        />
                      ) : (
                        <div className="w-48 h-72 bg-gray-300 rounded-xl mb-4 flex items-center justify-center text-gray-500">
                          No Image Available
                        </div>
                      )}

                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">{movie.title}</h3>
                        <p className="text-gray-500 font-medium mt-1">{ticket.date} • {ticket.time}</p>
                      </div>
                      <p className="text-2xl font-bold text-green-500 mb-2">₹{ticket.price}</p>
                      <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                        ✅ Confirmed
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
