import React, { useEffect, useState } from "react";
import StorageIndicator from "../widgets/StorageIndicator";
import { getUsage } from "../api/filesApi";
import "styles/layout/SideBar.css";

import {
  FiHome,
  FiFolder,
  FiClock,
  FiStar,
  FiAlertCircle,
  FiUsers,
  FiTrash2,
  FiHardDrive,
} from "react-icons/fi";

function SideBar({ activeView, onChangeView }) {
  const [usage, setUsage] = useState({
    usedBytes: 0,
    quotaBytes: 15 * 1024 * 1024 * 1024,
  });

  useEffect(() => {
    let alive = true;

    // Poll storage usage periodically and stop cleanly on unmount.
    async function loadUsage() {
      try {
        const u = await getUsage();
        if (!alive) return;
        setUsage({
          usedBytes: u?.usedBytes ?? 0,
          quotaBytes: u?.quotaBytes ?? 15 * 1024 * 1024 * 1024,
        });
      } catch {
        // Ignore usage polling errors.
      }
    }

    loadUsage();
    const t = setInterval(loadUsage, 3000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const Item = ({ id, icon: Icon, text, onClick }) => (
    <li
      className={`sb-item ${activeView === id ? "active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
    >
      <span className="sb-icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="sb-text">{text}</span>
    </li>
  );

  return (
    <aside className="dashboard-side">
      <ul className="side-list">
        <Item
          id="home"
          icon={FiHome}
          text="Home"
          onClick={() => {
            onChangeView("home");
            window.dispatchEvent(new CustomEvent("reset-home"));
          }}
        />

        <Item
          id="mydrive"
          icon={FiFolder}
          text="My Drive"
          onClick={() => {
            onChangeView("mydrive");
            window.dispatchEvent(new CustomEvent("reset-mydrive"));
          }}
        />

        <Item
          id="recent"
          icon={FiClock}
          text="Recent"
          onClick={() => {
            onChangeView("recent");
            window.dispatchEvent(new CustomEvent("reset-recent"));
          }}
        />

        <Item id="starred" icon={FiStar} text="Starred" onClick={() => onChangeView("starred")} />

        <Item
          id="important"
          icon={FiAlertCircle}
          text="Important"
          onClick={() => onChangeView("important")}
        />

        <Item
          id="shared"
          icon={FiUsers}
          text="Shared with me"
          onClick={() => {
            onChangeView("shared");
            window.dispatchEvent(new CustomEvent("reset-shared"));
          }}
        />

        <Item id="trash" icon={FiTrash2} text="Trash" onClick={() => onChangeView("trash")} />

        <Item
          id="storage"
          icon={FiHardDrive}
          text="Storage"
          onClick={() => onChangeView("storage")}
        />
      </ul>

      <div className="sb-storage">
        <StorageIndicator usedBytes={usage.usedBytes} quotaBytes={usage.quotaBytes} />
      </div>
    </aside>
  );
}

export default SideBar;
