import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

/**
 * Registration Step 3: Personal Information
 * Handles Date of Birth selection and Gender identity.
 */
export default function Step3({ formData, setFormData, errors, authStyles, colors }) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  /** Determines the initial date displayed by the picker (defaults to 18 years ago) */
  const getDateValue = () => {
    if (formData.dateOfBirth) {
      const parsed = new Date(formData.dateOfBirth);
      if (!isNaN(parsed)) return parsed;
    }
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 18);
    return defaultDate;
  };

  /** Formats the selected date into a YYYY-MM-DD string for the database */
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

  /** Formats the DOB string for a user-friendly display in the UI */
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

      {errors.dateOfBirth && <Text style={authStyles.errorText}>{errors.dateOfBirth}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          themeVariant={isDarkMode ? "dark" : "light"}
        />
      )}

      <Text style={[authStyles.label, { marginTop: 10 }]}>Gender</Text>

      {/* Gender Selection Grid */}
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

      {errors.gender && <Text style={authStyles.errorText}>{errors.gender}</Text>}
    </View>
  );
}