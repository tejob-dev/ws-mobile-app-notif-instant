// Tâche en arrière-plan pour maintenir la connexion WebSocket
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/NotificationService';

const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    console.log('🔄 Exécution de la tâche en arrière-plan...');
    
    // Vérifier la connexion WebSocket
    const status = notificationService.getConnectionStatus();
    
    if (!status.isConnected) {
      console.log('🔗 Reconnexion au serveur...');
      await notificationService.connectToServer();
    }
    
    // Vérifier les messages en attente
    const messages = await notificationService.getStoredMessages();
    console.log(`📨 ${messages.length} messages stockés localement`);
    
    // Mettre à jour le timestamp de la dernière vérification
    await AsyncStorage.setItem('lastBackgroundCheck', new Date().toISOString());
    
    console.log('✅ Tâche en arrière-plan terminée avec succès');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur dans la tâche en arrière-plan:', error);
    return { success: false, error: error.message };
  }
});

export default BACKGROUND_NOTIFICATION_TASK;
