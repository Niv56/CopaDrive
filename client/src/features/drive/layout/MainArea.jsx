import React from "react";

import HomeView from "../pages/HomeView";
import MyDrive from "../pages/MyDrive";
import RecentView from "../pages/RecentView";
import StarredView from "../pages/StarredView";
import ImportantView from "../pages/ImportantView";
import SharedView from "../pages/SharedView";
import TrashView from "../pages/TrashView";
import StorageView from "../pages/StorageView";

import CreateItem from "../widgets/CreateItem";

/** Renders the specific page content based on sidebar selection */
function MainArea({ activeView, onChangeView }) {

  /** Dispatches global events to refresh views after creation */
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

      {/* Render global Create button if not in MyDrive view */}
      {activeView !== "mydrive" && (
        <CreateItem onItemCreated={handleItemCreated} currentFolderId={null} />
      )}
    </main>
  );
}

export default MainArea;