// ResellTickets.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { MovieContext } from "../components/Searchbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Toast Import
import "react-toastify/dist/ReactToastify.css";
import { MyListingsContext } from "../MyListingsContext";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "./context";


const ResellTickets = () => {
  const { selectedMovie, setSelectedMovie } = useContext(MovieContext);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!selectedMovie) {
      const savedMovie = localStorage.getItem("selectedMovie");
      if (savedMovie) {
        setSelectedMovie(JSON.parse(savedMovie));
      }
    }
  }, [selectedMovie, setSelectedMovie]);

  const nextStep = () => {
    if (selectedMovie || currentStep >= 2) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="min-h-screen pt-8 flex items-start justify-center bg-gradient-to-br from-gray-100 to-gray-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg">
        {/* Step Content */}
        <div className="pb-6">
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 selectedMovie={selectedMovie} />}
          {currentStep === 3 && <Step3 />}
          {currentStep === 4 && <Step4 />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className={`bg-gray-300 text-gray-700 px-6 py-3 rounded-full text-lg font-semibold transition ${
              currentStep === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105"
            }`}
            disabled={currentStep === 1}
          >
            Back
          </button>
          {currentStep !== 4 && (
            <button
              onClick={nextStep}
              className={`px-6 py-3 rounded-full text-lg font-semibold transition ${
                selectedMovie || currentStep >= 2
                  ? "bg-pink-500 text-white hover:bg-pink-600 hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!selectedMovie && currentStep < 2}
            >
              {currentStep === 3 ? "Next" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------ STEP 1 ------------
const Step1 = () => {
  const { setSelectedMovie } = useContext(MovieContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          "https://api.themoviedb.org/3/trending/all/day?api_key=d44c90a7e9d0bf546cab4bb5b5cbdb90"
        );
        if (!response.ok)
          throw new Error(`API request failed with status ${response.status}`);

        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setMovies(data.results);
          setFilteredMovies(data.results.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setShowDropdown(true);

    if (query.length === 0) {
      setFilteredMovies(movies.slice(0, 5));
      return;
    }

    const filtered = movies
      .filter(
        (movie) =>
          movie.title?.toLowerCase().includes(query) ||
          movie.name?.toLowerCase().includes(query)
      )
      .slice(0, 5);

    setFilteredMovies(filtered);
  };

  const handleMovieSelection = (movie) => {
    setSearchQuery(movie.title || movie.name);
    setSelectedMovie(movie);
    localStorage.setItem("selectedMovie", JSON.stringify(movie));
    setShowDropdown(false);
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
        Sell Your Tickets Fast
      </h1>

      <div className="relative mb-6" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a movie..."
            value={searchQuery}
            onChange={handleSearch}
            onClick={() => setShowDropdown(true)}
            className="w-full py-4 px-6 pl-12 pr-12 rounded-xl text-gray-800 focus:outline-none shadow-lg border-2 border-gray-300 transition-all duration-300 hover:border-gray-400 text-lg"
          />
        </div>

        {showDropdown && (
          <div className="absolute w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-y-auto max-h-60 z-50">
            <div className="divide-y divide-gray-100">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center p-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => handleMovieSelection(movie)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="w-16 h-24 rounded-lg object-cover shadow-md"
                  />
                  <h3 className="ml-4 font-semibold">
                    {movie.title || movie.name}
                  </h3>
                  <span className="ml-auto text-gray-500">
                    ⭐{" "}
                    {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-6">
        <li className="flex items-start space-x-4">
          <span className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white text-lg font-bold rounded-full">
            1
          </span>
          <p className="text-base font-medium text-gray-700">
            Forward your ticket confirmation email.
          </p>
        </li>
        <li className="flex items-start space-x-4">
          <span className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white text-lg font-bold rounded-full">
            2
          </span>
          <p className="text-base font-medium text-gray-700">
            Click{" "}
            <span className="font-semibold text-pink-500">
              "I've forwarded my tickets"
            </span>{" "}
            button.
          </p>
        </li>
        <li className="flex items-start space-x-4">
          <span className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white text-lg font-bold rounded-full">
            3
          </span>
          <p className="text-base font-medium text-gray-700">
            Set your price and sell quickly.
          </p>
        </li>
      </ul>

      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
        <span className="text-gray-600 font-medium">
          Want to organize an event?
        </span>
        <Link to="/create-event">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-700 transition">
            Create Event
          </button>
        </Link>
      </div>
    </div>
  );
};

// ------------ STEP 2 ------------
const Step2 = ({ selectedMovie }) => {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-800">
        Step 2: Confirm Details
      </h1>
      <p className="text-xl text-gray-600 text-center mb-6">
        Please confirm your ticket details before proceeding.
      </p>
      {selectedMovie ? (
        <div className="bg-gray-100 p-6 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex-1">
            <p className="text-lg text-gray-700 font-medium">
              🎬 Movie: {selectedMovie.title || selectedMovie.name}
            </p>
            <p className="text-lg text-gray-700 font-medium">
              📅 Release Date:{" "}
              {selectedMovie.release_date || selectedMovie.first_air_date}
            </p>
            <p className="text-lg text-gray-700 font-medium">
              ⭐ Rating: {selectedMovie.vote_average?.toFixed(1) || "N/A"}
            </p>
          </div>
          <div className="ml-6">
            <img
              src={`https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}`}
              alt={selectedMovie.title || selectedMovie.name}
              className="w-40 h-60 rounded-xl shadow-lg object-cover"
            />
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No movie selected.</p>
      )}
    </div>
  );
};

// ------------ STEP 3 ------------

const Step3 = () => {
  const [verificationStatus, setVerificationStatus] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
      setVerificationStatus("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      console.log("Verifying email:", email); 
      const response = await axios.post(
        "http://localhost:8000/auth/verify-ticket",
        { email },
        { withCredentials: true }
      );
      console.log("Response:", response.data)
      setVerificationStatus(response.data.message);
      console.log(response.data);
    } catch (error) {
      setVerificationStatus(
        error.response?.data?.message ||
          "Error verifying the ticket. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn bg-white p-8 rounded-2xl shadow-md space-y-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-800">
        🎟 Step 3: Forward Your Ticket
      </h1>
      <p className="text-lg text-center text-gray-600">
        To begin the resale process, forward your ticket confirmation email to
        us.
      </p>

      {/* Email Info */}
      <div className="bg-gray-100 border-l-4 border-pink-500 p-6 rounded-lg shadow-sm">
        <p className="text-lg font-semibold text-gray-800">
          📬 Forward your email to:
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=Swaptickets001@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 font-semibold text-pink-600 underline hover:text-pink-700"
          >
            Swaptickets001@gmail.com
          </a>
        </p>
        <p className="mt-2 text-gray-600 text-sm">
          This helps us verify your ticket and make it available for resale.
        </p>
      </div>

      {/* Email Input & Verification Button */}
      <div className="flex flex-col items-center space-y-4">
        <input
          type="email"
          className="p-3 border-2 rounded-lg w-3/4 sm:w-1/2"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          disabled={loading}
          className={`bg-pink-600 text-white p-3 rounded-lg ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-700"
          }`}
          onClick={handleVerifyEmail}
        >
          {loading ? "Verifying..." : "Verify Forwarded Ticket"}
        </button>
        {verificationStatus && (
          <div
            className={`mt-4 text-center text-lg font-semibold ${
              verificationStatus.includes("✅")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            <p>{verificationStatus}</p>
          </div>
        )}
      </div>

      {/* Support Note */}
      <div className="flex items-center bg-pink-50 p-4 rounded-md shadow-sm">
        <span className="text-pink-600 text-xl mr-3">💡</span>
        <p className="text-gray-700 text-sm">
          Make sure your ticket is confirmed and includes all relevant details
          like booking ID, seat number, and event info.
        </p>
      </div>

      {/* Tips / Extra Info */}
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-start">
          <span className="mr-2 text-pink-500">✔️</span>
          Forward the **exact email** from your ticket provider.
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-pink-500">✔️</span>
          Don't edit or crop any content.
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-pink-500">✔️</span>
          We'll notify you once your ticket is listed!
        </li>
      </ul>

      {/* Help Line */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          Need help? Reach out to our support team anytime.
        </p>
        <p className="text-pink-600 font-semibold mt-1">📞 +91 98765 43210</p>
      </div>
    </div>
  );
};

