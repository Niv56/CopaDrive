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
  
  const handleItemCreated = () => {
    window.dispatchEvent(new Event("reset-home"));
    window.dispatchEvent(new Event("refresh-mydrive"));
  };

  return (
    <main className="dashboard-main">
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

      
      {activeView !== "mydrive" && (
        <CreateItem onItemCreated={handleItemCreated} currentFolderId={null} />
      )}
    </main>
  );
}

export default MainArea;