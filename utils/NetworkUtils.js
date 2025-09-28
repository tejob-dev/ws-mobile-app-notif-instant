import { Platform } from 'react-native';

// Utilitaires réseau pour l'application mobile
export class NetworkUtils {
  
  // Obtenir l'IP locale de l'appareil (pour debug)
  static async getLocalIP() {
    try {
      // Pour Android, on peut utiliser une API native ou des méthodes alternatives
      // Ici on retourne les IPs communes à essayer
      return [
        '192.168.1.71', // IP fixe configurée
        '192.168.1.1',  // Routeur commun
        '10.0.2.2',     // Émulateur Android
        'localhost',     // Local
      ];
    } catch (error) {
      console.error('Erreur lors de l\'obtention de l\'IP locale:', error);
      return ['192.168.1.71']; // Fallback
    }
  }

  // Tester la connectivité à une URL
  static async testConnection(url, timeout = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Créer une requête de test
      const testSocket = new WebSocket(`ws://${url}`);
      
      const timeoutId = setTimeout(() => {
        testSocket.close();
        resolve({
          url,
          success: false,
          error: 'Timeout',
          responseTime: Date.now() - startTime
        });
      }, timeout);
      
      testSocket.onopen = () => {
        clearTimeout(timeoutId);
        testSocket.close();
        resolve({
          url,
          success: true,
          responseTime: Date.now() - startTime
        });
      };
      
      testSocket.onerror = (error) => {
        clearTimeout(timeoutId);
        testSocket.close();
        resolve({
          url,
          success: false,
          error: error.message || 'Connection failed',
          responseTime: Date.now() - startTime
        });
      };
    });
  }

  // Trouver la meilleure URL de serveur
  static async findBestServerUrl(port = 3001) {
    const ips = await this.getLocalIP();
    const urlsToTest = ips.map(ip => `${ip}:${port}`);
    
    console.log('🔍 Test de connectivité pour les URLs:', urlsToTest);
    
    const results = await Promise.all(
      urlsToTest.map(url => this.testConnection(url))
    );
    
    // Trier par succès puis par temps de réponse
    const successfulResults = results
      .filter(result => result.success)
      .sort((a, b) => a.responseTime - b.responseTime);
    
    if (successfulResults.length > 0) {
      const bestUrl = successfulResults[0].url;
      console.log('✅ Meilleure URL trouvée:', bestUrl);
      return bestUrl;
    }
    
    console.log('❌ Aucune URL accessible trouvée');
    return null;
  }

  // Obtenir l'URL du serveur selon l'environnement
  static getServerUrl() {
    if (__DEV__) {
      // En développement, essayer localhost d'abord
      return Platform.OS === 'android' ? '10.0.2.2:3001' : 'localhost:3001';
    } else {
      // En production, utiliser l'IP configurée
      return '192.168.1.71:3001';
    }
  }
}

export default NetworkUtils;
