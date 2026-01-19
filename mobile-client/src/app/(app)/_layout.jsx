import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import SideBar from '../../layout/SideBar';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // כאן אנחנו מחברים את ה-SideBar המעוצב שלנו למגירה
        drawerContent={(props) => <SideBar {...props} />}

        screenOptions={{
          headerShown: false, // מסתיר את הבר המקורי של המערכת
          drawerType: 'front', // המגירה תעלה מעל המסך
          drawerStyle: {
            width: 280,
            backgroundColor: 'transparent', // חשוב כדי שנראה את אפקט הזכוכית
          },
          overlayColor: 'rgba(0,0,0,0.3)', // הצללה כהה מאחורי התפריט
          swipeEnabled: true, // מאפשר פתיחה בהחלקה
        }}
      >
        {/* הגדרת מסך הבית בתוך המגירה */}
        <Drawer.Screen
          name="home"
          options={{
            swipeEnabled: true
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}