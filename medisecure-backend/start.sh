#!/bin/bash
set -e

echo 'Attente de la base de données...'
sleep 5

# Vérifier si les tables existent déjà
TABLES=$(psql -U postgres -h db -d medisecure -c "\dt" -t | wc -l)

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

echo 'Création de l'utilisateur administrateur...'
python create_admin.py

echo 'Démarrage de l'API...'
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload