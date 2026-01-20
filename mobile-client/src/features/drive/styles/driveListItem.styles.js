
import { StyleSheet } from "react-native";

export const listItemStyles = StyleSheet.create({
  // Menu backdrop
  backdrop: { 
    flex: 1, 
    backgroundColor: "transparent" 
  },
  dim: { 
    backgroundColor: "rgba(0,0,0,0.08)" 
  },

  // Stack menu (floating options)
  stackMenu: {
    position: "absolute",
    width: 260,
    gap: 12,
  },
  stackBtn: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "rgba(255,255,255,0.98)",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    minWidth: 260,
  },
  stackLabel: {
    flex: 1,
    textAlign: "left",
    fontSize: 12,
    color: "#333",
    letterSpacing: 1.2,
  },

  // Rename modal
  renameBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  renameCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
  },
  renameTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  renameInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  renameBtnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  renameGhostText: {
    color: "#6c757d",
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  renameBtnPrimary: {
    backgroundColor: "#0d6efd",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  renamePrimaryText: {
    color: "white",
    fontWeight: "700",
    letterSpacing: 1.5,
  },
});