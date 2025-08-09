import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { kickOutStudent } from "../store/pollSlice";
import { useSocket } from "../hooks/useSocket";

const PollResults = ({
  poll,
  onNewQuestion,
  onViewHistory,
  showNewQuestionButton = false,
}) => {
  const [results, setResults] = useState(poll);
  const [showParticipants, setShowParticipants] = useState(false);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    if (socket && poll) {
      socket.on("answer-submitted", (data) => {
        if (data.pollId === poll._id) {
          // Update results in real-time
          setResults((prev) => ({
            ...prev,
            responses: [
              ...prev.responses,
              {
                studentName: data.studentName,
                selectedOption: data.selectedOption,
                timestamp: new Date(),
              },
            ],
            options: prev.options.map((option, index) =>
              index === data.selectedOption
                ? { ...option, votes: option.votes + 1 }
                : option
            ),
          }));
        }
      });

      return () => {
        socket.off("answer-submitted");
      };
    }
  }, [socket, poll]);

  if (!results) return null;

  const totalVotes = results.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const handleKickOut = async (studentName) => {
    try {
      await dispatch(
        kickOutStudent({ pollId: results._id, studentName })
      ).unwrap();

      // Update local state
      setResults((prev) => ({
        ...prev,
        responses: prev.responses.filter((r) => r.studentName !== studentName),
      }));

      // Emit socket event
      if (socket) {
        socket.emit("student-kicked", { studentName, pollId: results._id });
      }
    } catch (error) {
      console.error("Failed to kick out student:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {showNewQuestionButton && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => onViewHistory && onViewHistory()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              📊 View Poll History
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Question</h2>
                <p className="text-gray-200">{results.question}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showParticipants ? "Chat" : "Participants"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1 p-6">
              <div className="space-y-4">
                {results.options.map((option, index) => {
                  const percentage = getPercentage(option.votes);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="font-medium text-gray-900">
                            {option.text}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showNewQuestionButton && (
                <button
                  onClick={() => onNewQuestion && onNewQuestion()}
                  className="w-full mt-8 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  + Ask a new question
                </button>
              )}
            </div>

            {showParticipants && (
              <div className="w-80 border-l border-gray-200 bg-gray-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Participants</h3>
                </div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {results.responses.map((response, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-700">
                        {response.studentName}
                      </span>
                      {user.role === "teacher" && (
                        <button
                          onClick={() => handleKickOut(response.studentName)}
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          Kick out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {user.role === "student" && !showNewQuestionButton && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 mb-4">
              🔴 Internet Poll
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Wait for the teacher to ask a new question.
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollResults;
