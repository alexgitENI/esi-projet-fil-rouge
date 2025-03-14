from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
from uuid import UUID

# DTOs pour la création et la mise à jour de rendez-vous
class AppointmentCreateDTO(BaseModel):
    """DTO pour la création d'un rendez-vous"""
    patient_id: UUID
    doctor_id: UUID
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = None
    notes: Optional[str] = None
    
    @validator('end_time')
    def validate_end_time(cls, end_time, values):
        """Valide que l'heure de fin est après l'heure de début"""
        if 'start_time' in values and end_time <= values['start_time']:
            raise ValueError("L'heure de fin doit être après l'heure de début")
        return end_time

class AppointmentUpdateDTO(BaseModel):
    """DTO pour la mise à jour d'un rendez-vous"""
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    
    @validator('end_time')
    def validate_end_time(cls, end_time, values):
        """Valide que l'heure de fin est après l'heure de début"""
        if 'start_time' in values and values['start_time'] and end_time <= values['start_time']:
            raise ValueError("L'heure de fin doit être après l'heure de début")
        return end_time

# DTOs pour les réponses
class AppointmentResponseDTO(BaseModel):
    """DTO pour la réponse avec un rendez-vous"""
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    start_time: datetime
    end_time: datetime
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        orm_mode = True

class AppointmentListResponseDTO(BaseModel):
    """DTO pour la réponse avec une liste de rendez-vous"""
    appointments: List[AppointmentResponseDTO]
    total: int
    skip: int
    limit: int