import { request } from "../../../shared_code/hooks/api/request";

export async function getSearchResults(token, query, options = {}) {
    const res = await fetch(`${BASE_URL}/api/search/${encodeURIComponent(query)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal: options.signal,
    });
    return res.json();
}