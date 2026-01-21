import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../shared_code/hooks/useAuth';

export default function EditUserModal({ visible, onClose }) {
    const { user, updateUserData } = useAuth();

    // Initialize form state with existing user data
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
        image: user?.profilePic || null,
    });

    // Open image picker to update profile photo
    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
        });
        if (!result.canceled) setFormData({ ...formData, image: result.assets[0].uri });
    };

    // Prepare FormData and update user profile
    const handleSave = async () => {
        const data = new FormData();
        data.append('firstName', formData.firstName);
        await updateUserData(data);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Edit user</Text>

                    {/* Profile Image Section */}
                    <View style={styles.imageSection}>
                        <Image source={{ uri: formData.image }} style={styles.avatar} />
                        <Pressable style={styles.changeBtn} onPress={handlePickImage}>
                            <Text style={styles.changeBtnText}>Change photo</Text>
                        </Pressable>
                    </View>

                    {/* Name Input Field */}
                    <TextInput
                        style={styles.input}
                        value={formData.firstName}
                        onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                        placeholder="FIRST NAME"
                    />

                    {/* Modal Action Buttons */}
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