import React from "react";

const KickedOut = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Branding */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-8">
          <span className="mr-1">★</span>
          Intervue Poll
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl font-bold text-black mb-6">
          You've been Kicked out !
        </h1>

        {/* Explanatory Message */}
        <p className="text-gray-500 text-lg leading-relaxed">
          Looks like the teacher had removed you from the poll system. Please Try again sometime.
        </p>
      </div>
    </div>
  );
};

export default KickedOut;
