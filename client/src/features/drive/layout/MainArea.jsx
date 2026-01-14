import React from "react";

// Imports from the new architecture (pages folder)
import HomeView from "../pages/HomeView";
import MyDrive from "../pages/MyDrive";
import RecentView from "../pages/RecentView";
import StarredView from "../pages/StarredView";
import ImportantView from "../pages/ImportantView";
import SharedView from "../pages/SharedView";
import TrashView from "../pages/TrashView";
import StorageView from "../pages/StorageView";

// Integration: Global CreateItem widget
import CreateItem from "../widgets/CreateItem"; 

/**
 * MainArea: Renders the specific page content based on the active sidebar selection.
 */
function MainArea({ activeView, onChangeView }) {
  
  // פונקציה שמרעננת את כל המערכת כשהכפתור הגלובלי יוצר קובץ
  const handleItemCreated = () => {
    // שולח אירועים שגם ה-Home וגם ה-MyDrive מאזינים להם
    window.dispatchEvent(new Event("reset-home"));
    window.dispatchEvent(new Event("refresh-mydrive"));
  };

  return (
    <main className="dashboard-main">
      {/* View Management */}
      {activeView === "home" && <HomeView onChangeView={onChangeView} />}

      {activeView === "mydrive" && <MyDrive />}
      {activeView === "recent" && <RecentView />}

      {activeView === "starred" && <StarredView onChangeView={onChangeView} />}
      {activeView === "important" && (
        <ImportantView onChangeView={onChangeView} />
      )}

      {activeView === "shared" && <SharedView />}
      {activeView === "trash" && <TrashView />}

      {activeView === "storage" && (
        <StorageView onChangeView={onChangeView} />
      )}

      {/* ✅ הכפתור הגלובלי 
          אנחנו מציגים אותו בכל העמודים **חוץ** מ-MyDrive.
          למה? כי MyDrive מנהל כפתור משלו שיודע ליצור קבצים בתוך תיקיות ספציפיות.
          בכל שאר העמודים (Home, Starred, וכו') הכפתור ייצור בתיקייה הראשית.
      */}
      {activeView !== "mydrive" && (
        <CreateItem onItemCreated={handleItemCreated} currentFolderId={null} />
      )}
    </main>
  );
}

export default MainArea;