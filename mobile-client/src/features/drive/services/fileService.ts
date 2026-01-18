import { request } from "../../../shared_code/hooks/api/request";
import { DriveItem } from "../types/driveItem";

export async function getFiles(token: string): Promise<DriveItem[]> {
    return request<DriveItem[]>("/api/files", {
        method: "GET",
        token: token
    });
}