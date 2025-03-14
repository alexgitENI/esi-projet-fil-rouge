from uuid import UUID
from datetime import datetime

from appointment_management.domain.entities.appointment import Appointment, AppointmentStatus
from appointment_management.domain.services.appointment_service import AppointmentService
from appointment_management.domain.ports.secondary.appointment_repository_protocol import AppointmentRepositoryProtocol
from appointment_management.application.dtos.appointment_dtos import AppointmentCreateDTO, AppointmentResponseDTO
from patient_management.domain.ports.secondary.patient_repository_protocol import PatientRepositoryProtocol
from shared.ports.primary.id_generator_protocol import IdGeneratorProtocol
from patient_management.domain.exceptions.patient_exceptions import PatientNotFoundException

class ScheduleAppointmentUseCase:
    """
    Cas d'utilisation pour la planification d'un rendez-vous.
    Orchestrer la logique de planification d'un nouveau rendez-vous.
    """
    
    def __init__(
        self,
        appointment_repository: AppointmentRepositoryProtocol,
        patient_repository: PatientRepositoryProtocol,
        appointment_service: AppointmentService,
        id_generator: IdGeneratorProtocol
    ):
        """
        Initialise le cas d'utilisation avec les dépendances nécessaires.
        
        Args:
            appointment_repository: Le repository des rendez-vous
            patient_repository: Le repository des patients
            appointment_service: Le service du domaine pour les rendez-vous
            id_generator: Le générateur d'identifiants
        """
        self.appointment_repository = appointment_repository
        self.patient_repository = patient_repository
        self.appointment_service = appointment_service
        self.id_generator = id_generator
    
    async def execute(self, data: AppointmentCreateDTO) -> AppointmentResponseDTO:
        """
        Exécute le cas d'utilisation.
        
        Args:
            data: Les données pour la création du rendez-vous
            
        Returns:
            AppointmentResponseDTO: Le rendez-vous créé
            
        Raises:
            PatientNotFoundException: Si le patient n'est pas trouvé
            ValueError: Si les heures de début et de fin sont invalides
        """
        # Valider les heures de début et de fin
        self.appointment_service.validate_appointment_times(data.start_time, data.end_time)
        
        # Vérifier si le patient existe
        patient = await self.patient_repository.get_by_id(data.patient_id)
        if not patient:
            raise PatientNotFoundException(data.patient_id)
        
        # Vérifier si le créneau est disponible (aucun chevauchement)
        existing_appointments = await self.appointment_repository.get_by_doctor(
            data.doctor_id, 
            skip=0, 
            limit=1000
        )
        
        if self.appointment_service.check_appointment_overlap(
            existing_appointments, 
            data.start_time, 
            data.end_time
        ):
            raise ValueError("Ce créneau horaire est déjà occupé par un autre rendez-vous")
        
        # Générer un ID pour le rendez-vous
        appointment_id = self.id_generator.generate_id()
        
        # Créer l'entité Appointment
        appointment = Appointment(
            id=appointment_id,
            patient_id=data.patient_id,
            doctor_id=data.doctor_id,
            start_time=data.start_time,
            end_time=data.end_time,
            status=AppointmentStatus.SCHEDULED,
            reason=data.reason,
            notes=data.notes
        )
        
        # Sauvegarder le rendez-vous
        created_appointment = await self.appointment_repository.create(appointment)
        
        # Convertir l'entité en DTO de réponse
        return AppointmentResponseDTO(
            id=created_appointment.id,
            patient_id=created_appointment.patient_id,
            doctor_id=created_appointment.doctor_id,
            start_time=created_appointment.start_time,
            end_time=created_appointment.end_time,
            status=created_appointment.status.value,
            reason=created_appointment.reason,
            notes=created_appointment.notes,
            created_at=created_appointment.created_at,
            updated_at=created_appointment.updated_at,
            is_active=created_appointment.is_active
        )