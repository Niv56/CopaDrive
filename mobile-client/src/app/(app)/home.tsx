import React from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
// ודא שהנתיב הזה נכון אצלך (3 תיקיות אחורה ל-app)
import { useAuth } from "./../../app/providers/AuthContext";

export default function Home() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Home! 🏠</Text>
        <Text style={styles.sub}>You are successfully logged in.</Text>

        {/* כפתור התנתקות */}
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout & See Login Design</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  sub: { fontSize: 16, color: "#666", marginBottom: 40 },
  
  logoutBtn: {
    backgroundColor: "#ff4444",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    shadowColor: "#ff4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});