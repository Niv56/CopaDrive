import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../app/providers/AuthContext";
import { getFiles } from "../services/fileService";

export function useMyDrive() {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchItems = useCallback(async () => {
        if (!token) return;
        try {
            const data = await getFiles(token);
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch files:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchItems();
    };

    return { items, loading, refreshing, onRefresh };
}