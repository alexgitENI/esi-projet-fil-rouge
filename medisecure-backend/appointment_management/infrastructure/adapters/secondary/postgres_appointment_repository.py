# medisecure-backend/appointment_management/infrastructure/adapters/secondary/postgres_appointment_repository.py
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete, and_, or_, func
import logging

from appointment_management.domain.entities.appointment import Appointment, AppointmentStatus
from appointment_management.domain.ports.secondary.appointment_repository_protocol import AppointmentRepositoryProtocol
from shared.infrastructure.database.models.appointment_model import AppointmentModel, AppointmentStatus as AppointmentStatusModel

# Configuration du logging
logger = logging.getLogger(__name__)

class PostgresAppointmentRepository(AppointmentRepositoryProtocol):
    """
    Adaptateur secondaire pour le repository des rendez-vous avec PostgreSQL.
    Implémente le port AppointmentRepositoryProtocol.
    """
    
    def __init__(self, session: AsyncSession):
        """
        Initialise le repository avec une session SQLAlchemy.
        
        Args:
            session: La session SQLAlchemy à utiliser
        """
        self.session = session
    
    async def get_by_id(self, appointment_id: UUID) -> Optional[Appointment]:
        """
        Récupère un rendez-vous par son ID.
        
        Args:
            appointment_id: L'ID du rendez-vous à récupérer
            
        Returns:
            Optional[Appointment]: Le rendez-vous trouvé ou None si non trouvé
        """
        try:
            logger.debug(f"Récupération du rendez-vous avec ID: {appointment_id}")
            query = select(AppointmentModel).where(AppointmentModel.id == appointment_id)
            result = await self.session.execute(query)
            appointment_model = result.scalar_one_or_none()
            
            if not appointment_model:
                logger.debug(f"Rendez-vous avec ID {appointment_id} non trouvé")
                return None
            
            logger.debug(f"Rendez-vous trouvé: {appointment_model.id}")
            return self._map_to_entity(appointment_model)
        except Exception as e:
            logger.exception(f"Erreur lors de la récupération du rendez-vous {appointment_id}: {str(e)}")
            raise
    
    async def create(self, appointment: Appointment) -> Appointment:
        """
        Crée un nouveau rendez-vous.
        
        Args:
            appointment: Le rendez-vous à créer
            
        Returns:
            Appointment: Le rendez-vous créé avec son ID généré
        """
        try:
            logger.info(f"Création d'un nouveau rendez-vous: {appointment.id}")
            logger.debug(f"Données du rendez-vous: patient_id={appointment.patient_id}, doctor_id={appointment.doctor_id}")
            logger.debug(f"Dates: start_time={appointment.start_time}, end_time={appointment.end_time}")
            
            # S'assurer que les ID sont de type UUID
            patient_id = appointment.patient_id if isinstance(appointment.patient_id, UUID) else UUID(str(appointment.patient_id))
            doctor_id = appointment.doctor_id if isinstance(appointment.doctor_id, UUID) else UUID(str(appointment.doctor_id))
            
            # Créer le modèle avec les bonnes conversions de types
            appointment_model = AppointmentModel(
                id=appointment.id,
                patient_id=patient_id,
                doctor_id=doctor_id,
                start_time=appointment.start_time,
                end_time=appointment.end_time,
                status=AppointmentStatusModel(appointment.status.value),
                reason=appointment.reason,
                notes=appointment.notes,
                created_at=appointment.created_at,
                updated_at=appointment.updated_at,
                is_active=appointment.is_active
            )
            
            self.session.add(appointment_model)
            await self.session.commit()
            await self.session.refresh(appointment_model)
            
            logger.info(f"Rendez-vous créé avec succès: {appointment_model.id}")
            return self._map_to_entity(appointment_model)
        except Exception as e:
            logger.exception(f"Erreur lors de la création du rendez-vous: {str(e)}")
            await self.session.rollback()
            raise
    
    async def update(self, appointment: Appointment) -> Appointment:
        """
        Met à jour un rendez-vous existant.
        
        Args:
            appointment: Le rendez-vous à mettre à jour
            
        Returns:
            Appointment: Le rendez-vous mis à jour
        """
        try:
            logger.info(f"Mise à jour du rendez-vous: {appointment.id}")
            
            # S'assurer que les ID sont de type UUID
            patient_id = appointment.patient_id if isinstance(appointment.patient_id, UUID) else UUID(str(appointment.patient_id))
            doctor_id = appointment.doctor_id if isinstance(appointment.doctor_id, UUID) else UUID(str(appointment.doctor_id))
            
            query = (
                update(AppointmentModel)
                .where(AppointmentModel.id == appointment.id)
                .values(
                    patient_id=patient_id,
                    doctor_id=doctor_id,
                    start_time=appointment.start_time,
                    end_time=appointment.end_time,
                    status=AppointmentStatusModel(appointment.status.value),
                    reason=appointment.reason,
                    notes=appointment.notes,
                    updated_at=datetime.utcnow(),
                    is_active=appointment.is_active
                )
            )
            
            await self.session.execute(query)
            await self.session.commit()
            
            # Récupérer le rendez-vous mis à jour
            updated_appointment = await self.get_by_id(appointment.id)
            logger.info(f"Rendez-vous {appointment.id} mis à jour avec succès")
            return updated_appointment
        except Exception as e:
            logger.exception(f"Erreur lors de la mise à jour du rendez-vous {appointment.id}: {str(e)}")
            await self.session.rollback()
            raise
    
    async def delete(self, appointment_id: UUID) -> bool:
        """
        Supprime un rendez-vous.
        
        Args:
            appointment_id: L'ID du rendez-vous à supprimer
            
        Returns:
            bool: True si le rendez-vous a été supprimé, False sinon
        """
        query = delete(AppointmentModel).where(AppointmentModel.id == appointment_id)
        result = await self.session.execute(query)
        
        if result.rowcount == 0:
            return False
        
        await self.session.commit()
        return True
    
    async def list_all(self, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """
        Liste tous les rendez-vous avec pagination.
        
        Args:
            skip: Le nombre de rendez-vous à sauter
            limit: Le nombre maximum de rendez-vous à retourner
            
        Returns:
            List[Appointment]: La liste des rendez-vous
        """
        query = select(AppointmentModel).offset(skip).limit(limit)
        result = await self.session.execute(query)
        appointment_models = result.scalars().all()
        
        return [self._map_to_entity(appointment_model) for appointment_model in appointment_models]
    
    async def get_by_patient(self, patient_id: UUID, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """
        Récupère les rendez-vous d'un patient.
        
        Args:
            patient_id: L'ID du patient
            skip: Le nombre de rendez-vous à sauter
            limit: Le nombre maximum de rendez-vous à retourner
            
        Returns:
            List[Appointment]: La liste des rendez-vous du patient
        """
        query = (
            select(AppointmentModel)
            .where(AppointmentModel.patient_id == patient_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(query)
        appointment_models = result.scalars().all()
        
        return [self._map_to_entity(appointment_model) for appointment_model in appointment_models]
    
    async def get_by_doctor(self, doctor_id: UUID, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """
        Récupère les rendez-vous d'un médecin.
        
        Args:
            doctor_id: L'ID du médecin
            skip: Le nombre de rendez-vous à sauter
            limit: Le nombre maximum de rendez-vous à retourner
            
        Returns:
            List[Appointment]: La liste des rendez-vous du médecin
        """
        query = (
            select(AppointmentModel)
            .where(AppointmentModel.doctor_id == doctor_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(query)
        appointment_models = result.scalars().all()
        
        return [self._map_to_entity(appointment_model) for appointment_model in appointment_models]
    
    async def get_by_date_range(self, start_date: date, end_date: date, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """
        Récupère les rendez-vous dans une plage de dates.
        
        Args:
            start_date: La date de début
            end_date: La date de fin
            skip: Le nombre de rendez-vous à sauter
            limit: Le nombre maximum de rendez-vous à retourner
            
        Returns:
            List[Appointment]: La liste des rendez-vous dans la plage de dates
        """
        # Convertir les dates en datetime pour la requête
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        query = (
            select(AppointmentModel)
            .where(
                or_(
                    and_(
                        AppointmentModel.start_time >= start_datetime,
                        AppointmentModel.start_time <= end_datetime
                    ),
                    and_(
                        AppointmentModel.end_time >= start_datetime,
                        AppointmentModel.end_time <= end_datetime
                    )
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(query)
        appointment_models = result.scalars().all()
        
        return [self._map_to_entity(appointment_model) for appointment_model in appointment_models]
    
    async def count(self) -> int:
        """
        Compte le nombre total de rendez-vous.
        
        Returns:
            int: Le nombre total de rendez-vous
        """
        query = select(func.count()).select_from(AppointmentModel)
        result = await self.session.execute(query)
        return result.scalar_one()
    
    def _map_to_entity(self, appointment_model: AppointmentModel) -> Appointment:
        """
        Convertit un modèle SQLAlchemy en entité du domaine.
        
        Args:
            appointment_model: Le modèle SQLAlchemy à convertir
            
        Returns:
            Appointment: L'entité du domaine correspondante
        """
        try:
            return Appointment(
                id=appointment_model.id,
                patient_id=appointment_model.patient_id,
                doctor_id=appointment_model.doctor_id,
                start_time=appointment_model.start_time,
                end_time=appointment_model.end_time,
                status=AppointmentStatus(appointment_model.status.value),
                reason=appointment_model.reason,
                notes=appointment_model.notes,
                created_at=appointment_model.created_at,
                updated_at=appointment_model.updated_at,
                is_active=appointment_model.is_active
            )
        except Exception as e:
            logger.exception(f"Erreur lors de la conversion du modèle en entité: {str(e)}")
            raise