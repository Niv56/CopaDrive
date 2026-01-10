import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles
import "@fontsource/inter/latin.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/800.css";


// Create React root and render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
