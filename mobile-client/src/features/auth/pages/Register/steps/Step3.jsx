import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { authStyles } from "../../../styles/auth.styles";

export default function Step3({ formData, setFormData, errors }) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getDateValue = () => {
    if (formData.dateOfBirth) {
      const parsed = new Date(formData.dateOfBirth);
      if (!isNaN(parsed)) return parsed;
    }
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 18);
    return defaultDate;
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && selectedDate) {
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
        style={[authStyles.dateButton, errors.dateOfBirth && authStyles.dateButtonError]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 10 }} />
        <Text style={[
          authStyles.dateText,
          !formData.dateOfBirth && authStyles.dateTextPlaceholder
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

      <Text style={[authStyles.label, { marginTop: 10 }]}>Gender</Text>

      <View style={authStyles.genderContainer}>
        <View style={authStyles.genderRow}>
          {["Male", "Female", "Other"].map((g) => (
            <Pressable
              key={g}
              style={[
                authStyles.genderBtn,
                formData.gender === g && authStyles.genderBtnActive
              ]}
              onPress={() => setFormData({ ...formData, gender: g })}
            >
              <Text style={[
                authStyles.genderText,
                formData.gender === g && authStyles.genderTextActive
              ]}>
                {g}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[
            authStyles.genderBtnFull, // משתמשים רק בזה כדי למנוע התנגשות הגדרות
            formData.gender === "Prefer not to say" && authStyles.genderBtnActive
          ]}
          onPress={() => setFormData({ ...formData, gender: "Prefer not to say" })}
        >
          <Text style={[
            authStyles.genderText,
            formData.gender === "Prefer not to say" && authStyles.genderTextActive
          ]}>
            Prefer not to say
          </Text>
        </Pressable>
      </View>

      {errors.gender && <Text style={authStyles.errorText}>{errors.gender}</Text>}
    </View>
  );
}