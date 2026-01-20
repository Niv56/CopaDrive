import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../app/providers/AuthContext'; 
import { getUsage } from '../features/drive/services/fileService';
import StorageTree from '../features/drive/components/StorageTree';

const MENU_ITEMS = [
  { id: 'home', icon: 'home', label: 'Home', route: '/home' },
  { id: 'recent', icon: 'clock', label: 'Recent', route: '/recent' },
  { id: 'important', icon: 'alert-circle', label: 'Important', route: '/important' },
  { id: 'trash', icon: 'trash-2', label: 'Trash', route: '/trash' },
  { id: 'storage', icon: 'hard-drive', label: 'Storage', route: '/storage' },
];

export default function SideBar(props) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, logout } = useAuth(); // שימוש ב-logout מה-Context
  
  const [usage, setUsage] = useState({
    usedBytes: 0,
    quotaBytes: 15 * 1024 * 1024 * 1024,
  });

  useEffect(() => {
    let alive = true;
    async function loadUsage() {
      if (!token) return;
      try {
        const u = await getUsage(token);
        if (!alive) return;
        if (u) setUsage({ usedBytes: u.usedBytes ?? 0, quotaBytes: u.quotaBytes ?? 15 * 1024 * 1024 * 1024 });
      } catch (e) {}
    }
    loadUsage();
    const interval = setInterval(loadUsage, 10000); 
    return () => { alive = false; clearInterval(interval); };
  }, [token]);

  // פונקציית הניתוק עם אישור מהמשתמש
  const handleLogoutAction = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to disconnect?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            await logout(); // קריאה לפונקציית הניתוק האמיתית
          } 
        }
      ]
    );
  };

  return (
    <BlurView intensity={80} tint="light" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CopaDrive</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.includes(item.route);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.route)}
                style={[styles.item, isActive && styles.itemActive]}
              >
                <Feather name={item.icon} size={20} color={isActive ? '#0d6efd' : '#444'} />
                <Text style={[styles.text, isActive && styles.textActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.divider} />

          <TouchableOpacity onPress={handleLogoutAction} style={styles.logoutItem}>
            <Feather name="log-out" size={20} color="#d93025" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
      
      <View style={styles.footer}>
          <StorageTree usedBytes={usage.usedBytes} quotaBytes={usage.quotaBytes} />
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.75)' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, marginBottom: 10 },
  headerTitle: { fontSize: 24, fontFamily: 'BrunoAceSC_400Regular', color: '#333', letterSpacing: 1.5 },
  scrollContent: { paddingTop: 0 },
  list: { paddingHorizontal: 16, gap: 6 },
  item: { flexDirection: 'row', alignItems: 'center', height: 48, paddingLeft: 16, borderRadius: 24, marginBottom: 4 },
  itemActive: { backgroundColor: 'rgba(13, 110, 253, 0.12)' },
  text: { fontSize: 15, fontWeight: '500', color: '#444', marginLeft: 16 },
  textActive: { color: '#0d6efd', fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 15, marginHorizontal: 10 },
  logoutItem: { flexDirection: 'row', alignItems: 'center', height: 48, paddingLeft: 16 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#d93025', marginLeft: 16 },
  footer: { paddingBottom: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
});