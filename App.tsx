import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  AppState,
  AppStateStatus
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import backgroundService from './services/BackgroundService';
import notificationService from './services/NotificationService';
import { getDeviceInfo, testFeatures } from './utils/AndroidCompatibility';

interface Message {
  id: string;
  content: string;
  type: string;
  timestamp: string;
}

export default function App() {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Déconnecté');
  const [messages, setMessages] = useState<Message[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [compatibilityInfo, setCompatibilityInfo] = useState<any>(null);
  const [featureTests, setFeatureTests] = useState<any>(null);

  useEffect(() => {
    initializeApp();
    loadStoredMessages();
    checkCompatibility();
    
    // Écouter les changements d'état de l'application
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initialisation de l\'application...');
      
      // Démarrer le service en arrière-plan
      const success = await backgroundService.start();
      
      if (success) {
        setIsServiceRunning(true);
        setConnectionStatus('Connecté');
        console.log('✅ Service démarré avec succès');
      } else {
        Alert.alert(
          'Erreur',
          'Impossible de démarrer le service de notifications. Vérifiez les permissions.',
          [{ text: 'OK' }]
        );
      }
      
      // Obtenir les informations de l'appareil
      const status = backgroundService.getStatus();
      setDeviceInfo(status);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'initialisation de l\'application');
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('📱 État de l\'application changé:', nextAppState);
    
    if (nextAppState === 'active') {
      // L'application est revenue au premier plan
      updateConnectionStatus();
    }
  };

  const updateConnectionStatus = () => {
    const status = backgroundService.getStatus();
    setConnectionStatus(status.notificationStatus.isConnected ? 'Connecté' : 'Déconnecté');
    setDeviceInfo(status);
  };

  const loadStoredMessages = async () => {
    try {
      const storedMessages = await notificationService.getStoredMessages();
      setMessages(storedMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const checkCompatibility = async () => {
    try {
      const deviceInfo = getDeviceInfo();
      setCompatibilityInfo(deviceInfo);
      
      const tests = await testFeatures();
      setFeatureTests(tests);
      
      console.log('📱 Informations de compatibilité:', deviceInfo);
      console.log('🧪 Tests de fonctionnalités:', tests);
    } catch (error) {
      console.error('Erreur lors de la vérification de compatibilité:', error);
    }
  };

  const toggleService = async () => {
    try {
      if (isServiceRunning) {
        await backgroundService.stop();
        setIsServiceRunning(false);
        setConnectionStatus('Arrêté');
      } else {
        await backgroundService.start();
        setIsServiceRunning(true);
        setConnectionStatus('Connecté');
      }
      updateConnectionStatus();
    } catch (error) {
      console.error('Erreur lors du changement d\'état du service:', error);
      Alert.alert('Erreur', 'Impossible de changer l\'état du service');
    }
  };

  const clearMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
      setMessages([]);
      Alert.alert('Succès', 'Messages effacés');
    } catch (error) {
      console.error('Erreur lors de l\'effacement des messages:', error);
      Alert.alert('Erreur', 'Impossible d\'effacer les messages');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connecté': return '#4CAF50';
      case 'Déconnecté': return '#F44336';
      case 'Arrêté': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'Connecté': return '🟢';
      case 'Déconnecté': return '🔴';
      case 'Arrêté': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>🔔 NotificationApp</Text>
        <Text style={styles.subtitle}>Service de notifications en temps réel</Text>
      </View>

      {/* Statut de connexion */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>
          {getStatusIcon()} {connectionStatus}
        </Text>
      </View>

      {/* Informations de compatibilité */}
      {compatibilityInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📱 Compatibilité Android</Text>
          <Text style={[styles.infoText, { color: compatibilityInfo.compatibility.compatible ? '#4CAF50' : '#F44336' }]}>
            {compatibilityInfo.compatibility.message}
          </Text>
          <Text style={styles.infoText}>Version Android: {compatibilityInfo.osVersion}</Text>
          <Text style={styles.infoText}>Modèle: {compatibilityInfo.modelName}</Text>
          <Text style={styles.infoText}>Marque: {compatibilityInfo.brand}</Text>
          
          {compatibilityInfo.compatibility.features.length > 0 && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Fonctionnalités disponibles:</Text>
              {compatibilityInfo.compatibility.features.map((feature: string, index: number) => (
                <Text key={index} style={styles.featureText}>• {feature}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Tests de fonctionnalités */}
      {featureTests && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>🧪 Tests de fonctionnalités</Text>
          <Text style={[styles.infoText, { color: featureTests.webSocketConnection ? '#4CAF50' : '#F44336' }]}>
            WebSocket: {featureTests.webSocketConnection ? '✅' : '❌'}
          </Text>
          <Text style={[styles.infoText, { color: featureTests.notifications ? '#4CAF50' : '#F44336' }]}>
            Notifications: {featureTests.notifications ? '✅' : '❌'}
          </Text>
          <Text style={[styles.infoText, { color: featureTests.backgroundTask ? '#4CAF50' : '#F44336' }]}>
            Tâches arrière-plan: {featureTests.backgroundTask ? '✅' : '❌'}
          </Text>
          <Text style={[styles.infoText, { color: featureTests.persistentNotification ? '#4CAF50' : '#F44336' }]}>
            Notification persistante: {featureTests.persistentNotification ? '✅' : '❌'}
          </Text>
          <Text style={[styles.infoText, { color: featureTests.localStorage ? '#4CAF50' : '#F44336' }]}>
            Stockage local: {featureTests.localStorage ? '✅' : '❌'}
          </Text>
        </View>
      )}

      {/* Informations de l'appareil */}
      {deviceInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📱 Informations de l'appareil</Text>
          <Text style={styles.infoText}>Plateforme: {Platform.OS}</Text>
          <Text style={styles.infoText}>Service actif: {deviceInfo.isRegistered ? 'Oui' : 'Non'}</Text>
          <Text style={styles.infoText}>Polling local: {deviceInfo.isPolling ? 'Oui' : 'Non'}</Text>
          {deviceInfo.notificationStatus.deviceId && (
            <Text style={styles.infoText}>ID Appareil: {deviceInfo.notificationStatus.deviceId}</Text>
          )}
        </View>
      )}

      {/* Boutons de contrôle */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isServiceRunning ? styles.stopButton : styles.startButton]}
          onPress={toggleService}
        >
          <Text style={styles.buttonText}>
            {isServiceRunning ? '🛑 Arrêter le service' : '▶️ Démarrer le service'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]}
          onPress={clearMessages}
        >
          <Text style={styles.buttonText}>🗑️ Effacer les messages</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <Text style={styles.messagesTitle}>📨 Messages reçus ({messages.length})</Text>
        <ScrollView style={styles.messagesList}>
          {messages.length === 0 ? (
            <Text style={styles.noMessages}>Aucun message reçu</Text>
          ) : (
            messages.map((message, index) => (
              <View key={message.id || index} style={styles.messageItem}>
                <Text style={styles.messageContent}>{message.content}</Text>
                <Text style={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleString('fr-FR')}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>ℹ️ Instructions</Text>
        <Text style={styles.instructionsText}>
          • Le service fonctionne en arrière-plan{'\n'}
          • Les notifications apparaissent même quand l'app est fermée{'\n'}
          • Compatible Android 6+ et iOS{'\n'}
          • Une notification persistante reste dans la barre d'état
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  clearButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  messagesList: {
    flex: 1,
  },
  noMessages: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  messageItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  instructionsContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  featuresContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    marginBottom: 2,
  },
});
