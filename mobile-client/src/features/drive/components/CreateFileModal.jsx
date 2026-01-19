import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { driveStyles } from "../styles/myDrive.styles";

export default function CreateFileModal({ visible, onClose, onSave }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        await onSave({ name: name.trim(), type: 'file', content: 'Sample text' });
        setLoading(false);
        setName("");
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={localStyles.overlay}>
                <BlurView intensity={90} tint="light" style={localStyles.modalCard}>
                    <Text style={[driveStyles.sectionText, { fontSize: 20, marginBottom: 20 }]}>Create New File</Text>

                    <TextInput
                        style={localStyles.input}
                        placeholder="File Name (e.g. notes.txt)"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <View style={localStyles.actions}>
                        <Pressable style={localStyles.btnCancel} onPress={onClose}>
                            <Text style={{ color: '#666' }}>Cancel</Text>
                        </Pressable>
                        <Pressable style={localStyles.btnSave} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Create</Text>}
                        </Pressable>
                    </View>
                </BlurView>
            </View>
        </Modal>
    );
}

const localStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: '85%', padding: 25, borderRadius: 24, overflow: 'hidden', borderWeight: 1, borderColor: 'rgba(255,255,255,0.4)' },
    input: { backgroundColor: 'rgba(255,255,255,0.8)', padding: 15, borderRadius: 15, marginBottom: 20, fontSize: 16 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    btnCancel: { padding: 12, borderRadius: 10 },
    btnSave: { backgroundColor: '#1a73e8', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 }
});