import { createContext, useContext, useState } from "react";
import axios from "axios";

export const MyListingsContext = createContext();

export const MyListingsProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // // 🔥 Fetch user-specific ticket listings + merge movie data
  // const fetchListings = async () => {
  //   const token = localStorage.getItem("authToken");
  //   if (!token) return;

  //   setLoading(true);
  //   try {
  //     const res = await axios.get("http://localhost:8000/ticket/resell/mine", {
  //       headers: { Authorization: `Bearer ${token}` },
  //       withCredentials: true,
  //     });

  //     const ticketData = res.data.data || [];
  //     if (ticketData.length === 0) {
  //       setListings([]);
  //       setLoading(false);
  //       return;
  //     }

  //     const movieIds = [...new Set(ticketData.map((ticket) => ticket.movieId))];
  //     const movieDetails = await fetchMovies(movieIds);

  //     const updatedListings = ticketData.map((ticket) => ({
  //       ...ticket,
  //       movie: movieDetails[ticket.movieId] || { title: "Unknown", poster_path: "" },
  //     }));

  //     setListings(updatedListings);
  //   } catch (error) {
  //     console.error("❌ Error fetching listings:", error);
  //     setListings([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
  
      const res = await axios.get("http://localhost:8000/ticket/resell/mine", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
  
      const ticketData = res.data.data || [];
      if (ticketData.length === 0) {
        setListings([]);
        return;
      }
  
      const movieIds = [...new Set(ticketData.map((ticket) => ticket.movieId))];
      const movieDetails = await fetchMovies(movieIds);
  
      const updatedListings = ticketData.map((ticket) => ({
        ...ticket,
        movie: movieDetails[ticket.movieId] || { title: "Unknown", poster_path: "" }, // ✅ Ensure valid movie object
      }));
  
      console.log("✅ Updated Listings:", updatedListings); // Debugging
      setListings(updatedListings);
    } catch (error) {
      console.error("❌ Error fetching listings:", error);
    }
  };
  

  // 🔥 Fetch movie details with correct structure
  const fetchMovies = async (movieIds) => {
    const movieDetails = {};
    for (const id of movieIds) {
      try {
        const movieRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
          params: { api_key: import.meta.env.VITE_TMDB_API_KEY },
        });

        movieDetails[id] = movieRes.data || { title: "Unknown", poster_path: "" };
      } catch (err) {
        console.error(`❌ Error fetching movie details for ${id}:`, err);
        movieDetails[id] = { title: "Unknown", poster_path: "" };
      }
    }

    return movieDetails;
  };

  const addListing = (newTicket) => {
    if (!newTicket || !newTicket.movieId) {
      console.warn("⚠️ Invalid ticket data received:", newTicket);
      return;
    }
  
    const movie = {
      id: newTicket.movieId,
      title: newTicket.movieTitle || "Unknown Movie",
      poster_path: "", // ✅ Add a default empty poster to prevent crashes
    };
  
    setListings((prevListings) => [...prevListings, { ...newTicket, movie }]);
  };
  

  const removeListing = (ticketId) => {
    if (!ticketId) return;
  
    setListings((prev) => prev.filter((ticket) => ticket._id !== ticketId));
  
    setTimeout(() => {
      fetchListings(); // 🔥 Ensure latest data is pulled from the backend
    }, 1000);
  };
  

  return (
    <MyListingsContext.Provider
      value={{ listings, fetchListings, addListing, removeListing, loading }}
    >
      {children}
    </MyListingsContext.Provider>
  );
};

export const useMyListingsContext = () => useContext(MyListingsContext);
