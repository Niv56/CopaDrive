import React from "react";
import { ImageBackground, View, StyleSheet, Alert, StatusBar, Text, Platform } from "react-native";
import { BlurView } from "expo-blur"; // וודא שמותקן: npx expo install expo-blur
import TopBar from "../../../layout/TopBar";
import Fab from "../../../layout/fab/Fab";
import { useTheme } from "../../../app/providers/ThemeContext";

// טעינת שתי התמונות (יום ולילה)
const lightBg = require("../../../assets/images/light.png");
const nightBg = require("../../../assets/images/night.png");

export default function ScreenLayout({ title, children }) {
    const { isDarkMode, colors } = useTheme();

    const handleFeatureAlert = () => {
        Alert.alert("Development Note", "You need to implement MongoDB logic for this action.");
    };

    return (
        <ImageBackground 
            source={isDarkMode ? nightBg : lightBg} 
            style={styles.backgroundImage} 
            resizeMode="cover"
        >
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={{ flex: 1 }}>
                {/* ה-Header העליון */}
                <TopBar />
                
                {/* מיכל התוכן הראשי.
                   paddingTop: 110 - כדי לתת מקום ל-TopBar הצף שנוסיף תכף.
                   paddingBottom: 20 - מרווח תחתון.
                */}
                <View style={{ flex: 1, paddingTop: 110, paddingBottom: 20 }}>
                    
                    {/* ✅ בלוק הכותרת הצף (כמו בתמונה שביקשת) */}
                    <View style={styles.titleWrapper}>
                        <BlurView 
                            intensity={Platform.OS === 'ios' ? 30 : 50} 
                            tint={isDarkMode ? "dark" : "light"}
                            style={[
                                styles.titleBlurContainer,
                                { 
                                    backgroundColor: isDarkMode ? "rgba(30,30,30,0.5)" : "rgba(255,255,255,0.6)",
                                    borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)"
                                }
                            ]}
                        >
                            <Text style={[
                                styles.homeTitle, 
                                { color: colors.textPrimary }
                            ]}>
                                {title ? title.toUpperCase() : ""}
                            </Text>
                        </BlurView>
                    </View>

                    {/* תוכן העמוד (רשימת הקבצים וכו') */}
                    <View style={{ flex: 1 }}>
                        {children}
                    </View>
                </View>
            </View>

            <Fab onPress={handleFeatureAlert} />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    // עיצוב בלוק הכותרת הצף
    titleWrapper: {
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 20,
        overflow: 'hidden',
        // צל עדין לבלוק הכותרת
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    titleBlurContainer: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
    },
    homeTitle: {
        fontFamily: "BrunoAceSC_400Regular", // שימוש בפונט המיוחד של האפליקציה
        fontSize: 28,
        letterSpacing: 2,
        fontWeight: "bold",
    }
});