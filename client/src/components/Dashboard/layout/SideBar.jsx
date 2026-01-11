import React, { useEffect, useState } from "react";
import StorageIndicator from "../widgets/StorageIndicator";
import { getUsage } from "../../../api/filesApi";

function SideBar({ activeView, onChangeView }) {
  const [usage, setUsage] = useState({ usedBytes: 0, quotaBytes: 15 * 1024 * 1024 * 1024 });

  useEffect(() => {
    let alive = true;

    async function loadUsage() {
      try {
        const u = await getUsage();
        if (!alive) return;
        setUsage({
          usedBytes: u?.usedBytes ?? 0,
          quotaBytes: u?.quotaBytes ?? 15 * 1024 * 1024 * 1024,
        });
      } catch {
        // לא מפילים UI אם זה נכשל
      }
    }

    loadUsage();

    // אופציונלי: לרענן כל כמה שניות
    const t = setInterval(loadUsage, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <aside className="dashboard-side">
      <ul className="side-list">
        <li className={activeView === "home" ? "active" : ""} onClick={() => onChangeView("home")}>
          🏠 Home
        </li>

        <li
          className={activeView === "mydrive" ? "active" : ""}
          onClick={() => {
            window.dispatchEvent(new Event("reset-mydrive"));
            onChangeView("mydrive");
          }}
        >
          📁 My Drive
        </li>

        <li className={activeView === "recent" ? "active" : ""} onClick={() => onChangeView("recent")}>
          🕒 Recent
        </li>

        <li className={activeView === "starred" ? "active" : ""} onClick={() => onChangeView("starred")}>
          ⭐ Starred
        </li>

        <li className={activeView === "important" ? "active" : ""} onClick={() => onChangeView("important")}>
          ❗ Important
        </li>

        <li className={activeView === "shared" ? "active" : ""} onClick={() => onChangeView("shared")}>
          👤 Shared with me
        </li>

        <li className={activeView === "trash" ? "active" : ""} onClick={() => onChangeView("trash")}>
          🗑️ Trash
        </li>

        <li className={activeView === "storage" ? "active" : ""} onClick={() => onChangeView("storage")}>
          ☁️ Storage
        </li>
      </ul>

      <StorageIndicator usedBytes={usage.usedBytes} quotaBytes={usage.quotaBytes} />
    </aside>
  );
}

export default SideBar;
