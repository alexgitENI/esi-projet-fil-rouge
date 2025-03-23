-- Création des types énumérés
CREATE TYPE IF NOT EXISTS userrole AS ENUM ('admin', 'doctor', 'nurse', 'patient', 'receptionist');
CREATE TYPE IF NOT EXISTS appointmentstatus AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed', 'missed');

-- Création des tables
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

-- Création de l'utilisateur admin
INSERT INTO users (id, email, hashed_password, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@medisecure.com',
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Mot de passe: Admin123!
  'Admin',
  'User',
  'admin',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;