# Guide de connexion WebSocket - Corrections apportées

## Problèmes identifiés et solutions

### 1. ❌ CORS du serveur trop restrictif

**Problème :** Le serveur n'acceptait que `http://localhost:3000` comme origine.

**Solution :** Ajout de plusieurs origines autorisées dans la configuration CORS.

```javascript
// backend/server.js
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.71:3001", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### 2. ❌ Serveur non accessible depuis l'extérieur

**Problème :** Le serveur écoutait seulement sur `localhost`, inaccessible depuis l'appareil mobile.

**Solution :** Configuration pour écouter sur toutes les interfaces réseau (`0.0.0.0`).

```javascript
// backend/server.js
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📱 WebSocket disponible sur ws://localhost:${PORT}`);
  console.log(`📱 WebSocket disponible sur ws://192.168.1.71:${PORT}`);
  console.log(`🌐 API REST disponible sur http://localhost:${PORT}/api`);
  console.log(`🌐 API REST disponible sur http://192.168.1.71:${PORT}/api`);
});
```

### 3. ❌ URL WebSocket incorrecte dans l'application

**Problème :** L'application utilisait `http://` au lieu de `ws://` pour les WebSockets.

**Solution :** Correction du protocole et ajout d'un système de fallback.

```javascript
// services/NotificationService.js
const serverUrl = `ws://${this.serverUrl}`;
console.log('🔗 Tentative de connexion au serveur:', serverUrl);
```

### 4. 🔧 Système de fallback amélioré

**Nouvelle fonctionnalité :** L'application essaie maintenant plusieurs URLs automatiquement.

```javascript
// config.js
network: {
  fallbackUrls: [
    '192.168.1.71:3001',
    'localhost:3001',
    '10.0.2.2:3001', // Adresse spéciale pour émulateur Android
  ],
  connectionTimeout: 10000,
},
```

### 5. 🔧 Gestion d'erreurs robuste

**Amélioration :** Meilleure gestion des erreurs de connexion avec reconnexion automatique.

```javascript
// services/NotificationService.js
for (const url of urlsToTry) {
  try {
    // Tentative de connexion
    this.socket = io(url, { /* options */ });
    // Attendre la connexion avec timeout
    await new Promise((resolve, reject) => {
      // Gestion du timeout et des événements
    });
    console.log('✅ Connexion réussie à:', url);
    break;
  } catch (error) {
    console.log(`❌ Échec de connexion à ${url}:`, error.message);
    // Essayer l'URL suivante
  }
}
```

## Instructions de configuration

### 1. Vérifier l'adresse IP de votre ordinateur

```bash
# Sur macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Sur Windows
ipconfig | findstr "IPv4"
```

### 2. Mettre à jour la configuration

Modifiez le fichier `config.js` avec votre adresse IP :

```javascript
export const config = {
  serverUrl: 'VOTRE_IP:3001', // Remplacez par votre IP
  network: {
    fallbackUrls: [
      'VOTRE_IP:3001',
      'localhost:3001',
      '10.0.2.2:3001',
    ],
  },
};
```

### 3. Démarrer le serveur

```bash
cd backend
node server.js
```

Vous devriez voir :
```
🚀 Serveur démarré sur le port 3001
📱 WebSocket disponible sur ws://localhost:3001
📱 WebSocket disponible sur ws://VOTRE_IP:3001
🌐 API REST disponible sur http://localhost:3001/api
🌐 API REST disponible sur http://VOTRE_IP:3001/api
```

### 4. Tester la connexion

L'application mobile devrait maintenant :
- ✅ Se connecter automatiquement au serveur WebSocket
- ✅ Essayer plusieurs URLs de fallback si nécessaire
- ✅ Se reconnecter automatiquement en cas de perte de connexion
- ✅ Afficher des logs détaillés de connexion

## Dépannage

### Si la connexion échoue encore :

1. **Vérifiez le pare-feu** : Assurez-vous que le port 3001 est ouvert
2. **Vérifiez le réseau** : L'appareil mobile et l'ordinateur doivent être sur le même réseau
3. **Testez avec curl** : `curl http://VOTRE_IP:3001/api/health`
4. **Vérifiez les logs** : Regardez les logs de l'application mobile pour voir quelle URL est testée

### Adresses spéciales :

- `10.0.2.2:3001` : Pour émulateur Android (redirige vers localhost de l'hôte)
- `192.168.1.x:3001` : Pour réseau local WiFi
- `localhost:3001` : Pour développement local uniquement

## Résultat attendu

Après ces corrections, vous devriez voir dans les logs de l'application :

```
🔗 Tentative de connexion au serveur: ws://192.168.1.71:3001
✅ Connexion réussie à: 192.168.1.71:3001
🔗 Connecté au serveur WebSocket
```
