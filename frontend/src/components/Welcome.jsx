import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";

const Welcome = ({ onContinue }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const dispatch = useDispatch();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      dispatch(setUser({ name: "", role: selectedRole }));
      onContinue(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 mb-4">
            🔴 Internet Poll
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to the Live Polling System
          </h1>
          <p className="text-gray-600">
            Please select the role that best describes you to begin using the
            live polling system.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              selectedRole === "student"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleRoleSelect("student")}
          >
            <h3 className="font-semibold text-gray-900 mb-1">I'm a Student</h3>
            <p className="text-sm text-gray-600">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry
            </p>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              selectedRole === "teacher"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleRoleSelect("teacher")}
          >
            <h3 className="font-semibold text-gray-900 mb-1">I'm a Teacher</h3>
            <p className="text-sm text-gray-600">
              Submit answers and View live poll results in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            selectedRole
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Welcome;
