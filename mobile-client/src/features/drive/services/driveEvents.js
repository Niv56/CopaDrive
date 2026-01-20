import { DeviceEventEmitter } from "react-native";

const EVENT_NAME = "COPADRIVE_REFRESH";

export function emitDriveRefresh(payload = {}) {
  DeviceEventEmitter.emit(EVENT_NAME, payload);
}

export function subscribeDriveRefresh(handler) {
  const sub = DeviceEventEmitter.addListener(EVENT_NAME, handler);
  return () => sub.remove();
}
