// src/api/services/patientService.ts
import apiClient from "../apiClient";
import { ENDPOINTS } from "../endpoints";
import {
  Patient,
  PatientCreateDto,
  PatientUpdateDto,
} from "../../types/patient.types";

// Interface pour adapter les réponses de l'API
interface PatientListResponse {
  patients: Patient[];
  total: number;
  skip: number;
  limit: number;
}

// Fonction pour adapter les DTO du front vers le back
const adaptPatientCreateDto = (frontDto: PatientCreateDto): any => {
  return {
    first_name: frontDto.firstName,
    last_name: frontDto.lastName,
    date_of_birth: frontDto.dateOfBirth,
    gender: frontDto.gender,
    email: frontDto.email,
    phone_number: frontDto.phone,
    address: frontDto.address,
    insurance_id: frontDto.insuranceNumber,
    notes: frontDto.medicalHistory,
    has_consent: true, // Par défaut, on suppose que le consentement est donné
    gdpr_consent: true,
  };
};

// Fonction pour adapter les DTO du back vers le front
const adaptPatientFromApi = (backDto: any): Patient => {
  return {
    id: backDto.id,
    firstName: backDto.first_name,
    lastName: backDto.last_name,
    dateOfBirth: backDto.date_of_birth,
    gender: backDto.gender as "male" | "female" | "other",
    email: backDto.email,
    phone: backDto.phone_number,
    address: backDto.address,
    insuranceNumber: backDto.insurance_id,
    medicalHistory: backDto.notes,
    createdAt: backDto.created_at,
    updatedAt: backDto.updated_at,
  };
};

// Fonction pour adapter les DTO de mise à jour
const adaptPatientUpdateDto = (frontDto: PatientUpdateDto): any => {
  const backDto: any = {};

  if (frontDto.firstName !== undefined) backDto.first_name = frontDto.firstName;
  if (frontDto.lastName !== undefined) backDto.last_name = frontDto.lastName;
  if (frontDto.dateOfBirth !== undefined)
    backDto.date_of_birth = frontDto.dateOfBirth;
  if (frontDto.gender !== undefined) backDto.gender = frontDto.gender;
  if (frontDto.email !== undefined) backDto.email = frontDto.email;
  if (frontDto.phone !== undefined) backDto.phone_number = frontDto.phone;
  if (frontDto.address !== undefined) backDto.address = frontDto.address;
  if (frontDto.insuranceNumber !== undefined)
    backDto.insurance_id = frontDto.insuranceNumber;
  if (frontDto.medicalHistory !== undefined)
    backDto.notes = frontDto.medicalHistory;

  return backDto;
};

const patientService = {
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await apiClient.get<PatientListResponse>(
      ENDPOINTS.PATIENTS.BASE
    );
    return response.patients.map(adaptPatientFromApi);
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await apiClient.get<any>(ENDPOINTS.PATIENTS.DETAIL(id));
    return adaptPatientFromApi(response);
  },

  createPatient: async (patient: PatientCreateDto): Promise<Patient> => {
    const adaptedPatient = adaptPatientCreateDto(patient);
    const response = await apiClient.post<any>(
      ENDPOINTS.PATIENTS.BASE,
      adaptedPatient
    );
    return adaptPatientFromApi(response);
  },

  updatePatient: async (
    id: string,
    patient: PatientUpdateDto
  ): Promise<Patient> => {
    const adaptedPatient = adaptPatientUpdateDto(patient);
    const response = await apiClient.put<any>(
      ENDPOINTS.PATIENTS.DETAIL(id),
      adaptedPatient
    );
    return adaptPatientFromApi(response);
  },

  deletePatient: async (id: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.PATIENTS.DETAIL(id));
  },

  searchPatients: async (query: string): Promise<Patient[]> => {
    const response = await apiClient.post<PatientListResponse>(
      ENDPOINTS.PATIENTS.SEARCH,
      { name: query, skip: 0, limit: 100 }
    );
    return response.patients.map(adaptPatientFromApi);
  },
};

export default patientService;
