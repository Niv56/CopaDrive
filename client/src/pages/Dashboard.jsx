import React from 'react';
import './Dashboard.css';

import TopBar from '../components/Dashboard/TopBar';
import SideBar from '../components/Dashboard/SideBar';
import MainArea from '../components/Dashboard/MainArea';



function Dashboard() {
  return (
    
    <div className="dashboard-root">
      <TopBar />

      <div className="dashboard-body">
        <SideBar />
        <MainArea />
      </div>
    </div>

  );

}

export default Dashboard;
