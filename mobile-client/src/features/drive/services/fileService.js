import { request } from "../../../shared_code/hooks/api/request";

export async function getFiles(token) {
    return request("/api/files", {
        method: "GET",
        token: token
    });
    
}
export async function getUsage(token) {
    return request("/api/files/usage", {
        method: "GET",
        token: token
    }); 
    }