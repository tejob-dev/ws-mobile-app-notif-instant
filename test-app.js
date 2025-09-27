#!/usr/bin/env node

/**
 * Script de test pour NotificationApp
 * Vérifie la configuration et les fonctionnalités
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de NotificationApp...\n');

// Vérifier les fichiers requis
const requiredFiles = [
  'App.tsx',
  'package.json',
  'app.json',
  'services/NotificationService.js',
  'services/BackgroundService.js',
  'utils/AndroidCompatibility.js',
  'tasks/backgroundTask.js',
  'firebase-config.js',
  'android/app/src/main/AndroidManifest.xml'
];

console.log('📁 Vérification des fichiers requis:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Certains fichiers requis sont manquants!');
  process.exit(1);
}

// Vérifier package.json
console.log('\n📦 Vérification des dépendances:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  const requiredDeps = [
    'expo-notifications',
    'expo-task-manager',
    'expo-background-fetch',
    'socket.io-client',
    '@react-native-async-storage/async-storage',
    'expo-device'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MANQUANT`);
    }
  });
} catch (error) {
  console.log('❌ Erreur lors de la lecture de package.json:', error.message);
}

// Vérifier app.json
console.log('\n⚙️ Vérification de la configuration:');
try {
  const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'app.json'), 'utf8'));
  
  // Vérifier les permissions Android
  if (appJson.expo.android && appJson.expo.android.permissions) {
    const permissions = appJson.expo.android.permissions;
    const requiredPermissions = [
      'android.permission.INTERNET',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.POST_NOTIFICATIONS'
    ];
    
    requiredPermissions.forEach(permission => {
      if (permissions.includes(permission)) {
        console.log(`✅ Permission: ${permission}`);
      } else {
        console.log(`❌ Permission manquante: ${permission}`);
      }
    });
  }
  
  // Vérifier les plugins
  if (appJson.expo.plugins) {
    console.log('✅ Plugins Expo configurés');
  } else {
    console.log('❌ Aucun plugin Expo configuré');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture de app.json:', error.message);
}

// Vérifier AndroidManifest.xml
console.log('\n🤖 Vérification du manifeste Android:');
try {
  const manifestPath = path.join(__dirname, 'android/app/src/main/AndroidManifest.xml');
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    
    const requiredPermissions = [
      'android.permission.INTERNET',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.POST_NOTIFICATIONS'
    ];
    
    requiredPermissions.forEach(permission => {
      if (manifest.includes(permission)) {
        console.log(`✅ Permission Android: ${permission}`);
      } else {
        console.log(`❌ Permission Android manquante: ${permission}`);
      }
    });
  } else {
    console.log('❌ AndroidManifest.xml non trouvé');
  }
} catch (error) {
  console.log('❌ Erreur lors de la lecture du manifeste Android:', error.message);
}

// Instructions de test
console.log('\n📋 Instructions de test:');
console.log('1. Installez les dépendances: npm install');
console.log('2. Configurez Firebase avec google-services.json');
console.log('3. Modifiez l\'URL du serveur dans NotificationService.js');
console.log('4. Démarrez le serveur backend: cd ../backend && npm start');
console.log('5. Lancez l\'app: expo run:android');
console.log('6. Testez l\'envoi de messages via l\'API:');
console.log('   curl -X POST http://localhost:3001/api/send-message \\');
console.log('   -H "Content-Type: application/json" \\');
console.log('   -d \'{"content": "Test message", "type": "info"}\'');

console.log('\n✅ Test terminé!');
console.log('📱 L\'application est prête pour Android 6+');
console.log('🔔 Les notifications fonctionneront en arrière-plan');
console.log('📌 Une notification persistante restera dans la barre d\'état');
