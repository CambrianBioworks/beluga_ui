import { io } from "socket.io-client";

// Replace with your Python backend URL
export const socket = io("http://localhost:8000", {
  transports: ["websocket"], // force WebSocket transport
});
