import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export default function UpdateHandler() {
    const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

    useEffect(() => {
        async function checkUpdates() {
            if (__DEV__) return;
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    Alert.alert(
                        'Nueva actualización',
                        'Hay una nueva versión de BaulKey disponible. La descargaremos ahora para aplicar las mejoras.',
                        [{ text: 'OK', onPress: () => Updates.fetchUpdateAsync() }]
                    );
                }
            } catch (e) {
                console.error('Error al buscar updates:', e);
            }
        }
        checkUpdates();
    }, []);

    useEffect(() => {
        if (isUpdatePending) {
            Alert.alert(
                '¡Actualización lista!',
                'Se han descargado las mejoras. La aplicación se reiniciará para aplicarlas.',
                [
                    {
                        text: 'Reiniciar ahora',
                        onPress: () => Updates.reloadAsync()
                    }
                ],
                { cancelable: false }
            );
        }
    }, [isUpdatePending]);

    return null;
}
