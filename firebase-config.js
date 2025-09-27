// Configuration Firebase pour l'application mobile
import { initializeApp } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

// Configuration Firebase (remplacez par votre configuration)
// Pour obtenir ces informations de configuration Firebase :
// 1. Rendez-vous sur https://console.firebase.google.com/
// 2. Sélectionnez votre projet ou créez-en un nouveau.
// 3. Cliquez sur l’icône ⚙️ (Paramètres) > "Paramètres du projet".
// 4. Descendez jusqu’à la section "Vos applications" et sélectionnez votre application Android ou ajoutez-en une.
// 5. Les champs suivants seront affichés : apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId.
// 6. Copiez ces valeurs et remplacez-les ci-dessous.

const firebaseConfig = {
  apiKey: "AIzaSyAGFhYTDRGsYr5pvTuJP-oiIz1llhP0dQk",
  authDomain: "ws-notif-app.firebaseapp.com",
  projectId: "ws-notif-app",
  storageBucket: "ws-notif-app.firebasestorage.app",
  messagingSenderId: "524178263562",
  appId: "1:524178263562:android:075351749ee086a449d9f3"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Configuration des notifications
export const configureNotifications = async () => {
  try {
    // Demander la permission pour les notifications
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Autorisation des notifications accordée');
      
      // Obtenir le token FCM
      const token = await messaging().getToken();
      console.log('📱 Token FCM:', token);
      
      return token;
    } else {
      console.log('❌ Autorisation des notifications refusée');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des notifications:', error);
    return null;
  }
};

// Écouter les messages en arrière-plan
export const setupBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📨 Message reçu en arrière-plan:', remoteMessage);
    
    // Traiter le message en arrière-plan
    // Ici vous pouvez sauvegarder le message, mettre à jour la base de données locale, etc.
    
    return Promise.resolve();
  });
};

// Écouter les messages au premier plan
export const setupForegroundMessageHandler = (onMessageReceived) => {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('📨 Message reçu au premier plan:', remoteMessage);
    
    // Appeler la fonction de callback pour traiter le message
    if (onMessageReceived) {
      onMessageReceived(remoteMessage);
    }
  });

  return unsubscribe;
};

export default app;
