import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPollHistory } from "../store/pollSlice";

const PollHistory = ({ onBackToLive }) => {
  const dispatch = useDispatch();
  const { pollHistory } = useSelector((state) => state.poll);

  useEffect(() => {
    dispatch(getPollHistory());
  }, [dispatch]);

  const getPercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            View Poll History
          </h1>
          <button
            onClick={onBackToLive}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Live Poll
          </button>
        </div>

        <div className="space-y-6">
          {pollHistory.map((poll, pollIndex) => {
            const totalVotes = poll.options.reduce(
              (sum, option) => sum + option.votes,
              0
            );

            return (
              <div
                key={poll._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="bg-gray-800 text-white p-4">
                  <h3 className="text-lg font-semibold">
                    Question {pollIndex + 1}
                  </h3>
                  <p className="text-gray-200 mt-1">{poll.question}</p>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {poll.options.map((option, index) => {
                      const percentage = getPercentage(
                        option.votes,
                        totalVotes
                      );
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
                              className="bg-purple-600 h-3 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    Total responses: {totalVotes} • Created:{" "}
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}

          {pollHistory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No polls found in history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollHistory;
