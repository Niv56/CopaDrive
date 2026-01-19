import React from "react";
import { ImageBackground, SafeAreaView, Text, Alert, View } from "react-native";
import TopBar from "../../../layout/TopBar";
import Fab from "../../../layout/Fab";
import { driveStyles } from "../styles/myDrive.styles";

const bgImage = require("../../../assets/images/back.png");

export default function ScreenLayout({ title, children }) {
    const handleFeatureAlert = () => {
        Alert.alert("Development Note", "You need to implement MongoDB logic for this action.");
    };

    return (
        <ImageBackground source={bgImage} style={driveStyles.backgroundImage} resizeMode="cover">
            <SafeAreaView style={{ flex: 1 }}>
                <TopBar />
                <Text style={driveStyles.homeTitle}>{title}</Text>
                {children}
            </SafeAreaView>

            <Fab onPress={handleFeatureAlert} />
        </ImageBackground>
    );
}