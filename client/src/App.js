import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Editor from "./component/Editor";
import HomePage from "./pages/HomePage";
import { io } from "socket.io-client";
import React, { useState, useEffect } from "react";

function App() {
  const [socket, setSocket] = useState();

  // socket setup
  useEffect(() => {
    const socketServer = io("http://localhost:9000");
    console.log("connected");
    setSocket(socketServer);

    return () => {
      socketServer.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={socket && <HomePage socket={socket} />} />
        <Route path="/:userid/docs/:id" element={<Editor socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
