import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Verifica si el dispositivo soporta biometría y si está configurada.
 */
export const checkDeviceSecurity = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

/**
 * Intenta autenticar al usuario usando FaceID, Huella o PIN/Patrón.
 */
export const authenticateAction = async (promptMessage: string = 'Accede a tu bóveda de contraseñas'): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Usar código del dispositivo',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Error en autenticación biométrica:', error);
    return false;
  }
};
