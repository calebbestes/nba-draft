import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BigBoard from './big-board/page';
import { PlayerProfile } from './player-profile/page'
import './index.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/big-board" />} />
        <Route path="/big-board" element={<BigBoard />} />
        <Route path="/player/:id" element={<PlayerProfile />} />
        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
