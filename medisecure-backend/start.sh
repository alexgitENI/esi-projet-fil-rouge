#!/bin/bash
set -e

echo 'Attente de la base de données...'
sleep 5

# Configuration de la connexion PostgreSQL avec mot de passe
export PGPASSWORD=postgres

# Vérifier si les tables existent déjà
TABLES=$(psql -h db -U postgres -d medisecure -c "\dt" -t 2>/dev/null | wc -l || echo "0")

if [ "$TABLES" -eq "0" ]; then
  echo 'Initialisation de la base de données...'
  # Création des tables à partir des modèles SQLAlchemy
  python -c "
from shared.infrastructure.database.connection import Base, engine
from shared.infrastructure.database.models.user_model import UserModel
from shared.infrastructure.database.models.patient_model import PatientModel
from shared.infrastructure.database.models.appointment_model import AppointmentModel

print('Création des tables...')
Base.metadata.create_all(engine)
print('Tables créées avec succès')
"
fi

# Vérifier les valeurs valides pour l'énumération UserRole
echo 'Vérification des valeurs valides pour UserRole...'
ENUM_VALUES=$(psql -h db -U postgres -d medisecure -c "SELECT enum_range(NULL::userrole);" -t | tr -d ' ')
echo "Valeurs valides: $ENUM_VALUES"

# Vérifier si l'utilisateur admin existe déjà
ADMIN_EXISTS=$(psql -h db -U postgres -d medisecure -c "SELECT COUNT(*) FROM users WHERE email = 'admin@medisecure.com'" -t | tr -d ' ' || echo "0")

if [ "$ADMIN_EXISTS" -eq "0" ]; then
  echo 'Création de l utilisateur administrateur...'
  # Insertion directe via SQL en utilisant la valeur appropriée pour le rôle (ADMIN)
  psql -h db -U postgres -d medisecure -c "
    INSERT INTO users (id, email, hashed_password, first_name, last_name, role, is_active, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'admin@medisecure.com',
      '\$2b\$12\$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Mot de passe: Admin123!
      'Admin',
      'User',
      'ADMIN',  -- Lettre en majuscule
      TRUE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );"
  
  if [ $? -eq 0 ]; then
    echo 'Utilisateur administrateur créé avec succès:'
    echo 'Email: admin@medisecure.com'
    echo 'Mot de passe: Admin123!'
  else
    echo 'Erreur lors de la création de l utilisateur administrateur'
  fi
else
  echo 'L utilisateur administrateur existe déjà'
fi

echo 'Démarrage de l API...'
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload