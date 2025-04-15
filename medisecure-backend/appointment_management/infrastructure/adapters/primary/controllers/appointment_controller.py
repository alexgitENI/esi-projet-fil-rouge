# medisecure-backend/appointment_management/infrastructure/adapters/primary/controllers/appointment_controller.py

from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from datetime import date, timedelta, datetime
import logging

from shared.services.authenticator.extract_token import extract_token_payload
from shared.container.container import Container
from appointment_management.application.dtos.appointment_dtos import (
    AppointmentCreateDTO,
    AppointmentUpdateDTO,
    AppointmentResponseDTO,
    AppointmentListResponseDTO
)
from appointment_management.application.usecases.schedule_appointment_usecase import ScheduleAppointmentUseCase
from appointment_management.application.usecases.update_appointment_usecase import UpdateAppointmentUseCase
from appointment_management.application.usecases.get_patient_appointments_usecase import GetPatientAppointmentsUseCase
from appointment_management.domain.entities.appointment import AppointmentStatus
from patient_management.domain.exceptions.patient_exceptions import PatientNotFoundException

# Configuration du logging
logger = logging.getLogger(__name__)

# Créer un router pour les endpoints des rendez-vous
router = APIRouter(prefix="/appointments", tags=["appointments"])

def check_role_permission(role: str, allowed_roles: list) -> bool:
    """
    Vérifie si un rôle est autorisé, indépendamment de la casse.
    
    Args:
        role: Le rôle à vérifier
        allowed_roles: Liste des rôles autorisés
        
    Returns:
        bool: True si le rôle est autorisé, False sinon
    """
    if not role:
        return False
    
    # Normaliser le rôle et les rôles autorisés pour la comparaison
    role_lower = role.lower()
    allowed_roles_lower = [r.lower() for r in allowed_roles]
    
    return role_lower in allowed_roles_lower

def get_container():
    """
    Fournit le container d'injection de dépendances.
    """
    return Container()

@router.post("/", response_model=AppointmentResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    data: AppointmentCreateDTO,
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Crée un nouveau rendez-vous.
    """
    try:
        # Journaliser les données reçues
        logger.info(f"Données reçues pour la création d'un rendez-vous: {data}")
        
        # Vérifier si l'utilisateur a le droit de créer un rendez-vous
        user_role = token_payload.get("role", "")
        allowed_roles = ["admin", "doctor", "nurse", "receptionist"]
        
        if not check_role_permission(user_role, allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to create appointments"
            )
        
        # Créer le cas d'utilisation avec les dépendances nécessaires
        use_case = ScheduleAppointmentUseCase(
            appointment_repository=container.appointment_repository(),
            patient_repository=container.patient_repository(),
            appointment_service=container.appointment_service(),
            id_generator=container.id_generator()
        )
        
        # Valider les dates avant de les envoyer au cas d'utilisation
        try:
            # Vérifier et formater les dates si nécessaire
            if isinstance(data.start_time, str):
                data.start_time = datetime.fromisoformat(data.start_time.replace('Z', '+00:00'))
            if isinstance(data.end_time, str):
                data.end_time = datetime.fromisoformat(data.end_time.replace('Z', '+00:00'))
                
            logger.info(f"Dates après conversion: start_time={data.start_time}, end_time={data.end_time}")
        except ValueError as e:
            logger.error(f"Erreur lors de la conversion des dates: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date format: {str(e)}"
            )
        
        # Exécuter le cas d'utilisation
        try:
            logger.info("Tentative d'exécution du cas d'utilisation ScheduleAppointmentUseCase")
            result = await use_case.execute(data)
            logger.info(f"Rendez-vous créé avec succès: {result.id}")
            return result
        except Exception as e:
            logger.exception(f"Erreur pendant l'exécution du cas d'utilisation: {str(e)}")
            raise
    
    except PatientNotFoundException as e:
        logger.error(f"Patient non trouvé: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except ValueError as e:
        logger.error(f"Erreur de validation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        logger.exception(f"Erreur inattendue lors de la création du rendez-vous: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )