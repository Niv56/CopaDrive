import React from "react";

import MyDrive from "../main/MyDrive";
import RecentView from "../main/RecentView";
import StarredView from "../main/StarredView";
import SharedView from "../main/SharedView";
import TrashView from "../main/TrashView";

function MainArea({ activeView }) {
  return (
    <main className="dashboard-main">
      {activeView === "mydrive" && <MyDrive />}
      {activeView === "recent" && <RecentView />}
      {activeView === "starred" && <StarredView />}
      {activeView === "shared" && <SharedView />}
      {activeView === "trash" && <TrashView />}
      {activeView === "home" && <Home />}
      {activeView === "storage" && <Storage />}

    </main>
  );
}
export default MainArea;
