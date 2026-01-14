import { useState } from "react";
import { useTheme } from "app/providers/ThemeProvider"; 

import TopBar from "features/drive/layout/TopBar";
import SideBar from "features/drive/layout/SideBar";
import MainArea from "features/drive/layout/MainArea";

import lightVideo from "assets/videos/light.mp4";
import darkVideo from "assets/videos/dark.mp4";

import "styles/pages/Dashboard.css";

// Main Dashboard Layout
export default function Dashboard() {
  const [activeView, setActiveView] = useState("home");
  const { theme } = useTheme(); 

  return (
    <div className="dashboard-root">
      {/* תיקון למעבר חלק:
          במקום להחליף מקור וידאו (שגורם להבהוב), אנחנו טוענים את שניהם.
          ה-CSS מטפל בשקיפות (Opacity) כדי לעשות מעבר נעים.
      */}
      
      {/* וידאו יום */}
      <video
        className={`background-video ${theme === 'light' ? 'active' : ''}`}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={lightVideo} type="video/mp4" />
      </video>

      {/* וידאו לילה */}
      <video
        className={`background-video ${theme === 'dark' ? 'active' : ''}`}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={darkVideo} type="video/mp4" />
      </video>

      <div className="content-overlay">
        <TopBar />
        <div className="dashboard-body">
          <SideBar activeView={activeView} onChangeView={setActiveView} />
          <MainArea activeView={activeView} onChangeView={setActiveView} />
        </div>
      </div>
    </div>
  );
}