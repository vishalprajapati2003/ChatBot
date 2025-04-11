// import dotenv from "dotenv";
// dotenv.config();
import "dotenv/config.js";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import logger from "./config/logger.js";
import { generateResult } from "./services/ai.service.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    socket.project = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error("Token Authentication error"));
    }
    // Verify the token here (e.g., using JWT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded; // Attach user info to socket for later use

    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();

  console.log("a user connected");

  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    // console.log("data:",data);
    const message = data.message;

    const aiIsPresentInMessage = message.includes("@ai");

    socket.broadcast.to(socket.roomId).emit("project-message", data);

    if (aiIsPresentInMessage) {
      const prompt = message.replace("@ai", "");

      const result = await generateResult(prompt);

      // console.log("Result:", result);
      // Emit the AI response back to the room
      io.to(socket.roomId).emit("project-message", {
        message: result,
        sender: {
          _id: "ai",
          email: "AI",
        },
      });
      return;
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  logger.info(`\n🚀 Server listening on port ${process.env.PORT}`);
  // console.log(`Server listening on port ${process.env.PORT}`);
});

/*
When you use http.createServer(app): You're explicitly creating an HTTP server, passing your Express app (app) as the request handler.

This gives you more control — you can: Attach other protocols like WebSocket (e.g., with socket.io)

Intercept or manipulate lower-level request/response behavior

Access the server object directly for advanced configuration

Method	                    Use Case
http.createServer(app)	    When you need more control (e.g. WebSockets)
app.listen()	            Simple apps, quick setup
*/
