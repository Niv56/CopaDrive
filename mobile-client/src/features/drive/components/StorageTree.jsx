import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatBytes } from "../../../shared_code/utils/formatBytes";

export default function StorageTree({ usedBytes = 0, quotaBytes = 15 * 1024 * 1024 * 1024 }) {
  const used = Math.max(0, Number(usedBytes) || 0);
  const quota = Math.max(1, Number(quotaBytes) || 1);
  
  // חישוב האחוזים
  const percentage = Math.min(100, (used / quota) * 100);

  return (
    <View style={styles.container}>
      {/* מיכל העץ */}
      <View style={styles.treeContainer}>
        {/* שכבה 1: העץ האפור (רקע) */}
        <Text style={styles.treeIconBase}>🌴</Text>

        {/* שכבה 2: העץ הצבעוני (מילוי) - נחתך לפי הגובה */}
        <View style={[styles.fillWrapper, { height: `${percentage}%` }]}>
          <Text style={styles.treeIconFill}>🌴</Text>
        </View>
      </View>

      {/* טקסט למטה */}
      <Text style={styles.text}>
        {formatBytes(used)} of {formatBytes(quota)} used
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginTop: "auto", // דוחף את הרכיב לתחתית אם הוא בתוך Flex
  },
  treeContainer: {
    width: 60,
    height: 60,
    position: "relative",
    marginBottom: 5,
  },
  treeIconBase: {
    fontSize: 50,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    opacity: 0.3, // אפור/שקוף
    color: "#5f6368",
    filter: "grayscale(100%)", // הערה: ב-RN זה לא תמיד עובד, השקיפות מספיקה
  },
  fillWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden", // זה הקסם שיוצר את החיתוך
    justifyContent: "flex-end", // מצמיד את הטקסט הפנימי לתחתית
  },
  treeIconFill: {
    fontSize: 50,
    textAlign: "center",
    // חשוב: הגודל חייב להיות זהה לבסיס כדי שיתלבש בול
    height: 60, 
    lineHeight: 60, // עוזר ליישור
  },
  text: {
    fontSize: 12,
    color: "#5f6368",
    fontWeight: "600",
  },
});