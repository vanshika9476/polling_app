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
        <div className="min-h-screen bg-white flex items-center justify-center relative">
          <div className="text-center">
            {/* Branding */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-8">
              <span className="mr-1">★</span>
              Intervue Poll
            </div>
            
            {/* Loading Spinner */}
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
            
            {/* Instructional Text */}
            <h2 className="text-xl font-bold text-black">
              Wait for the teacher to ask questions..
            </h2>
          </div>
          
          {/* Chat Icon - Bottom Right */}
          <div className="absolute bottom-6 right-6">
            <button className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white hover:bg-purple-700 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      );

    default:
      return <Welcome onContinue={handleRoleSelection} />;
  }
}

export default App;
