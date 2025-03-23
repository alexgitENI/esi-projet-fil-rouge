from enum import Enum, auto

class UserRole(str, Enum):
    """Enumération des rôles d'utilisateurs dans le système"""
    ADMIN = "admin" 
    DOCTOR = "doctor"
    NURSE = "nurse"
    PATIENT = "patient"
    RECEPTIONIST = "receptionist"