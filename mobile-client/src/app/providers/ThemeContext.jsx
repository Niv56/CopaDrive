import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useColorScheme } from "react-native"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from "../../shared_code/styles/theme";

const ThemeContext = createContext();
const THEME_KEY = "app_theme_mode";

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); 
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        } else {
            setIsDarkMode(systemScheme === "dark");
        }
      } catch (e) {
        console.log("Failed to load theme", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const colors = useMemo(() => {
    return isDarkMode ? theme.dark : theme.light;
  }, [isDarkMode]);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_KEY, newMode ? "dark" : "light");
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  if (!isLoaded) return null;

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
export default ThemeProvider;