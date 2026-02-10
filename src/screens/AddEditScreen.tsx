import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { encrypt, generateStrongPassword } from '../utils/crypto';
import { addPassword, updatePassword, RegistroAcceso } from '../utils/database';

export default function AddEditScreen({ route, navigation }: any) {
    const existingItem = route.params?.item as RegistroAcceso;
    const preCliente = route.params?.preCliente as string;
    const { encryptionKey } = useVault();

    const [cliente, setCliente] = useState(existingItem?.cliente_nombre || preCliente || '');
    const [plataforma, setPlataforma] = useState(existingItem?.plataforma || '');
    const [usuario, setUsuario] = useState(existingItem?.usuario || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [notas, setNotas] = useState(existingItem?.notas || '');

    const handleSave = async () => {
        if (!cliente || !plataforma || !usuario || (!password && !existingItem)) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
            return;
        }

        if (!encryptionKey) return;

        try {
            let pwdToSave = existingItem?.password_cifrada;
            if (password) {
                pwdToSave = encrypt(password, encryptionKey);
            }

            const registro: RegistroAcceso = {
                cliente_nombre: cliente,
                plataforma,
                usuario,
                password_cifrada: pwdToSave!,
                notas,
            };

            if (existingItem?.id) {
                await updatePassword(existingItem.id, registro);
                Alert.alert('Éxito', 'Registro actualizado');
            } else {
                await addPassword(registro);
                Alert.alert('Éxito', 'Registro guardado');
            }
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'No se pudo guardar el registro: ' + (e instanceof Error ? e.message : 'Error desconocido'));
        }
    };

    const handleGenerate = () => {
        const newPwd = generateStrongPassword(16);
        setPassword(newPwd);
        setShowPassword(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.backText}>← Volver</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{existingItem ? 'Editar Acceso' : 'Nuevo Acceso'}</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Cliente *</Text>
                        <TextInput
                            style={styles.input}
                            value={cliente}
                            onChangeText={setCliente}
                            placeholder="Ej: Juan Pérez"
                            placeholderTextColor="#64748B"
                        />

                        <Text style={styles.label}>Plataforma *</Text>
                        <TextInput
                            style={styles.input}
                            value={plataforma}
                            onChangeText={setPlataforma}
                            placeholder="Ej: DIAN, Gmail, Banco"
                            placeholderTextColor="#64748B"
                        />

                        <Text style={styles.label}>Usuario / Cédula *</Text>
                        <TextInput
                            style={styles.input}
                            value={usuario}
                            onChangeText={setUsuario}
                            placeholder="Ej: jperez@mail.com"
                            placeholderTextColor="#64748B"
                        />

                        <Text style={styles.label}>{existingItem ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#64748B"
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.generateButton}
                                onPress={handleGenerate}
                            >
                                <Text style={styles.generateButtonText}>Generar</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Notas</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            value={notas}
                            onChangeText={setNotas}
                            multiline
                            placeholder="Información adicional..."
                            placeholderTextColor="#64748B"
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Guardar Registro</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    scroll: {
        paddingBottom: 40,
    },
    header: {
        padding: 20,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        color: '#3B82F6',
        fontSize: 16,
        marginRight: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    form: {
        padding: 20,
    },
    label: {
        color: '#94A3B8',
        fontSize: 14,
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 14,
        color: '#F8FAFC',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eyeButton: {
        padding: 10,
        position: 'absolute',
        right: 90,
    },
    eyeIcon: {
        fontSize: 18,
    },
    generateButton: {
        backgroundColor: '#334155',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#475569',
    },
    generateButtonText: {
        color: '#F8FAFC',
        fontWeight: '600',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
