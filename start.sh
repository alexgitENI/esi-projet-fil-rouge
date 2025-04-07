#!/bin/bash

# Script de démarrage de l'application MediSecure

# Vérification des prérequis
echo "Vérification des prérequis..."
if ! command -v docker &> /dev/null; then
    echo "Docker n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Démarrage des services
echo "Démarrage des services MediSecure..."
docker-compose up -d

# Attente que les services soient prêts
echo "Attente que les services soient prêts..."
sleep 5

# Affichage des URLs d'accès
echo ""
echo "================================================="
echo "MediSecure est en cours d'exécution !"
echo "================================================="
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🚀 API: http://localhost:8000/api/docs"
echo ""
echo "Identifiants par défaut :"
echo "Email: admin@medisecure.com"
echo "Mot de passe: Admin123!"
echo ""
echo "Pour afficher les logs : docker-compose logs -f"
echo "Pour arrêter : docker-compose down"
echo "================================================="