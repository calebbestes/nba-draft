import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BigBoard from "./big-board/page";
import "./index.css";
import PlayerProfile from "./player-profile/page";
import ExtraMustard from "./extra-mustard/page";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/big-board" />} />
        <Route path="/big-board" element={<BigBoard />} />
        <Route path="/player/:name" element={<PlayerProfile />} />
        <Route path="/compare" element={<ExtraMustard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);