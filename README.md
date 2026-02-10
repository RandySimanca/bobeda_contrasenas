# 🔐 BaulKey - Gestor de Contraseñas Seguro

**BaulKey** es una aplicación móvil moderna y segura diseñada para almacenar y gestionar tus credenciales de forma totalmente local y privada. Olvídate de recordar decenas de contraseñas; BaulKey las protege por ti con cifrado de grado militar.

![BaulKey Logo](assets/icon.png)

## ✨ Características Principales

- **Cifrado Local**: Tus datos nunca salen de tu dispositivo. Utilizamos AES-256 para encriptar cada registro.
- **Contraseña Maestra**: Una única llave protegida con `expo-secure-store` para acceder a todo tu baúl.
- **Acceso Biométrico**: Desbloquea tu bóveda rápidamente con tu huella dactilar o reconocimiento facial.
- **Sistema de Backups Robusto**:
  - Exporta tus datos a archivos `.db` con nombres personalizados.
  - Almacenamiento directo en carpetas del sistema (como Descargas) mediante `StorageAccessFramework`.
  - Validación de integridad para asegurar que tus respaldos nunca estén vacíos.
- **Actualizaciones Inalámbricas (OTA)**: Recibe mejoras y correcciones al instante sin necesidad de reinstalar la app manualmente, gracias a Expo Updates.
- **Interfaz Premium**: Diseño oscuro elegante, optimizado para una experiencia de usuario fluida y segura.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React Native con Expo (SDK 50+)
- **Base de Datos**: SQLite (expo-sqlite) con modo WAL (Write-Ahead Logging).
- **Seguridad**: CryptoJS para cifrado de datos y Expo SecureStore para llaves maestras.
- **Navegación**: React Navigation.

## 🚀 Instalación y Desarrollo

Si deseas clonar este proyecto y ejecutarlo en tu entorno local, sigue estos pasos:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/RandySimanca/bobeda_contrasenas.git
   cd bobeda_contrasenas
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar con Expo**:
   ```bash
   npx expo start
   ```

## 📦 Compilación (EAS Build)

Para generar el archivo APK para Android:

```bash
eas build --platform android --profile preview
```

## 📄 Licencia

Este proyecto es de uso privado. Todos los derechos reservados.

---
Creado con ❤️ para la seguridad digital.
