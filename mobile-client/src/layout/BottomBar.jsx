import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { driveStyles } from "../features/drive/styles/myDrive.styles";

interface BottomBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomBar({ activeTab, setActiveTab }: BottomBarProps) {
  
  const NavItem = ({ icon, label, id }: any) => (
    <Pressable style={driveStyles.navItem} onPress={() => setActiveTab(id)}>
      <Ionicons 
        name={icon} 
        size={24} 
        color={activeTab === id ? "#1a73e8" : "#5f6368"} 
      />
      <Text style={[driveStyles.navLabel, activeTab === id && driveStyles.navLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={driveStyles.bottomNav}>
      <NavItem icon="home" label="Home" id="home" />
      <NavItem icon="star-outline" label="Starred" id="starred" />
      <NavItem icon="people-outline" label="Shared" id="shared" />
      <NavItem icon="folder-outline" label="myDrive" id="mydrive" />
    </View>
  );
}