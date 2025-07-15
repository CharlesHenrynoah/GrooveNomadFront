#!/bin/bash

# Script pour démarrer le backend et le frontend en parallèle
echo "🚀 Démarrage de GrooveNomad..."

# Tuer les processus existants sur les ports 3001 et 5000
echo "🔄 Nettoyage des ports..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Démarrer le backend en arrière-plan
echo "🔧 Démarrage du backend sur le port 5000..."
cd backend && npm start &
BACKEND_PID=$!

# Attendre que le backend soit prêt
sleep 3

# Démarrer le frontend
echo "🎨 Démarrage du frontend sur le port 3001..."
cd .. && BROWSER=none npm start &
FRONTEND_PID=$!

# Afficher les informations
echo ""
echo "✅ GrooveNomad est maintenant en cours d'exécution !"
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend: http://localhost:5000"
echo "📊 Base de données: Neon PostgreSQL"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les serveurs..."

# Gérer l'interruption
trap "echo 'Arrêt des serveurs...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Attendre indéfiniment
wait 