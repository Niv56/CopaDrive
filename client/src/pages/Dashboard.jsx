import React from 'react';
import './Dashboard.css';

import TopBar from '../components/Dashboard/TopBar';
import SideBar from '../components/Dashboard/SideBar';
import MainArea from '../components/Dashboard/MainArea';

console.log('TopBar:', TopBar);
console.log('SideBar:', SideBar);
console.log('MainArea:', MainArea);


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
