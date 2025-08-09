import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";

const Welcome = ({ onContinue }) => {
  const [selectedRole, setSelectedRole] = useState("student"); // Default to student as shown in image
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
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-black text-white px-4 py-2 text-sm">
        Desktop 001
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-40px)] px-4">
        {/* Branding */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-8">
          <span className="mr-1">★</span>
          Intervue Poll
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-black mb-4 text-center">
          Welcome to the Live Polling System
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 mb-12 text-center max-w-md">
          Please select the role that best describes you to begin using the live polling system.
        </p>

        {/* Role Selection Cards */}
        <div className="flex gap-6 mb-12 max-w-2xl w-full">
          {/* Student Card */}
          <div
            className={`flex-1 border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedRole === "student"
                ? "border-purple-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => handleRoleSelect("student")}
          >
            <h3 className="font-bold text-black text-lg mb-3">I'm a Student</h3>
            <p className="text-sm text-gray-500">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </p>
          </div>

          {/* Teacher Card */}
          <div
            className={`flex-1 border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedRole === "teacher"
                ? "border-purple-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => handleRoleSelect("teacher")}
          >
            <h3 className="font-bold text-black text-lg mb-3">I'm a Teacher</h3>
            <p className="text-sm text-gray-500">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-8 rounded-lg font-medium text-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Welcome;
