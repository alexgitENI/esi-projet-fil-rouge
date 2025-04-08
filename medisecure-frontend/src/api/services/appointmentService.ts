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
  startTime: string;
  endTime: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentUpdateDto {
  status?: "scheduled" | "confirmed" | "cancelled" | "completed";
  startTime?: string;
  endTime?: string;
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
    start_time: frontDto.startTime,
    end_time: frontDto.endTime,
    reason: frontDto.reason,
    notes: frontDto.notes,
  };
};

// Fonction pour adapter les DTO de mise à jour
const adaptAppointmentUpdateDto = (frontDto: AppointmentUpdateDto): any => {
  const backDto: any = {};

  if (frontDto.status !== undefined) backDto.status = frontDto.status;
  if (frontDto.startTime !== undefined) backDto.start_time = frontDto.startTime;
  if (frontDto.endTime !== undefined) backDto.end_time = frontDto.endTime;
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

    try {
      const response = await apiClient.get<AppointmentListResponse>(url);
      console.log("API Response for appointments:", response);
      return response.appointments.map(adaptAppointmentFromApi);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Retourner un tableau vide en cas d'erreur plutôt que de planter
      return [];
    }
  },

  getAppointmentById: async (id: string): Promise<Appointment | null> => {
    try {
      const response = await apiClient.get<any>(
        ENDPOINTS.APPOINTMENTS.DETAIL(id)
      );
      return adaptAppointmentFromApi(response);
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      return null;
    }
  },

  getAppointmentsByPatient: async (
    patientId: string
  ): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get<AppointmentListResponse>(
        ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId)
      );
      return response.appointments.map(adaptAppointmentFromApi);
    } catch (error) {
      console.error(
        `Error fetching appointments for patient ${patientId}:`,
        error
      );
      return [];
    }
  },

  getAppointmentsByDoctor: async (doctorId: string): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get<AppointmentListResponse>(
        ENDPOINTS.APPOINTMENTS.BY_DOCTOR(doctorId)
      );
      return response.appointments.map(adaptAppointmentFromApi);
    } catch (error) {
      console.error(
        `Error fetching appointments for doctor ${doctorId}:`,
        error
      );
      return [];
    }
  },

  getAppointmentsCalendar: async (
    year: number,
    month: number
  ): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get<AppointmentListResponse>(
        `${ENDPOINTS.APPOINTMENTS.CALENDAR}?year=${year}&month=${month}`
      );
      return response.appointments.map(adaptAppointmentFromApi);
    } catch (error) {
      console.error(`Error fetching calendar for ${year}/${month}:`, error);
      return [];
    }
  },

  createAppointment: async (
    appointment: AppointmentCreateDto
  ): Promise<Appointment | null> => {
    try {
      const adaptedAppointment = adaptAppointmentCreateDto(appointment);
      console.log("Creating appointment with data:", adaptedAppointment);
      const response = await apiClient.post<any>(
        ENDPOINTS.APPOINTMENTS.BASE,
        adaptedAppointment
      );
      console.log("Appointment created successfully:", response);
      return adaptAppointmentFromApi(response);
    } catch (error) {
      console.error("Error creating appointment:", error);
      return null;
    }
  },

  updateAppointment: async (
    id: string,
    appointment: AppointmentUpdateDto
  ): Promise<Appointment | null> => {
    try {
      const adaptedAppointment = adaptAppointmentUpdateDto(appointment);
      console.log(`Updating appointment ${id} with data:`, adaptedAppointment);
      const response = await apiClient.put<any>(
        ENDPOINTS.APPOINTMENTS.DETAIL(id),
        adaptedAppointment
      );
      console.log("Appointment updated successfully:", response);
      return adaptAppointmentFromApi(response);
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      return null;
    }
  },

  cancelAppointment: async (
    id: string,
    reason?: string
  ): Promise<Appointment | null> => {
    try {
      const response = await apiClient.put<any>(
        ENDPOINTS.APPOINTMENTS.DETAIL(id),
        {
          status: "cancelled",
          notes: reason,
        }
      );
      console.log(`Appointment ${id} cancelled successfully`);
      return adaptAppointmentFromApi(response);
    } catch (error) {
      console.error(`Error cancelling appointment ${id}:`, error);
      return null;
    }
  },

  confirmAppointment: async (id: string): Promise<Appointment | null> => {
    try {
      const response = await apiClient.put<any>(
        ENDPOINTS.APPOINTMENTS.DETAIL(id),
        {
          status: "confirmed",
        }
      );
      console.log(`Appointment ${id} confirmed successfully`);
      return adaptAppointmentFromApi(response);
    } catch (error) {
      console.error(`Error confirming appointment ${id}:`, error);
      return null;
    }
  },

  completeAppointment: async (id: string): Promise<Appointment | null> => {
    try {
      const response = await apiClient.put<any>(
        ENDPOINTS.APPOINTMENTS.DETAIL(id),
        {
          status: "completed",
        }
      );
      console.log(`Appointment ${id} marked as completed`);
      return adaptAppointmentFromApi(response);
    } catch (error) {
      console.error(`Error completing appointment ${id}:`, error);
      return null;
    }
  },
};

export default appointmentService;
