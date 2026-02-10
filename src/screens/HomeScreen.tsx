import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, StatusBar, Clipboard, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { searchPasswords, RegistroAcceso, deletePassword } from '../utils/database';
import { decrypt } from '../utils/crypto';
import { exportBackup, importBackup } from '../utils/storage';
import * as Updates from 'expo-updates';

export default function HomeScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [registros, setRegistros] = useState<RegistroAcceso[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const { encryptionKey, lock } = useVault();

    const loadData = useCallback(async () => {
        const data = await searchPasswords(searchQuery);
        setRegistros(data);
    }, [searchQuery]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadData);
        loadData();
        return unsubscribe;
    }, [navigation, loadData]);

    const handleCopy = (encryptedPwd: string) => {
        if (!encryptionKey) return;
        try {
            const plainText = decrypt(encryptedPwd, encryptionKey);
            Clipboard.setString(plainText);
            Alert.alert('Copiado', 'Contraseña copiada al portapapeles');
        } catch (e) {
            Alert.alert('Error', 'No se pudo desencriptar la contraseña');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Eliminar',
            '¿Estás seguro de que quieres eliminar esta contraseña?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await deletePassword(id);
                        loadData();
                    }
                },
            ]
        );
    };

    const handleView = (encryptedPwd: string) => {
        if (!encryptionKey) return;
        try {
            const plainText = decrypt(encryptedPwd, encryptionKey);
            Alert.alert('Contraseña', plainText);
        } catch (e) {
            Alert.alert('Error', 'No se pudo desencriptar');
        }
    };

    const handleExport = async () => {
        await exportBackup();
    };

    const handleImport = async () => {
        await importBackup(async () => {
            // Reiniciar la app para cargar la nueva DB
            try {
                await Updates.reloadAsync();
            } catch (e) {
                // Si Updates no está disponible (en desarrollo a veces falla), pedir cierre manual
                Alert.alert('Reiniciar', 'Por favor cierra y abre la app manualmente para ver los cambios.');
            }
        });
    };

    const groupedData = registros.reduce((acc: { [key: string]: RegistroAcceso[] }, item) => {
        if (!acc[item.cliente_nombre]) {
            acc[item.cliente_nombre] = [];
        }
        acc[item.cliente_nombre].push(item);
        return acc;
    }, {});

    const renderItem = ({ item: cliente }: { item: string }) => {
        const plataformas = groupedData[cliente];
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{cliente}</Text>
                    <TouchableOpacity
                        style={styles.addSmallButton}
                        onPress={() => navigation.navigate('AddEdit', { preCliente: cliente })}
                    >
                        <Text style={styles.addSmallText}>+ Añadir Plataforma</Text>
                    </TouchableOpacity>
                </View>

                {plataformas.map((p) => (
                    <View key={p.id} style={styles.platformRow}>
                        <View style={styles.platformInfo}>
                            <Text style={styles.platformName}>{p.plataforma}</Text>
                            <Text style={styles.platformUser}>{p.usuario}</Text>
                        </View>
                        <View style={styles.platformActions}>
                            <TouchableOpacity
                                style={styles.miniAction}
                                onPress={() => handleView(p.password_cifrada)}
                            >
                                <Text style={styles.actionIcon}>👁️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.miniAction, { backgroundColor: '#10B98120' }]}
                                onPress={() => handleCopy(p.password_cifrada)}
                            >
                                <Text style={styles.actionIcon}>📋</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.miniAction, { backgroundColor: '#33415520' }]}
                                onPress={() => navigation.navigate('AddEdit', { item: p })}
                            >
                                <Text style={styles.actionIcon}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.miniAction, { backgroundColor: '#EF444420' }]}
                                onPress={() => p.id && handleDelete(p.id)}
                            >
                                <Text style={styles.actionIcon}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mi Bóveda</Text>
                <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            {showMenu && (
                <View style={styles.menuOverlay}>
                    <TouchableOpacity
                        style={styles.menuBackground}
                        onPress={() => setShowMenu(false)}
                        activeOpacity={1}
                    />
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { setShowMenu(false); handleExport(); }}
                        >
                            <Text style={styles.menuItemIcon}>💾</Text>
                            <Text style={styles.menuItemText}>Copia de Seguridad</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { setShowMenu(false); handleImport(); }}
                        >
                            <Text style={styles.menuItemIcon}>📥</Text>
                            <Text style={styles.menuItemText}>Restaurar Datos</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity
                            style={[styles.menuItem, { borderBottomWidth: 0 }]}
                            onPress={() => { setShowMenu(false); lock(); }}
                        >
                            <Text style={styles.menuItemIcon}>🔒</Text>
                            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Bloquear Bóveda</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar cliente o plataforma..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={Object.keys(groupedData)}
                keyExtractor={(item) => item}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay registros. Toca el botón + para añadir uno.</Text>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddEdit')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 5, // Reducido ya que SafeAreaView maneja el notch
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    menuButton: {
        padding: 10,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    menuIcon: {
        fontSize: 24,
        color: '#F8FAFC',
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    menuBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        width: 200,
        padding: 8,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    menuItemIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    menuItemText: {
        color: '#F8FAFC',
        fontSize: 14,
        fontWeight: '500',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#334155',
        marginVertical: 4,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    searchInput: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 12,
        color: '#F8FAFC',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        paddingBottom: 4,
    },
    addSmallButton: {
        backgroundColor: '#3B82F620',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    addSmallText: {
        color: '#3B82F6',
        fontSize: 12,
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    platformRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#33415540',
    },
    platformInfo: {
        flex: 1,
    },
    platformName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F8FAFC',
    },
    platformUser: {
        fontSize: 13,
        color: '#94A3B8',
    },
    platformActions: {
        flexDirection: 'row',
    },
    miniAction: {
        padding: 8,
        borderRadius: 8,
        marginLeft: 4,
        backgroundColor: '#3B82F610',
    },
    actionIcon: {
        fontSize: 14,
    },
    emptyText: {
        color: '#64748B',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        backgroundColor: '#3B82F6',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#3B82F6',
        bottom: 40, // Subido para evitar colisión con botones de Android
        right: 30,
    },
    fabText: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: 'bold',
    },
});
