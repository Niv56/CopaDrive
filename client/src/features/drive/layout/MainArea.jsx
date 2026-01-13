import React from "react";

import HomeView from "../pages/HomeView";
import MyDrive from "../pages/MyDrive";
import RecentView from "../pages/RecentView";
import StarredView from "../pages/StarredView";
import ImportantView from "../pages/ImportantView";
import SharedView from "../pages/SharedView";
import TrashView from "../pages/TrashView";
import StorageView from "../pages/StorageView";

// MainArea: Renders the specific page content based on the active sidebar selection
function MainArea({ activeView, onChangeView }) {
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
    </main>
  );
}

export default MainArea;