import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import SideBar from '../../layout/SideBar';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <SideBar {...props} />}
        screenOptions={{
          headerShown: false, // מסתיר את הבר של המגירה (כי יש לנו TopBar משלנו)
          drawerType: 'front',
          drawerStyle: {
            width: 280,
            backgroundColor: 'transparent',
          },
          overlayColor: 'rgba(0,0,0,0.3)',
          swipeEnabled: true,
          
          // ✅ משפר ביצועים במעבר
          lazy: true, 
        }}
      >
        <Drawer.Screen 
          name="home" 
          options={{ swipeEnabled: true }} 
        />

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