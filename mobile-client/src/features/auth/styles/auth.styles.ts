import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const authStyles = StyleSheet.create({
  // רקע כללי
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  
  // הכרטיס הלבן המרכזי
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Glassmorphism
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  // כותרות
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  brandText: {
    fontSize: 34,
    fontFamily: "BrunoAceSC_400Regular", // הפונט המיוחד
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },

  // שדות קלט (Inputs)
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e1e1",
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
    color: "#333",
    height: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
    marginLeft: 4,
  },

  // כפתורים
  btnPrimary: {
    backgroundColor: "#007bff",
    borderRadius: 50,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 50,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  btnDisabled: {
    backgroundColor: "#a0cfff",
    borderColor: "#a0cfff",
    elevation: 0,
  },
  btnTextPrimary: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  btnTextSecondary: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  
  // טקסט שגיאה
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginLeft: 4,
    marginTop: -10,
    marginBottom: 10,
  },

  // קישורים למטה
  linkBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#555",
  },
  linkTextBold: {
    fontWeight: "700",
    color: "#1a1a1a",
    textDecorationLine: "underline",
  },
});