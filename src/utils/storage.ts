import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { checkpointDatabase, closeDb } from './database';

const DB_NAME = 'vault.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

export const exportBackup = async (customName?: string) => {
  try {
    await checkpointDatabase();
    const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
    if (!fileInfo.exists) {
      Alert.alert('Error', 'No se encontró la base de datos para respaldar');
      return;
    }

    const { StorageAccessFramework } = FileSystem;
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      Alert.alert('Permiso Denegado', 'Necesitas dar permiso para guardar el archivo.');
      return;
    }

    let backupName = customName || `respaldo_boveda_${new Date().toISOString().split('T')[0]}`;
    if (!backupName.toLowerCase().endsWith('.db')) {
        backupName += '.db';
    }
    
    // Cerrar la base de datos para asegurar que el archivo físico esté completo y libre
    await closeDb();

    // Leer el contenido de la base de datos
    const content = await FileSystem.readAsStringAsync(DB_PATH, { encoding: FileSystem.EncodingType.Base64 });
    
    if (!content || content.length < 10) {
        Alert.alert('Error', 'El archivo de base de datos está vacío o es demasiado pequeño. Intenta añadir un registro antes de exportar.');
        return;
    }

    // Crear el archivo en la ubicación seleccionada
    const fileUri = await StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      backupName,
      'application/octet-stream'
    );

    // Escribir en el nuevo archivo
    await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.Base64 });

    const sizeKB = Math.round(content.length * 0.75 / 1024); // Estimación del tamaño real en bytes
    Alert.alert('Éxito', `Copia de seguridad guardada correctamente (${sizeKB} KB) como: ${backupName}`);
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

    // Cerrar conexión actual antes de manipular archivos
    await closeDb();

    // Asegurar que el directorio SQLite exista
    const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
    const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
    }

    // ELIMINAR archivos previos para evitar conflictos de WAL/SHM
    const sidecarFiles = [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`, `${DB_PATH}-journal`];
    for (const file of sidecarFiles) {
        const info = await FileSystem.getInfoAsync(file);
        if (info.exists) {
            await FileSystem.deleteAsync(file, { idempotent: true });
        }
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
