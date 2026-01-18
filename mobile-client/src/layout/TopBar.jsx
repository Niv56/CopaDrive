import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { driveStyles } from "../features/drive/styles/myDrive.styles"; 

export default function TopBar() {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={driveStyles.topBarSearchWrapper}>
      <Pressable onPress={toggleDrawer} hitSlop={10}>
        <Ionicons name="menu" size={24} color="#5f6368" />
      </Pressable>
      
      <Text style={driveStyles.searchText}>Search in CopaDrive</Text>
      
      <View style={driveStyles.profileCircle}>
        <Ionicons name="person" size={18} color="#fff" />
      </View>
    </View>
  );
}