from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete, or_, and_
from sqlalchemy.sql import text

from patient_management.domain.entities.patient import Patient
from patient_management.domain.ports.secondary.patient_repository_protocol import PatientRepositoryProtocol
from shared.infrastructure.database.models.patient_model import PatientModel

class PostgresPatientRepository(PatientRepositoryProtocol):
    """
    Adaptateur secondaire pour le repository des patients avec PostgreSQL.
    Implémente le port PatientRepositoryProtocol.
    """
    
    def __init__(self, session: AsyncSession):
        """
        Initialise le repository avec une session SQLAlchemy.
        
        Args:
            session: La session SQLAlchemy à utiliser
        """
        self.session = session
    
    async def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        """
        Récupère un patient par son ID.
        
        Args:
            patient_id: L'ID du patient à récupérer
            
        Returns:
            Optional[Patient]: Le patient trouvé ou None si non trouvé
        """
        query = select(PatientModel).where(PatientModel.id == patient_id)
        result = await self.session.execute(query)
        patient_model = result.scalar_one_or_none()
        
        if not patient_model:
            return None
        
        return self._map_to_entity(patient_model)
    
    async def get_by_email(self, email: str) -> Optional[Patient]:
        """
        Récupère un patient par son email.
        
        Args:
            email: L'email du patient à récupérer
            
        Returns:
            Optional[Patient]: Le patient trouvé ou None si non trouvé
        """
        query = select(PatientModel).where(PatientModel.email == email)
        result = await self.session.execute(query)
        patient_model = result.scalar_one_or_none()
        
        if not patient_model:
            return None
        
        return self._map_to_entity(patient_model)
    
    async def create(self, patient: Patient) -> Patient:
        """
        Crée un nouveau patient.
        
        Args:
            patient: Le patient à créer
            
        Returns:
            Patient: Le patient créé avec son ID généré
        """
        patient_model = PatientModel(
            id=patient.id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            date_of_birth=patient.date_of_birth,
            gender=patient.gender,
            address=patient.address,
            city=patient.city,
            postal_code=patient.postal_code,
            country=patient.country,
            phone_number=patient.phone_number,
            email=patient.email,
            blood_type=patient.blood_type,
            allergies=patient.allergies,
            chronic_diseases=patient.chronic_diseases,
            current_medications=patient.current_medications,
            has_consent=patient.has_consent,
            consent_date=patient.consent_date,
            gdpr_consent=patient.gdpr_consent,
            insurance_provider=patient.insurance_provider,
            insurance_id=patient.insurance_id,
            notes=patient.notes,
            created_at=patient.created_at,
            updated_at=patient.updated_at,
            is_active=patient.is_active
        )
        
        self.session.add(patient_model)
        await self.session.commit()
        await self.session.refresh(patient_model)
        
        return self._map_to_entity(patient_model)
    
    async def update(self, patient: Patient) -> Patient:
        """
        Met à jour un patient existant.
        
        Args:
            patient: Le patient à mettre à jour
            
        Returns:
            Patient: Le patient mis à jour
        """
        query = (
            update(PatientModel)
            .where(PatientModel.id == patient.id)
            .values(
                first_name=patient.first_name,
                last_name=patient.last_name,
                date_of_birth=patient.date_of_birth,
                gender=patient.gender,
                address=patient.address,
                city=patient.city,
                postal_code=patient.postal_code,
                country=patient.country,
                phone_number=patient.phone_number,
                email=patient.email,
                blood_type=patient.blood_type,
                allergies=patient.allergies,
                chronic_diseases=patient.chronic_diseases,
                current_medications=patient.current_medications,
                has_consent=patient.has_consent,
                consent_date=patient.consent_date,
                gdpr_consent=patient.gdpr_consent,
                insurance_provider=patient.insurance_provider,
                insurance_id=patient.insurance_id,
                notes=patient.notes,
                updated_at=patient.updated_at,
                is_active=patient.is_active
            )
        )
        
        await self.session.execute(query)
        await self.session.commit()
        
        # Récupérer le patient mis à jour pour le retourner
        updated_patient = await self.get_by_id(patient.id)
        return updated_patient
    
    async def delete(self, patient_id: UUID) -> bool:
        """
        Supprime un patient.
        
        Args:
            patient_id: L'ID du patient à supprimer
            
        Returns:
            bool: True si le patient a été supprimé, False sinon
        """
        query = delete(PatientModel).where(PatientModel.id == patient_id)
        result = await self.session.execute(query)
        
        if result.rowcount == 0:
            return False
        
        await self.session.commit()
        return True
    
    async def list_all(self, skip: int = 0, limit: int = 100) -> List[Patient]:
        """
        Liste tous les patients avec pagination.
        
        Args:
            skip: Le nombre de patients à sauter
            limit: Le nombre maximum de patients à retourner
            
        Returns:
            List[Patient]: La liste des patients
        """
        query = select(PatientModel).offset(skip).limit(limit)
        result = await self.session.execute(query)
        patient_models = result.scalars().all()
        
        return [self._map_to_entity(patient_model) for patient_model in patient_models]
    
    async def search(
        self,
        name: Optional[str] = None,
        date_of_birth: Optional[date] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Patient]:
        """
        Recherche des patients selon différents critères.
        
        Args:
            name: Le nom ou prénom du patient (recherche partielle)
            date_of_birth: La date de naissance du patient
            email: L'email du patient (recherche exacte)
            phone: Le numéro de téléphone du patient (recherche partielle)
            skip: Le nombre de patients à sauter
            limit: Le nombre maximum de patients à retourner
            
        Returns:
            List[Patient]: La liste des patients correspondant aux critères
        """
        # Construire la requête de base
        query = select(PatientModel)
        
        # Ajouter les filtres si fournis
        filters = []
        
        if name:
            # Recherche partielle sur le prénom ou le nom
            filters.append(
                or_(
                    PatientModel.first_name.ilike(f"%{name}%"),
                    PatientModel.last_name.ilike(f"%{name}%")
                )
            )
        
        if date_of_birth:
            filters.append(PatientModel.date_of_birth == date_of_birth)
        
        if email:
            filters.append(PatientModel.email == email)
        
        if phone:
            filters.append(PatientModel.phone_number.ilike(f"%{phone}%"))
        
        # Ajouter tous les filtres à la requête
        if filters:
            query = query.where(and_(*filters))
        
        # Ajouter la pagination
        query = query.offset(skip).limit(limit)
        
        # Exécuter la requête
        result = await self.session.execute(query)
        patient_models = result.scalars().all()
        
        return [self._map_to_entity(patient_model) for patient_model in patient_models]
    
    async def count(self) -> int:
        """
        Compte le nombre total de patients.
        
        Returns:
            int: Le nombre total de patients
        """
        query = select(text("COUNT(*)")).select_from(PatientModel)
        result = await self.session.execute(query)
        return result.scalar_one()
    
    def _map_to_entity(self, patient_model: PatientModel) -> Patient:
        """
        Convertit un modèle SQLAlchemy en entité du domaine.
        
        Args:
            patient_model: Le modèle SQLAlchemy à convertir
            
        Returns:
            Patient: L'entité du domaine correspondante
        """
        return Patient(
            id=patient_model.id,
            first_name=patient_model.first_name,
            last_name=patient_model.last_name,
            date_of_birth=patient_model.date_of_birth,
            gender=patient_model.gender,
            address=patient_model.address,
            city=patient_model.city,
            postal_code=patient_model.postal_code,
            country=patient_model.country,
            phone_number=patient_model.phone_number,
            email=patient_model.email,
            blood_type=patient_model.blood_type,
            allergies=patient_model.allergies or {},
            chronic_diseases=patient_model.chronic_diseases or {},
            current_medications=patient_model.current_medications or {},
            has_consent=patient_model.has_consent,
            consent_date=patient_model.consent_date,
            gdpr_consent=patient_model.gdpr_consent,
            insurance_provider=patient_model.insurance_provider,
            insurance_id=patient_model.insurance_id,
            notes=patient_model.notes,
            created_at=patient_model.created_at,
            updated_at=patient_model.updated_at,
            is_active=patient_model.is_active
        )