import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { authStyles } from "../../../styles/auth.styles";

export default function Step3({ formData, setFormData, errors }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const genders = ["male", "female", "other"];

  // Parse existing date or default to 18 years ago
  const getDateValue = () => {
    if (formData.dateOfBirth) {
      const parsed = new Date(formData.dateOfBirth);
      if (!isNaN(parsed)) return parsed;
    }
    // Default: 18 years ago
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 18);
    return defaultDate;
  };

  
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && selectedDate) {
      // Format as YYYY-MM-DD for the API
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      setFormData({ ...formData, dateOfBirth: `${year}-${month}-${day}` });
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Select your birthday";
    const date = new Date(dateStr);
    if (isNaN(date)) return "Select your birthday";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View>
      
      <Text style={authStyles.label}>Date of Birth</Text>
      <Pressable
        style={[localStyles.dateButton, errors.dateOfBirth && localStyles.dateButtonError]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 10 }} />
        <Text style={[
          localStyles.dateText,
          !formData.dateOfBirth && localStyles.dateTextPlaceholder
        ]}>
          {formatDisplayDate(formData.dateOfBirth)}
        </Text>
      </Pressable>
      {errors.dateOfBirth && <Text style={authStyles.errorText}>{errors.dateOfBirth}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      {Platform.OS === "ios" && showDatePicker && (
        <Pressable style={localStyles.iosDoneBtn} onPress={() => setShowDatePicker(false)}>
          <Text style={localStyles.iosDoneText}>Done</Text>
        </Pressable>
      )}

      <Text style={[authStyles.label, { marginTop: 10 }]}>Gender</Text>
      <View style={localStyles.genderRow}>
        {genders.map((g) => (
          <Pressable
            key={g}
            style={[
              localStyles.genderBtn,
              formData.gender === g && localStyles.genderBtnActive
            ]}
            onPress={() => setFormData({ ...formData, gender: g })}
          >
            <Text style={[
              localStyles.genderText,
              formData.gender === g && localStyles.genderTextActive
            ]}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.gender && <Text style={authStyles.errorText}>{errors.gender}</Text>}
    </View>
  );
}

// Local styles
const localStyles = StyleSheet.create({
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  genderBtn: {
    flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#e1e1e1",
    alignItems: "center", backgroundColor: "#fff"
  },
  genderBtnActive: { backgroundColor: "#007bff", borderColor: "#007bff" },
  genderText: { color: "#333", fontWeight: "600" },
  genderTextActive: { color: "#fff" },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 8,
  },
  dateButtonError: {
    borderColor: "#dc3545",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  dateTextPlaceholder: {
    color: "#999",
  },
  iosDoneBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  iosDoneText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "600",
  },
});