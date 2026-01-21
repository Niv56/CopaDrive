import { DeviceEventEmitter } from "react-native";

// Global event keys for cross-component communication
const EVENT_NAME = "COPADRIVE_REFRESH";
const NAVIGATE_FOLDER_EVENT = "COPADRIVE_NAVIGATE_FOLDER";

/**
 * Triggers a global refresh signal. 
 * Used after uploads, deletions, or edits to sync the UI.
 */
export function emitDriveRefresh(payload = {}) {
  DeviceEventEmitter.emit(EVENT_NAME, payload);
}

/**
 * Subscribes a component to the refresh event. 
 * Returns a cleanup function to remove the listener on unmount.
 */
export function subscribeDriveRefresh(handler) {
  const sub = DeviceEventEmitter.addListener(EVENT_NAME, handler);
  return () => sub.remove();
}

/**
 * Broadcasts a navigation request to a specific folder.
 * Typically used by Search or Sidebars to change the MyDrive view.
 */
export function emitNavigateToFolder(folderId, folderName) {
  DeviceEventEmitter.emit(NAVIGATE_FOLDER_EVENT, { folderId, folderName });
}

/**
 * Subscribes to folder navigation requests.
 */
export function subscribeNavigateToFolder(handler) {
  const sub = DeviceEventEmitter.addListener(NAVIGATE_FOLDER_EVENT, handler);
  return () => sub.remove();
}