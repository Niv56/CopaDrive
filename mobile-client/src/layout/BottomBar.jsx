import React, { useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  PanResponder 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useTheme } from "../app/providers/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MARGIN_H = 20;
const BAR_WIDTH = SCREEN_WIDTH - (MARGIN_H * 2);
const TAB_COUNT = 4;
const TAB_WIDTH = BAR_WIDTH / TAB_COUNT;
const BUBBLE_WIDTH = TAB_WIDTH * 0.7;
const BUBBLE_OFFSET = (TAB_WIDTH - BUBBLE_WIDTH) / 2;

export default function BottomBar({ activeTab, setActiveTab }) {
  const { isDarkMode, colors } = useTheme();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const tabs = ["home", "starred", "shared", "mydrive"];

  const animateToTab = (index) => {
    const targetX = (index * TAB_WIDTH) + BUBBLE_OFFSET;
    Animated.spring(slideAnim, {
      toValue: targetX,
      useNativeDriver: true,
      speed: 15,
      bounciness: 8,
    }).start();
  };

  useEffect(() => {
    const index = tabs.indexOf(activeTab);
    if (index !== -1) {
      animateToTab(index);
    }
  }, [activeTab]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
        slideAnim.stopAnimation((value) => {
           slideAnim.setOffset(value); 
           slideAnim.setValue(0);
        });
      },
      onPanResponderMove: (evt, gestureState) => {
         slideAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
        slideAnim.flattenOffset();
        const touchX = evt.nativeEvent.locationX;
        let targetIndex = Math.floor(touchX / TAB_WIDTH);
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= TAB_COUNT) targetIndex = TAB_COUNT - 1;
        const newTab = tabs[targetIndex];
        setActiveTab(newTab);
        animateToTab(targetIndex);
      },
    })
  ).current;

  const NavItem = ({ icon, id }) => {
    const isActive = activeTab === id;
    return (
      <View style={styles.navItem}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isActive ? "#fff" : (isDarkMode ? "#8E8E93" : "#5f6368")} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint={isDarkMode ? "dark" : "light"} style={styles.blurContainer}>
        
        <View 
          style={StyleSheet.absoluteFill} 
          {...panResponder.panHandlers} 
          zIndex={10} 
        />

        <Animated.View 
          style={[
            styles.slidingBubble,
            { backgroundColor: colors.primary }, 
            {
              transform: [
                { translateX: slideAnim },
                { scale: scaleAnim }
              ] 
            }
          ]} 
        />

        <View style={styles.innerContent} pointerEvents="none"> 
          <NavItem icon="home" id="home" />
          <NavItem icon="star" id="starred" />
          <NavItem icon="people" id="shared" />
          <NavItem icon="folder" id="mydrive" />
        </View>

      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    left: MARGIN_H,
    right: MARGIN_H,
    height: 65,
    borderRadius: 35,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
  },
  slidingBubble: {
    position: "absolute",
    width: BUBBLE_WIDTH,
    height: 44,
    borderRadius: 22,
    left: 0,
  },
  innerContent: {
    flexDirection: "row",
    height: "100%",
    justifyContent: "space-between",
  },
  navItem: {
    width: TAB_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});