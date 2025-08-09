import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentPoll, updatePoll } from "./store/pollSlice";
import { useSocket } from "./hooks/useSocket";

// Components
import Welcome from "./components/Welcome";
import StudentNameEntry from "./components/StudentNameEntry";
import TeacherCreatePoll from "./components/TeacherCreatePoll";
import StudentPollAnswer from "./components/StudentPollAnswer";
import PollResults from "./components/PollResults";
import PollHistory from "./components/PollHistory";
import KickedOut from "./components/KickedOut";

function App() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [showHistory, setShowHistory] = useState(false);
  const [isKickedOut, setIsKickedOut] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const { currentPoll } = useSelector((state) => state.poll);
  const socket = useSocket();

  useEffect(() => {
    // Get current poll on app load
    dispatch(getCurrentPoll());
  }, [dispatch]);

  useEffect(() => {
    if (socket) {
      // Listen for new polls
      socket.on("poll-created", (pollData) => {
        dispatch(updatePoll(pollData));
        if (
          user.role === "student" &&
          currentScreen !== "welcome" &&
          currentScreen !== "nameEntry"
        ) {
          setCurrentScreen("answerPoll");
        }
      });

      // Listen for poll results updates
      socket.on("results-updated", (pollData) => {
        dispatch(updatePoll(pollData));
      });

      // Listen for poll closure
      socket.on("poll-closed", () => {
        dispatch(updatePoll(null)); // Clear the current poll
        if (user.role === "student") {
          setCurrentScreen("waitingForTeacher");
        } else if (user.role === "teacher") {
          // Teacher stays on results screen but poll is cleared
          setCurrentScreen("results");
        }
      });

      // Listen for student being kicked out
      socket.on("student-kicked", (data) => {
        if (user.role === "student" && data.studentName === user.name) {
          setIsKickedOut(true);
        }
      });

      return () => {
        socket.off("poll-created");
        socket.off("results-updated");
        socket.off("poll-closed");
      };
    }
  }, [socket, dispatch, user.role, user.name, currentScreen]);

  const handleRoleSelection = (role) => {
    if (role === "student") {
      setCurrentScreen("nameEntry");
    } else {
      setCurrentScreen("teacherDashboard");
    }
  };

  const handleNameSubmit = () => {
    if (currentPoll && currentPoll.isActive) {
      // Check if student already answered
      const hasAnswered = currentPoll.responses?.some(
        (response) => response.studentName === user.name
      );

      if (hasAnswered) {
        setCurrentScreen("results");
      } else {
        setCurrentScreen("answerPoll");
      }
    } else {
      setCurrentScreen("waitingForTeacher");
    }
  };

  const handlePollCreated = () => {
    setCurrentScreen("results");
  };

  const handleAnswerSubmitted = () => {
    setCurrentScreen("results");
  };

  const handleNewQuestion = () => {
    setCurrentScreen("teacherDashboard");
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleBackToLive = () => {
    setShowHistory(false);
    setCurrentScreen("results");
  };

  // Show kicked out screen if student was kicked
  if (isKickedOut) {
    return <KickedOut />;
  }

  // Show history if requested
  if (showHistory) {
    return <PollHistory onBackToLive={handleBackToLive} />;
  }

  // Route to appropriate screen
  switch (currentScreen) {
    case "welcome":
      return <Welcome onContinue={handleRoleSelection} />;

    case "nameEntry":
      return <StudentNameEntry onNameSubmit={handleNameSubmit} />;

    case "teacherDashboard":
      return <TeacherCreatePoll onPollCreated={handlePollCreated} />;

    case "answerPoll":
      return (
        <StudentPollAnswer
          poll={currentPoll}
          onAnswerSubmitted={handleAnswerSubmitted}
        />
      );

    case "results":
      return (
        <PollResults
          poll={currentPoll}
          onNewQuestion={
            user.role === "teacher" ? handleNewQuestion : undefined
          }
          onViewHistory={
            user.role === "teacher" ? handleViewHistory : undefined
          }
          showNewQuestionButton={user.role === "teacher"}
        />
      );

    case "waitingForTeacher":
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 mb-4">
              🔴 Internet Poll
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Wait for the teacher to ask questions..
            </h2>
          </div>
        </div>
      );

    default:
      return <Welcome onContinue={handleRoleSelection} />;
  }
}

export default App;
