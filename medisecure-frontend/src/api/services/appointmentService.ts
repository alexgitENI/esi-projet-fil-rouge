// src/api/services/appointmentService.ts
import apiClient from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreateDto {
  patientId: string;
  doctorId: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentUpdateDto {
  status?: "scheduled" | "confirmed" | "cancelled" | "completed";
  startDateTime?: string;
  endDateTime?: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentFilter {
  patientId?: string;
  doctorId?: string;
  date?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

const appointmentService = {
  getAllAppointments: async (
    filter?: AppointmentFilter
  ): Promise<Appointment[]> => {
    let url = ENDPOINTS.APPOINTMENTS.BASE;

    if (filter) {
      const params = new URLSearchParams();

      if (filter.patientId) params.append("patientId", filter.patientId);
      if (filter.doctorId) params.append("doctorId", filter.doctorId);
      if (filter.date) params.append("date", filter.date);
      if (filter.status) params.append("status", filter.status);
      if (filter.startDate) params.append("startDate", filter.startDate);
      if (filter.endDate) params.append("endDate", filter.endDate);

      url += `?${params.toString()}`;
    }

    return apiClient.get<Appointment[]>(url);
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    return apiClient.get<Appointment>(ENDPOINTS.APPOINTMENTS.DETAIL(id));
  },

  getAppointmentsByPatient: async (
    patientId: string
  ): Promise<Appointment[]> => {
    return apiClient.get<Appointment[]>(
      ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId)
    );
  },

  getAppointmentsByDoctor: async (doctorId: string): Promise<Appointment[]> => {
    return apiClient.get<Appointment[]>(
      ENDPOINTS.APPOINTMENTS.BY_DOCTOR(doctorId)
    );
  },

  getAppointmentsCalendar: async (
    year: number,
    month: number
  ): Promise<Appointment[]> => {
    return apiClient.get<Appointment[]>(
      `${ENDPOINTS.APPOINTMENTS.CALENDAR}?year=${year}&month=${month}`
    );
  },

  createAppointment: async (
    appointment: AppointmentCreateDto
  ): Promise<Appointment> => {
    return apiClient.post<Appointment>(
      ENDPOINTS.APPOINTMENTS.BASE,
      appointment
    );
  },

  updateAppointment: async (
    id: string,
    appointment: AppointmentUpdateDto
  ): Promise<Appointment> => {
    return apiClient.put<Appointment>(
      ENDPOINTS.APPOINTMENTS.DETAIL(id),
      appointment
    );
  },

  cancelAppointment: async (
    id: string,
    reason?: string
  ): Promise<Appointment> => {
    return apiClient.put<Appointment>(ENDPOINTS.APPOINTMENTS.DETAIL(id), {
      status: "cancelled",
      notes: reason,
    });
  },

  confirmAppointment: async (id: string): Promise<Appointment> => {
    return apiClient.put<Appointment>(ENDPOINTS.APPOINTMENTS.DETAIL(id), {
      status: "confirmed",
    });
  },

  completeAppointment: async (id: string): Promise<Appointment> => {
    return apiClient.put<Appointment>(ENDPOINTS.APPOINTMENTS.DETAIL(id), {
      status: "completed",
    });
  },
};

export default appointmentService;
