import React from "react";
import { Redirect } from "expo-router";
// התיקון: ייבוא ישיר מה-Provider שנמצא ליד הקובץ הזה
import { useAuth } from "./providers/AuthContext";

export default function Index() {
  const { isHydrating, isAuthenticated } = useAuth();

  // בזמן שהאפליקציה בודקת אם יש טוקן שמור, לא מציגים כלום (או מסך טעינה)
  if (isHydrating) return null;

  // אם המשתמש מחובר -> לך לבית. אחרת -> לך להתחברות.
  if (isAuthenticated) return <Redirect href="/(app)/home" />;
  return <Redirect href="/(auth)/login" />;
}