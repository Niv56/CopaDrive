import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import SideBar from '../../layout/SideBar';

/**
 * Main application layout using a Drawer navigation system.
 * Wrapped in GestureHandlerRootView to enable native touch gestures.
 */
export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // Custom sidebar component for navigation links
        drawerContent={(props) => <SideBar {...props} />}
        screenOptions={{
          headerShown: false, // Hidden because we use a custom TopBar component
          drawerType: 'front', // Sidebar slides over the content
          drawerStyle: {
            width: 280,
            backgroundColor: 'transparent',
          },
          overlayColor: 'rgba(0,0,0,0.3)',
          swipeEnabled: true,

          // Performance: Loads screens only when they are focused
          lazy: true,
        }}
      >
        {/* Main Landing Page */}
        <Drawer.Screen
          name="home"
          options={{ swipeEnabled: true }}
        />

        {/* Secondary screens: 
          unmountOnBlur: true - Clears memory and force refreshes the page when navigated to.
          swipeEnabled: false - Prevents accidental sidebar opening during internal list interactions.
        */}
        <Drawer.Screen
          name="recent"
          options={{ unmountOnBlur: true, swipeEnabled: false }}
        />

        <Drawer.Screen
          name="important"
          options={{ unmountOnBlur: true, swipeEnabled: false }}
        />

        <Drawer.Screen
          name="storage"
          options={{ unmountOnBlur: true, swipeEnabled: false }}
        />

        <Drawer.Screen
          name="trash"
          options={{ unmountOnBlur: true, swipeEnabled: false }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}