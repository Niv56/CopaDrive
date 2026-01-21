import React from "react";
import { Stack } from "expo-router";

export default function AuthLayoutWrapper() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // אנימציית Fade נקייה
        animation: 'fade', 
        
        // ✅ הופך את המעבר למהיר וקריספי (200 מילי-שניות)
        animationDuration: 200,

        // מונע הבהובים
        contentStyle: { backgroundColor: 'transparent' }, 
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}