import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { deriveKey } from '../utils/crypto';
import { authenticateAction } from '../utils/auth';

interface VaultContextType {
    isUnlocked: boolean;
    unlock: (password: string) => Promise<boolean>;
    lock: () => void;
    encryptionKey: string | null;
    hasMasterPassword: boolean;
    setupMasterPassword: (password: string) => Promise<void>;
    biometricUnlock: () => Promise<boolean>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const MASTER_PWD_HASH_KEY = 'master_pwd_hash';

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
    const [hasMasterPassword, setHasMasterPassword] = useState(false);

    useEffect(() => {
        checkInitialStatus();
    }, []);

    const checkInitialStatus = async () => {
        const storedHash = await SecureStore.getItemAsync(MASTER_PWD_HASH_KEY);
        setHasMasterPassword(!!storedHash);
    };

    const setupMasterPassword = async (password: string) => {
        // Almacenamos un "hash" (en este caso la clave derivada) para verificar después
        // En una app real usaríamos un hash específico como SHA-256
        const key = deriveKey(password);
        await SecureStore.setItemAsync(MASTER_PWD_HASH_KEY, key);
        setHasMasterPassword(true);
    };

    const unlock = async (password: string): Promise<boolean> => {
        const storedKey = await SecureStore.getItemAsync(MASTER_PWD_HASH_KEY);
        const generatedKey = deriveKey(password);

        if (storedKey === generatedKey) {
            setEncryptionKey(generatedKey);
            setIsUnlocked(true);
            return true;
        }
        return false;
    };

    const biometricUnlock = async (): Promise<boolean> => {
        const storedKey = await SecureStore.getItemAsync(MASTER_PWD_HASH_KEY);
        if (!storedKey) return false;

        const biometricOk = await authenticateAction('Desbloquea tu bóveda');
        if (biometricOk) {
            setEncryptionKey(storedKey);
            setIsUnlocked(true);
            return true;
        }
        return false;
    };

    const lock = () => {
        setIsUnlocked(false);
        setEncryptionKey(null);
    };

    return (
        <VaultContext.Provider value={{ isUnlocked, unlock, lock, encryptionKey, hasMasterPassword, setupMasterPassword, biometricUnlock }}>
            {children}
        </VaultContext.Provider>
    );
};

export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) throw new Error('useVault debe usarse dentro de VaultProvider');
    return context;
};
