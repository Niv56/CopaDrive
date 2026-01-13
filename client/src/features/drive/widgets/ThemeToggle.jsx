import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "app/providers/ThemeProvider";

// Toggle between light and dark themes.
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn rounded-circle d-flex align-items-center justify-content-center p-0 border"
      style={{
        width: "40px",
        height: "40px",
        background: "var(--bg-paper)",
        color: "var(--text-primary)",
        borderColor: "var(--border-color)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {isLight ? <FiMoon size={18} /> : <FiSun size={18} />}
    </button>
  );
};

export default ThemeToggle;
