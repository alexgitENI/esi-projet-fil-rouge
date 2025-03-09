import apiClient from "../apiClient";
import { ENDPOINTS } from "../endpoints";
import {
  Patient,
  PatientCreateDto,
  PatientUpdateDto,
} from "../../types/patient.types";

const patientService = {
  getAllPatients: async (): Promise<Patient[]> => {
    return apiClient.get<Patient[]>(ENDPOINTS.PATIENTS.BASE);
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
    return apiClient.get<Patient[]>(
      `${ENDPOINTS.PATIENTS.SEARCH}?q=${encodeURIComponent(query)}`
    );
  },
};

export default patientService;
