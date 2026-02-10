import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

const DB_NAME = 'vault.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

export const exportBackup = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
    if (!fileInfo.exists) {
      Alert.alert('Error', 'No se encontró la base de datos para respaldar');
      return;
    }

    // Asegurarse de que Sharing esté disponible
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
      return;
    }

    // Copiar a un lugar temporal con un nombre más descriptivo
    const backupName = `respaldo_boveda_${new Date().toISOString().split('T')[0]}.db`;
    const tempPath = `${FileSystem.cacheDirectory}${backupName}`;
    await FileSystem.copyAsync({
      from: DB_PATH,
      to: tempPath,
    });

    await Sharing.shareAsync(tempPath, {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Guardar copia de seguridad',
      UTI: 'public.database',
    });
  } catch (error) {
    console.error('Error al exportar:', error);
    Alert.alert('Error', 'No se pudo generar la copia de seguridad');
  }
};

export const importBackup = async (onComplete: () => void) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // Intentar con todos los tipos ya que .db puede ser detectado de varias formas
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const selectedFile = result.assets[0];

    // Validación básica (opcional: podrías intentar abrir la db para validar esquema)
    if (!selectedFile.name.endsWith('.db')) {
        const confirm = await new Promise((resolve) => {
            Alert.alert(
                'Aviso',
                'El archivo seleccionado no termina en .db. ¿Deseas intentar restaurarlo de todos modos?',
                [
                    { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Continuar', onPress: () => resolve(true) }
                ]
            );
        });
        if (!confirm) return;
    }

    // Asegurar que el directorio SQLite exista
    const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
    const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
    }

    // Sobreescribir la base de datos actual
    await FileSystem.copyAsync({
      from: selectedFile.uri,
      to: DB_PATH,
    });

    Alert.alert('Éxito', 'Base de datos restaurada correctamente. La app se reiniciará para aplicar los cambios.');
    onComplete();
  } catch (error) {
    console.error('Error al importar:', error);
    Alert.alert('Error', 'No se pudo restaurar la base de datos');
  }
};
