import React from "react";
import "./StorageIndicator.css";
import { formatBytes } from "../../../utils/formatBytes";

export default function StorageIndicator({ usedBytes = 0, quotaBytes = 15 * 1024 * 1024 * 1024 }) {
  const used = Math.max(0, Number(usedBytes) || 0);
  const quota = Math.max(1, Number(quotaBytes) || 1);

  const pct = Math.min(100, (used / quota) * 100);
  const fillTop = `${100 - pct}%`;

  return (
    <div className="storage-box">
      <div className="storage-tree-container">
        <div className="storage-tree-bg">🌴</div>

        <div className="storage-tree-fill" style={{ "--fill-top": fillTop }}>
          🌴
        </div>
      </div>

      <div className="storage-sub">
        {formatBytes(used)} of {formatBytes(quota)} used
      </div>
    </div>
  );
}
