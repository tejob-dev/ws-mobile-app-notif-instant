#!/bin/bash

# Script de démarrage pour NotificationApp
echo "🚀 Démarrage de NotificationApp..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 16+"
    exit 1
fi

# Vérifier que Expo CLI est installé
if ! command -v expo &> /dev/null; then
    echo "📦 Installation d'Expo CLI..."
    npm install -g @expo/cli
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Vérifier la configuration
echo "🔍 Vérification de la configuration..."
node test-app.js

# Demander confirmation
echo ""
echo "📱 Prêt à démarrer l'application!"
echo "🔔 Fonctionnalités:"
echo "   • Notifications en temps réel"
echo "   • Service en arrière-plan"
echo "   • Compatible Android 6+"
echo "   • Notification persistante"
echo ""

read -p "Voulez-vous démarrer l'application maintenant? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Démarrage de l'application..."
    
    # Choisir la plateforme
    echo "Choisissez la plateforme:"
    echo "1) Android"
    echo "2) iOS"
    echo "3) Web"
    
    read -p "Votre choix (1-3): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            echo "🤖 Démarrage sur Android..."
            expo run:android
            ;;
        2)
            echo "🍎 Démarrage sur iOS..."
            expo run:ios
            ;;
        3)
            echo "🌐 Démarrage sur Web..."
            expo start --web
            ;;
        *)
            echo "❌ Choix invalide"
            exit 1
            ;;
    esac
else
    echo "👋 Au revoir! Utilisez 'expo start' pour démarrer l'application plus tard."
fi
