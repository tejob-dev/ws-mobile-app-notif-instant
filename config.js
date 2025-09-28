// Configuration de l'application
export const config = {
  // URL du serveur WebSocket (modifiez selon votre serveur)
  // Pour développement local : 'localhost:3001'
  // Pour appareil mobile : '192.168.1.71:3001' (remplacez par votre IP)
  serverUrl: '192.168.1.71:3001',
  
  // Configuration réseau
  network: {
    // Adresses alternatives à essayer
    fallbackUrls: [
      '192.168.1.71:3001',
      'localhost:3001',
      '10.0.2.2:3001', // Adresse spéciale pour émulateur Android
    ],
    // Timeout de connexion
    connectionTimeout: 10000,
  },
  
  // Configuration des notifications
  notifications: {
    channelId: 'notification-channel',
    channelName: 'Notifications en temps réel',
    channelDescription: 'Canal pour les notifications de l\'application',
  },
  
  // Configuration du polling local
  polling: {
    interval: 30000, // 30 secondes
    maxRetries: 5,
    retryDelay: 5000, // 5 secondes
  },
  
  // Configuration WebSocket
  websocket: {
    timeout: 20000,
    reconnectionDelay: 5000,
    reconnectionAttempts: 5,
  },
  
  // Configuration des tâches en arrière-plan
  backgroundTasks: {
    minimumInterval: 15000, // 15 secondes
    stopOnTerminate: false,
    startOnBoot: true,
  },
};

export default config;
