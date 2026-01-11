import React from "react";
import "./StorageIndicator.css";

export default function StorageIndicator({ usedGB = 1.69 }) {
  const TOTAL = 15;
  const used = Math.max(0, Math.min(Number(usedGB) || 0, TOTAL));
  const pct = (used / TOTAL) * 100;
  
  // כמה למלא מלמעלה (100% - pct = כמה לחתוך מלמעלה)
  const fillTop = `${100 - pct}%`;

  return (
    <div className="storage-box">
      <div className="storage-tree-container">
        {/* רקע דהוי */}
        <div className="storage-tree-bg">🌴</div>
        
        {/* מילוי צבעוני */}
        <div 
          className="storage-tree-fill"
          style={{ '--fill-top': fillTop }}
        >
          🌴
        </div>
      </div>

      <div className="storage-sub">
        {used.toFixed(2)} GB of {TOTAL.toFixed(2)} GB used
      </div>
    </div>
  );
}