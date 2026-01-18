export interface DriveItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    mimeType?: string;
    parent?: string;
    updatedAt: string;
}