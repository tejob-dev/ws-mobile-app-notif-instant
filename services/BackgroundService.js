import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './NotificationService';

// Nom de la tâche en arrière-plan
const BACKGROUND_FETCH_TASK = 'background-notification-task';

// Définir la tâche en arrière-plan
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('🔄 Exécution de la tâche en arrière-plan...');
    
    // Vérifier la connexion WebSocket
    const status = notificationService.getConnectionStatus();
    
    if (!status.isConnected) {
      console.log('🔗 Reconnexion au serveur...');
      await notificationService.connectToServer();
    }
    
    // Vérifier les messages en attente
    await checkPendingMessages();
    
    // Mettre à jour la notification persistante
    await updatePersistentNotification();
    
    console.log('✅ Tâche en arrière-plan terminée');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('❌ Erreur dans la tâche en arrière-plan:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

class BackgroundService {
  constructor() {
    this.isRegistered = false;
    this.intervalId = null;
  }

  // Enregistrer la tâche en arrière-plan
  async registerBackgroundTask() {
    try {
      if (this.isRegistered) {
        console.log('⚠️ Tâche en arrière-plan déjà enregistrée');
        return true;
      }

      // Vérifier si les tâches en arrière-plan sont disponibles
      const isAvailable = await BackgroundFetch.isAvailableAsync();
      if (!isAvailable) {
        console.log('❌ Les tâches en arrière-plan ne sont pas disponibles sur cet appareil');
        return false;
      }

      // Enregistrer la tâche
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15000, // 15 secondes minimum
        stopOnTerminate: false, // Continuer même si l'app est fermée
        startOnBoot: true, // Démarrer au boot de l'appareil
      });

      this.isRegistered = true;
      console.log('✅ Tâche en arrière-plan enregistrée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la tâche en arrière-plan:', error);
      return false;
    }
  }

  // Démarrer le service en arrière-plan
  async start() {
    try {
      console.log('🚀 Démarrage du service en arrière-plan...');
      
      // Enregistrer la tâche en arrière-plan
      await this.registerBackgroundTask();
      
      // Démarrer le service de notifications
      await notificationService.initialize();
      
      // Démarrer le polling local (pour les appareils qui ne supportent pas les tâches en arrière-plan)
      this.startLocalPolling();
      
      console.log('✅ Service en arrière-plan démarré');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du service en arrière-plan:', error);
      return false;
    }
  }

  // Démarrer le polling local
  startLocalPolling() {
    // Polling toutes les 30 secondes pour maintenir la connexion
    this.intervalId = setInterval(async () => {
      try {
        const status = notificationService.getConnectionStatus();
        
        if (!status.isConnected) {
          console.log('🔄 Reconnexion automatique...');
          await notificationService.connectToServer();
        }
        
        // Vérifier les messages en attente
        await this.checkPendingMessages();
        
      } catch (error) {
        console.error('❌ Erreur dans le polling local:', error);
      }
    }, 30000); // 30 secondes
  }

  // Vérifier les messages en attente
  async checkPendingMessages() {
    try {
      // Récupérer les messages stockés localement
      const messages = await notificationService.getStoredMessages();
      
      // Vérifier s'il y a de nouveaux messages depuis la dernière vérification
      const lastCheck = await AsyncStorage.getItem('lastMessageCheck');
      const now = new Date().toISOString();
      
      if (messages.length > 0) {
        const latestMessage = messages[0];
        
        if (!lastCheck || new Date(latestMessage.timestamp) > new Date(lastCheck)) {
          console.log('📨 Nouveaux messages détectés');
          // Traiter les nouveaux messages si nécessaire
        }
      }
      
      // Mettre à jour le timestamp de la dernière vérification
      await AsyncStorage.setItem('lastMessageCheck', now);
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des messages:', error);
    }
  }

  // Mettre à jour la notification persistante
  async updatePersistentNotification() {
    try {
      const status = notificationService.getConnectionStatus();
      const connectionStatus = status.isConnected ? 'Connecté' : 'Déconnecté';
      
      // Ici vous pouvez mettre à jour la notification persistante avec le statut de connexion
      console.log(`📌 Statut de connexion: ${connectionStatus}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la notification persistante:', error);
    }
  }

  // Arrêter le service en arrière-plan
  async stop() {
    try {
      console.log('🛑 Arrêt du service en arrière-plan...');
      
      // Arrêter le polling local
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      
      // Désenregistrer la tâche en arrière-plan
      if (this.isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
        this.isRegistered = false;
      }
      
      // Arrêter le service de notifications
      await notificationService.stop();
      
      console.log('✅ Service en arrière-plan arrêté');
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt du service en arrière-plan:', error);
    }
  }

  // Obtenir le statut du service
  getStatus() {
    return {
      isRegistered: this.isRegistered,
      isPolling: this.intervalId !== null,
      notificationStatus: notificationService.getConnectionStatus(),
    };
  }
}

// Instance singleton
const backgroundService = new BackgroundService();

export default backgroundService;
