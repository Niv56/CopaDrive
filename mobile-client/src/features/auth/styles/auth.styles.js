import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const getAuthStyles = (colors, isDarkMode) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: colors.background,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // החשכה נעימה
    zIndex: 0,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    // כרטיס שחור כמעט מלא במצב לילה
    backgroundColor: isDarkMode ? "rgba(18, 18, 18, 0.95)" : "rgba(255, 255, 255, 0.92)",
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDarkMode ? 0.6 : 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: "rgba(255,255,255,0.08)",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  brandText: {
    fontSize: 34,
    fontFamily: "BrunoAceSC_400Regular",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#fff",
    borderWidth: 1,
    borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    height: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    marginLeft: 4,
  },
  
  // ✅ הכפתור הפעיל - כחול בוהק
  btnPrimary: {
    backgroundColor: "#007bff", // כחול חזק תמיד
    borderRadius: 50,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // ✅ הכפתור הכבוי (כשאין פרטים) - שחור/אפור כהה במצב לילה
  btnDisabled: {
    backgroundColor: isDarkMode ? "#252525" : "#a0cfff", // שחור אפור במצב לילה
    borderColor: isDarkMode ? "#333" : "#a0cfff",
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    opacity: 1, // משאירים אטום כדי שיראה כמו כפתור
  },
  
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : colors.border,
    borderRadius: 50,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  btnTextPrimary: {
    fontSize: 18,
    fontWeight: "700",
    // טקסט אפור כהה כשהכפתור כבוי, ולבן כשהוא דולק
    color: "#fff", 
  },
  btnTextSecondary: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginLeft: 4,
    marginTop: -10,
    marginBottom: 10,
  },
  linkBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkTextBold: {
    fontWeight: "700",
    color: "#007bff",
    textDecorationLine: "underline",
  },
  
  // --- Gender & Date Styles ---
  genderContainer: { gap: 12, marginBottom: 10 },
  genderRow: { flexDirection: "row", gap: 10 },
  genderBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? "rgba(255,255,255,0.15)" : "#e1e1e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#fff",
  },
  genderBtnActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  genderText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  genderTextActive: {
    color: "#fff",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e1e1e1",
    marginBottom: 16,
  },
  dateButtonError: { borderColor: colors.danger },
  dateText: { fontSize: 16, color: colors.textPrimary, flex: 1 },
  dateTextPlaceholder: { color: colors.textTertiary },
});