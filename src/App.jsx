import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TransportProvider } from './context/TransportContext.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { HostPage } from './pages/HostPage.jsx';
import { JoinPage } from './pages/JoinPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <TransportProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/host" element={<HostPage />} />
            <Route path="/join/:code" element={<JoinPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </TransportProvider>
  );
}
