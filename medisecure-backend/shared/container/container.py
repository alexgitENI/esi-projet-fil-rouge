from dependency_injector import containers, providers
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from shared.adapters.primary.uuid_generator import UuidGenerator
from shared.adapters.secondary.postgres_user_repository import PostgresUserRepository
from shared.adapters.secondary.in_memory_user_repository import InMemoryUserRepository
from shared.infrastructure.services.smtp_mailer import SmtpMailer
from shared.services.authenticator.basic_authenticator import BasicAuthenticator

from patient_management.infrastructure.adapters.secondary.postgres_patient_repository import PostgresPatientRepository
from patient_management.infrastructure.adapters.secondary.in_memory_patient_repository import InMemoryPatientRepository
from patient_management.domain.services.patient_service import PatientService

import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Container(containers.DeclarativeContainer):
    """
    Container d'injection de dépendances pour l'application.
    Centralise la création et la gestion des instances des différentes classes.
    """
    
    config = providers.Configuration()
    
    # Configuration du container
    config.database_url.from_env("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/medisecure")
    config.environment.from_env("ENVIRONMENT", "development")
    
    # Création du moteur
    engine = providers.Singleton(
    create_async_engine,
    config.database_url,
    echo=True if config.environment == "development" else False
)
    
    # Création de la session SQLAlchemy
    async_session_factory = providers.Factory(
        sessionmaker,
        autocommit=False,
        autoflush=False,
        bind=engine,
        class_=AsyncSession
    )
    
    # Fournisseur de session
    db_session = providers.Resource(
        lambda session_factory: session_factory(),
        async_session_factory
    )
    
    # Adaptateurs primaires
    id_generator = providers.Factory(UuidGenerator)
    authenticator = providers.Factory(BasicAuthenticator)
    
    # Adaptateurs secondaires - Shared
    user_repository = providers.Factory(
        PostgresUserRepository,
        session=db_session
    )
    
    # Utiliser le repository en mémoire pour les tests
    user_repository_in_memory = providers.Factory(InMemoryUserRepository)
    
    # Services d'infrastructure
    mailer = providers.Factory(SmtpMailer)
    
    # Patient Management - Services et repositories
    patient_service = providers.Factory(PatientService)
    
    patient_repository = providers.Factory(
        PostgresPatientRepository,
        session=db_session
    )
    
    # Utiliser le repository en mémoire pour les tests
    patient_repository_in_memory = providers.Factory(InMemoryPatientRepository)