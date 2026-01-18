import { StyleSheet, Platform } from "react-native";

export const driveStyles = StyleSheet.create({
    backgroundImage: { flex: 1, width: "100%", height: "100%" },
    safeArea: { flex: 1 },

    // Top Bar - חיפוש ארוך שבתוכו המבורגר ופרופיל
    topBarSearchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // לבן חלבי אטום יותר
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
    searchText: { flex: 1, marginLeft: 15, color: '#5f6368', fontSize: 16 },
    profileCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center'
    },

    // כותרת HOME - עכשיו ישירות על הרקע
    homeTitle: {
        fontSize: 32,
        fontFamily: "BrunoAceSC_400Regular",
        color: "#1a1a1a",
        marginHorizontal: 25,
        marginVertical: 15,
    },

    // כרטיסיית קובץ בודדת (Individual Glass Card)
    fileCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.75)", // זכוכית חלבית לכל קובץ
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 15,
        marginBottom: 8, // רווח בין הכרטיסיות כדי לראות את הרקע
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },

    // Bottom Navigation - נמוך ומכסה את התחתית
    bottomNav: {
        flexDirection: 'row',
        height: 90, // הגדלת הגובה כדי לכסות את כל התחתית
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // לבן חלבי כמעט אטום
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 30, // דוחף את האייקונים מעט למעלה מהקצה הפיזי של המסך
        position: 'absolute', // מקבע אותו לתחתית המסך כלו
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: { alignItems: 'center' },
    navLabel: { fontSize: 11, color: '#5f6368', marginTop: 4 },
    navLabelActive: { color: '#1a73e8', fontWeight: 'bold' },

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 110, // העלאת הכפתור מעל ה-LowerBar החדש כדי שלא יכוסה
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
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
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // כותרת שקופה עדינה
        padding: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginHorizontal: 15,
        marginBottom: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
        fontFamily: 'BrunoAceSC_400Regular'
    }
});