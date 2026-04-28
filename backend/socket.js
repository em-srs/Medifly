const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, { 
    cors: { 
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"]
    } 
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join room specifically for user notifications
    socket.on("joinUserRoom", (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined user room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIo };
