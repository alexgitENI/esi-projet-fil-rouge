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
        user_role = token_payload.get("role")
        if user_role not in ["admin", "doctor", "nurse", "receptionist"]:
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

@router.get("/", response_model=AppointmentListResponseDTO)
async def list_appointments(
    startDate: Optional[str] = Query(None, description="Start date (format: YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (format: YYYY-MM-DD)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by appointment status"),
    patientId: Optional[UUID] = Query(None, description="Filter by patient ID"),
    doctorId: Optional[UUID] = Query(None, description="Filter by doctor ID"),
    skip: int = Query(0, description="Number of appointments to skip"),
    limit: int = Query(100, description="Maximum number of appointments to return"),
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Liste tous les rendez-vous avec filtrage par date et pagination.
    """
    try:
        # Vérifier les permissions
        user_role = token_payload.get("role")
        if not user_role or user_role.lower() not in ["admin", "doctor", "nurse", "receptionist"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to list appointments"
            )
        
        # Convertir les dates si elles sont fournies
        start_date = None
        end_date = None
        
        if startDate:
            try:
                start_date = date.fromisoformat(startDate)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start date format. Use YYYY-MM-DD"
                )
        
        if endDate:
            try:
                end_date = date.fromisoformat(endDate)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end date format. Use YYYY-MM-DD"
                )
        
        # Vérifier que la date de fin est après la date de début
        if start_date and end_date and end_date < start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after start date"
            )

        # Récupérer le repository
        appointment_repository = container.appointment_repository()
        
        # Filtrage et récupération des rendez-vous
        try:
            appointments = []
            
            if patientId:
                # Priorité au filtrage par patient
                appointments = await appointment_repository.get_by_patient(patientId, skip, limit)
            elif doctorId:
                # Filtrage par médecin
                appointments = await appointment_repository.get_by_doctor(doctorId, skip, limit)
            elif start_date and end_date:
                # Filtrage par plage de dates
                appointments = await appointment_repository.get_by_date_range(start_date, end_date, skip, limit)
            else:
                # Pas de filtrage, récupérer tous les rendez-vous
                appointments = await appointment_repository.list_all(skip, limit)
            
            # Filtrage par statut si fourni
            if status_filter:
                try:
                    status_enum = AppointmentStatus(status_filter)
                    appointments = [apt for apt in appointments if apt.status == status_enum]
                except ValueError:
                    # Statut invalide, ignorer le filtre
                    pass
            
            # Conversion en DTOs
            appointment_dtos = []
            for appointment in appointments:
                appointment_dtos.append(
                    AppointmentResponseDTO(
                        id=appointment.id,
                        patient_id=appointment.patient_id,
                        doctor_id=appointment.doctor_id,
                        start_time=appointment.start_time,
                        end_time=appointment.end_time,
                        status=appointment.status.value,
                        reason=appointment.reason,
                        notes=appointment.notes,
                        created_at=appointment.created_at,
                        updated_at=appointment.updated_at,
                        is_active=appointment.is_active
                    )
                )
            
            # Réponse finale
            return AppointmentListResponseDTO(
                appointments=appointment_dtos,
                total=len(appointments),
                skip=skip,
                limit=limit
            )
            
        except Exception as e:
            # En cas d'erreur, retourner une liste vide plutôt qu'une erreur 500
            return AppointmentListResponseDTO(
                appointments=[],
                total=0,
                skip=skip,
                limit=limit
            )
    
    except HTTPException:
        # Remonter les erreurs HTTP pour qu'elles soient correctement gérées
        raise
    
    except Exception as e:
        # Capturer toutes les autres exceptions et retourner une liste vide
        return AppointmentListResponseDTO(
            appointments=[],
            total=0,
            skip=skip,
            limit=limit
        )

@router.put("/{appointment_id}", response_model=AppointmentResponseDTO)
async def update_appointment(
    appointment_id: UUID = Path(..., description="The ID of the appointment to update"),
    data: AppointmentUpdateDTO = None,
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Met à jour un rendez-vous existant.
    
    Args:
        appointment_id: L'ID du rendez-vous à mettre à jour
        data: Les données pour la mise à jour du rendez-vous
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        AppointmentResponseDTO: Le rendez-vous mis à jour
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Vérifier si l'utilisateur a le droit de mettre à jour un rendez-vous
        user_role = token_payload.get("role")
        if user_role not in ["admin", "doctor", "nurse", "receptionist"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update appointments"
            )
        
        # Créer le cas d'utilisation avec les dépendances nécessaires
        use_case = UpdateAppointmentUseCase(
            appointment_repository=container.appointment_repository(),
            appointment_service=container.appointment_service()
        )
        
        # Exécuter le cas d'utilisation
        result = await use_case.execute(appointment_id, data or AppointmentUpdateDTO())
        
        return result
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    appointment_id: UUID = Path(..., description="The ID of the appointment to delete"),
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Supprime un rendez-vous.
    
    Args:
        appointment_id: L'ID du rendez-vous à supprimer
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        None
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Vérifier si l'utilisateur a le droit de supprimer un rendez-vous
        user_role = token_payload.get("role")
        if user_role not in ["admin", "doctor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators and doctors can delete appointments"
            )
        
        # Supprimer le rendez-vous
        appointment_repository = container.appointment_repository()
        success = await appointment_repository.delete(appointment_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment with ID {appointment_id} not found"
            )
        
        return None
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/patient/{patient_id}", response_model=AppointmentListResponseDTO)
async def get_patient_appointments(
    patient_id: UUID = Path(..., description="The ID of the patient"),
    skip: int = Query(0, description="Number of appointments to skip"),
    limit: int = Query(100, description="Maximum number of appointments to return"),
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Récupère les rendez-vous d'un patient.
    
    Args:
        patient_id: L'ID du patient
        skip: Le nombre de rendez-vous à sauter
        limit: Le nombre maximum de rendez-vous à retourner
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        AppointmentListResponseDTO: La liste des rendez-vous du patient
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Créer le cas d'utilisation avec les dépendances nécessaires
        use_case = GetPatientAppointmentsUseCase(
            appointment_repository=container.appointment_repository(),
            patient_repository=container.patient_repository()
        )
        
        # Exécuter le cas d'utilisation
        result = await use_case.execute(patient_id, skip, limit)
        
        return result
    
    except PatientNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except Exception as e:
        # Retourner une liste vide en cas d'erreur
        return AppointmentListResponseDTO(
            appointments=[],
            total=0,
            skip=skip,
            limit=limit
        )

@router.get("/doctor/{doctor_id}", response_model=AppointmentListResponseDTO)
async def get_doctor_appointments(
    doctor_id: UUID = Path(..., description="The ID of the doctor"),
    skip: int = Query(0, description="Number of appointments to skip"),
    limit: int = Query(100, description="Maximum number of appointments to return"),
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Récupère les rendez-vous d'un médecin.
    
    Args:
        doctor_id: L'ID du médecin
        skip: Le nombre de rendez-vous à sauter
        limit: Le nombre maximum de rendez-vous à retourner
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        AppointmentListResponseDTO: La liste des rendez-vous du médecin
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Récupérer les rendez-vous du médecin
        appointment_repository = container.appointment_repository()
        appointments = await appointment_repository.get_by_doctor(doctor_id, skip, limit)
        
        # Compter le nombre total de rendez-vous (approximatif sans pagination)
        total = len(appointments)
        
        # Convertir les entités en DTOs de réponse
        appointment_dtos = []
        for appointment in appointments:
            appointment_dtos.append(
                AppointmentResponseDTO(
                    id=appointment.id,
                    patient_id=appointment.patient_id,
                    doctor_id=appointment.doctor_id,
                    start_time=appointment.start_time,
                    end_time=appointment.end_time,
                    status=appointment.status.value,
                    reason=appointment.reason,
                    notes=appointment.notes,
                    created_at=appointment.created_at,
                    updated_at=appointment.updated_at,
                    is_active=appointment.is_active
                )
            )
        
        # Construire la réponse
        response = AppointmentListResponseDTO(
            appointments=appointment_dtos,
            total=total,
            skip=skip,
            limit=limit
        )
        
        return response
    
    except Exception as e:
        # Retourner une liste vide en cas d'erreur
        return AppointmentListResponseDTO(
            appointments=[],
            total=0,
            skip=skip,
            limit=limit
        )

@router.get("/calendar", response_model=AppointmentListResponseDTO)
async def get_calendar_appointments(
    year: int = Query(..., description="Year of the calendar"),
    month: int = Query(..., description="Month of the calendar (1-12)"),
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Récupère les rendez-vous pour un mois spécifique.
    
    Args:
        year: L'année du calendrier
        month: Le mois du calendrier (1-12)
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        AppointmentListResponseDTO: La liste des rendez-vous pour le mois spécifié
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Vérifier si le mois est valide
        if month < 1 or month > 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Month must be between 1 and 12"
            )
        
        # Calculer la plage de dates pour le mois
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        # Récupérer les rendez-vous pour cette plage de dates
        appointment_repository = container.appointment_repository()
        appointments = await appointment_repository.get_by_date_range(start_date, end_date)
        
        # Compter le nombre total de rendez-vous
        total = len(appointments)
        
        # Convertir les entités en DTOs de réponse
        appointment_dtos = []
        for appointment in appointments:
            appointment_dtos.append(
                AppointmentResponseDTO(
                    id=appointment.id,
                    patient_id=appointment.patient_id,
                    doctor_id=appointment.doctor_id,
                    start_time=appointment.start_time,
                    end_time=appointment.end_time,
                    status=appointment.status.value,
                    reason=appointment.reason,
                    notes=appointment.notes,
                    created_at=appointment.created_at,
                    updated_at=appointment.updated_at,
                    is_active=appointment.is_active
                )
            )
        
        # Construire la réponse
        response = AppointmentListResponseDTO(
            appointments=appointment_dtos,
            total=total,
            skip=0,
            limit=total
        )
        
        return response
    
    except HTTPException:
        raise
    
    except Exception as e:
        # Retourner une liste vide en cas d'erreur
        return AppointmentListResponseDTO(
            appointments=[],
            total=0,
            skip=0,
            limit=100
        )