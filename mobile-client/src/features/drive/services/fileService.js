import { request } from "../../../shared_code/hooks/api/request";

export async function getFiles(token) {
    return request("/api/files", {
        method: "GET",
        token: token
    });
}