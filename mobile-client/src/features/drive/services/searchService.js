import { request } from "../../../shared_code/hooks/api/request";

export async function fetchSearchItems(token, query) {
    if (!query || query.trim().length === 0) return [];

    try {
        const encoded = encodeURIComponent(query.trim());
        const data = await request(`/api/search/${encoded}`, {
            method: "GET",
            token: token,
        });
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Search failed:", error.message);
        return [];
    }
}