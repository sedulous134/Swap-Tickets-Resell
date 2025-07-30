import React, { useRef ,useState } from "react";
import { useCreateEvent } from "../CreateEventContext";
import QRCode from "qrcode";
import {
  FaCalendarAlt,
  FaDownload,
  FaGlobe,
  FaMapMarkerAlt,
  FaShareAlt,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ManageEvent = () => {
  const { eventData } = useCreateEvent();
  const eventRef = useRef(null);
  const [isHoveringShare, setIsHoveringShare] = useState(false);

  if (!eventData || Object.keys(eventData).every((key) => !eventData[key])) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          No Events Found
        </h1>
        <p className="text-lg text-gray-600">
          You currently have no events to manage.
        </p>
      </div>
    );
  }

  const {
    name,
    startDate,
    startTime,
    endDate,
    endTime,
    link,
    type,
    visibility,
    description,
    poster,
  } = eventData;

  let posterUrl = null;

  if (poster instanceof File || poster instanceof Blob) {
    try {
      posterUrl = URL.createObjectURL(poster);
    } catch (error) {
      console.error("Failed to createObjectURL for poster", error);
    }
  } else if (typeof poster === "string") {
    posterUrl = poster;
  }

  const shareOptions = [
    {
      name: "Facebook",
      icon: <FaFacebook />,
      link: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      link: `https://twitter.com/intent/tweet?url=${link}&text=Check%20out%20this%20event!`,
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      link: `https://wa.me/?text=Check%20out%20this%20event:%20${link}`,
    },
    {
      name: "Email",
      icon: <FaEnvelope />,
      link: `mailto:?subject=Check out this event&body=Here's the event link: ${link}`,
    },
  ];


const generatePDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");

  // 🖨️ Title (removed emoji to avoid encoding issues)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text("Event Ticket", 70, 20);

  // 🖼️ Poster Image
  if (posterUrl) {
    try {
      // Add as JPEG (check MIME type based on actual image)
      pdf.addImage(posterUrl, "JPEG", 15, 30, 180, 80);
    } catch (err) {
      console.error("Poster image could not be added", err);
    }
  }

  // 📅 Event Details Text
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  const lines = [
    `Event Name: ${name || "Untitled"}`,
    `Start Date: ${startDate || "N/A"} at ${startTime || "N/A"}`,
    `End Date: ${endDate || "N/A"} at ${endTime || "N/A"}`,
    `Location: ${link || "N/A"}`,
    `Type: ${type || "N/A"}`,
    `Visibility: ${visibility || "N/A"}`
  ];

  let y = 120;
  lines.forEach((line) => {
    pdf.text(line, 20, y);
    y += 8;
  });

  // 📝 Description
  pdf.setFont("helvetica", "italic");
  pdf.text("Description:", 20, y + 10);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    description ? description.substring(0, 400) : "No description provided.",
    20,
    y + 18,
    { maxWidth: 170 }
  );

  // 🔳 QR Code
  try {
    const qrContent = `Event: ${name}\nDate: ${startDate}\nLink: ${link}`;
    const qrDataUrl = await QRCode.toDataURL(qrContent);
    pdf.addImage(qrDataUrl, "PNG", 70, 200, 50, 50);
  } catch (err) {
    console.error("QR Code generation failed", err);
  }

  // 💾 Save PDF
  pdf.save(`${name || "Event"}_Details.pdf`);
};




  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-200 py-12 px-4 sm:px-8">
      <h1 className="text-5xl font-extrabold text-pink-600 text-center mb-10">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-gray-800 mb-8 tracking-tight"
      >
         Manage Events 🎟️
      </motion.h1>

      </h1>

      <div  ref={eventRef} className="bg-white shadow-2xl rounded-3xl p-8 max-w-5xl mx-auto relative">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {name || "Untitled Event"}
        </h2>

                <div className="absolute top-6 right-6 flex items-center gap-3">
                  
          <button
            onClick={generatePDF}
            className="bg-pink-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-pink-600 transition duration-300 flex items-center gap-2"
          >
            <FaDownload /> Download
          </button>

          <motion.button
            className="bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <FaShareAlt />
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Poster */}
          <div className="w-full h-full flex justify-center items-center">
            {posterUrl ? (
              <motion.img
                src={posterUrl}
                alt="Event Poster"
                className="rounded-2xl shadow-xl max-h-96 w-full object-cover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
            ) : (
              <div className="bg-gray-100 text-gray-500 flex items-center justify-center w-full h-64 rounded-2xl">
                <FaShareAlt className="mr-2" />
                No Poster Available
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="flex flex-col space-y-4 text-lg text-gray-700">
            <div className="bg-pink-50 rounded-xl px-5 py-3 shadow-sm flex items-center">
              <FaCalendarAlt className="text-pink-500 mr-3" />
              <span>
                <strong>Start:</strong> {startDate || "N/A"} at{" "}
                {startTime || "N/A"}
              </span>
            </div>

            <div className="bg-pink-50 rounded-xl px-5 py-3 shadow-sm flex items-center">
              <FaCalendarAlt className="text-pink-500 mr-3" />
              <span>
                <strong>End:</strong> {endDate || "N/A"} at {endTime || "N/A"}
              </span>
            </div>

            <div className="bg-pink-50 rounded-xl px-5 py-3 shadow-sm flex items-center">
              <FaMapMarkerAlt className="text-pink-500 mr-3" />
              <span>
                <strong>Location:</strong> {link || "N/A"}
              </span>
            </div>

            <div className="bg-pink-50 rounded-xl px-5 py-3 shadow-sm flex items-center">
              <FaGlobe className="text-pink-500 mr-3" />
              <span>
                <strong>Type:</strong> {type || "N/A"}
              </span>
            </div>

            <div className="bg-pink-50 rounded-xl px-5 py-3 shadow-sm flex items-center">
              <FaGlobe className="text-pink-500 mr-3" />
              <span>
                <strong>Visibility:</strong> {visibility || "N/A"}
              </span>
            </div>
          </div>
        </div>
       
     
        {/* Event Description */}
        <div className="mt-12">
          <div className="flex items-center mb-3">
            <FaEnvelope className="text-pink-500 mr-2 text-xl" />
            <h3 className="text-2xl font-bold text-gray-800">
              Event Description
            </h3>
          </div>
          <hr className="border-pink-300 mb-4" />

          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 shadow-xl max-h-60 overflow-y-auto border border-pink-100">
            {description ? (
              <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                {description}
              </p>
            ) : (
              <div className="text-gray-500 italic flex items-center">
                <FaEnvelope className="mr-2" />
                No description provided for this event.
              </div>
            )}
          </div>
        </div>

        {/* Share Button */}
        <div
          className="absolute top-6 right-6"
          // onMouseEnter={() => setIsHoveringShare(true)}
          // onMouseLeave={() => setIsHoveringShare(false)}

          onMouseEnter={() => {
            // clearTimeout(timeoutRef.current); 
            setIsHoveringShare(true);
          }}
          onMouseLeave={() => {
             setTimeout(() => {
              setIsHoveringShare(false);
            }, 150); 
          }}
        >
          <motion.button
            className="bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <FaShareAlt />
          </motion.button>
          {isHoveringShare && (
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="py-2">
                {shareOptions.map((option, index) => (
                  <li key={index}>
                    <a
                      href={option.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 hover:bg-pink-100 text-gray-800"
                    >
                      <span className="mr-2">{option.icon}</span> {option.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvent;
