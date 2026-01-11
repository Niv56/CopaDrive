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
        // שקט תעשייתי במקרה של שגיאה
      }
    }

    loadUsage();
    const t = setInterval(loadUsage, 10000); // רענון כל 10 שניות מספיק בהחלט
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // חישוב GB עבור האינדיקטור
  const usedGB = usage.usedBytes / (1024 * 1024 * 1024);

  return (
    <aside className="dashboard-side">
      <ul className="side-list">
        {/* הוספת Important/Priority בראש הרשימה כמקובל */}
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
          onClick={() => {
            onChangeView("recent");
            window.dispatchEvent(new CustomEvent("reset-recent"));
          }}
        >
          🕒 Recent
        </li>

        <li className={activeView === "starred" ? "active" : ""} onClick={() => onChangeView("starred")}>
          ⭐ Starred
        </li>

        <li
          className={activeView === "important" ? "active" : ""}
          onClick={() => onChangeView("important")}
        >
          ❗ Important
        </li>

        <li
          className={activeView === "shared" ? "active" : ""}
          onClick={() => {
            onChangeView("shared")
            window.dispatchEvent(new CustomEvent("reset-shared"));
          }}
        >
          👥 Shared with me
        </li>

        <li className={activeView === "trash" ? "active" : ""} onClick={() => onChangeView("trash")}>
          🗑️ Trash
        </li>

        <li
          className={activeView === "storage" ? "active" : ""}
          onClick={() => onChangeView("storage")}
        >
          💾 Storage
        </li>
      </ul>

      {/* שימוש במידע האמיתי מהשרת */}
      <StorageIndicator usedGB={usedGB} />
    </aside>
  );
}

export default SideBar;