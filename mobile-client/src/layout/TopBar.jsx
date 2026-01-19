import React, { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { driveStyles } from "../features/drive/styles/myDrive.styles";
import { useAuth } from "../app/providers/AuthContext";

import ProfileActionSheet from "./ProfileActionSheet";
import EditProfileModal from "../features/user/components/EditProfileModal";

export default function TopBar() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <View style={driveStyles.topBarSearchWrapper}>
        <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} hitSlop={10}>
          <Ionicons name="menu" size={24} color="#5f6368" />
        </Pressable>

        <Text style={driveStyles.searchText}>Search in CopaDrive</Text>

        <Pressable
          onPress={() => setIsProfileMenuOpen(true)}
          hitSlop={10}
          style={driveStyles.profileCircle}
        >
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              style={localStyles.avatarImage}
            />
          ) : (
            <Ionicons name="person" size={18} color="#fff" />
          )}
        </Pressable>
      </View>

      <ProfileActionSheet
        visible={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        onEditProfile={() => {
          setIsProfileMenuOpen(false);
          setIsEditOpen(true);
        }}
      />

      <EditProfileModal
        visible={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userId={user?.id || user?._id}
        initialFirstName={user?.firstName}
        initialLastName={user?.lastName}
        initialPhoneNumber={user?.phoneNumber}
        initialImage={user?.image}
      />
    </>
  );
}

const localStyles = StyleSheet.create({
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16, // עיגול מושלם
  },
});