// Dans src/api/services/patientService.ts

import apiClient from "../apiClient";
import { ENDPOINTS } from "../endpoints";
import {
  Patient,
  PatientCreateDto,
  PatientUpdateDto,
} from "../../types/patient.types";

const patientService = {
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await apiClient.get<{ patients: Patient[], total: number, skip: number, limit: number }>(ENDPOINTS.PATIENTS.BASE);
    return response.patients; // Ajuster pour la structure de réponse de l'API
  },

  getPatientById: async (id: string): Promise<Patient> => {
    return apiClient.get<Patient>(ENDPOINTS.PATIENTS.DETAIL(id));
  },

  createPatient: async (patient: PatientCreateDto): Promise<Patient> => {
    return apiClient.post<Patient>(ENDPOINTS.PATIENTS.BASE, patient);
  },

  updatePatient: async (
    id: string,
    patient: PatientUpdateDto
  ): Promise<Patient> => {
    return apiClient.put<Patient>(ENDPOINTS.PATIENTS.DETAIL(id), patient);
  },

  deletePatient: async (id: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.PATIENTS.DETAIL(id));
  },

  searchPatients: async (query: string): Promise<Patient[]> => {
    // Adapter pour utiliser les bons critères de recherche
    return apiClient.post<Patient[]>(
      ENDPOINTS.PATIENTS.SEARCH,
      { name: query, skip: 0, limit: 100 }
    );
  },
};

export default patientService;