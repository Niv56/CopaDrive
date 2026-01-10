import React from 'react';
import appLogo from '../../photos/logo.svg';

function TopBar() {
  return (
    <header className="dashboard-top">
      <div className="dashboard-top-left">
        <img src={appLogo} alt="CopaDrive logo" className="app-logo" />
        <h2 className="app-title">CopaDrive</h2>
      </div>

      <div className="dashboard-top-center">
        <input
          type="text"
          placeholder="Search in CopaDrive"
          className="dashboard-search"
        />
      </div>

      <div className="dashboard-top-right">
        <div className="user-avatar" aria-label="user avatar">
          <span className="user-avatar-icon">👤</span>
        </div>
        <div className="user-meta">
          <div className="user-name">Guest</div>
          <div className="user-sub">Not signed in</div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
