import React from "react";
import { Stack } from "expo-router";

/**
 * Authentication layout wrapper.
 * Uses a quick fade animation to provide a smooth transition between login and registration.
 */
export default function AuthLayoutWrapper() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,

        // Transparent background prevents flickers during screen transitions
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}