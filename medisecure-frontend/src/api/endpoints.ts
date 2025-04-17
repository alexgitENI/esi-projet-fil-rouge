// medisecure-frontend/src/api/endpoints.ts
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    RESET_PASSWORD: "/auth/reset-password",
  },
  PATIENTS: {
    BASE: "/patients", // Suppression du slash final
    DETAIL: (id: string) => `/patients/${id}`, // Suppression du slash final
    SEARCH: "/patients/search", // Suppression du slash final
  },
  APPOINTMENTS: {
    BASE: "/appointments",
    DETAIL: (id: string) => `/appointments/${id}`,
    BY_PATIENT: (patientId: string) => `/appointments/patient/${patientId}`,
    BY_DOCTOR: (doctorId: string) => `/appointments/doctor/${doctorId}`,
    CALENDAR: "/appointments/calendar",
  },
  MEDICAL_RECORDS: {
    BASE: "/medical-records",
    DETAIL: (id: string) => `/medical-records/${id}`,
    DOCUMENTS: (recordId: string) => `/medical-records/${recordId}/documents`,
    DOCUMENT: (recordId: string, documentId: string) =>
      `/medical-records/${recordId}/documents/${documentId}`,
  },
};
