import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import io from 'socket.io-client';
import config from '../config';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.serverUrl = config.serverUrl;
    this.fcmToken = null;
    this.deviceId = null;
    this.notificationChannelId = config.notifications.channelId;
    
    this.setupNotificationChannel();
  }

  // Configurer le canal de notification Android
  async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(this.notificationChannelId, {
        name: config.notifications.channelName,
        description: config.notifications.channelDescription,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }
  }

  // Initialiser le service
  async initialize() {
    try {
      console.log('🚀 Initialisation du service de notifications...');
      
      // Obtenir l'ID de l'appareil
      this.deviceId = await this.getDeviceId();
      
      // Configurer les notifications Expo (optionnel)
      try {
        await this.setupExpoNotifications();
      } catch (error) {
        console.log('⚠️ Les notifications Expo ne sont pas disponibles:', error.message);
        // Continuer sans les notifications Expo
      }
      
      // Se connecter au serveur WebSocket (optionnel)
      try {
        await this.connectToServer();
      } catch (error) {
        console.log('⚠️ Impossible de se connecter au serveur WebSocket:', error.message);
        // Continuer sans WebSocket
      }
      
      // Créer une notification persistante
      await this.createPersistentNotification();
      
      console.log('✅ Service de notifications initialisé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du service:', error);
      return false;
    }
  }

  // Obtenir l'ID unique de l'appareil
  async getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = Device.osInternalBuildId || Device.modelId || 'unknown-device';
        await AsyncStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Erreur lors de l\'obtention de l\'ID de l\'appareil:', error);
      return 'unknown-device';
    }
  }

  // Configurer les notifications Expo
  async setupExpoNotifications() {
    try {
      // Demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission de notification refusée');
      }

      // Obtenir le token Expo
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Project ID Expo valide
      });
      
      this.expoToken = token.data;
      console.log('📱 Token Expo:', this.expoToken);
      
      // Écouter les notifications reçues
      this.setupNotificationListeners();
      
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications Expo:', error);
      throw error;
    }
  }

  // Configurer les écouteurs de notifications
  setupNotificationListeners() {
    // Écouter les notifications reçues
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notification reçue:', notification);
      this.handleNotificationReceived(notification);
    });

    // Écouter les interactions avec les notifications
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Interaction avec notification:', response);
      this.handleNotificationInteraction(response);
    });
  }

  // Se connecter au serveur WebSocket
  async connectToServer() {
    try {
      // Essayer plusieurs URLs de fallback
      const urlsToTry = [this.serverUrl, ...config.network.fallbackUrls];
      
      for (const url of urlsToTry) {
        try {
          console.log('🔗 Tentative de connexion au serveur:', `http://${url}`);
          
          this.socket = io(`http://${url}`, {
            transports: ['websocket', 'polling'],
            timeout: config.network.connectionTimeout,
            forceNew: true,
            reconnection: true,
            reconnectionDelay: 5000,
            reconnectionAttempts: 3,
            upgrade: true,
            rememberUpgrade: false
          });
          
          // Attendre un peu pour voir si la connexion réussit
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Timeout de connexion'));
            }, config.network.connectionTimeout);
            
            this.socket.on('connect', () => {
              clearTimeout(timeout);
              resolve();
            });
            
            this.socket.on('connect_error', (error) => {
              clearTimeout(timeout);
              reject(error);
            });
          });
          
          console.log('✅ Connexion réussie à:', url);
          break; // Sortir de la boucle si la connexion réussit
          
        } catch (error) {
          console.log(`❌ Échec de connexion à ${url}:`, error.message);
          if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
          }
          
          // Si c'est la dernière URL, relancer l'erreur
          if (url === urlsToTry[urlsToTry.length - 1]) {
            throw new Error('Impossible de se connecter à aucun serveur');
          }
        }
      }

      // Configurer les gestionnaires d'événements
      this.setupSocketEventHandlers();

    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
      this.isConnected = false;
      // Ne pas lancer l'erreur pour éviter de planter l'application
      // throw error;
    }
  }

  // Configurer les gestionnaires d'événements WebSocket
  setupSocketEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔗 Connecté au serveur WebSocket');
      this.isConnected = true;
      
      // Enregistrer le token mobile
      this.registerMobileToken();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur WebSocket');
      this.isConnected = false;
      
      // Tenter de se reconnecter après 5 secondes
      setTimeout(() => {
        if (!this.isConnected) {
          this.connectToServer().catch(err => {
            console.log('⚠️ Échec de la reconnexion automatique:', err.message);
          });
        }
      }, 5000);
    });

    this.socket.on('message', (message) => {
      console.log('📨 Message reçu via WebSocket:', message);
      this.handleWebSocketMessage(message);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      this.isConnected = false;
      
      // Tenter de se reconnecter après un délai
      setTimeout(() => {
        if (!this.isConnected) {
          console.log('🔄 Reconnexion automatique...');
          this.connectToServer().catch(err => {
            console.log('⚠️ Échec de la reconnexion automatique:', err.message);
          });
        }
      }, 10000); // 10 secondes
    });
  }

  // Enregistrer le token mobile sur le serveur
  async registerMobileToken() {
    if (!this.socket || !this.isConnected) return;

    try {
      const tokenData = {
        token: this.expoToken || this.fcmToken,
        platform: Platform.OS,
        deviceId: this.deviceId,
      };

      this.socket.emit('register-mobile-token', tokenData);
      console.log('📱 Token mobile enregistré sur le serveur');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
    }
  }

  // Créer une notification persistante dans la barre d'état
  async createPersistentNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Service de notifications actif',
          body: 'L\'application écoute les notifications en temps réel',
          data: { type: 'persistent', persistent: true },
        },
        trigger: null, // Immédiat
        identifier: 'persistent-notification',
      });

      console.log('📌 Notification persistante créée');
    } catch (error) {
      console.error('Erreur lors de la création de la notification persistante:', error);
    }
  }

  // Gérer les messages WebSocket
  async handleWebSocketMessage(message) {
    try {
      // Afficher une notification pop-up
      await this.showPopUpNotification(message);
      
      // Sauvegarder le message localement
      await this.saveMessageLocally(message);
      
    } catch (error) {
      console.error('Erreur lors du traitement du message WebSocket:', error);
    }
  }

  // Afficher une notification pop-up
  async showPopUpNotification(message) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Nouvelle notification',
          body: message.content,
          data: {
            messageId: message.id,
            type: message.type,
            timestamp: message.timestamp,
          },
          sound: 'default',
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Immédiat
        identifier: `message-${message.id}`,
      });

      console.log('📱 Notification pop-up affichée:', message.content);
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification pop-up:', error);
    }
  }

  // Gérer les notifications reçues
  handleNotificationReceived(notification) {
    console.log('📨 Notification traitée:', notification);
    // Ici vous pouvez ajouter votre logique de traitement
  }

  // Gérer les interactions avec les notifications
  handleNotificationInteraction(response) {
    console.log('👆 Interaction avec notification:', response);
    // Ici vous pouvez naviguer vers une page spécifique ou effectuer une action
  }

  // Sauvegarder le message localement
  async saveMessageLocally(message) {
    try {
      const messages = await this.getStoredMessages();
      messages.unshift(message);
      
      // Garder seulement les 100 derniers messages
      const limitedMessages = messages.slice(0, 100);
      
      await AsyncStorage.setItem('messages', JSON.stringify(limitedMessages));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du message:', error);
    }
  }

  // Récupérer les messages stockés
  async getStoredMessages() {
    try {
      const messages = await AsyncStorage.getItem('messages');
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  // Arrêter le service
  async stop() {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      this.isConnected = false;
      console.log('🛑 Service de notifications arrêté');
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du service:', error);
    }
  }

  // Obtenir le statut de connexion
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      deviceId: this.deviceId,
      expoToken: this.expoToken,
      fcmToken: this.fcmToken,
    };
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;
