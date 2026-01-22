import { StyleSheet, Dimensions } from "react-native";

const getMaxMenuHeight = () => Dimensions.get('window').height * 0.7;

export const getDriveListItemStyles = (colors = {}) => StyleSheet.create({
  backdrop: {
    flex: 1
  },
  stackMenu: {
    position: "absolute",
    width: 260,
    maxHeight: getMaxMenuHeight(), // Max 70% of screen height
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: colors.card || "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  scrollMenu: {
    maxHeight: getMaxMenuHeight(),
  },
  scrollMenuContent: {
    padding: 8,
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
    marginBottom: 12,
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
