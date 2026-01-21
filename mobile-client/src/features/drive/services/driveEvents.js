import { DeviceEventEmitter } from "react-native";

const EVENT_NAME = "COPADRIVE_REFRESH";
const NAVIGATE_FOLDER_EVENT = "COPADRIVE_NAVIGATE_FOLDER";

export function emitDriveRefresh(payload = {}) {
  DeviceEventEmitter.emit(EVENT_NAME, payload);
}

export function subscribeDriveRefresh(handler) {
  const sub = DeviceEventEmitter.addListener(EVENT_NAME, handler);
  return () => sub.remove();
}

// Navigate to a specific folder in MyDrive
export function emitNavigateToFolder(folderId, folderName) {
  DeviceEventEmitter.emit(NAVIGATE_FOLDER_EVENT, { folderId, folderName });
}

export function subscribeNavigateToFolder(handler) {
  const sub = DeviceEventEmitter.addListener(NAVIGATE_FOLDER_EVENT, handler);
  return () => sub.remove();
}
