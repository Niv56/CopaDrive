import React from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StorageScreen from "../../features/drive/pages/StorageScreen";

export default function StoragePage() {
  const router = useRouter();

  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Header אלגנטי וייעודי למודל */}
        <View style={styles.modalHeader}>
          <View style={styles.headerLeftSpace} />
          
          {/* כפתור סגירה בצד ימין - סגנון Bootstrap/iOS נקי */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close-outline" size={32} color="#6c757d" />
          </TouchableOpacity>
        </View>

        {/* תוכן הסטורג' - נקי מכל רכיב ניווט אחר */}
        <View style={{ flex: 1 }}>
          <StorageScreen />
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff', // לבן מלא ונקי
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // דוחף את הכפתור לקצה
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
  },
  headerLeftSpace: {
    width: 40, // שומר על איזון ויזואלי
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#f8f9fa', // רקע אפור בהיר מאוד (Bootstrap light)
  }
});