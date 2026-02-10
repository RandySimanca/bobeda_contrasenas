import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';

export default function SetupScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { setupMasterPassword } = useVault();

    const handleSetup = async () => {
        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        try {
            await setupMasterPassword(password);
            Alert.alert('Éxito', 'Contraseña maestra configurada correctamente');
        } catch (e) {
            Alert.alert('Error', 'No se pudo configurar la contraseña');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Configura tu Bóveda</Text>
                    <Text style={styles.subtitle}>Crea una contraseña maestra para proteger tus datos. No la pierdas, no hay forma de recuperarla.</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nueva Contraseña Maestra"
                        placeholderTextColor="#999"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirmar Contraseña Maestra"
                        placeholderTextColor="#999"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSetup}>
                        <Text style={styles.buttonText}>Crear Bóveda Segura</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    content: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 22,
    },
    input: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 18,
        color: '#F8FAFC',
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    button: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
