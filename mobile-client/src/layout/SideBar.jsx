import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

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

  const handleNavigation = (route) => {
    if (route === '/home') {
        router.push(route);
    } else {
        console.log(`Navigation to ${route} is not implemented yet`);
    }
  };

  return (
    <BlurView intensity={80} tint="light" style={styles.container}>
      
      {/* כותרת התפריט */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CopaDrive</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.route || (item.id === 'home' && pathname === '/');
            
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleNavigation(item.route)}
                style={[styles.item, isActive && styles.itemActive]}
                activeOpacity={0.6}
              >
                <Feather
                  name={item.icon}
                  size={20}
                  color={isActive ? '#0d6efd' : '#444'}
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
      
      {/* פוטר */}
      <View style={styles.footer}>
          <View style={styles.storageBarBg}>
             <View style={styles.storageBarFill} />
          </View>
          <Text style={styles.storageText}>93.0 MB of 15.0 GB used</Text>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)', 
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'BrunoAceSC_400Regular', 
    color: '#333',
    letterSpacing: 1.5,
  },
  scrollContent: {
    paddingTop: 0,
  },
  list: {
    paddingHorizontal: 16,
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingLeft: 16,
    borderRadius: 24,
    marginBottom: 4,
  },
  itemActive: {
    backgroundColor: 'rgba(13, 110, 253, 0.12)',
  },
  icon: {
    marginRight: 16,
    opacity: 0.8,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
  },
  textActive: {
    color: '#0d6efd',
    fontWeight: '700',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  storageBarBg: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  storageBarFill: {
    width: '10%', 
    height: '100%',
    backgroundColor: '#0d6efd',
  },
  storageText: {
    fontSize: 12,
    color: '#666',
  }
});