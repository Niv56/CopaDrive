import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import SideBar from '../../layout/SideBar';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <SideBar {...props} />}

        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerStyle: { width: 280, backgroundColor: 'transparent' },
          overlayColor: 'rgba(0,0,0,0.3)',
          swipeEnabled: true,
        }}
      >
        <Drawer.Screen name="home" />

        {/* הגדרת הסטורג' כמודל שקופץ על הכל */}
        <Drawer.Screen 
          name="storage" 
        {/* הגדרת מסך הבית בתוך המגירה */}
        <Drawer.Screen
          name="home"
          options={{
            unmountOnBlur: true, // משמיד את הדף כשיוצאים ממנו
            swipeEnabled: false, // מבטל החלקה מהצד כדי שלא יתנגש עם כפתור חזור
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}