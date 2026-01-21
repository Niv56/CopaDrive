import { StyleSheet } from "react-native";

export const getUploadPreviewStyles = (colors = {}, isDarkMode) => {
  const cardBg = isDarkMode ? "#1e1e1e" : (colors.card || "#fff");
  const divider = isDarkMode ? colors.border : (colors.divider || "#f0f0f0");

  return StyleSheet.create({
    backdrop: {
      flex: 1
    },
    centerWrap: {
      flex: 1,
      justifyContent: "center",
      padding: 16
    },
    card: {
      backgroundColor: cardBg,
      borderRadius: 35,
      maxHeight: "85%",
      overflow: "hidden",
      elevation: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },

    // Header
    header: {
      backgroundColor: cardBg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      letterSpacing: 0.5,
    },
    closeBtn: {
      padding: 4
    },

    // Body
    body: {
      padding: 20,
    },

    // Preview
    previewContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    previewImage: {
      width: "100%",
      height: 200,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f5f5f5",
    },
    previewVideo: {
      width: "100%",
      height: 200,
      borderRadius: 20,
      backgroundColor: "#000",
    },
    previewFallback: {
      width: "100%",
      height: 150,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f5f5f5",
      justifyContent: "center",
      alignItems: "center",
    },
    previewFallbackText: {
      marginTop: 10,
      fontSize: 13,
      color: colors.textSecondary,
    },

    // Form Elements
    label: {
      fontSize: 11,
      fontWeight: "800",
      marginBottom: 8,
      marginLeft: 15,
      color: colors.textSecondary,
      letterSpacing: 0.5,
    },
    input: {
      borderRadius: 30,
      paddingHorizontal: 22,
      height: 50,
      fontSize: 15,
      marginBottom: 16,
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f3f4",
      color: colors.textPrimary,
      borderWidth: 0,
    },

    // Folder Picker
    folderPicker: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 30,
      paddingHorizontal: 20,
      height: 50,
      marginBottom: 8,
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f9fa",
      borderWidth: 1,
      borderColor: colors.border,
    },
    folderPickerText: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
      fontWeight: "500",
    },
    folderList: {
      backgroundColor: isDarkMode ? "#252525" : "#f9f9f9",
      borderRadius: 20,
      marginBottom: 16,
      maxHeight: 120,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    folderItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    folderItemActive: {
      backgroundColor: isDarkMode ? "rgba(123,97,255,0.2)" : colors.activeItem,
    },
    folderItemText: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: "500",
    },

    // Footer
    footer: {
      flexDirection: "row",
      gap: 10,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    secondaryBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 55,
      borderRadius: 30,
      backgroundColor: isDarkMode ? "#333" : "#f0f0f0",
    },
    secondaryBtnText: {
      fontWeight: "700",
      color: colors.textPrimary,
    },
    discardBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 55,
      borderRadius: 30,
      backgroundColor: isDarkMode ? "rgba(220,38,38,0.15)" : "#fef2f2",
    },
    discardBtnText: {
      fontWeight: "700",
      color: colors.danger,
    },
    confirmBtn: {
      flex: 1.5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 55,
      borderRadius: 30,
      backgroundColor: colors.primary,
    },
    confirmBtnDisabled: {
      opacity: 0.6
    },
    confirmBtnText: {
      fontWeight: "800",
      color: "#fff",
      fontSize: 16,
    },
  });
};