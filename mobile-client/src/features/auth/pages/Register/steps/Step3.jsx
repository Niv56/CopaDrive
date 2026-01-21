import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export default function Step3({ formData, setFormData, errors, styles, colors }) {
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
      <Text style={styles.label}>Date of Birth</Text>
      <Pressable
        style={[styles.dateButton || styles.inputWrapper, errors.dateOfBirth && styles.dateButtonError]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
        <Text style={[
          styles.dateText,
          !formData.dateOfBirth && styles.dateTextPlaceholder
        ]}>
          {formatDisplayDate(formData.dateOfBirth)}
        </Text>
      </Pressable>
      {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          // התאמת צבעים לדייט-פיקר באייפון
          themeVariant={colors.background === "#121212" ? "dark" : "light"}
        />
      )}

      <Text style={[styles.label, { marginTop: 10 }]}>Gender</Text>

      <View style={styles.genderContainer}>
        <View style={styles.genderRow}>
          {["Male", "Female", "Other"].map((g) => (
            <Pressable
              key={g}
              style={[
                styles.genderBtn,
                formData.gender === g && styles.genderBtnActive
              ]}
              onPress={() => setFormData({ ...formData, gender: g })}
            >
              <Text style={[
                styles.genderText,
                formData.gender === g && styles.genderTextActive
              ]}>
                {g}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[
            styles.genderBtn,
            { width: "100%", height: 50 }, // גודל מלא לכפתור האחרון
            formData.gender === "Prefer not to say" && styles.genderBtnActive
          ]}
          onPress={() => setFormData({ ...formData, gender: "Prefer not to say" })}
        >
          <Text style={[
            styles.genderText,
            formData.gender === "Prefer not to say" && styles.genderTextActive
          ]}>
            Prefer not to say
          </Text>
        </Pressable>
      </View>

      {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
    </View>
  );
}