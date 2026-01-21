import { StyleSheet } from "react-native";

// Dynamic styles that accept theme colors
export const getUploadPreviewStyles = (colors = {}) => StyleSheet.create({
  backdrop: { 
    flex: 1 
  },
  centerWrap: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 16 
  },
  card: { 
    backgroundColor: colors.card || "#fff", 
    borderRadius: 20, 
    maxHeight: "85%",
    overflow: "hidden",
  },

  // Header
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border || "#eee",
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700",
    color: colors.textPrimary || "#333",
  },
  closeBtn: { 
    padding: 4 
  },

  // Body
  body: { 
    padding: 16 
  },

  // Preview
  previewContainer: { 
    height: 200, 
    backgroundColor: colors.surface || "#f5f5f5", 
    borderRadius: 12, 
    marginBottom: 20, 
    overflow: "hidden", 
    justifyContent: "center", 
    alignItems: "center",
  },
  previewImage: { 
    width: "100%", 
    height: "100%",
  },
  previewVideo: { 
    width: "100%", 
    height: "100%" 
  },
  previewFallback: { 
    alignItems: "center", 
    gap: 8 
  },
  previewFallbackText: { 
    color: colors.textSecondary || "#666", 
    fontSize: 12 
  },

  // Form Elements
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 8, 
    color: colors.textPrimary || "#333",
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.border || "#ddd", 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 15, 
    marginBottom: 16,
    backgroundColor: colors.surface || "#fff",
    color: colors.textPrimary || "#333",
  },

  // Folder Picker
  folderPicker: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10,
    borderWidth: 1, 
    borderColor: colors.border || "#ddd", 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 8,
    backgroundColor: colors.surface || "#fff",
  },
  folderPickerText: { 
    flex: 1, 
    fontSize: 15, 
    color: colors.textPrimary || "#333",
  },
  folderList: { 
    backgroundColor: colors.surface || "#f9f9f9", 
    borderRadius: 10, 
    marginBottom: 16, 
    maxHeight: 150, 
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border || "#eee",
  },
  folderItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10, 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border || "#eee",
  },
  folderItemActive: { 
    backgroundColor: (colors.primary || "#2563eb") + "20",
  },
  folderItemText: { 
    fontSize: 14, 
    color: colors.textPrimary || "#333",
  },

  // Footer
  footer: { 
    flexDirection: "row", 
    gap: 10, 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: colors.border || "#eee",
  },
  secondaryBtn: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    gap: 6, 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: colors.surface || "#f0f0f0",
  },
  secondaryBtnText: { 
    fontWeight: "600", 
    color: colors.textPrimary || "#333",
  },
  discardBtn: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    gap: 6, 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: "#fef2f2",
  },
  discardBtnText: { 
    fontWeight: "600", 
    color: "#dc2626",
  },
  confirmBtn: { 
    flex: 1.5, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    gap: 6, 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: colors.primary || "#2563eb",
  },
  confirmBtnDisabled: { 
    opacity: 0.6 
  },
  confirmBtnText: { 
    fontWeight: "600", 
    color: "#fff",
  },
});
