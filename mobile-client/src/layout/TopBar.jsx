import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { driveStyles } from "../features/drive/styles/myDrive.styles";

import ProfileActionSheet from "./ProfileActionSheet";
import EditProfileModal from "../features/user/components/EditProfileModal";

// ✅ assuming your AuthContext provides user + token
import { useAuth } from "../app/providers/AuthContext";

export default function TopBar() {
  const navigation = useNavigation();
  const { user } = useAuth(); // user?.id, user?.firstName, user?.lastName, user?.phoneNumber, user?.dateOfBirth, user?.image

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const initialUser = useMemo(() => {
    return {
      id: user?.id || user?._id || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      dateOfBirth: user?.dateOfBirth || "",
      image: user?.image || "",
    };
  }, [user]);

  return (
    <>
      <View style={driveStyles.topBarSearchWrapper}>
        <Pressable onPress={toggleDrawer} hitSlop={10}>
          <Ionicons name="menu" size={24} color="#5f6368" />
        </Pressable>

        <Text style={driveStyles.searchText}>Search in CopaDrive</Text>

        {/* ✅ Profile icon press -> open action sheet */}
        <Pressable
          onPress={() => setIsProfileMenuOpen(true)}
          hitSlop={10}
          style={driveStyles.profileCircle}
        >
          <Ionicons name="person" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* ✅ The small bar (Night mode / Play song / Edit profile) with blur background */}
      <ProfileActionSheet
        visible={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        onEditProfile={() => {
          setIsProfileMenuOpen(false);
          setIsEditOpen(true);
        }}
      />

      {/* ✅ React-Native edit profile modal (not the web one) */}
      <EditProfileModal
        visible={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userId={initialUser.id}
        initialFirstName={initialUser.firstName}
        initialLastName={initialUser.lastName}
        initialPhoneNumber={initialUser.phoneNumber}
        initialDateOfBirth={initialUser.dateOfBirth}
        initialImage={initialUser.image}
      />
    </>
  );
}
