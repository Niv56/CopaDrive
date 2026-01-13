import React from "react";
import { useViewMode } from "features/drive/providers/ViewModeContext";
import "styles/widgets/ViewModeToggle.css";

// Component to toggle between list and grid view modes
export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="vmt-wrap" role="group" aria-label="View mode">
      <button
        type="button"
        className={`vmt-btn ${viewMode === "list" ? "is-on" : ""}`}
        onClick={() => setViewMode("list")}
        aria-pressed={viewMode === "list"}
        title="List view"
      >
        <span className="vmt-icon">{viewMode === "list" ? "✓" : ""}</span>
        <span className="vmt-icon">≡</span>
      </button>

      <button
        type="button"
        className={`vmt-btn ${viewMode === "grid" ? "is-on" : ""}`}
        onClick={() => setViewMode("grid")}
        aria-pressed={viewMode === "grid"}
        title="Grid view"
      >
        <span className="vmt-icon">⠿</span>
      </button>
    </div>
  );
}