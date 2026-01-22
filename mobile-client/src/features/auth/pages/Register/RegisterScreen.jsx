import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { registerUser } from "../../services/authService";
import AuthLayout from "../../components/AuthLayout";

import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";

import {
  validateStep1, validateStep2, validateStep3, validateStep4
} from "../../validators/registerValidators";

import { useTheme } from "../../../../app/providers/ThemeContext";
import { getAuthStyles } from "../../styles/auth.styles";

const TOTAL_STEPS = 4;

/**
 * Main registration controller.
 * Orchestrates the multi-step form flow, validation, and final API submission.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => getAuthStyles(colors, isDarkMode), [colors, isDarkMode]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    image: null,
    dateOfBirth: "",
    gender: "",
    email: "",
    password: "",
    verifyPassword: "",
  });

  /** Returns the appropriate subtitle for each step of the journey */
  const getHeaderTitle = () => {
    switch (step) {
      case 1: return "Who are you?";
      case 2: return "Contact Info";
      case 3: return "Personal Info";
      case 4: return "Security";
      case 5: return "Welcome!";
      default: return "";
    }
  };

  /** Runs specific validators based on the current step before allowing progress */
  const validateCurrentStep = () => {
    let stepErrors = {};
    if (step === 1) stepErrors = validateStep1(formData);
    if (step === 2) stepErrors = validateStep2(formData);
    if (step === 3) stepErrors = validateStep3(formData);
    if (step === 4) stepErrors = validateStep4(formData);

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
    else await handleSubmit();
  };

  const handleBack = () => {
    if (step > 1 && step <= TOTAL_STEPS) {
      setStep(step - 1);
      setErrors({});
    } else {
      router.replace("/login");
    }
  };

  /** Sanitizes form data and submits the registration request to the server */
  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      firstName: String(formData.firstName || "").trim(),
      lastName: String(formData.lastName || "").trim(),
      phoneNumber: String(formData.phoneNumber || "").trim(),
      dateOfBirth: String(formData.dateOfBirth || "").trim(),
      gender: String(formData.gender || "").trim(),
      email: String(formData.email || "").trim().toLowerCase(),
      password: String(formData.password || ""),
    };
    if (formData.image) payload.image = String(formData.image);

    const res = await registerUser(payload);
    setLoading(false);

    if (res?.success) {
      setStep(5); // Move to the success screen
    } else {
      Alert.alert("Registration Failed", res?.error || "Unknown error");
    }
  };

  return (
    <AuthLayout subtitle={getHeaderTitle()}>

      {/* Dynamic Step Rendering */}
      <View style={{ minHeight: 300 }}>
        {step === 1 && <Step1 formData={formData} setFormData={setFormData} errors={errors} styles={styles} colors={colors} />}
        {step === 2 && <Step2 formData={formData} setFormData={setFormData} errors={errors} styles={styles} colors={colors} />}
        {step === 3 && (
          <Step3
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            authStyles={styles}
            colors={colors}
          />
        )}
        {step === 4 && <Step4 formData={formData} setFormData={setFormData} errors={errors} styles={styles} colors={colors} />}
        {step === 5 && <Step5 styles={styles} />}
      </View>

      {/* Navigation Controls */}
      <View style={{ marginTop: 20 }}>
        {step === 5 ? (
          <Pressable style={styles.btnPrimary} onPress={() => router.replace("/login")}>
            <Text style={styles.btnTextPrimary}>Proceed to Login</Text>
          </Pressable>
        ) : (
          <View style={{ flexDirection: "row", gap: 15 }}>
            <Pressable style={[styles.btnSecondary, { flex: 1 }]} onPress={handleBack}>
              <Text style={styles.btnTextSecondary}>{step === 1 ? "Login" : "Back"}</Text>
            </Pressable>

            <Pressable
              style={[styles.btnPrimary, { flex: 1, marginTop: 10 }]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnTextPrimary}>
                  {step === TOTAL_STEPS ? "Submit" : "Next"}
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {/* Progress Indicators (Pagination Dots) */}
     {step <= TOTAL_STEPS && (
        <View style={localStyles.dots}>
          {[1, 2, 3, 4].map((i) => (
            <View 
              key={i} 
              style={[
                localStyles.dot, 
                i === step && { backgroundColor: colors.primary, width: 20 }
              ]} 
            />
          ))}
        </View>
      )}
    </AuthLayout>
  );
}

const localStyles = StyleSheet.create({
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 25 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});