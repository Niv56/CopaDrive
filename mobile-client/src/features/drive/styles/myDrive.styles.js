import { StyleSheet, Platform } from "react-native";

export const getDriveStyles = (colors) => StyleSheet.create({
    backgroundImage: { flex: 1, width: "100%", height: "100%" },
    safeArea: { flex: 1 },

    topBarSearchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface + 'E6', 
        marginHorizontal: 15,
        marginTop: Platform.OS === 'ios' ? 10 : 40,
        height: 52,
        borderRadius: 30,
        paddingHorizontal: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    searchText: { flex: 1, marginLeft: 15, color: colors.textSecondary, fontSize: 16 },
    profileCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center'
    },

    homeTitle: {
        fontSize: 32,
        fontFamily: "BrunoAceSC_400Regular",
        color: colors.textPrimary, 
        marginHorizontal: 25,
        marginVertical: 15,
    },

    fileCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card + 'BF', 
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 15,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: { marginRight: 15 },
    fileName: { fontSize: 16, fontWeight: "500", color: colors.textPrimary, marginBottom: 4 },
    fileInfo: { fontSize: 12, color: colors.textSecondary },

    bottomNav: {
        flexDirection: 'row',
        height: 90,
        backgroundColor: colors.background + 'F2',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 30,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: { alignItems: 'center' },
    navLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
    navLabelActive: { color: colors.primary, fontWeight: 'bold' },

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 110,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface + '66',
        padding: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginHorizontal: 15,
        marginBottom: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: colors.textTertiary,
        fontFamily: 'BrunoAceSC_400Regular'
    },

    breadcrumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: colors.surface + 'CC', 
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginHorizontal: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    backButton: {
        padding: 5,
        marginRight: 8,
    },
    breadcrumbItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breadcrumbText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        maxWidth: 100, 
    },
    breadcrumbActive: {
        color: colors.primary,
        fontWeight: '700',
    },
    breadcrumbSeparator: {
        fontSize: 14,
        color: colors.textTertiary,
        marginHorizontal: 5,
    },
});