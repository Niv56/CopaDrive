import React from "react";
<<<<<<< HEAD:client/src/features/drive/layout/MainArea.jsx

import HomeView from "../pages/HomeView";
import MyDrive from "../pages/MyDrive";
import RecentView from "../pages/RecentView";
import StarredView from "../pages/StarredView";
import ImportantView from "../pages/ImportantView";
import SharedView from "../pages/SharedView";
import TrashView from "../pages/TrashView";
import StorageView from "../pages/StorageView";
=======
import MyDrive from "../main/MyDrive";
import RecentView from "../main/RecentView";
import StarredView from "../main/StarredView";
import ImportantView from "../main/ImportantView";
import SharedView from "../main/SharedView";
import TrashView from "../main/TrashView";
import StorageView from "../main/StorageView";
import CreateItem from "../widgets/CreateItem"; 
>>>>>>> 964700f (button flow over compnent):client/src/components/Dashboard/layout/MainArea.jsx

// MainArea: Renders the specific page content based on the active sidebar selection
function MainArea({ activeView, onChangeView }) {
  
  const handleItemCreated = () => {
    window.dispatchEvent(new CustomEvent("refresh-mydrive"));
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

      <CreateItem onItemCreated={handleItemCreated} currentFolderId={null} />
    </main>
  );
}

export default MainArea;