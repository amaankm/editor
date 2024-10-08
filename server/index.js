import { Server } from "socket.io";
import { Redis } from "ioredis";

import Connection from "./database/db.js";

import {
  checkDocument,
  getDocument,
  updateDocument,
} from "./controller/document-controller.js";

const PORT = process.env.PORT || 9000;
const host = process.env.REDIS_HOST;
const password = process.env.REDIS_PASSWORD;
const port = process.env.REDIS_PORT;

//MongoDB connection
Connection();

const pub = new Redis({
  host: host,
  port: port,
  username: "default",
  password: password,
});

const sub = new Redis({
  host: host,
  port: port,
  username: "default",
  password: password,
});

sub.subscribe("CHANGES");

const io = new Server(PORT, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("check-document", async (documentId) => {
    console.log(documentId);
    const check = await checkDocument(documentId);
    socket.emit("return-check-document", check);
  });
  socket.on("get-document", async (documentId) => {
    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", async (data) => {
      const { delta, senderId } = JSON.parse(data);
      console.log(delta, senderId);
      await pub.publish(
        "CHANGES",
        JSON.stringify({ documentId, delta, senderId })
      );
      //   socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await updateDocument(documentId, data);
    });
  });
});

sub.on("message", (channel, change) => {
  if (channel === "CHANGES") {
    const { documentId, delta, senderId } = JSON.parse(change);
    console.log(documentId, delta, senderId);
    io.to(documentId).emit(
      "receive-changes",
      JSON.stringify({ delta, senderId })
    );
  }
});
