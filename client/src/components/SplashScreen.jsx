import React, { useEffect, useState } from "react";
import "styles/layout/SplashScreen.css";

/** Animated splash screen with auto-timer and skip option */
const SplashScreen = ({ onFinish }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleTransition();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  /** Triggers exit transition */
  const handleTransition = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 500);
  };

  return (
    <div className={`splash-screen ${isFading ? "fade-out" : ""}`}>
      <div className="splash-content">
        <div className="coconut-bounce">
          <span style={{ fontSize: "100px", display: "block" }}>🥥</span>
        </div>

        <h1 className="splash-title">CopaDrive</h1>

        <div className="loading-bar"></div>

        <button className="btn-sparkle" onClick={handleTransition}>
          <span className="sparkle-text">Skip</span>
          <div className="sparkle-stars">
            <div className="s-star s-1"></div>
            <div className="s-star s-2"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;