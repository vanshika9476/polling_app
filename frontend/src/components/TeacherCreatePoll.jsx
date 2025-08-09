import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPoll, clearError } from "../store/pollSlice";
import { useSocket } from "../hooks/useSocket";

const TeacherCreatePoll = ({ onPollCreated }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
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
        setCorrectAnswer(null);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 mb-4">
            📊 Internet Poll
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Let's Get Started
          </h1>
          <p className="text-gray-600">
            You'll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Rahul Bajaj"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {question.length}/100
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Edit Options
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Is it Correct?
              </label>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Rahul Bajaj`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswer === index}
                        onChange={() => setCorrectAnswer(index)}
                        className="text-purple-600"
                      />
                      <span className="ml-1 text-sm">Yes</span>
                    </label>
                    <span className="text-sm text-gray-500">No</span>
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700"
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
                className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                + Add More option
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timer (seconds)
            </label>
            <select
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Poll..." : "Ask Question"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherCreatePoll;
