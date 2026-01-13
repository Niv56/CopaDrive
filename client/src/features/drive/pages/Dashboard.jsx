import { useState } from "react";
import { useTheme } from "app/providers/ThemeProvider"; // ✅ ייבוא ה-Hook של העיצוב

import TopBar from "features/drive/layout/TopBar";
import SideBar from "features/drive/layout/SideBar";
import MainArea from "features/drive/layout/MainArea";

// ✅ ייבוא הסרטונים (וודא שהם נמצאים בתיקייה הזו בדיוק)
import lightVideo from "assets/videos/light.mp4";
import darkVideo from "assets/videos/dark.mp4";

import "styles/pages/Dashboard.css";

// Main Dashboard Layout
export default function Dashboard() {
  const [activeView, setActiveView] = useState("home");
  
  // ✅ שליפת המצב הנוכחי (dark/light)
  const { theme } = useTheme(); 

  return (
    <div className="dashboard-root">
      {/* ✅ נגן הווידאו ברקע */}
      <video
        key={theme} // הטריק שגורם להחלפה חלקה בין סרטונים
        className="background-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={theme === "dark" ? darkVideo : lightVideo} type="video/mp4" />
      </video>

      {/* ✅ שכבת התוכן עוטפת את הכל */}
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