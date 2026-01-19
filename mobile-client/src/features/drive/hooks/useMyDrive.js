// mobile-client/src/features/drive/hooks/useMyDrive.js

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../app/providers/AuthContext";
import { getFiles } from "../services/fileService";
import { subscribeDriveRefresh } from "../services/driveEvents";

export function useMyDrive() {
  const { token, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getFiles(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      if (
        error?.message &&
        (error.message.includes("token") || error.message.includes("401"))
      ) {
        await logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ✅ listen for global refresh events (upload/create/delete/etc.)
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
