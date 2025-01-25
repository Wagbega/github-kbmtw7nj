import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import LiveStream from './pages/LiveStream';
import Events from './pages/Events';
import Archive from './pages/Archive';
import Profile from './pages/Profile';
import PrayerWall from './pages/PrayerWall';
import PrayerRequestNotifications from './components/PrayerRequestNotifications';
import { Toaster } from 'react-hot-toast';

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScrollToTop />
        <Toaster position="top-right" />
        <Navigation />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live" element={<LiveStream />} />
            <Route path="/events" element={<Events />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/prayer-wall" element={<PrayerWall />} />
          </Routes>
        </div>
        <Footer />
        <PrayerRequestNotifications />
      </div>
    </BrowserRouter>
  );
}

export default App;