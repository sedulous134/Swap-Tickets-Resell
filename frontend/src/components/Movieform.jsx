import { useEffect, useState,useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../pages/context";
import { useMyListingsContext } from "../MyListingsContext";
const MovieForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const movie = location.state?.movie;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { removeListing, fetchListings } = useMyListingsContext();
  const [trailerUrl, setTrailerUrl] = useState("");
  const { userEmail } = useContext(AuthContext); 

  useEffect(() => {
    if (movie?.id) {
      fetchTickets();
    }
  }, [movie?.id]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        navigate("/login-signup");
        return;
      }

      const { data } = await axios.get(
        `http://localhost:8000/ticket/resell/movie/${movie.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log("✅ Fetched tickets:", data);
      setTickets(data.length > 0 ? data : []); // ✅ Ensures tickets exist before updating state
    } catch (err) {
      console.error("❌ Error fetching tickets:", err);
      // toast.error("Could not load tickets for this movie.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrailer = async () => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${
          import.meta.env.VITE_TMDB_API_KEY
        }`
      );

      console.log("✅ Trailer Data:", data);

      const trailer = data.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );

      if (!trailer) {
        toast.error("No official trailer available.");
        return;
      }

      setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);
    } catch (error) {
      console.error("❌ Error fetching trailer:", error);
      toast.error("Failed to load trailer.");
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 🔥 Handle ticket purchase & dynamically delete from backend
  const handleBuyTicket = async (ticket) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const res = await loadRazorpay();

    if (!res) {
      toast.error("Failed to load Razorpay.");
      return;
    }

    try {
      const { data: order } = await axios.post(
        "http://localhost:8000/api/razorpay/create-order",
        { amount: ticket.price },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Ticket Purchase",
        description: `Purchase ticket for ${movie.title || movie.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("🛠️ Deleting Ticket ID:", ticket._id);
            const verifyRes = await axios.post(
              "http://localhost:8000/api/razorpay/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ticket,
                userEmail, // ✅ Replace with actual logged-in user's email
                movieDetails: {
                  title: movie.title || movie.name,
                  poster: movie.poster_path ,
                  // price: ticket.price, 
                  date: movie.release_date || movie.first_air_date,
                  time: "7:00 PM",
                  venue: "PVR Cinemas",
                  seats: [ticket.seat || "General"],
                },
              },
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              }
            );

            if (verifyRes.data.success) {
              toast.success("🎉 Payment successful!");

              // ✅ 1. Save purchased ticket for user
              await axios.post(
                "http://localhost:8000/ticket/book",
                {
                  movieId: movie.id,
                  movieTitle: movie.title || movie.name,
                  seat: ticket.seat || "General",
                  price: ticket.price,
                  date: movie.release_date || movie.first_air_date,
                  time: "7:00 PM", // 🔹 You can make this dynamic later
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                  withCredentials: true,
                }
              );

              // 🔥 Delete the ticket from the backend
              console.log("🛠️ Attempting to delete ticket ID:", ticket._id); // ✅ Debugging

              await axios.delete(
                `http://localhost:8000/ticket/resell/${ticket._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  withCredentials: true,
                }
              );

              console.log(
                "🔄 Refreshing both listings and available tickets..."
              );
              // // 🔥 Remove purchased ticket from UI dynamically
              // setTickets((prevTickets) =>
              //   prevTickets.filter((t) => t._id !== ticket._id)
              // );

              // removeListing(ticket._id); // ✅ Remove locally

              // await fetchListings(); // 🔥 Ensure MyListings.jsx updates
              // await fetchTickets(); // 🔥 Refresh MovieForm.jsx ticket data
              // setTimeout(() => {
              //   navigate("/thank-you");
              // }, 1500);
              setTimeout(async () => {
                setTickets([]); // ✅ Ensure frontend doesn't hold stale tickets
                await fetchListings(); // 🔥 Ensure MyListings.jsx updates
                await fetchTickets(); // 🔥 Refresh MovieForm.jsx ticket data
                navigate("/thank-you");
              }, 1500);
            } else {
              toast.error("⚠️ Payment verification failed.");
            }
          } catch (err) {
            console.error("❌ Verification error:", err);
            toast.error("An error occurred during verification.");
          }
        },
        prefill: {
          name: "Guest User",
          email: "guest@example.com",
          contact: "9999999999",
        },
        theme: { color: "#f43f5e" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("❌ Payment error:", error);
      toast.error("Failed to initiate payment.");
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1); // ✅ Go back
    } else {
      navigate("/"); // ✅ If no history, go home
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-100 to-gray-300 p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl w-full flex items-center gap-8">
        {/* 🎬 Movie Image */}
        <div
          className="w-full md:w-1/2 relative group cursor-pointer"
          onClick={fetchTrailer}
        >
          <img
            src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover rounded-lg transition-all"
          />

          {/* 🔥 Overlay with Play Icon & Text on Hover */}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white mb-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
            <span className="text-white text-lg font-bold">Watch Trailer</span>
          </div>
        </div>

        {/* 🎟️ Movie Details */}
        <div className="w-1/2 flex flex-col justify-center text-left">
          <h1 className="text-4xl font-extrabold text-gray-800">
            {movie.title || movie.name}
          </h1>
          <p className="text-lg font-semibold text-gray-600 mt-2">
            📅{" "}
            {new Date(
              movie.release_date || movie.first_air_date
            ).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          {/* 🎫 Tickets Section */}
          <div className="mt-6">
            {loading ? (
              <div className="text-center text-gray-600">
                Loading tickets...
              </div>
            ) : tickets.length > 0 ? ( // ✅ Only show message if no tickets exist
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-green-700">
                  🎫 Tickets Available
                </h2>
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="p-4 bg-green-100 rounded-lg flex justify-between items-center shadow"
                  >
                    <div>
                      <p className="text-gray-800 font-semibold">
                        Seat: {ticket.seat || "General"}
                      </p>
                      <p className="text-gray-700">Price: ₹{ticket.price}</p>
                    </div>
                    <button
                      onClick={() => handleBuyTicket(ticket)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-200 rounded-lg">
                <span className="text-lg font-bold text-gray-700">
                  ❌ No Tickets Available
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-red-100 rounded-lg flex flex-col items-center shadow-md">
            <span className="text-lg font-bold text-red-700">
              🎫 Got Tickets to Sell?
            </span>
            <p className="text-gray-700 text-center mt-2">
              List your tickets now and sell them fast.
            </p>
            <button
              className="mt-3 px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
              onClick={() => navigate("/resell-tickets")}
            >
              Sell Tickets
            </button>
          </div>

          {/* 🔙 Back Button */}
          <div className="mt-6">
            <button
              className="bg-gray-700 text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-gray-900 transition"
              onClick={handleBack}
            >
              🔙 Back
            </button>
          </div>
        </div>
        {trailerUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl relative">
              <button
                className="absolute top-2 right-2 text-red-500 text-xl"
                onClick={() => setTrailerUrl("")}
              >
                ❌
              </button>
              <iframe
                width="560"
                height="315"
                src={trailerUrl}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieForm;
