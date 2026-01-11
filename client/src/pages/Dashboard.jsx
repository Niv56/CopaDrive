import { useState } from "react";
import TopBar from "../components/Dashboard/layout/TopBar";
import SideBar from "../components/Dashboard/layout/SideBar";
import MainArea from "../components/Dashboard/layout/MainArea";
import "./Dashboard.css";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("mydrive");

  return (
    <div className="dashboard-root">
      <TopBar />
      <div className="dashboard-body">
        <SideBar activeView={activeView} onChangeView={setActiveView} />
        <MainArea activeView={activeView} onChangeView={setActiveView} />
      </div>
    </div>
  );
}
