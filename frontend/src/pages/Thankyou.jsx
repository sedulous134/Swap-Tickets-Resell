import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-100 to-green-50 px-4">
      {/* Container */}
      <div
        className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 text-center border border-gray-200 animate-fade-in"
        style={{
          animation: "fadeIn 0.8s ease-out",
        }}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <CheckCircle2
            className="text-green-500 w-14 h-14 animate-bounce-in"
            style={{ animationDelay: "0.4s" }}
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-green-700 mb-3">
          Payment Complete! 🎉
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-lg leading-7 mb-6">
          Your ticket purchase was successful! <br />
          You'll receive a confirmation email in <strong>24 hours</strong>.
        </p>

        {/* Animated Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti"></div>
        </div>

        {/* Button */}
        <button
          onClick={() => navigate("/home")}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 hover:shadow-xl transition transform hover:-translate-y-1"
        >
          🏠 Go Home
        </button>
      </div>

      {/* Inline animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes bounceIn {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); }
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out both;
          }

          .animate-bounce-in {
            animation: bounceIn 0.6s ease-in-out both;
          }

          .confetti {
            position: absolute;
            width: 100%;
            height: 100%;
            background: url('https://cdn.jsdelivr.net/gh/Raul646/confetti-animation/assets/confetti.svg');
            background-size: cover;
            background-repeat: no-repeat;
            opacity: 0.6;
            animation: fadeIn 3s ease-in-out both infinite alternate;
          }
        `}
      </style>
    </div>
  );
};

export default ThankYou;
