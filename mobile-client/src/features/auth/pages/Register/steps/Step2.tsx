import React from "react";
import { View, Text, TextInput, StyleSheet, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// שימוש בנתיב המדויק שביקשת
import { authStyles } from "../../../styles/auth.styles";

export default function Step2({ formData, setFormData, errors }: any) {
  
  const handlePhoneChange = (text: string) => {
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
      {/* אזור התמונה נשאר עם עיצוב מקומי כי הוא ייחודי למסך הזה */}
      <View style={localStyles.imageContainer}>
        <View style={localStyles.avatarPlaceholder}>
           <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
        <Text style={localStyles.imageText}>Tap to upload photo (Coming soon)</Text>
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
      
      {errors.phoneNumber && <Text style={authStyles.errorText}>{errors.phoneNumber}</Text>}
    </View>
  );
}

// עיצובים מקומיים רק לרכיבים שקיימים ספציפית במסך הזה (כמו תמונת הפרופיל)
const localStyles = StyleSheet.create({
  imageContainer: { alignItems: "center", marginBottom: 20 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: "#f3f5f7",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#e1e1e1", marginBottom: 8
  },
  imageText: { fontSize: 13, color: "#888" },
});