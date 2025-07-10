#!/bin/bash

# Script de démarrage pour l'application GrooveNomadFront
# Ce script s'assure que nous sommes dans le bon répertoire avant de démarrer

echo "🚀 Démarrage de GrooveNomadFront..."

# Aller au répertoire du projet
cd "$(dirname "$0")"

# Vérifier si package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : package.json introuvable"
    echo "Assurez-vous d'être dans le bon répertoire"
    exit 1
fi

echo "📦 Répertoire de travail : $(pwd)"
echo "🔧 Démarrage du serveur de développement..."

# Démarrer le serveur
npm start 