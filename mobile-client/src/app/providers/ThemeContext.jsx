import React, { createContext, useContext, useState, useMemo } from "react";
import { useColorScheme } from "react-native"; 
import { theme } from "../../shared_code/styles/theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); 
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");

  const colors = useMemo(() => {
    return isDarkMode ? theme.dark : theme.light;
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};