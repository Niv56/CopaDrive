import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ViewModeContext = createContext(null);

const STORAGE_KEY = "copadrive:viewMode"; // "list" | "grid"

// Provider component to manage list/grid view state across the app
export function ViewModeProvider({ children }) {
  // Initialize state from localStorage (default to "list")
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "grid" ? "grid" : "list";
  });

  // Persist view mode changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  const value = useMemo(() => ({ viewMode, setViewMode }), [viewMode]);

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

// Custom hook to access view mode context
export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used inside <ViewModeProvider />");
  return ctx;
}