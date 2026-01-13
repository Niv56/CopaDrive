import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/globals/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

import { ViewModeProvider } from "./features/drive/providers/ViewModeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ViewModeProvider>
      <App />
    </ViewModeProvider>
  </React.StrictMode>
);
