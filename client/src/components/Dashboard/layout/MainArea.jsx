import React from "react";

import MyDrive from "../main/MyDrive";
import RecentView from "../main/RecentView";
import StarredView from "../main/StarredView";
import ImportantView from "../main/ImportantView";
import SharedView from "../main/SharedView";
import TrashView from "../main/TrashView";
import StorageView from "../main/StorageView"; // ✅

function MainArea({ activeView, onChangeView }) {
  return (
    <main className="dashboard-main">
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
