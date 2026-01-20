import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        (async () => {
            const savedTheme = await AsyncStorage.getItem("app_theme");
            if (savedTheme) setTheme(savedTheme);
        })();
    }, []);

    const toggleTheme = async () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        await AsyncStorage.setItem("app_theme", nextTheme);
    };

    const colors = theme === "light" ? lightPalette : darkPalette;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

const lightPalette = {
    background: "#ffffff",
    text: "#1a1a1a",
    subText: "#5f6368",
    card: "rgba(255, 255, 255, 0.8)",
    border: "rgba(0,0,0,0.1)",
    primary: "#007bff",
};

const darkPalette = {
    background: "#121212",
    text: "#ffffff",
    subText: "#a0a0a0",
    card: "rgba(30, 30, 30, 0.9)",
    border: "rgba(255,255,255,0.1)",
    primary: "#3b82f6",
};

export const useTheme = () => useContext(ThemeContext);