import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../app/providers/AuthContext";
import { getFiles } from "../services/fileService";

export function useMyDrive() {
    const { token, logout } = useAuth();
    const [items, setItems] = useState<DriveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);


    const fetchItems = useCallback(async () => {
        if (!token) return;
        try {
            const data = await getFiles(token);
            setItems(data);
        } catch (error: any) {
            if (error.message.includes("token") || error.message.includes("401")) {
                console.error("Session invalid, logging out...");
                await logout();
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, logout]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchItems();
    };

    return { items, loading, refreshing, onRefresh };
}