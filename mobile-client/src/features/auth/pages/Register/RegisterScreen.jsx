import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { registerUser } from "../../services/authService";
import AuthLayout from "../../components/AuthLayout";
import { authStyles } from "../../styles/auth.styles";

import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";

import {
  validateStep1, validateStep2, validateStep3, validateStep4
} from "../../validators/registerValidators";

const TOTAL_STEPS = 4;

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // תיקון: הוסר ה-<any> שגרם לקריסה
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phoneNumber: "", image: null,
    dateOfBirth: "", gender: "", email: "", password: "", verifyPassword: "",
  });

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

  const handleSubmit = async () => {
    setLoading(true);
    const res = await registerUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      email: formData.email.toLowerCase(),
      password: formData.password,
    });
    setLoading(false);

    if (res.success) setStep(5);
    else Alert.alert("Registration Failed", res.error || "Unknown error");
  };

  return (
    <AuthLayout subtitle={getHeaderTitle()}>
      <View style={{ minHeight: 300 }}>
        {step === 1 && <Step1 formData={formData} setFormData={setFormData} errors={errors} />}
        {step === 2 && <Step2 formData={formData} setFormData={setFormData} errors={errors} />}
        {step === 3 && <Step3 formData={formData} setFormData={setFormData} errors={errors} />}
        {step === 4 && <Step4 formData={formData} setFormData={setFormData} errors={errors} />}
        {step === 5 && <Step5 />}
      </View>

      <View style={{ marginTop: 20 }}>
        {step === 5 ? (
          <Pressable style={authStyles.btnPrimary} onPress={() => router.replace("/login")}>
            <Text style={authStyles.btnTextPrimary}>Proceed to Login</Text>
          </Pressable>
        ) : (
          <View style={{ flexDirection: "row", gap: 15 }}>
            <Pressable style={[authStyles.btnSecondary, { flex: 1 }]} onPress={handleBack}>
              <Text style={authStyles.btnTextSecondary}>{step === 1 ? "Login" : "Back"}</Text>
            </Pressable>

            <Pressable style={[authStyles.btnPrimary, { flex: 1, marginTop: 10 }]} onPress={handleNext}>
              {loading ? <ActivityIndicator color="#fff" /> :
                <Text style={authStyles.btnTextPrimary}>{step === TOTAL_STEPS ? "Submit" : "Next"}</Text>
              }
            </Pressable>
          </View>
        )}
      </View>

      {step <= TOTAL_STEPS && (
        <View style={localStyles.dots}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[localStyles.dot, i === step && localStyles.dotActive]} />
          ))}
        </View>
      )}
    </AuthLayout>
  );
}

const localStyles = StyleSheet.create({
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 25 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ddd" },
  dotActive: { backgroundColor: "#007bff", width: 20 },
});