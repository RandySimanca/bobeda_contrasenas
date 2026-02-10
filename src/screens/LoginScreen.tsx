import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';

export default function LoginScreen() {
    const [password, setPassword] = useState('');
    const { unlock, biometricUnlock } = useVault();

    useEffect(() => {
        // Al cargar la pantalla de login, intentamos huella automáticamente
        handleBiometric();
    }, []);

    const handleBiometric = async () => {
        await biometricUnlock();
    };

    const handleUnlock = async () => {
        const success = await unlock(password);
        if (!success) {
            Alert.alert('Error', 'Contraseña incorrecta o autenticación fallida');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>🔒</Text>
                    </View>
                    <Text style={styles.title}>Bóveda Bloqueada</Text>
                    <Text style={styles.subtitle}>Ingresa tu contraseña maestra para acceder</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña Maestra"
                        placeholderTextColor="#999"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleUnlock}>
                        <Text style={styles.buttonText}>Desbloquear con Contraseña</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, { backgroundColor: '#3B82F6', marginTop: 15 }]} onPress={handleBiometric}>
                        <Text style={styles.buttonText}>Usar Huella ☝️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
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
    logoContainer: {
        alignSelf: 'center',
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 30,
        marginBottom: 20,
    },
    logoText: {
        fontSize: 40,
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
        marginBottom: 30,
        textAlign: 'center',
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
        backgroundColor: '#10B981',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    forgotButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    forgotText: {
        color: '#64748B',
        fontSize: 14,
    },
});
