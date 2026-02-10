import CryptoJS from 'crypto-js';

// En un entorno real, el salt debería ser único por usuario y guardarse de forma segura.
// Para esta versión offline, generaremos uno y lo guardaremos en la DB o SecureStore.
const DEFAULT_SALT = 'gestor-contrasenas-unique-salt-2024';

/**
 * Deriva una clave de 256 bits a partir de la Contraseña Maestra.
 */
export const deriveKey = (masterPassword: string): string => {
  return CryptoJS.PBKDF2(masterPassword, DEFAULT_SALT, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
};

/**
 * Encripta un texto usando AES-256 con la clave derivada.
 */
export const encrypt = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

/**
 * Desencripta un texto usando AES-256 con la clave derivada.
 */
export const decrypt = (ciphertext: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const generateStrongPassword = (length: number = 16): string => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};
