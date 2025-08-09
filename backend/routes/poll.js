const express = require("express");
const pollController = require("../controllers/pollController");

const router = express.Router();

// Create a new poll
router.post("/create", pollController.createPoll);

// Get current active poll
router.get("/current", pollController.getCurrentPoll);

// Submit answer
router.post("/answer", pollController.submitAnswer);

// Get poll results
router.get("/:pollId/results", pollController.getPollResults);

// Close poll
router.put("/:pollId/close", pollController.closePoll);

// Get all polls
router.get("/history", pollController.getAllPolls);

// Kick out student
router.delete("/:pollId/kickout/:studentName", pollController.kickOutStudent);

module.exports = router;
