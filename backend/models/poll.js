const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      text: String,
      votes: { type: Number, default: 0 },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  responses: [
    {
      studentName: String,
      selectedOption: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  timer: {
    type: Number,
    default: 60, // 60 seconds
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Poll", pollSchema);
