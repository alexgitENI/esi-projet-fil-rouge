import pytest
from datetime import date, datetime, timedelta
from uuid import uuid4

from patient_management.domain.entities.patient import Patient
from patient_management.domain.services.patient_service import PatientService
from patient_management.domain.exceptions.patient_exceptions import (
    MissingPatientConsentException,
    MissingGuardianConsentException,
    MissingRequiredFieldException
)

@pytest.fixture
def patient_service():
    """Fixture pour créer une instance de PatientService pour les tests"""
    return PatientService()

@pytest.fixture
def sample_patient():
    """Fixture pour créer un patient de test"""
    return Patient(
        id=uuid4(),
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1980, 1, 1),
        gender="male",
        email="john.doe@example.com",
        has_consent=True,
        gdpr_consent=True,
        consent_date=datetime.utcnow()
    )

def test_validate_patient_data_valid(patient_service):
    """Test la validation de données patient valides"""
    # Arrange
    first_name = "John"
    last_name = "Doe"
    date_of_birth = date(1980, 1, 1)
    gender = "male"
    
    # Act & Assert
    # Si tout est valide, la fonction ne devrait pas lever d'exception
    patient_service.validate_patient_data(first_name, last_name, date_of_birth, gender)

def test_validate_patient_data_missing_first_name(patient_service):
    """Test la validation de données patient avec prénom manquant"""
    # Arrange
    first_name = ""
    last_name = "Doe"
    date_of_birth = date(1980, 1, 1)
    gender = "male"
    
    # Act & Assert
    with pytest.raises(MissingRequiredFieldException) as excinfo:
        patient_service.validate_patient_data(first_name, last_name, date_of_birth, gender)
    
    assert "first_name" in str(excinfo.value)

def test_validate_patient_data_missing_last_name(patient_service):
    """Test la validation de données patient avec nom manquant"""
    # Arrange
    first_name = "John"
    last_name = ""
    date_of_birth = date(1980, 1, 1)
    gender = "male"
    
    # Act & Assert
    with pytest.raises(MissingRequiredFieldException) as excinfo:
        patient_service.validate_patient_data(first_name, last_name, date_of_birth, gender)
    
    assert "last_name" in str(excinfo.value)

def test_validate_patient_data_missing_date_of_birth(patient_service):
    """Test la validation de données patient avec date de naissance manquante"""
    # Arrange
    first_name = "John"
    last_name = "Doe"
    date_of_birth = None
    gender = "male"
    
    # Act & Assert
    with pytest.raises(MissingRequiredFieldException) as excinfo:
        patient_service.validate_patient_data(first_name, last_name, date_of_birth, gender)
    
    assert "date_of_birth" in str(excinfo.value)

def test_validate_patient_data_missing_gender(patient_service):
    """Test la validation de données patient avec genre manquant"""
    # Arrange
    first_name = "John"
    last_name = "Doe"
    date_of_birth = date(1980, 1, 1)
    gender = ""
    
    # Act & Assert
    with pytest.raises(MissingRequiredFieldException) as excinfo:
        patient_service.validate_patient_data(first_name, last_name, date_of_birth, gender)
    
    assert "gender" in str(excinfo.value)

def test_validate_patient_data_future_date_of_birth(patient_service):
    """Test la validation de données patient avec date de naissance dans le futur"""
    # Arrange
    first_name = "John"
    last_name = "Doe"
    date_of_birth = date.today() + timedelta(days=1)
    gender = "male"
    
    # Act & Assert
    with pytest.raises(ValueError) as excinfo:
        patient_service.validate_patient_data(first_name, last_name, date_of_birth, gender)
    
    assert "future" in str(excinfo.value)

def test_check_consent_for_minor_with_consent(patient_service, monkeypatch):
    """Test la vérification du consentement pour un mineur avec consentement"""
    # Arrange
    patient = Patient(
        id=uuid4(),
        first_name="Child",
        last_name="Doe",
        date_of_birth=date.today() - timedelta(days=365 * 10),  # 10 ans
        gender="male"
    )
    
    # Mock de la propriété age pour qu'elle retourne 10
    monkeypatch.setattr(patient, "age", 10)
    
    # Act & Assert
    # Si le tuteur a donné son consentement, la fonction ne devrait pas lever d'exception
    patient_service.check_consent_for_minor(patient, True)

def test_check_consent_for_minor_without_consent(patient_service, monkeypatch):
    """Test la vérification du consentement pour un mineur sans consentement"""
    # Arrange
    patient = Patient(
        id=uuid4(),
        first_name="Child",
        last_name="Doe",
        date_of_birth=date.today() - timedelta(days=365 * 10),  # 10 ans
        gender="male"
    )
    
    # Mock de la propriété age pour qu'elle retourne 10
    monkeypatch.setattr(patient, "age", 10)
    
    # Act & Assert
    with pytest.raises(MissingGuardianConsentException) as excinfo:
        patient_service.check_consent_for_minor(patient, False)
    
    assert str(patient.id) in str(excinfo.value)

def test_check_consent_for_adult(patient_service, monkeypatch):
    """Test la vérification du consentement pour un adulte"""
    # Arrange
    patient = Patient(
        id=uuid4(),
        first_name="Adult",
        last_name="Doe",
        date_of_birth=date.today() - timedelta(days=365 * 30),  # 30 ans
        gender="male"
    )
    
    # Mock de la propriété age pour qu'elle retourne 30
    monkeypatch.setattr(patient, "age", 30)
    
    # Act & Assert
    # Même si le tuteur n'a pas donné son consentement, la fonction ne devrait pas lever d'exception
    # car le patient est un adulte
    patient_service.check_consent_for_minor(patient, False)

def test_check_access_permission_with_consent(patient_service, sample_patient):
    """Test la vérification de la permission d'accès avec consentement"""
    # Arrange
    user_id = uuid4()
    
    # Act & Assert
    # Si le patient a donné son consentement, la fonction ne devrait pas lever d'exception
    patient_service.check_access_permission(sample_patient, user_id)

def test_check_access_permission_without_consent(patient_service, sample_patient):
    """Test la vérification de la permission d'accès sans consentement"""
    # Arrange
    user_id = uuid4()
    sample_patient.has_consent = False
    
    # Act & Assert
    with pytest.raises(MissingPatientConsentException) as excinfo:
        patient_service.check_access_permission(sample_patient, user_id)
    
    assert str(sample_patient.id) in str(excinfo.value)