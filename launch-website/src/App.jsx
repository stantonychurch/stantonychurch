import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Globe, Smartphone, ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';

const YOUTUBE_URL = "https://youtube.com/@wonderworkerstantony-mtp?si=DR85gCuhl5Z7n4r0";
const WEBSITE_URL = "https://stantonychruchmettupalayam.pythonanywhere.com/";

function App() {
  const [activeLaunch, setActiveLaunch] = useState(null); // 'youtube', 'website', 'app', or null

  const handleLaunch = (type) => {
    setActiveLaunch(type);
  };

  const handleBack = () => {
    setActiveLaunch(null);
  };

  return (
    <div className="app-container">
      <div className="bg-glow"></div>

      <AnimatePresence mode="wait">
        {!activeLaunch && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center"
          >
            <header className="header">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="header-title"
              >
                St. Antony Church
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="header-subtitle"
              >
                Wonder Worker - MTP
              </motion.p>
            </header>

            <div className="cards-container">
              {/* YouTube Card */}
              <motion.div 
                className="launch-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLaunch('youtube')}
              >
                <div className="icon-wrapper">
                  <Youtube size={36} color="#d4af37" />
                </div>
                <h2 className="card-title">YouTube Channel</h2>
                <p className="card-desc">Experience our sermons, prayers, and community events through our official channel.</p>
                <button className="launch-btn">Launch Channel</button>
              </motion.div>

              {/* Website Card */}
              <motion.div 
                className="launch-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLaunch('website')}
              >
                <div className="icon-wrapper">
                  <Globe size={36} color="#d4af37" />
                </div>
                <h2 className="card-title">Official Website</h2>
                <p className="card-desc">Discover our history, mass timings, and connect with our parish community online.</p>
                <button className="launch-btn">Launch Website</button>
              </motion.div>

              {/* App Card */}
              <motion.div 
                className="launch-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLaunch('app')}
              >
                <div className="icon-wrapper">
                  <Smartphone size={36} color="#d4af37" />
                </div>
                <h2 className="card-title">Mobile App</h2>
                <p className="card-desc">Carry the Word of God in your pocket with our dedicated Devotional App.</p>
                <button className="launch-btn">Launch App</button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeLaunch === 'youtube' && (
          <motion.div
            key="youtube-reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="reveal-container"
          >
            <button className="back-btn" onClick={handleBack}>
              <ArrowLeft size={20} /> Back
            </button>
            <Youtube size={64} className="reveal-icon" />
            <h2 className="reveal-title">Wonder Work St Antony Church - MTP</h2>
            <p className="reveal-desc">Our official YouTube channel is now live. Subscribe to stay updated with our latest videos.</p>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="reveal-action-btn">
              Visit Channel <ExternalLink size={20} />
            </a>
          </motion.div>
        )}

        {activeLaunch === 'website' && (
          <motion.div
            key="website-reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="reveal-container"
          >
            <button className="back-btn" onClick={handleBack}>
              <ArrowLeft size={20} /> Back
            </button>
            <Globe size={64} className="reveal-icon" />
            <h2 className="reveal-title">St. Antony Church Portal</h2>
            <p className="reveal-desc">Explore our new digital home. Connecting our community across the globe.</p>
            <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="reveal-action-btn">
              Visit Website <ExternalLink size={20} />
            </a>
          </motion.div>
        )}

        {activeLaunch === 'app' && (
          <motion.div
            key="app-reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="reveal-container"
          >
            <button className="back-btn" onClick={handleBack}>
              <ArrowLeft size={20} /> Back
            </button>
            
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none"/>
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            
            <h2 className="reveal-title">App Launched Successfully!</h2>
            <p className="reveal-desc">
              The <strong>St Antony Church</strong> app is now live and ready to serve our community. 
              Available for download on your mobile devices.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
