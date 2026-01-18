import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const MENU_ITEMS = [
  { id: 'home', icon: 'home', label: 'Home', route: '/home' },
  { id: 'mydrive', icon: 'folder', label: 'My Drive', route: '/mydrive' },
  { id: 'recent', icon: 'clock', label: 'Recent', route: '/recent' },
  { id: 'starred', icon: 'star', label: 'Starred', route: '/starred' },
  { id: 'important', icon: 'alert-circle', label: 'Important', route: '/important' },
  { id: 'shared', icon: 'users', label: 'Shared', route: '/shared' },
  { id: 'trash', icon: 'trash-2', label: 'Trash', route: '/trash' },
  { id: 'storage', icon: 'hard-drive', label: 'Storage', route: '/storage' },
];

export default function SideBar(props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      {/* כותרת התפריט */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CopaDrive</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {MENU_ITEMS.map((item) => {
            // בדיקה האם הפריט הזה הוא הפעיל כרגע
            const isActive = pathname === item.route || (item.id === 'home' && pathname === '/');
            
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleNavigation(item.route)}
                style={[styles.item, isActive && styles.itemActive]}
                activeOpacity={0.7}
              >
                <Feather
                  name={item.icon}
                  size={22}
                  color={isActive ? '#0d6efd' : '#333'}
                  style={styles.icon}
                />
                <Text style={[styles.text, isActive && styles.textActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>
      
      {/* פוטר (אופציונלי למד אחסון) */}
      <View style={styles.footer}>
         {/* <StorageIndicator /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  scrollContent: {
    paddingTop: 0,
  },
  list: {
    paddingHorizontal: 12,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingLeft: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  itemActive: {
    backgroundColor: 'rgba(13, 110, 253, 0.15)',
  },
  icon: {
    marginRight: 14,
    opacity: 0.9,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  textActive: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  }
});