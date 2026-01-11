import React from "react";
import StorageIndicator from "../widgets/StorageIndicator";

function SideBar({ activeView, onChangeView }) {
  return (
    <aside className="dashboard-side">
      <ul className="side-list">
         <li
          className={activeView === "home" ? "active" : ""}
          onClick={() => onChangeView("home")}
        >
          🏠 Home
        </li>

        <li
          className={activeView === "mydrive" ? "active" : ""}
          onClick={() => {
            onChangeView("mydrive");
            window.dispatchEvent(new CustomEvent("reset-mydrive"));
          }}
        >
          📁 My Drive
        </li>

        <li
          className={activeView === "recent" ? "active" : ""}
          onClick={() => onChangeView("recent")}
        >
          🕒 Recent
        </li>

        <li
          className={activeView === "starred" ? "active" : ""}
          onClick={() => onChangeView("starred")}
        >
          ⭐ Starred
        </li>

        <li
          className={activeView === "shared" ? "active" : ""}
          onClick={() => onChangeView("shared")}
        >
          👤 Shared with me
        </li>

        <li
          className={activeView === "trash" ? "active" : ""}
          onClick={() => onChangeView("trash")}
        >
          🗑️ Trash
        </li>
        <li
          className={activeView === "storage" ? "active" : ""}
          onClick={() => onChangeView("storage")}
        >
          ☁️ Storage
        </li>
      </ul>
      
      {/* מחוץ ל-ul, בתחתית */}
      <StorageIndicator usedGB={12} />
    </aside>
  );
}
export default SideBar;