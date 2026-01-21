import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "./providers/AuthContext";

export default function Index() {
  const { isHydrating, isAuthenticated } = useAuth();

  if (isHydrating) return null;

  if (isAuthenticated) return <Redirect href="/(app)/home" />;
  return <Redirect href="/(auth)/login" />;
}