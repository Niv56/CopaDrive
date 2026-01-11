import React from "react";

function SideBar({ activeView, onChangeView }) {
  return (
    <aside className="dashboard-side">
      <ul className="side-list">
        <li
          className={activeView === "mydrive" ? "active" : ""}
          onClick={() => {
            onChangeView("mydrive");
            window.dispatchEvent(new CustomEvent("reset-mydrive"));
          }}
        >
          My Drive
        </li>

        <li
          className={activeView === "recent" ? "active" : ""}
          onClick={() => onChangeView("recent")}
        >
          Recent
        </li>

        <li
          className={activeView === "starred" ? "active" : ""}
          onClick={() => onChangeView("starred")}
        >
          Starred
        </li>

        <li
          className={activeView === "shared" ? "active" : ""}
          onClick={() => onChangeView("shared")}
        >
          Shared
        </li>

        <li
          className={activeView === "trash" ? "active" : ""}
          onClick={() => onChangeView("trash")}
        >
          Trash
        </li>
      </ul>
    </aside>
  );
}
export default SideBar;