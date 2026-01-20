import React from "react";
import { View, Text, TextInput, StyleSheet, Keyboard, Image, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker'; // חובה להתקין: npx expo install expo-image-picker
import { authStyles } from "../../../styles/auth.styles";

export default function Step2({ formData, setFormData, errors }) {

  // פונקציה לבחירת תמונה מהגלריה
  const pickImage = async () => {
    // 1. בקשת הרשאה לגישה לגלריה (דרישת ולידציה וחוויית משתמש) 
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        "Permission Denied",
        "We need permission to access your photos to set a profile picture."
      );
      return;
    }

    // 2. פתיחת הגלריה לבחירת תמונה 
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // מאפשר למשתמש לחתוך את התמונה
      aspect: [1, 1],      // יחס תמונה של 1:1 (ריבוע) עבור פרופיל
      quality: 0.7,        // הפחתת איכות לשמירה על ביצועים
    });

    // 3. אם המשתמש בחר תמונה, נשמור את ה-URI שלה ב-State 
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
      {/* אזור בחירת והצגת תמונת הפרופיל  */}
      <View style={localStyles.imageContainer}>
        <Pressable onPress={pickImage} style={localStyles.avatarPlaceholder}>
          {formData.image ? (
            // אם קיימת תמונה - הצג אותה
            <Image source={{ uri: formData.image }} style={localStyles.avatarImage} />
          ) : (
            // אם אין תמונה - הצג אייקון ברירת מחדל
            <Ionicons name="image-outline" size={40} color="#ccc" />
          )}
        </Pressable>
        <Text style={localStyles.imageText}>
          {formData.image ? "Tap to change photo" : "Tap to upload photo"}
        </Text>
        {/* ולידציה ויזואלית לתמונה אם נדרש [cite: 43, 52] */}
        {errors.image && <Text style={authStyles.errorText}>{errors.image}</Text>}
      </View>

      <Text style={authStyles.label}>Phone Number</Text>
      <View style={authStyles.inputWrapper}>
        <Ionicons name="call-outline" size={20} color="#666" style={authStyles.inputIcon} />
        <TextInput
          style={authStyles.input}
          placeholder="05X-XXX-XXXX"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={handlePhoneChange}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>
      <Text style={{ fontSize: 12, color: "#888", marginBottom: 5, marginLeft: 4 }}>
        Israeli mobile numbers only
      </Text>

      {/* הצגת הודעת שגיאה ברורה למשתמש [cite: 43, 51] */}
      {errors.phoneNumber && <Text style={authStyles.errorText}>{errors.phoneNumber}</Text>}
    </View>
  );
}

const localStyles = StyleSheet.create({
  imageContainer: { alignItems: "center", marginBottom: 20 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f3f5f7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    marginBottom: 8,
    overflow: "hidden" // מבטיח שהתמונה לא תחרוג מהעיגול
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  imageText: { fontSize: 13, color: "#888", fontWeight: "500" },
});