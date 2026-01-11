import { useEffect, useState, useCallback } from "react";
import { getRecentFiles, openItem, formatLastAccessed } from "../../../api/filesApi";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";
import "../main/MyDrive.css";

function RecentView() {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openedFile, setOpenedFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  // 1. תיקון const (היה חסר c)
  const loadRecentFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRecentFiles();

      // השרת שלך מחזיר אובייקטים עם updatedAt, לכן אין צורך לסנן שדות אחרים
      const files = Array.isArray(data) ? data : [];

      setRecentFiles(files);
    } catch (e) {
      setError(e?.message ?? "Failed to load recent files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentFiles();

    function handleReset() {
      loadRecentFiles();
    }

    window.addEventListener("reset-recent", handleReset);
    return () => {
      window.removeEventListener("reset-recent", handleReset);
    };
  }, [loadRecentFiles]);

  async function onOpen(item) {
    setLoadingFile(true);
    try {
      const fullFile = await openItem(item);

      if (fullFile) {
        setOpenedFile(fullFile);
        // רענון הרשימה כדי שהקובץ שזה עתה נפתח יקפוץ לראש הרשימה (כי ה-updatedAt שלו השתנה בשרת)
        setTimeout(() => {
          loadRecentFiles();
        }, 300);
      }
    } catch (e) {
      console.error("Failed to open file:", e);
      alert("Failed to open file: " + e.message);
    } finally {
      setLoadingFile(false);
    }
  }

  if (loading) return <div className="mainarea"><div className="text-center p-5">Loading recent files...</div></div>;
  if (error) return <div className="mainarea"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="mainarea">
      <div className="mb-4">
        <h2 style={{ fontSize: "24px", fontWeight: "400", color: "#202124" }} onClick={loadRecentFiles}>
          Recent
        </h2>
      </div>

      <div className="files-container">
        {recentFiles.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999", padding: "40px" }}>
            No recently accessed files yet.
          </div>
        ) : (
          recentFiles.map((item) => (
            <div key={item.id} style={{ position: "relative" }}>
              <FileListItem
                item={item}
                onOpen={onOpen}
                onEdit={() => alert("יש לממש")}
                onShare={() => alert("יש לממש")}
                onDelete={() => alert("יש לממש")}
              />

              {/* 🎯 תיקון: הצגת "Opened" במקום "Updated" ושימוש ב-lastAccessed */}
              <div style={{
                position: "absolute",
                right: "60px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: "#5f6368",
                pointerEvents: "none"
              }}>
                Opened {formatLastAccessed(item.lastAccessed)}
              </div>
            </div>
          ))
        )}
      </div>

      {loadingFile && (
        <div className="modal-overlay">
          <div className="bg-white p-3 rounded">Loading content...</div>
        </div>
      )}

      <FileViewerModal
        file={openedFile}
        role={"viewer"}
        onClose={() => setOpenedFile(null)}
        onEdit={() => alert("יש לממש")}
        onShare={() => alert("יש לממש")}
        onDelete={() => alert("יש לממש")}
      />
    </div>
  );
}

export default RecentView;