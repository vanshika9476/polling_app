import { useContext } from "react";
import SocketContext from "../context/SocketContext";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  // Return the socket (which could be null during initialization)
  return context;
};
