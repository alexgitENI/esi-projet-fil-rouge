from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from datetime import date

from shared.services.authenticator.extract_token import extract_token_payload
from shared.container.container import Container
from patient_management.application.dtos.patient_dtos import (
    PatientCreateDTO,
    PatientUpdateDTO,
    PatientResponseDTO,
    PatientListResponseDTO,
    PatientSearchDTO
)
from patient_management.application.usecases.create_patient_folder_usercase import CreatePatientFolderUseCase
from patient_management.application.usecases.update_patient_usecase import UpdatePatientUseCase
from patient_management.application.usecases.get_patient_usecase import GetPatientUseCase
from patient_management.domain.exceptions.patient_exceptions import (
    PatientNotFoundException,
    PatientAlreadyExistsException,
    MissingPatientConsentException,
    MissingRequiredFieldException,
    MissingGuardianConsentException
)

# Créer un router pour les endpoints des patients
router = APIRouter(prefix="/api/patients", tags=["patients"])

def get_container():
    """
    Fournit le container d'injection de dépendances.
    """
    return Container()

@router.post("/", response_model=PatientResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_patient(
    data: PatientCreateDTO,
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Crée un nouveau dossier patient.
    
    Args:
        data: Les données pour la création du patient
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        PatientResponseDTO: Le patient créé
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Vérifier si l'utilisateur a le droit de créer un patient
        user_role = token_payload.get("role")
        if user_role not in ["admin", "doctor", "nurse", "receptionist"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to create patient folders"
            )
        
        # Créer le cas d'utilisation avec les dépendances nécessaires
        use_case = CreatePatientFolderUseCase(
            patient_repository=container.patient_repository(),
            patient_service=container.patient_service(),
            id_generator=container.id_generator()
        )
        
        # Exécuter le cas d'utilisation
        result = await use_case.execute(data)
        
        return result
    
    except PatientAlreadyExistsException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    
    except MissingRequiredFieldException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except MissingGuardianConsentException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
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

@router.get("/{patient_id}", response_model=PatientResponseDTO)
async def get_patient(
    patient_id: UUID = Path(..., description="The ID of the patient to get"),
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Récupère un patient par son ID.
    
    Args:
        patient_id: L'ID du patient à récupérer
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        PatientResponseDTO: Le patient récupéré
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Récupérer l'ID de l'utilisateur à partir du token
        user_id = UUID(token_payload.get("sub"))
        
        # Créer le cas d'utilisation avec les dépendances nécessaires
        use_case = GetPatientUseCase(
            patient_repository=container.patient_repository(),
            patient_service=container.patient_service()
        )
        
        # Exécuter le cas d'utilisation
        result = await use_case.execute(patient_id, user_id)
        
        return result
    
    except PatientNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except MissingPatientConsentException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.put("/{patient_id}", response_model=PatientResponseDTO)
async def update_patient(
    patient_id: UUID = Path(..., description="The ID of the patient to update"),
    data: PatientUpdateDTO = None,
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Met à jour un patient existant.
    
    Args:
        patient_id: L'ID du patient à mettre à jour
        data: Les données pour la mise à jour du patient
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        PatientResponseDTO: Le patient mis à jour
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Vérifier si l'utilisateur a le droit de mettre à jour un patient
        user_role = token_payload.get("role")
        if user_role not in ["admin", "doctor", "nurse", "receptionist"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update patient folders"
            )
        
        # Créer le cas d'utilisation avec les dépendances nécessaires
        use_case = UpdatePatientUseCase(
            patient_repository=container.patient_repository(),
            patient_service=container.patient_service()
        )
        
        # Exécuter le cas d'utilisation
        result = await use_case.execute(patient_id, data or PatientUpdateDTO())
        
        return result
    
    except PatientNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except MissingRequiredFieldException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
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

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: UUID = Path(..., description="The ID of the patient to delete"),
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Supprime un patient.
    
    Args:
        patient_id: L'ID du patient à supprimer
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        None
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Vérifier si l'utilisateur a le droit de supprimer un patient
        user_role = token_payload.get("role")
        if user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can delete patient folders"
            )
        
        # Exécuter la suppression directement (pas besoin d'un cas d'utilisation dédié)
        patient_repository = container.patient_repository()
        success = await patient_repository.delete(patient_id)
        
        if not success:
            raise PatientNotFoundException(patient_id)
        
        return None
    
    except PatientNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/", response_model=PatientListResponseDTO)
async def list_patients(
    skip: int = Query(0, description="Number of patients to skip"),
    limit: int = Query(100, description="Maximum number of patients to return"),
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Liste tous les patients avec pagination.
    
    Args:
        skip: Le nombre de patients à sauter
        limit: Le nombre maximum de patients à retourner
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        PatientListResponseDTO: La liste des patients
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Vérifier si l'utilisateur a le droit de lister les patients
        user_role = token_payload.get("role")
        if user_role not in ["admin", "doctor", "nurse", "receptionist"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to list patients"
            )
        
        # Récupérer le repository des patients
        patient_repository = container.patient_repository()
        
        # Récupérer les patients
        patients = await patient_repository.list_all(skip, limit)
        
        # Compter le nombre total de patients
        total = await patient_repository.count()
        
        # Convertir les entités en DTOs de réponse
        patient_dtos = [
            PatientResponseDTO(
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
                gdpr_consent=patient.gdpr_consent,
                consent_date=patient.consent_date,
                insurance_provider=patient.insurance_provider,
                insurance_id=patient.insurance_id,
                notes=patient.notes,
                created_at=patient.created_at,
                updated_at=patient.updated_at,
                is_active=patient.is_active
            )
            for patient in patients
        ]
        
        # Construire la réponse
        response = PatientListResponseDTO(
            patients=patient_dtos,
            total=total,
            skip=skip,
            limit=limit
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.post("/search", response_model=PatientListResponseDTO)
async def search_patients(
    search_criteria: PatientSearchDTO,
    token_payload: Dict[str, Any] = Depends(extract_token_payload),
    container: Container = Depends(get_container)
):
    """
    Recherche des patients selon différents critères.
    
    Args:
        search_criteria: Les critères de recherche
        token_payload: Les informations du token JWT
        container: Le container d'injection de dépendances
        
    Returns:
        PatientListResponseDTO: La liste des patients correspondant aux critères
        
    Raises:
        HTTPException: En cas d'erreur
    """
    try:
        # Vérifier si l'utilisateur a le droit de rechercher des patients
        user_role = token_payload.get("role")
        if user_role not in ["admin", "doctor", "nurse", "receptionist"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to search patients"
            )
        
        # Récupérer le repository des patients
        patient_repository = container.patient_repository()
        
        # Rechercher les patients
        patients = await patient_repository.search(
            name=search_criteria.name,
            date_of_birth=search_criteria.date_of_birth,
            email=search_criteria.email,
            phone=search_criteria.phone,
            skip=search_criteria.skip,
            limit=search_criteria.limit
        )
        
        # Compter le nombre total de patients (approximatif)
        # Note: Dans une implémentation réelle, il faudrait compter le nombre total de patients
        # correspondant aux critères de recherche, sans la pagination
        total = len(patients)
        
        # Convertir les entités en DTOs de réponse
        patient_dtos = [
            PatientResponseDTO(
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
                gdpr_consent=patient.gdpr_consent,
                consent_date=patient.consent_date,
                insurance_provider=patient.insurance_provider,
                insurance_id=patient.insurance_id,
                notes=patient.notes,
                created_at=patient.created_at,
                updated_at=patient.updated_at,
                is_active=patient.is_active
            )
            for patient in patients
        ]
        
        # Construire la réponse
        response = PatientListResponseDTO(
            patients=patient_dtos,
            total=total,
            skip=search_criteria.skip,
            limit=search_criteria.limit
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )