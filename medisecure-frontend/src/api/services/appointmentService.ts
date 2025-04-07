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

// Fonction pour adapter les appointements du back-end vers le front-end
const adaptAppointmentFromApi = (backDto: any): Appointment => {
  return {
    id: backDto.id,
    patientId: backDto.patient_id,
    doctorId: backDto.doctor_id,
    startTime: backDto.start_time,
    endTime: backDto.end_time,
    status: backDto.status,
    reason: backDto.reason,
    notes: backDto.notes,
    createdAt: backDto.created_at,
    updatedAt: backDto.updated_at,
  };
};

// Fonction pour adapter les DTO de création du front vers le back
const adaptAppointmentCreateDto = (frontDto: AppointmentCreateDto): any => {
  return {
    patient_id: frontDto.patientId,
    doctor_id: frontDto.doctorId,
    start_time: frontDto.startDateTime,
    end_time: frontDto.endDateTime,
    reason: frontDto.reason,
    notes: frontDto.notes,
  };
};

// Fonction pour adapter les DTO de mise à jour
const adaptAppointmentUpdateDto = (frontDto: AppointmentUpdateDto): any => {
  const backDto: any = {};

  if (frontDto.status !== undefined) backDto.status = frontDto.status;
  if (frontDto.startDateTime !== undefined)
    backDto.start_time = frontDto.startDateTime;
  if (frontDto.endDateTime !== undefined)
    backDto.end_time = frontDto.endDateTime;
  if (frontDto.reason !== undefined) backDto.reason = frontDto.reason;
  if (frontDto.notes !== undefined) backDto.notes = frontDto.notes;

  return backDto;
};

// Interface pour la réponse de liste
interface AppointmentListResponse {
  appointments: any[];
  total: number;
  skip: number;
  limit: number;
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

    const response = await apiClient.get<AppointmentListResponse>(url);
    return response.appointments.map(adaptAppointmentFromApi);
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get<any>(
      ENDPOINTS.APPOINTMENTS.DETAIL(id)
    );
    return adaptAppointmentFromApi(response);
  },

  getAppointmentsByPatient: async (
    patientId: string
  ): Promise<Appointment[]> => {
    const response = await apiClient.get<AppointmentListResponse>(
      ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId)
    );
    return response.appointments.map(adaptAppointmentFromApi);
  },

  getAppointmentsByDoctor: async (doctorId: string): Promise<Appointment[]> => {
    const response = await apiClient.get<AppointmentListResponse>(
      ENDPOINTS.APPOINTMENTS.BY_DOCTOR(doctorId)
    );
    return response.appointments.map(adaptAppointmentFromApi);
  },

  getAppointmentsCalendar: async (
    year: number,
    month: number
  ): Promise<Appointment[]> => {
    const response = await apiClient.get<AppointmentListResponse>(
      `${ENDPOINTS.APPOINTMENTS.CALENDAR}?year=${year}&month=${month}`
    );
    return response.appointments.map(adaptAppointmentFromApi);
  },

  createAppointment: async (
    appointment: AppointmentCreateDto
  ): Promise<Appointment> => {
    const adaptedAppointment = adaptAppointmentCreateDto(appointment);
    const response = await apiClient.post<any>(
      ENDPOINTS.APPOINTMENTS.BASE,
      adaptedAppointment
    );
    return adaptAppointmentFromApi(response);
  },

  updateAppointment: async (
    id: string,
    appointment: AppointmentUpdateDto
  ): Promise<Appointment> => {
    const adaptedAppointment = adaptAppointmentUpdateDto(appointment);
    const response = await apiClient.put<any>(
      ENDPOINTS.APPOINTMENTS.DETAIL(id),
      adaptedAppointment
    );
    return adaptAppointmentFromApi(response);
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
