import React, { useState, useMemo } from "react";
import { View, Pressable, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "../app/providers/AuthContext";
import SearchBar from "./SearchBar/SearchBar";
import EditProfileModal from "../features/auth/components/EditProfileModal";

// ✅ ייבוא ה-Theme
import { getDriveStyles } from "../features/drive/styles/myDrive.styles";
import { useTheme } from "../app/providers/ThemeContext";

export default function TopBar() {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  
  // ✅ שליפת הצבעים
  const { colors } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  // ✅ ביטלנו את isProfileMenuOpen, נשארנו רק עם המודל של העריכה
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <View style={styles.masterZIndex}>
      <View style={driveStyles.topBarSearchWrapper}>
        
        {/* כפתור המבורגר - פותח את ה-Sidebar */}
        <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} hitSlop={15}>
          <Ionicons name="menu" size={28} color={colors.textSecondary} />
        </Pressable>

        {/* שורת חיפוש */}
        <SearchBar token={token} />

        {/* תמונת פרופיל - לחיצה פותחת ישר את העריכה */}
        <Pressable onPress={() => setIsEditOpen(true)} style={driveStyles.profileCircle}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={18} color="#fff" />
          )}
        </Pressable>
      </View>

      {/* הוסר: ProfileActionSheet (התפריט הקטן) */}

      {/* מודל עריכת פרופיל */}
      <EditProfileModal
        visible={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userId={user?.id || user?._id}
        initialFirstName={user?.firstName}
        initialLastName={user?.lastName}
        initialPhoneNumber={user?.phoneNumber}
        initialImage={user?.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  masterZIndex: { zIndex: 10000, position: 'relative' },
  avatar: { width: 32, height: 32, borderRadius: 16 }
});