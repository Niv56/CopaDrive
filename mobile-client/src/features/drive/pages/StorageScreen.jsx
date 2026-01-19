import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../app/providers/AuthContext'; 
import { getFiles } from '../services/fileService';
import { formatBytes } from '../../../shared_code/utils/formatBytes';

export default function StorageScreen() {
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [token]);

  const loadFiles = async () => {
    if (!token) return;
    try {
      const data = await getFiles(token);
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load files for storage view", err);
    } finally {
      setLoading(false);
    }
  };

  // לוגיקה לסינון ומיון קבצים לפי גודל יורד
  const sortedFiles = useMemo(() => {
    return [...files]
      .filter((f) => f.type === 'file')
      .sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0));
  }, [files]);

  const renderItem = ({ item }) => {
    const isImage = item.mimeType?.startsWith('image');
    const iconName = isImage ? "image" : "document-text";
    const iconColor = isImage ? "#d93025" : "#4285F4";

    return (
      <View style={styles.fileRow}>
        <View style={styles.iconWrapper}>
            <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
            {/* הצגת משקל הקובץ מתחת לשם כפי שביקשת */}
            <Text style={styles.fileSize}>{formatBytes(item.sizeBytes)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
         <Text style={styles.pageTitle}>STORAGE</Text>
         <Text style={styles.subTitle}>Files using storage (descending)</Text>
      </View>

      <FlatList
        data={sortedFiles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
            <Text style={styles.emptyText}>No files taking up storage.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerContainer: {
    paddingHorizontal: 25,
    paddingVertical: 10, // הוקטן כדי להתאים למבנה המודל החדש
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'BrunoAceSC_400Regular', // שימוש בפונט הפרויקט
    color: '#333',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subTitle: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 5 
  },
  listContent: { 
    paddingHorizontal: 15,
    paddingBottom: 20 
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  iconWrapper: { 
    width: 45, 
    alignItems: 'flex-start' 
  },
  fileInfo: { 
    flex: 1 
  },
  fileName: { 
    fontSize: 16, 
    color: '#212529', 
    fontWeight: '500',
    marginBottom: 2 
  },
  fileSize: { 
    fontSize: 13, 
    color: '#6c757d', 
    fontWeight: '600' 
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#adb5bd',
    fontSize: 16
  }
});