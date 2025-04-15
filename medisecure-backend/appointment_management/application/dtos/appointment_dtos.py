# medisecure-backend/appointment_management/application/dtos/appointment_dtos.py
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
    
    class Config:
        # Configuration pour que Pydantic accepte et valide correctement les UUID
        json_encoders = {
            UUID: str
        }
    
    @validator('end_time')
    def validate_end_time(cls, end_time, values):
        """Valide que l'heure de fin est après l'heure de début"""
        if 'start_time' in values and end_time <= values['start_time']:
            raise ValueError("L'heure de fin doit être après l'heure de début")
        return end_time
    
    @validator('patient_id', 'doctor_id', pre=True)
    def validate_uuid(cls, v):
        """Valide et convertit les champs UUID"""
        if isinstance(v, str):
            return UUID(v)
        return v
    
    @validator('start_time', 'end_time', pre=True)
    def validate_datetime(cls, v):
        """Valide et convertit les dates et heures"""
        if isinstance(v, str):
            try:
                # Traiter les dates ISO avec ou sans 'Z'
                if v.endswith('Z'):
                    v = v[:-1] + '+00:00'
                return datetime.fromisoformat(v)
            except ValueError:
                raise ValueError(f"Format de date invalide: {v}. Utilisez le format ISO 8601.")
        return v

class AppointmentUpdateDTO(BaseModel):
    """DTO pour la mise à jour d'un rendez-vous"""
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        # Configuration pour que Pydantic accepte et valide correctement les UUID
        json_encoders = {
            UUID: str
        }
    
    @validator('end_time')
    def validate_end_time(cls, end_time, values):
        """Valide que l'heure de fin est après l'heure de début"""
        if 'start_time' in values and values['start_time'] and end_time <= values['start_time']:
            raise ValueError("L'heure de fin doit être après l'heure de début")
        return end_time
    
    @validator('start_time', 'end_time', pre=True)
    def validate_datetime(cls, v):
        """Valide et convertit les dates et heures"""
        if isinstance(v, str):
            try:
                # Traiter les dates ISO avec ou sans 'Z'
                if v.endswith('Z'):
                    v = v[:-1] + '+00:00'
                return datetime.fromisoformat(v)
            except ValueError:
                raise ValueError(f"Format de date invalide: {v}. Utilisez le format ISO 8601.")
        return v
    
    @validator('status')
    def validate_status(cls, v):
        """Valide que le statut est valide"""
        if v is not None:
            valid_statuses = ['scheduled', 'confirmed', 'cancelled', 'completed', 'missed']
            if v not in valid_statuses:
                raise ValueError(f"Statut invalide. Les valeurs valides sont: {', '.join(valid_statuses)}")
        return v

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
        json_encoders = {
            UUID: str
        }

class AppointmentListResponseDTO(BaseModel):
    """DTO pour la réponse avec une liste de rendez-vous"""
    appointments: List[AppointmentResponseDTO]
    total: int
    skip: int
    limit: int