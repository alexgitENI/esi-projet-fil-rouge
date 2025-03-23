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

from appointment_management.infrastructure.adapters.secondary.postgres_appointment_repository import PostgresAppointmentRepository
from appointment_management.infrastructure.adapters.secondary.in_memory_appointment_repository import InMemoryAppointmentRepository
from appointment_management.domain.services.appointment_service import AppointmentService

import os
import logging
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Container(containers.DeclarativeContainer):
    """
    Container d'injection de dépendances pour l'application.
    Centralise la création et la gestion des instances des différentes classes.
    """
    
    config = providers.Configuration()
    
    # Configuration du container
    config.database_url.from_env("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/medisecure")
    config.environment.from_env("ENVIRONMENT", "development")
    
    # Assurer que nous utilisons bien asyncpg
    if config.database_url() and "postgresql://" in config.database_url() and "asyncpg" not in config.database_url():
        config.database_url.override(config.database_url().replace("postgresql://", "postgresql+asyncpg://"))
    
    # Création du moteur - Activer echo=True pour le développement pour voir les requêtes SQL
    engine = providers.Singleton(
        create_async_engine,
        config.database_url,
        echo=True if config.environment() == "development" else False
    )
    
    # Création de la session SQLAlchemy
    async_session_factory = providers.Factory(
        sessionmaker,
        autocommit=False,
        autoflush=False,
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    # Fournisseur de session
    db_session = providers.Resource(
        lambda session_factory: session_factory(),
        async_session_factory
    )
    
    # Adaptateurs primaires
    id_generator = providers.Factory(UuidGenerator)
    authenticator = providers.Factory(BasicAuthenticator)
    
    # Services du domaine
    patient_service = providers.Factory(PatientService)
    appointment_service = providers.Factory(AppointmentService)
    
    # Adaptateurs secondaires - Shared
    user_repository = providers.Factory(
        PostgresUserRepository,
        session=db_session
    )
    
    # Version in-memory pour les tests
    user_repository_in_memory = providers.Factory(InMemoryUserRepository)
    
    # Patient Management - Repositories
    patient_repository = providers.Factory(
        PostgresPatientRepository,
        session=db_session
    )
    
    # Version in-memory pour les tests
    patient_repository_in_memory = providers.Factory(InMemoryPatientRepository)
    
    # Appointment Management - Repositories
    appointment_repository = providers.Factory(
        PostgresAppointmentRepository,
        session=db_session
    )
    
    # Version in-memory pour les tests
    appointment_repository_in_memory = providers.Factory(InMemoryAppointmentRepository)
    
    # Services d'infrastructure
    mailer = providers.Factory(SmtpMailer)
    
    # Log des dépendances chargées au démarrage
    def __init__(self):
        super().__init__()
        env = self.config.environment()
        db_url = self.config.database_url()
        # Masquer le mot de passe dans les logs
        if db_url and "@" in db_url:
            parts = db_url.split("@")
            masked_url = parts[0].split(":")
            masked_url = f"{masked_url[0]}:***@{parts[1]}"
            logger.info(f"Environnement: {env}, Base de données: {masked_url}")
        else:
            logger.info(f"Environnement: {env}, URL de base de données configurée")
    
    # Configuration conditionnelle selon l'environnement
    def configure_for_environment(self):
        """Configure les dépendances en fonction de l'environnement"""
        env = self.config.environment()
        
        if env == "test":
            # Remplacer les repositories PostgreSQL par des repositories in-memory pour les tests
            logger.info("Environnement de test détecté: utilisation des repositories in-memory")
            self.user_repository.override(self.user_repository_in_memory)
            self.patient_repository.override(self.patient_repository_in_memory)
            self.appointment_repository.override(self.appointment_repository_in_memory)
        else:
            logger.info(f"Environnement {env}: utilisation des repositories PostgreSQL")