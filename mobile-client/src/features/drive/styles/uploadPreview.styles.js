import { StyleSheet } from "react-native";

export const getUploadPreviewStyles = (colors = {}, isDarkMode) => {
  // ✅ קובעים תמיד divider נכון לפי מצב לילה/יום (בלי fallback לבן)
  const divider = isDarkMode ? "rgba(255,255,255,0.10)" : (colors.border || "#e9ecef");
  const cardBg = isDarkMode ? "#1e1e1e" : (colors.card || "#fff");

  return StyleSheet.create({
    backdrop: {
      flex: 1,
    },
    centerWrap: {
      flex: 1,
      justifyContent: "center",
      padding: 16,
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

    header: {
      backgroundColor: cardBg, // ✅ כדי שלא יהיה “קו לבן” מה-ScrollView
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
      color: colors.textPrimary || "#fff",
      letterSpacing: 0.5,
    },
    closeBtn: { padding: 4 },

    // ✅ חשוב: גם ל-body לתת רקע כמו הכרטיס כדי שלא יציץ לבן בגלילה
    body: {
      backgroundColor: cardBg,
      padding: 20,
    },

    previewContainer: {
      height: 180,
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : (colors.surface || "#f5f5f5"),
      borderRadius: 20,
      marginBottom: 20,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    previewImage: { width: "100%", height: "100%" },
    previewVideo: { width: "100%", height: "100%" },
    previewFallback: { alignItems: "center", gap: 8 },
    previewFallbackText: {
      color: colors.textSecondary || (isDarkMode ? "#b0b3b8" : "#666"),
      fontSize: 12,
    },

    label: {
      fontSize: 11,
      fontWeight: "800",
      marginBottom: 8,
      marginLeft: 15,
      color: isDarkMode ? "#999" : "#777",
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
      borderColor: divider,
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
      borderColor: divider,
    },
    folderItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    folderItemActive: {
      backgroundColor: isDarkMode ? "rgba(123, 97, 255, 0.2)" : "rgba(13, 110, 253, 0.12)",
    },
    folderItemText: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: "500",
    },

    footer: {
      backgroundColor: cardBg, // ✅ גם כאן כדי למנוע “קו לבן”
      flexDirection: "row",
      gap: 10,
      padding: 20,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: divider,
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
      color: "#dc2626",
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
    confirmBtnDisabled: { opacity: 0.6 },
    confirmBtnText: {
      fontWeight: "800",
      color: "#fff",
      fontSize: 16,
    },
  });
};
