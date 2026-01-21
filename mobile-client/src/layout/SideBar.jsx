import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../app/providers/AuthContext'; 
import { getUsage } from '../features/drive/services/fileService';
import StorageTree from '../features/drive/components/StorageTree';
import { useTheme } from '../app/providers/ThemeContext';

// ✅ ייבוא הלוגו כקומפוננטה עבור SVG
import Logo from '../assets/images/logo.svg'; 

// ✅ נתיב מתוקן: מ-src/layout ל-src/shared_code
import MusicToggle from '../shared_code/components/MusicToggle';

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
  const { token, logout } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  
  const [usage, setUsage] = useState({ usedBytes: 0, quotaBytes: 15 * 1024 * 1024 * 1024 });

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

  const handleLogoutAction = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => await logout() }
    ]);
  };

  return (
    <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={styles.container}>
      <View style={styles.header}>
        {/* ✅ הצגת הלוגו כ-SVG עם גובה ורוחב מוגדרים */}
        <Logo width={35} height={35} style={styles.logo} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>CopaDrive</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.includes(item.route);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.route)}
                style={[styles.item, isActive && { backgroundColor: colors.activeItem }]}
              >
                <Feather name={item.icon} size={20} color={isActive ? colors.primary : colors.iconColor} />
                <Text style={[styles.text, { color: isActive ? colors.primary : colors.textPrimary }, isActive && styles.textActive]}>
                    {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity onPress={handleLogoutAction} style={styles.logoutItem}>
            <Feather name="log-out" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
      
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.controlsRow}>
              
             {/* כפתור הנגן החדש */}
             <MusicToggle />

             <TouchableOpacity 
                style={[styles.themeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={toggleTheme}
             >
                <Feather name={isDarkMode ? "sun" : "moon"} size={20} color={colors.textPrimary} />
             </TouchableOpacity>
          </View>
          <StorageTree usedBytes={usage.usedBytes} quotaBytes={usage.quotaBytes} />
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 24, 
    paddingBottom: 20, 
    marginBottom: 10,
    flexDirection: 'row', // שורת לוגו וטקסט
    alignItems: 'center' // מרכוז אנכי של הלוגו והטקסט
  },
  logo: {
    marginRight: 12 // רווח בין הלוגו לטקסט
  },
  headerTitle: { 
    fontSize: 24, 
    fontFamily: 'BrunoAceSC_400Regular', 
    letterSpacing: 1.5,
    // ✅ תיקון: הוספת גובה שורה מפורש כדי למנוע חיתוך של הפונט המיוחד
    lineHeight: 36 
  },
  scrollContent: { paddingTop: 0 },
  list: { paddingHorizontal: 16, gap: 6 },
  item: { flexDirection: 'row', alignItems: 'center', height: 48, paddingLeft: 16, borderRadius: 24, marginBottom: 4 },
  text: { fontSize: 15, fontWeight: '500', marginLeft: 16 },
  textActive: { fontWeight: '700' },
  divider: { height: 1, marginVertical: 15, marginHorizontal: 10 },
  logoutItem: { flexDirection: 'row', alignItems: 'center', height: 48, paddingLeft: 16 },
  logoutText: { fontSize: 15, fontWeight: '600', marginLeft: 16 },
  footer: { paddingBottom: 20, paddingTop: 10, borderTopWidth: 1 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
  themeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 }
});