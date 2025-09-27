# NotificationApp - Application de Notifications en Temps Réel

Cette application React Native permet de recevoir des notifications en temps réel via WebSocket et Firebase Cloud Messaging, avec un service en arrière-plan qui fonctionne même quand l'application est fermée.

## 🚀 Fonctionnalités

- ✅ **Notifications en temps réel** via WebSocket
- ✅ **Service en arrière-plan** qui fonctionne même quand l'app est fermée
- ✅ **Notification persistante** dans la barre d'état
- ✅ **Compatibilité Android 6+** et iOS
- ✅ **Reconnexion automatique** en cas de perte de connexion
- ✅ **Stockage local** des messages reçus
- ✅ **Interface utilisateur intuitive**

## 📋 Prérequis

- Node.js 16+
- Expo CLI
- Android Studio (pour Android)
- Xcode (pour iOS)
- Compte Firebase

## 🛠️ Installation

### 1. Installer les dépendances

```bash
cd NotificationApp
npm install
```

### 2. Configuration Firebase

1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
2. Activez Firebase Cloud Messaging
3. Téléchargez le fichier `google-services.json` pour Android
4. Placez-le dans le dossier `NotificationApp/`
5. Mettez à jour `firebase-config.js` avec vos clés

### 3. Configuration du serveur

Modifiez l'URL du serveur dans `services/NotificationService.js` :

```javascript
this.serverUrl = 'http://votre-serveur:3001';
```

### 4. Build et déploiement

#### Pour Android :
```bash
expo run:android
```

#### Pour iOS :
```bash
expo run:ios
```

## 🔧 Configuration

### Permissions Android

L'application demande automatiquement les permissions suivantes :
- `INTERNET` - Pour la connexion WebSocket
- `ACCESS_NETWORK_STATE` - Pour vérifier l'état du réseau
- `WAKE_LOCK` - Pour maintenir l'appareil éveillé
- `VIBRATE` - Pour les vibrations des notifications
- `RECEIVE_BOOT_COMPLETED` - Pour démarrer automatiquement au boot
- `FOREGROUND_SERVICE` - Pour le service en arrière-plan
- `POST_NOTIFICATIONS` - Pour afficher les notifications

### Configuration des notifications

L'application crée automatiquement un canal de notification avec les paramètres suivants :
- **Nom** : "Notifications en temps réel"
- **Importance** : Haute
- **Vibration** : Activée
- **Son** : Par défaut
- **Lumière** : Activée

## 📱 Utilisation

1. **Lancement** : Ouvrez l'application
2. **Démarrage automatique** : Le service se lance automatiquement
3. **Notification persistante** : Une notification reste dans la barre d'état
4. **Messages** : Les notifications apparaissent en pop-up
5. **Historique** : Les messages sont stockés localement

## 🔄 Fonctionnement en arrière-plan

### Android 6+
- Utilise `expo-background-fetch` pour les tâches périodiques
- Service en arrière-plan avec `FOREGROUND_SERVICE`
- Reconnexion automatique toutes les 30 secondes
- Notification persistante dans la barre d'état

### iOS
- Utilise les notifications push natives
- Limité par les restrictions iOS pour les tâches en arrière-plan
- Fonctionne principalement via les notifications push

## 🐛 Dépannage

### Problèmes courants

1. **Service ne démarre pas**
   - Vérifiez les permissions
   - Redémarrez l'application
   - Vérifiez la configuration Firebase

2. **Notifications ne s'affichent pas**
   - Vérifiez les permissions de notification
   - Vérifiez la configuration Firebase
   - Testez avec le serveur de test

3. **Connexion WebSocket échoue**
   - Vérifiez l'URL du serveur
   - Vérifiez la connectivité réseau
   - Vérifiez que le serveur est démarré

### Logs de débogage

Activez les logs dans la console pour voir :
- État de la connexion WebSocket
- Messages reçus
- Erreurs de service
- Statut des tâches en arrière-plan

## 📊 Architecture

```
NotificationApp/
├── App.tsx                 # Interface principale
├── services/
│   ├── NotificationService.js    # Service de notifications
│   └── BackgroundService.js       # Service en arrière-plan
├── tasks/
│   └── backgroundTask.js          # Tâche en arrière-plan
├── firebase-config.js             # Configuration Firebase
└── android/
    └── app/src/main/
        └── AndroidManifest.xml    # Permissions Android
```

## 🔒 Sécurité

- Les tokens FCM sont stockés localement
- Connexion WebSocket sécurisée (HTTPS recommandé)
- Validation des messages côté serveur
- Gestion des tokens invalides

## 📈 Performance

- Polling optimisé (30 secondes)
- Stockage local limité (100 messages)
- Reconnexion intelligente
- Gestion mémoire optimisée

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation Expo
- Vérifiez les logs de débogage

---

**Note** : Cette application est conçue pour fonctionner avec le serveur WebSocket fourni dans le dossier `backend/`. Assurez-vous que le serveur est démarré avant de tester l'application.
