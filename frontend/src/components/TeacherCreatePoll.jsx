import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPoll, clearError } from "../store/pollSlice";
import { useSocket } from "../hooks/useSocket";

const TeacherCreatePoll = ({ onPollCreated }) => {
  const [question, setQuestion] = useState("Rahul Bajaj");
  const [options, setOptions] = useState(["vanshika", "Rahul Bajaj"]);
  const [correctAnswer, setCorrectAnswer] = useState(null); // Default to no correct answer
  const [timer, setTimer] = useState(60);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.poll);
  const socket = useSocket();

  // Clear any errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer === index) {
        setCorrectAnswer(null); // Reset to no correct answer
      } else if (correctAnswer > index) {
        setCorrectAnswer(correctAnswer - 1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || options.some((opt) => !opt.trim())) {
      return;
    }

    console.log("Creating poll with data:", { question: question.trim(), options: options.filter((opt) => opt.trim()), timer, correctAnswer });

    const pollData = {
      question: question.trim(),
      options: options.filter((opt) => opt.trim()),
      timer,
      correctAnswer,
    };

    try {
      const result = await dispatch(createPoll(pollData)).unwrap();
      console.log("Poll created successfully:", result);

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("new-poll", result);
      }

      onPollCreated(result);
    } catch (error) {
      console.error("Failed to create poll:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-6">
            <span className="mr-1">★</span>
            Intervue Poll
          </div>
          <h1 className="text-3xl font-bold text-black mb-4">
            Let's Get Started
          </h1>
          <p className="text-gray-500 text-lg">
            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Question Input Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xl font-bold text-black">
                Enter your question
              </label>
              <select
                value={timer}
                onChange={(e) => setTimer(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
                <option value={120}>120 seconds</option>
              </select>
            </div>
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                maxLength={100}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-gray-50"
                required
              />
              <div className="absolute bottom-2 right-2 text-sm text-gray-500">
                {question.length}/100
              </div>
            </div>
          </div>

          {/* Options and Correctness Section */}
          <div>
            <div className="grid grid-cols-2 gap-12">
              {/* Left Column - Edit Options */}
              <div>
                <label className="block text-xl font-bold text-black mb-6">
                  Edit Options
                </label>
                <div className="space-y-6">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder="Enter option text"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-6 border border-purple-300 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                  >
                    + Add More option
                  </button>
                )}
              </div>

              {/* Right Column - Is it Correct? */}
              <div>
                <label className="block text-xl font-bold text-black mb-6">
                  Is it Correct?
                </label>
                <div className="space-y-6">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-6 h-12">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`correctAnswer_${index}`}
                          checked={correctAnswer === index}
                          onChange={() => setCorrectAnswer(index)}
                          className="text-purple-600 focus:ring-purple-500 w-4 h-4"
                        />
                        <span className="ml-3 text-sm font-medium">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`correctAnswer_${index}`}
                          checked={correctAnswer !== index}
                          onChange={() => setCorrectAnswer(null)}
                          className="text-purple-600 focus:ring-purple-500 w-4 h-4"
                        />
                        <span className="ml-3 text-sm font-medium">No</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 px-10 rounded-lg font-medium text-lg hover:from-purple-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? "Creating Poll..." : "Ask Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherCreatePoll;
