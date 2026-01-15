import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/globals/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

import { ViewModeProvider } from "./features/drive/providers/ViewModeContext";

/**
 * Application entry point.
 * Initializes the React root, injects global styles, and wraps the app 
 * in necessary context providers.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ViewModeProvider>
      <App />
    </ViewModeProvider>
  </React.StrictMode>
);