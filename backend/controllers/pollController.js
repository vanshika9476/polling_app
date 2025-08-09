const Poll = require("../models/poll");

const pollController = {
  // Create a new poll
  createPoll: async (req, res) => {
    try {
      const { question, options } = req.body;

      // Close any existing active poll before creating a new one
      await Poll.updateMany({ isActive: true }, { isActive: false });

      const formattedOptions = options.map((option) => ({
        text: option,
        votes: 0,
      }));

      const poll = new Poll({
        question,
        options: formattedOptions,
        isActive: true,
        startTime: new Date(),
      });

      await poll.save();
      res.status(201).json(poll);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get current active poll
  getCurrentPoll: async (req, res) => {
    try {
      const poll = await Poll.findOne({ isActive: true });
      res.json(poll);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Submit answer to poll
  submitAnswer: async (req, res) => {
    try {
      const { pollId, selectedOption, studentName } = req.body;

      const poll = await Poll.findById(pollId);

      if (!poll || !poll.isActive) {
        return res.status(400).json({ error: "Poll not found or not active" });
      }

      // Check if student already answered
      const existingResponse = poll.responses.find(
        (response) => response.studentName === studentName
      );

      if (existingResponse) {
        return res
          .status(400)
          .json({ error: "You have already answered this poll" });
      }

      // Add response
      poll.responses.push({
        studentName,
        selectedOption,
        timestamp: new Date(),
      });

      // Update vote count
      poll.options[selectedOption].votes += 1;

      await poll.save();
      res.json({ message: "Answer submitted successfully", poll });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get poll results
  getPollResults: async (req, res) => {
    try {
      const { pollId } = req.params;
      const poll = await Poll.findById(pollId);

      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      res.json(poll);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Close poll
  closePoll: async (req, res) => {
    try {
      const { pollId } = req.params;

      const poll = await Poll.findByIdAndUpdate(
        pollId,
        { isActive: false },
        { new: true }
      );

      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      res.json(poll);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all polls (history)
  getAllPolls: async (req, res) => {
    try {
      const polls = await Poll.find().sort({ createdAt: -1 });
      res.json(polls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Kick out student
  kickOutStudent: async (req, res) => {
    try {
      const { pollId, studentName } = req.params;

      const poll = await Poll.findById(pollId);

      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      // Remove student's response
      const removedResponse = poll.responses.find(
        (response) => response.studentName === studentName
      );

      if (removedResponse) {
        // Decrease vote count
        poll.options[removedResponse.selectedOption].votes -= 1;

        // Remove response
        poll.responses = poll.responses.filter(
          (response) => response.studentName !== studentName
        );

        await poll.save();
      }

      res.json({ message: "Student kicked out successfully", poll });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = pollController;
