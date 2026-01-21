import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

// ✅ הפונקציה מקבלת authStyles
export default function Step3({ formData, setFormData, errors, authStyles, colors }) {
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
      {/* ✅ תוקן ל-authStyles */}
      <Text style={authStyles.label}>Date of Birth</Text>
      
      <Pressable
        style={[
          authStyles.dateButton || authStyles.inputWrapper, 
          errors.dateOfBirth && authStyles.dateButtonError
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
        <Text style={[
          authStyles.dateText,
          !formData.dateOfBirth && authStyles.dateTextPlaceholder
        ]}>
          {formatDisplayDate(formData.dateOfBirth)}
        </Text>
      </Pressable>
      
      {/* ✅ תוקן ל-authStyles */}
      {errors.dateOfBirth && <Text style={authStyles.errorText}>{errors.dateOfBirth}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          themeVariant={colors.background === "#121212" ? "dark" : "light"}
        />
      )}

      {/* ✅ תוקן ל-authStyles */}
      <Text style={[authStyles.label, { marginTop: 10 }]}>Gender</Text>

      <View style={authStyles.genderContainer}>
        <View style={authStyles.genderRow}>
          {[{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Other", value: "other" }].map((g) => (
            <Pressable
              key={g.value}
              style={[
                authStyles.genderBtn,
                formData.gender === g.value && authStyles.genderBtnActive
              ]}
              onPress={() => setFormData({ ...formData, gender: g.value })}
            >
              <Text style={[
                authStyles.genderText,
                formData.gender === g.value && authStyles.genderTextActive
              ]}>
                {g.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[
            authStyles.genderBtnFull, 
            formData.gender === "prefer_not_to_say" && authStyles.genderBtnActive
          ]}
          onPress={() => setFormData({ ...formData, gender: "prefer_not_to_say" })}
        >
          <Text style={[
            authStyles.genderText,
            formData.gender === "prefer_not_to_say" && authStyles.genderTextActive
          ]}>
            Prefer not to say
          </Text>
        </Pressable>
      </View>

      {/* ✅ תוקן ל-authStyles */}
      {errors.gender && <Text style={authStyles.errorText}>{errors.gender}</Text>}
    </View>
  );
}