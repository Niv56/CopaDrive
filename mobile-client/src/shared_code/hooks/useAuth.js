import { useAuth } from "../../app/providers/AuthContext";

/**
 * A custom hook abstraction for the AuthContext.
 * Provides a centralized way to access authentication state and methods.
 */
export default function useAuthHook() {
  return useAuth();
}