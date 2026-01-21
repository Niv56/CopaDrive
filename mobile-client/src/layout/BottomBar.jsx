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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MARGIN_H = 20;
const BAR_WIDTH = SCREEN_WIDTH - (MARGIN_H * 2);
const TAB_COUNT = 4;
const TAB_WIDTH = BAR_WIDTH / TAB_COUNT;
const BUBBLE_WIDTH = TAB_WIDTH * 0.7; // רוחב הבועה הכחולה
const BUBBLE_OFFSET = (TAB_WIDTH - BUBBLE_WIDTH) / 2; // כדי למרכז את הבועה במשבצת

export default function BottomBar({ activeTab, setActiveTab }) {
  // הערך מייצג פיקסלים (לא אינדקס) לתנועה חלקה לחלוטין
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const tabs = ["home", "starred", "shared", "mydrive"];

  // פונקציית עזר להזזת הבועה לטאב מסוים
  const animateToTab = (index) => {
    const targetX = (index * TAB_WIDTH) + BUBBLE_OFFSET;
    Animated.spring(slideAnim, {
      toValue: targetX,
      useNativeDriver: true,
      speed: 15,
      bounciness: 8,
    }).start();
  };

  // מעקב אחרי שינויים חיצוניים (למשל אם משנים טאב דרך הקוד)
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
        // כיווץ קטן לתחושת מגע
        Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
        
        // עוצרים אנימציות קודמות כדי שהבועה לא "תילחם" באצבע
        slideAnim.stopAnimation((value) => {
            // הבועה נשארת איפה שהיא ברגע הנגיעה
            slideAnim.setOffset(value); 
            slideAnim.setValue(0);
        });
      },

      onPanResponderMove: (evt, gestureState) => {
         // תזוזה חלקה עם האצבע (1:1)
         slideAnim.setValue(gestureState.dx);
      },

      onPanResponderRelease: (evt, gestureState) => {
        // החזרת הגודל
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

        // איחוד ה-Offset והערך הנוכחי כדי להבין איפה אנחנו באמת
        slideAnim.flattenOffset();

        // חישוב המיקום הסופי של האצבע בתוך הבר
        // locationX נותן את המיקום היחסי בתוך הקומפוננטה
        const touchX = evt.nativeEvent.locationX;
        
        // חישוב איזה טאב הכי קרוב לאצבע
        let targetIndex = Math.floor(touchX / TAB_WIDTH);
        
        // הגנה מפני חריגות
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= TAB_COUNT) targetIndex = TAB_COUNT - 1;

        const newTab = tabs[targetIndex];

        // עדכון הסטייט של האפליקציה
        setActiveTab(newTab);
        
        // "מגנוט" הבועה למרכז הטאב הנבחר
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
            color={isActive ? "#fff" : "#8E8E93"} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        
        {/* שכבת המגע - תופסת את כל הבר ומאפשרת לחיצה והחלקה */}
        <View 
          style={StyleSheet.absoluteFill} 
          {...panResponder.panHandlers} 
          zIndex={10} 
        />

        {/* הבועה הכחולה */}
        <Animated.View 
          style={[
            styles.slidingBubble,
            {
              transform: [
                { translateX: slideAnim },
                { scale: scaleAnim }
              ] 
            }
          ]} 
        />

        {/* האייקונים */}
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
    backgroundColor: "#007AFF",
    borderRadius: 22,
    left: 0, // המיקום ההתחלתי הוא 0, ה-translateX מזיז אותה
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