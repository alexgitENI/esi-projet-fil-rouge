// src/api/endpoints.ts
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  PATIENTS: {
    BASE: "/api/patients",
    DETAIL: (id: string) => `/api/patients/${id}`,
    SEARCH: "/api/patients/search",
  },
  APPOINTMENTS: {
    BASE: "/api/appointments",
    DETAIL: (id: string) => `/api/appointments/${id}`,
    BY_PATIENT: (patientId: string) => `/api/appointments/patient/${patientId}`,
    BY_DOCTOR: (doctorId: string) => `/api/appointments/doctor/${doctorId}`,
    CALENDAR: "/api/appointments/calendar",
  },
  MEDICAL_RECORDS: {
    BASE: "/api/medical-records",
    DETAIL: (id: string) => `/api/medical-records/${id}`,
    DOCUMENTS: (recordId: string) =>
      `/api/medical-records/${recordId}/documents`,
    DOCUMENT: (recordId: string, documentId: string) =>
      `/api/medical-records/${recordId}/documents/${documentId}`,
  },
};
