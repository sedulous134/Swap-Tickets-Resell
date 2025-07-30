import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../pages/context"; // Import the AuthContext
import SearchBar from "../components/Searchbar";

const Home = () => {
  const { isLogin } = useContext(AuthContext);
  // const [konamiCode, setKonamiCode] = useState([]);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Konami Code Input Detection
  // const konamiSequence = [
  //   "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"
  // ];

  // const handleKeyPress = (e) => {
  //   const newKonamiCode = [...konamiCode, e.key];
  //   setKonamiCode(newKonamiCode);
  //   if (newKonamiCode.length > konamiSequence.length) {
  //     newKonamiCode.shift(); // Keep only the latest 10 inputs
  //   }
  //   if (newKonamiCode.join() === konamiSequence.join()) {
  //     setShowEasterEgg(true); // Trigger Easter Egg when the code is complete
  //   }
  // };

  // React.useEffect(() => {
  //   window.addEventListener("keydown", handleKeyPress);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyPress);
  //   };
  // }, [konamiCode]);

  return (
    <div className="w-full text-gray-800 bg-[#F9FAFB] overflow-hidden">
      {/* Hero Section */}
      <div className="relative w-full h-[100vh] flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#F9FAFB] to-[#E2E8F0]">
        {/* Gradient Decorative Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-12 left-10 w-96 h-96 bg-[#FFB6C1] opacity-10 rounded-full blur-[60px]"></div>
          <div className="absolute bottom-8 right-16 w-96 h-96 bg-[#FF80AB] opacity-10 rounded-full blur-[60px]"></div>
        </div>

        {/* Content */}
        <div className="z-10 px-6 md:px-12 text-center">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#5A67D8] to-[#4C51BF] drop-shadow-2xl leading-tight">
            Build the Future of Your Events
            <br />
            <span className="text-[#2D3748]">Where Innovation Meets Execution</span>
          </h1>
          <p className="mt-4 text-lg text-[#2D3748] max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into unforgettable events. Control every detail effortlessly with our platform.
          </p>
          <div className="mt-6 flex justify-center items-center gap-4">
            {/* <input
              type="text"
              placeholder="Find your next big event"
              className="py-3 px-6 w-64 md:w-80 rounded-l-lg text-gray-800 focus:outline-none shadow-lg border-2 border-gray-300"
            /> */}
            <SearchBar />
            {/* <button className="bg-[#FF70A6] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#FF4078] transition duration-300 shadow-lg">
              Explore Now
            </button> */}
          </div>
        </div>

        {/* Conditionally Rendered Call-to-Action Button */}
        {/* {!isLogin && (
          <div className="mt-8 z-10">
            <Link
              to="/login-signup"
              className="bg-gradient-to-r from-[#FF70A6] to-[#FF66B2] text-white font-bold py-3 px-8 rounded-full shadow-xl hover:scale-105 transition-transform duration-300"
            >
              Get Started
            </Link>
          </div>
        )} */}

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 animate-bounce z-10">
          <span className="text-gray-400 text-sm">Scroll Down ↓</span>
        </div>
      </div>

      {/* Feature Section */}
      <div className="w-full py-16 px-8 bg-gradient-to-r from-[#F9FAFB] via-[#F1F5F9] to-[#F9FAFB] text-gray-900 flex items-center justify-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full max-w-7xl">
          {/* Left Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#FFEEF2] px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="text-[#FF70A6]">✨ NEW</span>
              <span>Next-Level Event Management</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2D3748]">
              Seamless Event Creation, Perfect Execution
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              Whether you’re hosting a small gathering or a large event, our platform helps you manage everything in one place.
            </p>
            <Link to="/create-event">
              <button className="bg-[#FF70A6] hover:bg-[#FF4078] text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-md">
                Create Your Event
              </button>
            </Link>
          </div>

          {/* Right Image/Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="w-48 h-48 mx-auto flex items-center justify-center">
              <img
                      src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800"
                      alt="Event Planning"
                      className="rounded-2xl object-cover w-full h-full"
                    />
              </div>
              <p className="text-center text-[#2D3748] mt-4 font-medium">
                For Organizers, by Organizers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Easter Egg Section (Triggered by Konami Code) */}
      {showEasterEgg && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#FF70A6] text-white flex justify-center items-center z-50">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">🎉 You Found an Easter Egg! 🎉</h1>
            <p className="text-2xl mb-8">Now go ahead and have some fun with this Easter egg! 🎮</p>
            <button
              onClick={() => setShowEasterEgg(false)}
              className="bg-[#FF4078] hover:bg-[#FF1D52] py-3 px-8 rounded-full font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Testimonial Section */}
      <div className="w-full py-16 px-8 bg-[#F9FAFB] text-gray-900 text-center">
        <h3 className="text-4xl font-bold mb-6 text-[#5A67D8]">
          What Our Users Are Saying
        </h3>
        <p className="text-lg text-[#4A5568] mb-8 max-w-3xl mx-auto">
          Our users rave about the simplicity and efficiency our platform provides. Here's why.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="w-72 bg-[#FFEEF2] p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
            <p className="text-gray-700">
              "This platform has changed how I plan events. So intuitive and easy to use!"
            </p>
            <h5 className="mt-4 font-bold text-[#2D3748]">— Zoe Lee</h5>
          </div>
          <div className="w-72 bg-[#FFEEF2] p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
            <p className="text-gray-700">
              "I love the flexibility and customization options. Every detail is at my fingertips."
            </p>
            <h5 className="mt-4 font-bold text-[#2D3748]">— Jake Turner</h5>
          </div>
        </div>
      </div>

      {/* Final Call to Action */}
      <div className="w-full py-16 px-8 bg-gradient-to-r from-[#F9FAFB] via-[#F1F5F9] to-[#F9FAFB] text-gray-900 text-center">
        <div className="w-full max-w-4xl bg-[#FF70A6] p-8 rounded-2xl text-center mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Create Your Event?
          </h2>
          <p className="text-lg text-white mb-6">
            Take control of your events and bring them to life with just a few clicks.
          </p>
          <Link to="/create-event">
            <button className="bg-[#FF4078] hover:bg-[#FF1D52] text-white font-bold py-3 px-8 rounded-full transition-transform duration-300">
              Get Started Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
