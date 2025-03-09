export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  email?: string;
  phone?: string;
  address?: string;
  insuranceNumber?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
}

export type PatientCreateDto = Omit<Patient, "id" | "createdAt" | "updatedAt">;

export type PatientUpdateDto = Partial<PatientCreateDto>;
