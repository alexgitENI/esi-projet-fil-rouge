from typing import Optional
from datetime import datetime, date
from uuid import UUID

from appointment_management.domain.entities.appointment import Appointment, AppointmentStatus
from patient_management.domain.exceptions.patient_exceptions import PatientNotFoundException

class AppointmentService:
    """
    Service du domaine pour les opérations liées aux rendez-vous.
    Contient la logique métier pour la gestion des rendez-vous.
    """
    
    def validate_appointment_times(self, start_time: datetime, end_time: datetime) -> None:
        """
        Valide les heures de début et de fin d'un rendez-vous.
        
        Args:
            start_time: L'heure de début du rendez-vous
            end_time: L'heure de fin du rendez-vous
            
        Raises:
            ValueError: Si l'heure de fin est avant ou égale à l'heure de début
        """
        if end_time <= start_time:
            raise ValueError("L'heure de fin doit être après l'heure de début")
    
    def check_appointment_overlap(
        self, 
        existing_appointments: list[Appointment], 
        start_time: datetime, 
        end_time: datetime,
        appointment_id: Optional[UUID] = None
    ) -> bool:
        """
        Vérifie si un rendez-vous chevauche des rendez-vous existants.
        
        Args:
            existing_appointments: Liste des rendez-vous existants à vérifier
            start_time: L'heure de début du nouveau rendez-vous
            end_time: L'heure de fin du nouveau rendez-vous
            appointment_id: L'ID du rendez-vous à exclure de la vérification (pour les mises à jour)
            
        Returns:
            bool: True si le rendez-vous chevauche un autre, False sinon
        """
        for appointment in existing_appointments:
            # Ignorer le rendez-vous lui-même pour les mises à jour
            if appointment_id and appointment.id == appointment_id:
                continue
                
            # Ignorer les rendez-vous annulés
            if appointment.status == AppointmentStatus.CANCELLED:
                continue
                
            # Vérifier si les plages horaires se chevauchent
            if (
                (start_time < appointment.end_time and end_time > appointment.start_time) or
                (start_time == appointment.start_time and end_time == appointment.end_time)
            ):
                return True
                
        return False
    
    def get_available_slots(
        self, 
        existing_appointments: list[Appointment], 
        date_to_check: date,
        slot_duration_minutes: int = 30,
        start_hour: int = 8,
        end_hour: int = 18
    ) -> list[dict]:
        """
        Trouve les créneaux disponibles pour une date donnée.
        
        Args:
            existing_appointments: Liste des rendez-vous existants pour cette date
            date_to_check: La date pour laquelle chercher des créneaux
            slot_duration_minutes: La durée d'un créneau en minutes
            start_hour: L'heure de début de la journée
            end_hour: L'heure de fin de la journée
            
        Returns:
            list[dict]: Liste des créneaux disponibles avec heure de début et de fin
        """
        # Filtrer les rendez-vous pour la date spécifiée
        date_appointments = [
            appointment for appointment in existing_appointments
            if appointment.start_time.date() == date_to_check
            and appointment.status != AppointmentStatus.CANCELLED
        ]
        
        # Créer des créneaux pour toute la journée
        all_slots = []
        current_time = datetime.combine(date_to_check, datetime.min.time().replace(hour=start_hour))
        end_time = datetime.combine(date_to_check, datetime.min.time().replace(hour=end_hour))
        
        while current_time < end_time:
            slot_end = current_time.replace(minute=current_time.minute + slot_duration_minutes)
            all_slots.append({
                "start": current_time,
                "end": slot_end,
                "available": True
            })
            current_time = slot_end
        
        # Marquer les créneaux occupés
        for appointment in date_appointments:
            for slot in all_slots:
                # Si le rendez-vous chevauche le créneau, marquer comme non disponible
                if (
                    (appointment.start_time < slot["end"] and appointment.end_time > slot["start"]) or
                    (appointment.start_time == slot["start"] and appointment.end_time == slot["end"])
                ):
                    slot["available"] = False
        
        # Retourner uniquement les créneaux disponibles
        available_slots = [slot for slot in all_slots if slot["available"]]
        
        return available_slots