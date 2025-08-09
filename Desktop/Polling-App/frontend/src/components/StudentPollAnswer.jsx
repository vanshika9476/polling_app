import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitAnswer } from "../store/pollSlice";
import { useSocket } from "../hooks/useSocket";

const StudentPollAnswer = ({ poll, onAnswerSubmitted }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const loading = useSelector((state) => state.poll.loading);
  const socket = useSocket();

  useEffect(() => {
    if (poll) {
      const startTime = new Date(poll.startTime);
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const remaining = Math.max(0, (poll.timer || 60) - elapsed);
      setTimeLeft(remaining);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0 && !hasSubmitted) {
            // Time's up, show results
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 mb-4">
            🔴 Internet Poll
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Wait for the teacher to ask questions..
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Question 1</h2>
              <div className="flex items-center gap-2">
                <span className="text-red-400">⏰</span>
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <p className="mt-2">{poll.question}</p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedOption === index
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
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
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${
                      selectedOption === index ? "bg-purple-600" : "bg-gray-400"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-900">{option.text}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                selectedOption === null ||
                hasSubmitted ||
                timeLeft === 0 ||
                loading.poll
              }
              className="w-full mt-6 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default StudentPollAnswer;
