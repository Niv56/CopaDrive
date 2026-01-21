import React from "react";
import { View, Text, TextInput, StyleSheet, Keyboard, Image, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

// ✅ מקבלים את styles ו-colors
export default function Step2({ formData, setFormData, errors, styles, colors }) {

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need permission to access your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handlePhoneChange = (text) => {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

    let formatted = cleaned;
    if (cleaned.length > 3 && cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    setFormData({ ...formData, phoneNumber: formatted });
  };

  return (
    <View>
      <View style={localStyles.imageContainer}>
        <Pressable onPress={pickImage} style={[localStyles.avatarPlaceholder, { borderColor: colors.border }]}>
          {formData.image ? (
            <Image source={{ uri: formData.image }} style={localStyles.avatarImage} />
          ) : (
            <Ionicons name="image-outline" size={40} color={colors.textTertiary} />
          )}
        </Pressable>
        <Text style={[localStyles.imageText, { color: colors.textSecondary }]}>
          {formData.image ? "Tap to change photo" : "Tap to upload photo"}
        </Text>
        {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
      </View>

      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="05X-XXX-XXXX"
          placeholderTextColor={colors.textTertiary}
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={handlePhoneChange}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>
      <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 5, marginLeft: 4 }}>
        Israeli mobile numbers only
      </Text>

      {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
    </View>
  );
}

const localStyles = StyleSheet.create({
  imageContainer: { alignItems: "center", marginBottom: 20 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.05)", // שקוף עדין כדי להתאים לכהה/בהיר
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  imageText: { fontSize: 13, fontWeight: "500" },
});