import React from "react";
import { formatBytes } from "shared/utils/formatBytes";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

function SmallIcon({ isFolder }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 12,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: isFolder ? "#fff3e0" : "#eef2ff",
      color: "#3c4043",
      fontSize: 18,
      flexShrink: 0
    }}>
      {isFolder ? "📁" : "📄"}
    </div>
  );
}

export default function FileGridItem({
  item,
  ownerLabel,
  ownerAvatar,
  dateLabel,
  showSize = true,
  onOpen,
}) {
  const isFolder = item?.type === "folder";
  const sizeLabel = isFolder ? "—" : formatBytes(item?.sizeBytes ?? 0);

  return (
    <div className="file-card" onClick={() => onOpen?.(item)} role="button" tabIndex={0}>
      <div className="file-card-top">
        <SmallIcon isFolder={isFolder} />
      </div>

      <div className="file-card-name" title={item?.name}>
        {item?.name}
      </div>

      <div className="file-card-meta">
        <div className="file-card-owner" title={ownerLabel}>
          <img
            className="file-card-avatar"
            src={ownerAvatar || defaultAvatar}
            alt="Owner"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatar; }}
          />
          <span>{ownerLabel || "Me"}</span>
        </div>

        <div title={dateLabel}>{dateLabel || "—"}</div>
      </div>

      {showSize ? (
        <div className="file-card-meta" style={{ justifyContent: "flex-end" }}>
          <div>{sizeLabel}</div>
        </div>
      ) : null}
    </div>
  );
}