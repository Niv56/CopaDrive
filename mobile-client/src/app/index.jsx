import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "./providers/AuthContext";

/**
 * Entry point redirector.
 * Determines the initial route based on authentication state.
 */
export default function Index() {
  const { isHydrating, isAuthenticated } = useAuth();

  // Wait for authentication state to load from storage to prevent incorrect redirects
  if (isHydrating) return null;

  // Route authenticated users to the main app, others to the login flow
  if (isAuthenticated) return <Redirect href="/(app)/home" />;
  return <Redirect href="/(auth)/login" />;
}