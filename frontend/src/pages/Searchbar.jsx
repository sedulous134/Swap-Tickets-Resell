import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";  // To read the search query from the URL
import Searchbar from "../components/Searchbar"; // Import Searchbar Component

const Searchbar = () => {
  const location = useLocation();  // Use location to get query parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]); // Store search results

  useEffect(() => {
    // Extract the query parameter from the URL
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    setSearchQuery(query || "");
    fetchEvents(query || "");
  }, [location]);

  // Fetch events based on search query
  const fetchEvents = (query) => {
    // You can replace this with an API call
    const eventsData = [
      { id: 1, name: "Music Concert", date: "2025-05-10" },
      { id: 2, name: "Tech Conference", date: "2025-06-12" },
      { id: 3, name: "Art Exhibition", date: "2025-07-20" },
      { id: 4, name: "Stand-up Comedy", date: "2025-08-15" },
      // More events
    ];
    // Filter events based on search query
    const filtered = eventsData.filter((event) =>
      event.name.toLowerCase().includes(query.toLowerCase())
    );
    setEvents(filtered);
  };

  return (
    <div className="w-full text-gray-800 bg-[#F9FAFB] overflow-hidden">
      <div className="w-full text-center py-8">
        <h1 className="text-4xl font-bold">Search Results for "{searchQuery}"</h1>
        <Searchbar onSearch={(query) => fetchEvents(query)} />  {/* Allow searching from Search page too */}

        <div className="mt-8">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="my-4">
                <h3 className="text-2xl font-bold">{event.name}</h3>
                <p>{event.date}</p>
              </div>
            ))
          ) : (
            <p>No events found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Searchbar;
