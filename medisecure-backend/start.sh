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
  
  # Création des tables manuellement avec les commandes SQL
  psql -h db -U postgres -d medisecure -c "
    -- Création de l'énumération UserRole si elle n'existe pas déjà
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE userrole AS ENUM ('admin', 'doctor', 'nurse', 'patient', 'receptionist');
      END IF;
    END$$;

    -- Création de l'énumération AppointmentStatus si elle n'existe pas déjà
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointmentstatus') THEN
        CREATE TYPE appointmentstatus AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed', 'missed');
      END IF;
    END$$;

    -- Création de la table users si elle n'existe pas déjà
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email VARCHAR NOT NULL UNIQUE,
      hashed_password VARCHAR NOT NULL,
      first_name VARCHAR NOT NULL,
      last_name VARCHAR NOT NULL,
      role userrole NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Création de la table patients si elle n'existe pas déjà
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      first_name VARCHAR NOT NULL,
      last_name VARCHAR NOT NULL,
      date_of_birth DATE NOT NULL,
      gender VARCHAR NOT NULL,
      address VARCHAR,
      city VARCHAR,
      postal_code VARCHAR,
      country VARCHAR,
      phone_number VARCHAR,
      email VARCHAR,
      blood_type VARCHAR,
      allergies JSONB,
      chronic_diseases JSONB,
      current_medications JSONB,
      has_consent BOOLEAN DEFAULT FALSE,
      consent_date TIMESTAMP,
      gdpr_consent BOOLEAN DEFAULT FALSE,
      insurance_provider VARCHAR,
      insurance_id VARCHAR,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    );

    -- Création de la table appointments si elle n'existe pas déjà
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY,
      patient_id UUID NOT NULL REFERENCES patients(id),
      doctor_id UUID NOT NULL REFERENCES users(id),
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      status appointmentstatus DEFAULT 'scheduled',
      reason VARCHAR,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    );
  "
  
  echo "Tables créées avec succès"
fi

# Vérifier les valeurs valides pour l'énumération UserRole
echo 'Vérification des valeurs valides pour UserRole...'
ENUM_VALUES=$(psql -h db -U postgres -d medisecure -c "SELECT enum_range(NULL::userrole);" -t | tr -d ' ')
echo "Valeurs valides: $ENUM_VALUES"

# Vérifier si l'utilisateur admin existe déjà
ADMIN_EXISTS=$(psql -h db -U postgres -d medisecure -c "SELECT COUNT(*) FROM users WHERE email = 'admin@medisecure.com'" -t | tr -d ' ' || echo "0")

if [ "$ADMIN_EXISTS" -eq "0" ]; then
  echo 'Création de l utilisateur administrateur...'
  # Insertion directe via SQL en utilisant la valeur appropriée pour le rôle (admin)
  psql -h db -U postgres -d medisecure -c "
    INSERT INTO users (id, email, hashed_password, first_name, last_name, role, is_active, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'admin@medisecure.com',
      '\$2b\$12\$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Mot de passe: Admin123!
      'Admin',
      'User',
      'admin',  -- en minuscule pour correspondre à l'énumération
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