import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitAnswer } from "../store/pollSlice";
import { useSocket } from "../hooks/useSocket";

const StudentPollAnswer = ({ poll, onAnswerSubmitted }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(poll?.timer || 60);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const loading = useSelector((state) => state.poll.loading);
  const socket = useSocket();

  useEffect(() => {
    if (poll && !hasSubmitted) {
      // Start with the poll's timer value
      const initialTime = poll.timer || 60;
      setTimeLeft(initialTime);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            // Time's up, show results
            clearInterval(timer);
            onAnswerSubmitted();
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [poll, hasSubmitted, onAnswerSubmitted]);

  const handleSubmit = async () => {
    if (selectedOption === null || hasSubmitted) return;

    try {
      const answerData = {
        pollId: poll._id,
        selectedOption,
        studentName: user.name,
      };

      await dispatch(submitAnswer(answerData)).unwrap();

      // Emit socket event
      if (socket) {
        socket.emit("submit-answer", answerData);
      }

      setHasSubmitted(true);
      onAnswerSubmitted();
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!poll) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative">
        <div className="text-center">
          {/* Branding */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-8">
            <span className="mr-1">★</span>
            Intervue Poll
          </div>
          
          {/* Loading Spinner */}
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          
          {/* Instructional Text */}
          <h2 className="text-xl font-bold text-black">
            Wait for the teacher to ask questions..
          </h2>
        </div>
        
        {/* Chat Icon - Bottom Right */}
        <div className="absolute bottom-6 right-6">
          <button className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white hover:bg-purple-700 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-gray-800 h-1"></div>
      
      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-8">
        {/* Question Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Question 1</h2>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-mono text-red-500 font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden shadow-lg">
          {/* Question Bar */}
          <div className="bg-gray-800 text-white p-6 rounded-t-xl">
            <p className="text-lg font-medium">{poll.question}</p>
          </div>

          {/* Options Section */}
          <div className="p-6 space-y-4">
            {poll.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOption === index
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  disabled={hasSubmitted || timeLeft === 0}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 ${
                    selectedOption === index ? "bg-purple-600" : "bg-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-black font-medium">{option.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={
              selectedOption === null ||
              hasSubmitted ||
              timeLeft === 0 ||
              loading.poll
            }
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-8 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.poll
              ? "Submitting..."
              : hasSubmitted
              ? "Submitted"
              : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPollAnswer;