// ------------ STEP 4 ------------
const Step4 = () => {
  const { selectedMovie } = useContext(MovieContext);
  const { addListing } = useContext(MyListingsContext);
  const [price, setPrice] = useState("");
  const navigate = useNavigate();
  // const { user } = useAuth();

  // const handleSubmit = () => {
  //   if (!price || isNaN(price) || Number(price) <= 0) {
  //     toast.error("Please enter a valid price");
  //     return;
  //   }

  //   addListing({ movie: selectedMovie, price: parseFloat(price) });
  //   toast.success("Ticket listed successfully!");
  //   navigate("/my-listings");
  // };

  const handleListTicket = async () => {
    if (!price || isNaN(price) || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
  
    if (!selectedMovie?.id) {
      toast.error("Invalid movie selection. Please try again.");
      return;
    }
    console.log("🎬 Selected Movie Before Listing:", selectedMovie); // ✅ Debugging

    const token = localStorage.getItem("authToken"); // 🔑 Get token from local storage
  
    if (!token) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return;
    } 
  
    console.log("🔑 Token before listing ticket:", token); // ✅ Debugging
  
    try {
      const response = await axios.post(
        "http://localhost:8000/ticket/resell/list",
        {
          movieId: selectedMovie.id,
          movieTitle: selectedMovie.title || selectedMovie.name,
          price,
          status: "listed",
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Attach token properly
          withCredentials: true,
        }
      );
  
      console.log("✅ Ticket listed:", response.data);
      addListing(response.data.ticket);
      toast.success("Ticket listed successfully!");
      navigate("/my-listings");
    } catch (err) {
      console.error("❌ Error listing ticket:", err);
  
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("authToken"); // 🔥 Clear invalid token
        navigate("/login");
      } else {
        toast.error("Failed to list ticket. Please try again.");
      }
    }
  };
  
  
  

  return (
    <div className="animate-fadeIn bg-white p-8 rounded-2xl shadow-md space-y-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-800">
        💸 Step 4: Set Your Price
      </h1>

      {selectedMovie && (
        <div className="flex flex-col sm:flex-row items-center bg-gray-50 p-6 rounded-xl shadow-sm">
          <img
            src={`https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}`}
            alt={selectedMovie.title || selectedMovie.name}
            className="w-32 h-48 rounded-lg shadow-lg object-cover mb-4 sm:mb-0 sm:mr-6"
          />
          <div className="text-gray-700 space-y-2">
            <p className="text-lg font-semibold">
              🎬 {selectedMovie.title || selectedMovie.name}
            </p>
            <p>
              📅 {selectedMovie.release_date || selectedMovie.first_air_date}
            </p>
            <p>⭐ {selectedMovie.vote_average?.toFixed(1) || "N/A"}</p>
          </div>
        </div>
      )}

      {/* Price Input */}
      <div className="text-center">
        <label className="block text-lg font-medium text-gray-800 mb-2">
          Set Your Ticket Price (INR)
        </label>
        <input
          type="number"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-1/2 p-3 border-2 border-gray-300 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div className="text-center">
        <button
          className="bg-pink-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-pink-700 transition-all"
          onClick={handleListTicket}
        >
          List My Ticket
        </button>
      </div>
    </div>
  );
};

export default ResellTickets;
