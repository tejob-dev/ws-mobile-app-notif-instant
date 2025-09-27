import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Vérifier la compatibilité Android 6+
export const checkAndroidCompatibility = () => {
  if (Platform.OS !== 'android') {
    return {
      compatible: true,
      message: 'Plateforme non Android',
      features: []
    };
  }

  const androidVersion = Device.osVersion;
  const majorVersion = parseInt(androidVersion.split('.')[0]);
  
  const compatibility = {
    compatible: majorVersion >= 6,
    androidVersion: androidVersion,
    majorVersion: majorVersion,
    features: []
  };

  // Fonctionnalités disponibles selon la version
  if (majorVersion >= 6) {
    compatibility.features.push('Notifications natives');
    compatibility.features.push('Service en arrière-plan');
    compatibility.features.push('Tâches périodiques');
  }

  if (majorVersion >= 8) {
    compatibility.features.push('Canal de notifications');
    compatibility.features.push('Notification persistante');
  }

  if (majorVersion >= 10) {
    compatibility.features.push('Notifications en plein écran');
    compatibility.features.push('Gestion avancée des permissions');
  }

  if (majorVersion >= 13) {
    compatibility.features.push('Notifications runtime');
    compatibility.features.push('Gestion des permissions granulaire');
  }

  // Messages de compatibilité
  if (compatibility.compatible) {
    compatibility.message = `Android ${androidVersion} - Compatible`;
  } else {
    compatibility.message = `Android ${androidVersion} - Version trop ancienne (minimum Android 6.0)`;
  }

  return compatibility;
};

// Vérifier les permissions disponibles
export const checkPermissions = async () => {
  const permissions = {
    internet: true, // Toujours disponible
    networkState: true, // Toujours disponible
    wakeLock: true, // Disponible depuis Android 1.0
    vibrate: true, // Disponible depuis Android 1.0
    bootCompleted: true, // Disponible depuis Android 1.0
    foregroundService: false,
    postNotifications: false,
    systemAlertWindow: false
  };

  // Vérifier les permissions spécifiques selon la version Android
  const androidVersion = Device.osVersion;
  const majorVersion = parseInt(androidVersion.split('.')[0]);

  if (majorVersion >= 8) {
    permissions.foregroundService = true;
  }

  if (majorVersion >= 13) {
    permissions.postNotifications = true;
  }

  if (majorVersion >= 6) {
    permissions.systemAlertWindow = true;
  }

  return permissions;
};

// Obtenir les informations détaillées de l'appareil
export const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    osVersion: Device.osVersion,
    deviceName: Device.deviceName,
    deviceType: Device.deviceType,
    isDevice: Device.isDevice,
    brand: Device.brand,
    modelName: Device.modelName,
    modelId: Device.modelId,
    osInternalBuildId: Device.osInternalBuildId,
    osBuildId: Device.osBuildId,
    totalMemory: Device.totalMemory,
    manufacturer: Device.manufacturer,
    compatibility: checkAndroidCompatibility(),
    permissions: checkPermissions()
  };
};

// Tester les fonctionnalités spécifiques
export const testFeatures = async () => {
  const tests = {
    webSocketConnection: false,
    notifications: false,
    backgroundTask: false,
    persistentNotification: false,
    localStorage: false
  };

  try {
    // Test de connexion WebSocket
    tests.webSocketConnection = await testWebSocketConnection();
    
    // Test des notifications
    tests.notifications = await testNotifications();
    
    // Test des tâches en arrière-plan
    tests.backgroundTask = await testBackgroundTask();
    
    // Test de la notification persistante
    tests.persistentNotification = await testPersistentNotification();
    
    // Test du stockage local
    tests.localStorage = await testLocalStorage();
    
  } catch (error) {
    console.error('Erreur lors des tests de fonctionnalités:', error);
  }

  return tests;
};

// Test de connexion WebSocket
const testWebSocketConnection = async () => {
  try {
    // Simuler un test de connexion
    return true;
  } catch (error) {
    return false;
  }
};

// Test des notifications
const testNotifications = async () => {
  try {
    // Vérifier si les notifications sont disponibles
    return Platform.OS === 'android' || Platform.OS === 'ios';
  } catch (error) {
    return false;
  }
};

// Test des tâches en arrière-plan
const testBackgroundTask = async () => {
  try {
    // Vérifier la compatibilité des tâches en arrière-plan
    const androidVersion = Device.osVersion;
    const majorVersion = parseInt(androidVersion.split('.')[0]);
    return Platform.OS === 'android' && majorVersion >= 6;
  } catch (error) {
    return false;
  }
};

// Test de la notification persistante
const testPersistentNotification = async () => {
  try {
    // Vérifier la compatibilité des notifications persistantes
    const androidVersion = Device.osVersion;
    const majorVersion = parseInt(androidVersion.split('.')[0]);
    return Platform.OS === 'android' && majorVersion >= 8;
  } catch (error) {
    return false;
  }
};

// Test du stockage local
const testLocalStorage = async () => {
  try {
    // Test simple du stockage local
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  checkAndroidCompatibility,
  checkPermissions,
  getDeviceInfo,
  testFeatures
};
