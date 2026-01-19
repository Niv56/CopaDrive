import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import SideBar from '../../layout/SideBar';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // חיבור ה-SideBar המעוצב שלנו למגירה
        drawerContent={(props) => <SideBar {...props} />}
        
        screenOptions={{
          headerShown: false, // הסתרת הבר המובנה לטובת ה-TopBar שלנו
          drawerType: 'front', // המגירה תצוף מעל המסך
          drawerStyle: {
            width: 280,
            backgroundColor: 'transparent', // מאפשר לראות את אפקט ה-Blur של ה-SideBar
          },
          overlayColor: 'rgba(0,0,0,0.3)', // הצללה על תוכן המסך כשהמגירה פתוחה
          swipeEnabled: true, // ברירת מחדל של פתיחה בהחלקה
        }}
      >
        {/* מסך הבית - מאפשר פתיחת מגירה בהחלקה (Home) */}
        <Drawer.Screen 
          name="home" 
          options={{ swipeEnabled: true }} 
        />

        {/* מסך ה-Recent - מוגדר כמודל עצמאי ללא החלקה */}
        <Drawer.Screen 
          name="recent" 
          options={{ 
            unmountOnBlur: true, // ניקוי הזיכרון ביציאה מהמסך
            swipeEnabled: false  // ביטול החלקה כדי לא להפריע למחוות במסך המודל
          }} 
        />

        {/* מסך ה-Important - מוגדר כמודל עצמאי ללא החלקה */}
        <Drawer.Screen 
          name="important" 
          options={{ 
            unmountOnBlur: true, 
            swipeEnabled: false 
          }} 
        />

        {/* מסך הסטורג' - מוגדר כמודל עצמאי ללא החלקה */}
        <Drawer.Screen 
          name="storage" 
          options={{
            unmountOnBlur: true,
            swipeEnabled: false, 
          }}
          
        />
        <Drawer.Screen 
  name="trash" 
  options={{ 
    unmountOnBlur: true,
    swipeEnabled: false 
  }} 
/>
      </Drawer>
    </GestureHandlerRootView>
  );
}