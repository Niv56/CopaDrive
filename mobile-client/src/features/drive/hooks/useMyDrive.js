import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../app/providers/AuthContext";
import { getFiles } from "../services/fileService";
import { subscribeDriveRefresh } from "../services/driveEvents";

/**
 * Custom hook to manage the state and synchronization of the user's file list.
 * Handles initial loading, pull-to-refresh, and cross-component event listening.
 */
export function useMyDrive() {
  const { token, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /** * Fetches files from the backend. 
   * Triggers an automatic logout if the token is found to be expired (401).
   */
  const fetchItems = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getFiles(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      const isAuthError = error?.message &&
        (error.message.includes("token") || error.message.includes("401"));

      if (isAuthError) {
        await logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, logout]);

  // Initial data fetch on mount or token change
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /** * Global Event Listener
   * Subscribes to changes (like uploads or deletions) triggered by other components 
   * to keep the local file list in sync without requiring a full page remount.
   */
  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => {
      setRefreshing(true);
      fetchItems();
    });
    return unsubscribe;
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  return { items, loading, refreshing, onRefresh };
}