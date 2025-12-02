import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { WSMessage, WSMessageType } from "../shared/gameTypes";

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : "*",
      credentials: true,
    },
    path: "/api/socket.io",
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join game session room
    socket.on("join_session", (sessionCode: string) => {
      socket.join(`session:${sessionCode}`);
      console.log(`[WebSocket] Socket ${socket.id} joined session: ${sessionCode}`);
    });

    // Leave game session room
    socket.on("leave_session", (sessionCode: string) => {
      socket.leave(`session:${sessionCode}`);
      console.log(`[WebSocket] Socket ${socket.id} left session: ${sessionCode}`);
    });

    // Join as host
    socket.on("join_as_host", (sessionCode: string) => {
      socket.join(`host:${sessionCode}`);
      console.log(`[WebSocket] Socket ${socket.id} joined as host: ${sessionCode}`);
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("WebSocket server not initialized");
  }
  return io;
}

/**
 * Broadcast message to all players in a session
 */
export function broadcastToSession(
  sessionCode: string,
  type: WSMessageType,
  payload: unknown
) {
  if (!io) return;

  const message: WSMessage = {
    type,
    payload,
    timestamp: Date.now(),
  };

  io.to(`session:${sessionCode}`).emit("game_event", message);
  console.log(`[WebSocket] Broadcast to session ${sessionCode}:`, type);
}

/**
 * Send message only to host
 */
export function sendToHost(
  sessionCode: string,
  type: WSMessageType,
  payload: unknown
) {
  if (!io) return;

  const message: WSMessage = {
    type,
    payload,
    timestamp: Date.now(),
  };

  io.to(`host:${sessionCode}`).emit("host_event", message);
  console.log(`[WebSocket] Sent to host ${sessionCode}:`, type);
}

/**
 * Send message to specific socket
 */
export function sendToSocket(
  socketId: string,
  type: WSMessageType,
  payload: unknown
) {
  if (!io) return;

  const message: WSMessage = {
    type,
    payload,
    timestamp: Date.now(),
  };

  io.to(socketId).emit("game_event", message);
}
