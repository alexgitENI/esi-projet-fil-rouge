#!/bin/bash
set -e

echo 'Attente de la base de données...'
sleep 5

# Configuration de la connexion PostgreSQL avec mot de passe
export PGPASSWORD=postgres

# Tentative de connexion à la base de données
echo "Vérification de la connexion à la base de données..."
pgisready=0
for i in {1..30}; do
  pg_isready -h db -U postgres && pgisready=1 && break
  echo "En attente de la base de données... $i/30"
  sleep 1
done

if [ $pgisready -ne 1 ]; then
  echo "Impossible de se connecter à la base de données après 30 tentatives"
  exit 1
fi

# Vérifier si la base de données existe, sinon la créer
echo "Vérification de l'existence de la base de données..."
if ! psql -h db -U postgres -lqt | cut -d \| -f 1 | grep -qw medisecure; then
  echo "Création de la base de données medisecure..."
  psql -h db -U postgres -c "CREATE DATABASE medisecure;"
fi

# Exécuter le script d'initialisation
echo 'Initialisation de la base de données...'
psql -h db -U postgres -d medisecure -f /app/init.sql

if [ $? -eq 0 ]; then
  echo "Base de données initialisée avec succès"
else
  echo "Avertissement : Des erreurs sont survenues lors de l'initialisation de la base de données, mais l'exécution continue."
fi

# Vérifier l'utilisateur admin
ADMIN_EXISTS=$(psql -h db -U postgres -d medisecure -c "SELECT COUNT(*) FROM users WHERE email = 'admin@medisecure.com'" -t | tr -d ' ' 2>/dev/null || echo "0")

if [ "$ADMIN_EXISTS" = "1" ]; then
  echo 'Utilisateur administrateur trouvé:'
  echo 'Email: admin@medisecure.com'
  echo 'Mot de passe: Admin123!'
else
  echo 'AVERTISSEMENT: Utilisateur administrateur non trouvé!'
  echo 'Cela peut être dû à des erreurs dans le script d''initialisation.'
fi

echo 'Démarrage de l API...'
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload