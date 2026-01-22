import { request } from "../../../shared_code/hooks/api/request";

/**
 * Search Service
 * Handles server-side queries for files and folders within the drive.
 */
export async function fetchSearchItems(token, query) {
    // Prevent API calls for empty strings
    if (!query || query.trim().length === 0) return [];

    try {
        // Encode query to safely handle special characters in the URL
        const encoded = encodeURIComponent(query.trim());
        const data = await request(`/api/search/${encoded}`, {
            method: "GET",
            token: token,
        });

        // Ensure returned data is iterable for the UI components
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}