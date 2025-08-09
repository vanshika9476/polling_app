const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const userRouter = require("./routes/auth");
const pollRouter = require("./routes/poll");
const db = require("./initializer/db");
const authMiddleware = require("./middlewares/authMiddleware");
const Poll = require("./models/poll");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/polls", pollRouter);

// Store active poll timers
const pollTimers = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join poll room
  socket.on("join-poll", (pollId) => {
    socket.join(pollId);
    console.log(`User ${socket.id} joined poll ${pollId}`);
  });

  // Handle new poll creation
  socket.on("new-poll", (pollData) => {
    // Clear any existing timer for the poll
    if (pollTimers.has(pollData._id)) {
      clearTimeout(pollTimers.get(pollData._id));
    }

    // Set up auto-close timer (default 60 seconds)
    const timer = setTimeout(async () => {
      try {
        await Poll.findByIdAndUpdate(pollData._id, { isActive: false });
        io.emit("poll-closed", pollData._id);
        pollTimers.delete(pollData._id);
        console.log(`Poll ${pollData._id} automatically closed after timer`);
      } catch (error) {
        console.error("Error auto-closing poll:", error);
      }
    }, (pollData.timer || 60) * 1000);

    pollTimers.set(pollData._id, timer);
    io.emit("poll-created", pollData);
  });

  // Handle poll answer submission
  socket.on("submit-answer", (data) => {
    io.to(data.pollId).emit("answer-submitted", data);
  });

  // Handle poll results update
  socket.on("update-results", (data) => {
    io.emit("results-updated", data);
  });

  // Handle manual poll closure
  socket.on("close-poll", async (pollId) => {
    try {
      // Clear the timer if poll is manually closed
      if (pollTimers.has(pollId)) {
        clearTimeout(pollTimers.get(pollId));
        pollTimers.delete(pollId);
      }

      await Poll.findByIdAndUpdate(pollId, { isActive: false });
      io.emit("poll-closed", pollId);
      console.log(`Poll ${pollId} manually closed`);
    } catch (error) {
      console.error("Error closing poll:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log("Server is listening on port: ", PORT);
});
