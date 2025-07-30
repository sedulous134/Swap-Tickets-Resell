import React, { useState, useEffect } from "react";
import {
  FaGlobe,
  FaClock,
  FaLock,
  FaMapMarkerAlt,
  FaVideo,
  FaCalendar,
} from "react-icons/fa";
import { FiCalendar, FiSettings, FiShare2 } from "react-icons/fi";
import DatePicker from "react-datepicker";
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
<ToastContainer position="top-right" autoClose={3000} />
// import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import { useCreateEvent } from "../CreateEventContext";
// import { CreateEventProvider } from "../CreateEventContext";



export default function CreateEvent() {
  const { setEventData } = useCreateEvent();
  const [entryFee, setEntryFee] = useState(1000);
  const [attendees, setAttendees] = useState(250);
  const [showForm, setShowForm] = useState(false);
  const [eventName, setEventName] = useState("");
  const [visibility, setVisibility] = useState("");
  const [eventType, setEventType] = useState("");
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [eventLink, setEventLink] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [eventDescription, setEventDescription] = useState("");

  const handleSubmit = () => {
    if (!eventName || !startDate || !startTime || !eventDescription) {
      toast.error("Please fill out all the fields!");
      return;
    }
  
    const eventDetails = {
      name: eventName,
      visibility,
      type: eventType,
      startDate: startDate?.toLocaleDateString(),
      startTime: startTime?.toLocaleTimeString(),
      endDate: endDate?.toLocaleDateString(),
      endTime: endTime?.toLocaleTimeString(),
      link: eventLink,
      description: eventDescription,
      poster: eventImage,
    };
  
    setEventData(eventDetails); // Store event details in context
  
    toast.success("Event created successfully!");
    setShowForm(false);
    resetFormFields();
  };
  
  const resetFormFields = () => {
    setEventName("");
    setVisibility("");
    setEventType("");
    setStartDate(null);
    setStartTime(null);
    setEndDate(null);
    setEndTime(null);
    setEventLink("");
    setEventDescription("");
    setEventImage(null);
  };

  const calculateSavings = () => (entryFee * attendees * 0.1).toFixed(2);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", showForm);
  }, [showForm]);

  const isNextDisabled = !(eventName && visibility && eventType);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-pink-300 px-4 py-6 transition-all duration-300">
      <ToastContainer position="top-center" />
      <div className="text-sm font-semibold text-white bg-pink-500 px-5 py-2 rounded-full shadow-md animate-bounce mb-8">
        Lowest fees in the market!
      </div>

      <h1 className="text-5xl font-extrabold text-center text-gray-800 leading-tight mb-8">
        Affordable Event <span className="text-pink-600">Ticketing</span>{" "}
        Platform<br /> tailored to your <span className="text-pink-600">needs</span>.
      </h1>

      <button
        onClick={() => setShowForm(true)}
        className="mt-6 px-10 py-4 bg-pink-600 text-white text-2xl font-extrabold rounded-full shadow-lg hover:bg-pink-700 transform hover:scale-105 transition-all duration-200 mb-12"
      >
        Create an Event
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full transition-all duration-300">
            {step === 1 ? (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  What’s your event about?
                </h2>

                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  maxLength={50}
                  placeholder="Enter event name"
                  className="w-full p-4 border-2 rounded-lg text-gray-800 font-semibold"
                />
                <p className="text-sm text-gray-500 mt-1">{eventName.length} / 50</p>

                <label className="block text-lg font-semibold text-gray-700 mt-6">
                  Visibility
                </label>
                <div className="flex gap-4 mt-2">
                  <button
                    className={`flex items-center justify-center w-1/2 p-3 border-2 rounded-lg font-semibold ${
                      visibility === "public"
                        ? "bg-pink-500 text-white"
                        : "text-gray-700"
                    }`}
                    onClick={() => setVisibility(visibility === "public" ? "" : "public")}
                  >
                    <FaGlobe className="mr-2" /> Public
                  </button>
                  <button
                    className={`flex items-center justify-center w-1/2 p-3 border-2 rounded-lg font-semibold ${
                      visibility === "private"
                        ? "bg-pink-500 text-white"
                        : "text-gray-700"
                    }`}
                    onClick={() => setVisibility(visibility === "private" ? "" : "private")}
                  >
                    <FaLock className="mr-2" /> Private
                  </button>
                </div>

                <label className="block text-lg font-semibold text-gray-700 mt-6">
                  Event Type
                </label>
                <div className="flex gap-4 mt-2">
                  <button
                    className={`flex items-center justify-center w-1/2 p-3 border-2 rounded-lg font-semibold ${
                      eventType === "in-person"
                        ? "bg-pink-500 text-white"
                        : "text-gray-700"
                    }`}
                    onClick={() =>
                      setEventType(eventType === "in-person" ? "" : "in-person")
                    }
                  >
                    <FaMapMarkerAlt className="mr-2" /> In-Person
                  </button>
                  <button
                    className={`flex items-center justify-center w-1/2 p-3 border-2 rounded-lg font-semibold ${
                      eventType === "online"
                        ? "bg-pink-500 text-white"
                        : "text-gray-700"
                    }`}
                    onClick={() =>
                      setEventType(eventType === "online" ? "" : "online")
                    }
                  >
                    <FaVideo className="mr-2" /> Online
                  </button>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button
                    className="text-pink-600 font-bold hover:underline text-lg"
                    onClick={() => setShowForm(false)}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={isNextDisabled}
                    className={`px-6 py-3 rounded-lg text-lg font-bold transition-transform ${
                      isNextDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-pink-600 text-white hover:bg-pink-700 transform hover:scale-105"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : step === 2 ? (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  When and where?
                </h2>

                <label className="block text-lg font-semibold text-gray-700">
                  Date & Time
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3 border-2 rounded-lg flex items-center justify-between">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                        // Reset end date if it's before the start date
                        if (endDate && date && date > endDate) {
                          setEndDate(null);
                          setEndTime(null);
                          toast.warning("End date and time reset because it's before the start date.")
                        }
                      }}
                      placeholderText="Start Date"
                      className="outline-none w-full"
                    />
                    <FaCalendar />
                  </div>
                  <div className="p-3 border-2 rounded-lg flex items-center justify-between">
                    <DatePicker
                      selected={startTime}
                      onChange={(time) => setStartTime(time)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      placeholderText="Start Time"
                      className="outline-none w-full"
                    />
                    <FaClock />
                  </div>
                  <div className="p-3 border-2 rounded-lg flex items-center justify-between">
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => {
                        // Ensure end date is not before start date
                        if (!startDate || date >= startDate) {
                          setEndDate(date);
                        } else {
                          toast.error("End date cannot be before the start date.");
                        }
                      }}
                      placeholderText="End Date"
                      className="outline-none w-full"
                    />
                    <FaCalendar />
                  </div>
                  <div className="p-3 border-2 rounded-lg flex items-center justify-between">
                    <DatePicker
                      selected={endTime}
                      onChange={(time) => {
                        // Ensure the end time is valid relative to start time
                        if (
                          (!startDate || !startTime) || 
                          (endDate && endDate > startDate) || 
                          (endDate && endDate === startDate && time > startTime)
                        ) {
                          setEndTime(time);
                        } else {
                          toast.error("End time cannot be before the start time.");
                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      placeholderText="End Time"
                      className="outline-none w-full"
                    />
                    <FaClock />
                  </div>
                </div>

                <label className="block text-lg font-semibold text-gray-700 mt-6">
                  Venue Location
                </label>
                <input
                  type="text"
                  value={eventLink}
                  onChange={(e) => setEventLink(e.target.value)}
                  placeholder="Enter Location"
                  className="w-full p-4 border-2 rounded-lg text-gray-800 font-semibold"
                />

                <div className="flex justify-between items-center mt-6">
                  <button
                    className="text-pink-600 font-bold hover:underline text-lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-pink-600 text-white text-lg font-bold rounded-lg hover:bg-pink-700 transform hover:scale-105 transition"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Add Event Media
                </h2>

                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Event Poster
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEventImage(e.target.files[0])}
                  className="block w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100"
                />
                {eventImage && (
                  <img
                    src={URL.createObjectURL(eventImage)}
                    alt="Preview"
                    className="mt-4 rounded-xl border-2 max-h-56 object-contain"
                  />
                )}

                <label className="block text-lg font-semibold text-gray-700 mt-6 mb-2">
                  Short Description
                </label>
                <textarea
                  rows="4"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Tell attendees what your event is about..."
                  className="w-full p-4 border-2 rounded-lg text-gray-800 font-medium resize-none"
                ></textarea>

                <div className="flex justify-between items-center mt-6">
                  <button
                    className="text-pink-600 font-bold hover:underline text-lg"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-pink-600 text-white text-lg font-bold rounded-lg hover:bg-pink-700 transform hover:scale-105 transition"
                  >
                    Create Event
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 flex flex-col items-center">
        <div className="w-24 h-24 bg-white border-4 border-pink-300 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-5xl font-bold text-pink-600">₹</span>
        </div>
        <p className="text-xl font-extrabold text-pink-700 mt-4">
          CHEAPEST FEES
        </p>
      </div>

      <div className="mt-16 w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Save <span className="text-pink-600">more</span> on event fees with us!
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Avg. Entry Fee
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              value={entryFee}
              onChange={(e) => setEntryFee(Number(e.target.value))}
              className="w-full h-2 bg-pink-200 rounded-full"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Attendees
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              className="w-full h-2 bg-pink-200 rounded-full"
            />
          </div>
        </div>

        <p className="mt-6 text-xl font-bold text-center">
          Potential savings:{" "}
          <span className="text-pink-600">₹{calculateSavings()}</span>
        </p>
      </div>
      {/* Steps Section */}
      <section className="py-16 px-5 md:px-10 bg-white rounded mt-5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
            List your event in
          </h2>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-pink-600 mb-6">
            3 simple steps
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
            We help you create events with lowest service charges in the
            industry
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <FiCalendar />,
                title: "Add basic details",
                desc: "Enter your event name, date, time and location",
              },
              {
                icon: <FiSettings />,
                title: "Add Tickets",
                desc: "Create different ticket types with custom prices",
              },
              {
                icon: <FiShare2 />,
                title: "Go public",
                desc: "Send invites and start selling tickets",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-2xl mb-6">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-600 text-white flex items-center justify-center rounded-full text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
