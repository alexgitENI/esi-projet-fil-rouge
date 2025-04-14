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
  try {
    console.log("Adaptation des données du rendez-vous:", frontDto);

    // Vérifier que les données nécessaires sont présentes
    if (!frontDto.patientId || !frontDto.doctorId) {
      throw new Error("PatientId et doctorId sont requis");
    }

    if (!frontDto.startTime || !frontDto.endTime) {
      throw new Error("Les heures de début et de fin sont requises");
    }

    // Formater les dates correctement
    // S'assurer que les dates sont au format ISO
    let startTime: Date;
    let endTime: Date;

    try {
      // Créer des objets Date à partir des chaînes
      if (typeof frontDto.startTime === "string") {
        // Si c'est juste une heure, on combine avec la date
        if (frontDto.startTime.length <= 8) {
          // format HH:MM ou HH:MM:SS
          const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
          startTime = new Date(`${today}T${frontDto.startTime}`);
        } else {
          startTime = new Date(frontDto.startTime);
        }
      } else {
        startTime = frontDto.startTime as any;
      }

      if (typeof frontDto.endTime === "string") {
        if (frontDto.endTime.length <= 8) {
          const today = new Date().toISOString().split("T")[0];
          endTime = new Date(`${today}T${frontDto.endTime}`);
        } else {
          endTime = new Date(frontDto.endTime);
        }
      } else {
        endTime = frontDto.endTime as any;
      }

      // Valider les dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error("Dates invalides");
      }
    } catch (e) {
      console.error("Erreur lors du parsing des dates:", e);
      throw new Error("Format de date invalide");
    }

    // Créer l'objet à envoyer à l'API
    return {
      patient_id: frontDto.patientId,
      doctor_id: frontDto.doctorId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      reason: frontDto.reason || "Consultation",
      notes: frontDto.notes || "",
    };
  } catch (error) {
    console.error("Erreur lors de l'adaptation des données:", error);
    throw error;
  }
};

// Fonction pour adapter les DTO de mise à jour
const adaptAppointmentUpdateDto = (frontDto: AppointmentUpdateDto): any => {
  const backDto: any = {};

  if (frontDto.status !== undefined) backDto.status = frontDto.status;

  // Traiter les dates de la même façon que pour la création
  if (frontDto.startTime !== undefined) {
    try {
      const startTime = new Date(frontDto.startTime);
      backDto.start_time = startTime.toISOString();
    } catch (e) {
      console.error("Erreur lors du parsing de la date de début:", e);
    }
  }

  if (frontDto.endTime !== undefined) {
    try {
      const endTime = new Date(frontDto.endTime);
      backDto.end_time = endTime.toISOString();
    } catch (e) {
      console.error("Erreur lors du parsing de la date de fin:", e);
    }
  }

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
    try {
      // On utilise une approche différente pour construire l'URL avec les paramètres
      let queryParams = new URLSearchParams();

      if (filter) {
        if (filter.patientId) queryParams.append("patientId", filter.patientId);
        if (filter.doctorId) queryParams.append("doctorId", filter.doctorId);
        if (filter.date) queryParams.append("date", filter.date);
        if (filter.status) queryParams.append("status", filter.status);
        if (filter.startDate) queryParams.append("startDate", filter.startDate);
        if (filter.endDate) queryParams.append("endDate", filter.endDate);
      }

      const url = `${ENDPOINTS.APPOINTMENTS.BASE}?${queryParams.toString()}`;
      console.log("Fetching appointments with URL:", url);

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
      // Utilisation du format de requête avec paramètres pour éviter les erreurs 405
      const queryParams = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      });

      const url = `${
        ENDPOINTS.APPOINTMENTS.CALENDAR
      }?${queryParams.toString()}`;
      console.log("Fetching calendar with URL:", url);

      const response = await apiClient.get<AppointmentListResponse>(url);
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

      // Augmenter le timeout pour cette requête spécifique
      const response = await apiClient.post<any>(
        ENDPOINTS.APPOINTMENTS.BASE,
        adaptedAppointment,
        { timeout: 30000 } // Augmenter le timeout à 30 secondes
      );

      console.log("Appointment created successfully:", response);
      return adaptAppointmentFromApi(response);
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error; // Renvoyer l'erreur pour un meilleur traitement côté UI
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
        adaptedAppointment,
        { timeout: 30000 } // Augmenter le timeout
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
