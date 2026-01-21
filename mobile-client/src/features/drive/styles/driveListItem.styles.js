import { StyleSheet } from "react-native";

export const getDriveListItemStyles = (colors = {}) => StyleSheet.create({
  backdrop: { 
    flex: 1 
  },
  stackMenu: { 
    position: "absolute", 
    width: 260, 
    gap: 12 
  },
  stackBtn: { 
    height: 54, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "flex-start", 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    borderRadius: 30, 
    elevation: 4, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.18, 
    shadowRadius: 5, 
    minWidth: 260,
    backgroundColor: colors.card || "#fff",
  },
  stackLabel: { 
    flex: 1, 
    textAlign: "left", 
    fontSize: 12, 
    letterSpacing: 1.2,
    color: colors.textPrimary || "#333",
  },
  leftActionContainer: { 
    width: 100, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  deleteActionAnim: { 
    width: 70, 
    height: 60, 
    borderRadius: 18, 
    elevation: 2, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    marginRight: 10,
    backgroundColor: colors.danger || "#dc2626",
  },
  deleteButtonInner: { 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  deleteText: { 
    color: "white", 
    fontWeight: "700", 
    fontSize: 11, 
    marginTop: 2 
  },
  dotsButton: {
    padding: 6,
  },
  iconMargin: {
    marginRight: 12,
  },
});
