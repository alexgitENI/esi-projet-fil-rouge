#!/bin/bash
set -e

echo 'Attente de la base de données...'
sleep 5

# Configuration de la connexion PostgreSQL avec mot de passe
export PGPASSWORD=postgres

# Exécuter le script d'initialisation
echo 'Initialisation de la base de données...'
psql -h db -U postgres -d medisecure -f /app/init.sql

if [ $? -eq 0 ]; then
  echo "Base de données initialisée avec succès"
else
  echo "Erreur lors de l'initialisation de la base de données"
  exit 1
fi

# Vérifier l'utilisateur admin
ADMIN_EXISTS=$(psql -h db -U postgres -d medisecure -c "SELECT COUNT(*) FROM users WHERE email = 'admin@medisecure.com'" -t | tr -d ' ' || echo "0")

if [ "$ADMIN_EXISTS" -eq "1" ]; then
  echo 'Utilisateur administrateur trouvé:'
  echo 'Email: admin@medisecure.com'
  echo 'Mot de passe: Admin123!'
else
  echo 'ERREUR: Utilisateur administrateur non trouvé!'
fi

echo 'Démarrage de l API...'
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload