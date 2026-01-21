import React from "react";
import { Stack } from "expo-router";

export default function AuthLayoutWrapper() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade', 
        
        animationDuration: 200,

        contentStyle: { backgroundColor: 'transparent' }, 
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}