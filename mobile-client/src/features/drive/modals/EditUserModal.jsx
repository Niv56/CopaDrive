import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../shared_code/hooks/useAuth';

export default function EditUserModal({ visible, onClose }) {
    const { user, updateUserData } = useAuth(); 
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
        image: user?.profilePic || null,
    });

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
        });
        if (!result.canceled) setFormData({ ...formData, image: result.assets[0].uri });
    };

    const handleSave = async () => {
        // כאן תשתמש ב-FormData כפי שלמדנו כדי לשלוח לשרת ה-NodeJS 
        const data = new FormData();
        data.append('firstName', formData.firstName);
        // ... הוספת שאר השדות
        await updateUserData(data);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Edit user</Text>

                    {/* אזור התמונה - בהשראת ה-Web */}
                    <View style={styles.imageSection}>
                        <Image source={{ uri: formData.image }} style={styles.avatar} />
                        <Pressable style={styles.changeBtn} onPress={handlePickImage}>
                            <Text style={styles.changeBtnText}>Change photo</Text>
                        </Pressable>
                    </View>

                    {/* שדות קלט עם ולידציה כנדרש [cite: 43] */}
                    <TextInput
                        style={styles.input}
                        value={formData.firstName}
                        onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                        placeholder="FIRST NAME"
                    />
                    {/* הוסף כאן את שאר השדות: Last Name, Phone Number */}

                    <View style={styles.actions}>
                        <Pressable onPress={onClose}><Text>Cancel</Text></Pressable>
                        <Pressable onPress={handleSave} style={styles.saveBtn}>
                            <Text style={styles.saveBtnText}>Save changes</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}