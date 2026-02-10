import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VaultProvider, useVault } from './src/context/VaultContext';
import SetupScreen from './src/screens/SetupScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEditScreen from './src/screens/AddEditScreen';
import UpdateHandler from './src/components/UpdateHandler';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { isUnlocked, hasMasterPassword, lock } = useVault();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // La app salió al fondo o está inactiva
        lock();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lock]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasMasterPassword ? (
        <Stack.Screen name="Setup" component={SetupScreen} />
      ) : !isUnlocked ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddEdit" component={AddEditScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <NavigationContainer>
          <UpdateHandler />
          <Navigation />
        </NavigationContainer>
      </VaultProvider>
    </SafeAreaProvider>
  );
}
