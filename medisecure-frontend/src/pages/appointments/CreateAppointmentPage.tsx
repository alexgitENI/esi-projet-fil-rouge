// src/pages/appointments/CreateAppointmentPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Patient } from "../../types/patient.types";
import patientService from "../../api/services/patientService";
import InputField from "../../components/common/InputField/InputField";
import SelectField from "../../components/common/SelectField/SelectField";
import Button from "../../components/common/Button/Button";
import Alert from "../../components/common/Alert/Alert";

// Schéma de validation
const appointmentSchema = z.object({
  patientId: z.string().min(1, "Veuillez sélectionner un patient"),
  date: z.string().min(1, "La date est requise"),
  startTime: z.string().min(1, "L'heure de début est requise"),
  endTime: z.string().min(1, "L'heure de fin est requise"),
  doctorId: z.string().min(1, "Veuillez sélectionner un médecin"),
  appointmentType: z
    .string()
    .min(1, "Veuillez sélectionner un type de rendez-vous"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof appointmentSchema>;

// Types fictifs pour les médecins et types de rendez-vous
interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface AppointmentType {
  id: string;
  name: string;
  duration: number; // en minutes
}

const CreateAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedPatientId = queryParams.get("patientId");
  const preselectedDate = queryParams.get("date");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: preselectedPatientId || "",
      date: preselectedDate || new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      doctorId: "",
      appointmentType: "",
      notes: "",
    },
  });

  // Observer les champs pour mettre à jour automatiquement l'heure de fin
  const watchAppointmentType = watch("appointmentType");
  const watchStartTime = watch("startTime");

  useEffect(() => {
    if (watchAppointmentType && watchStartTime) {
      const selectedType = appointmentTypes.find(
        (type) => type.id === watchAppointmentType
      );
      if (selectedType) {
        const startTime = new Date(`2000-01-01T${watchStartTime}`);
        const endTime = new Date(
          startTime.getTime() + selectedType.duration * 60000
        );
        const formattedEndTime = endTime.toTimeString().substring(0, 5);
        setValue("endTime", formattedEndTime);
      }
    }
  }, [watchAppointmentType, watchStartTime, appointmentTypes, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simuler l'appel API pour les patients
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockPatients: Patient[] = [
          {
            id: "1",
            firstName: "Sophie",
            lastName: "Martin",
            dateOfBirth: "1985-06-15",
            gender: "female",
            email: "sophie.martin@example.com",
            phone: "06 12 34 56 78",
            createdAt: "2023-02-15T10:30:00Z",
            updatedAt: "2023-02-15T10:30:00Z",
          },
          {
            id: "2",
            firstName: "Thomas",
            lastName: "Dubois",
            dateOfBirth: "1992-03-22",
            gender: "male",
            email: "thomas.dubois@example.com",
            phone: "06 23 45 67 89",
            createdAt: "2023-02-14T14:15:00Z",
            updatedAt: "2023-02-14T14:15:00Z",
          },
          {
            id: "3",
            firstName: "Emma",
            lastName: "Petit",
            dateOfBirth: "1978-11-05",
            gender: "female",
            email: "emma.petit@example.com",
            phone: "06 34 56 78 90",
            createdAt: "2023-02-13T09:45:00Z",
            updatedAt: "2023-02-13T09:45:00Z",
          },
        ];
        setPatients(mockPatients);

        // Simuler l'appel API pour les médecins
        const mockDoctors: Doctor[] = [
          {
            id: "1",
            name: "Dr. Jean Dupont",
            specialty: "Médecin généraliste",
          },
          { id: "2", name: "Dr. Marie Lambert", specialty: "Cardiologue" },
          { id: "3", name: "Dr. Robert Martin", specialty: "Dermatologue" },
        ];
        setDoctors(mockDoctors);

        // Simuler l'appel API pour les types de rendez-vous
        const mockAppointmentTypes: AppointmentType[] = [
          { id: "1", name: "Consultation standard", duration: 15 },
          { id: "2", name: "Consultation longue", duration: 30 },
          { id: "3", name: "Urgence", duration: 20 },
          { id: "4", name: "Suivi de traitement", duration: 15 },
        ];
        setAppointmentTypes(mockAppointmentTypes);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Formater les données pour l'API
      const appointmentData = {
        ...data,
        startDateTime: `${data.date}T${data.startTime}:00`,
        endDateTime: `${data.date}T${data.endTime}:00`,
      };

      // En environnement réel, nous utiliserions :
      // await appointmentService.createAppointment(appointmentData);

      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Rendez-vous créé avec succès");
      navigate("/appointments");
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError("Une erreur est survenue lors de la création du rendez-vous");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-primary-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Créer un nouveau rendez-vous
        </h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-outline inline-flex items-center"
        >
          <svg
            className="h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour
        </button>
      </div>

      {error && (
        <Alert variant="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Formulaire */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations de base */}
          <div>
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Informations du rendez-vous
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                id="patientId"
                label="Patient"
                {...register("patientId")}
                error={errors.patientId?.message}
                options={patients.map((patient) => ({
                  value: patient.id,
                  label: `${patient.firstName} ${patient.lastName}`,
                }))}
                required
              />

              <SelectField
                id="doctorId"
                label="Médecin"
                {...register("doctorId")}
                error={errors.doctorId?.message}
                options={doctors.map((doctor) => ({
                  value: doctor.id,
                  label: `${doctor.name} (${doctor.specialty})`,
                }))}
                required
              />

              <InputField
                id="date"
                label="Date"
                type="date"
                {...register("date")}
                error={errors.date?.message}
                required
              />

              <SelectField
                id="appointmentType"
                label="Type de rendez-vous"
                {...register("appointmentType")}
                error={errors.appointmentType?.message}
                options={appointmentTypes.map((type) => ({
                  value: type.id,
                  label: `${type.name} (${type.duration} min)`,
                }))}
                required
              />

              <InputField
                id="startTime"
                label="Heure de début"
                type="time"
                {...register("startTime")}
                error={errors.startTime?.message}
                required
              />

              <InputField
                id="endTime"
                label="Heure de fin"
                type="time"
                {...register("endTime")}
                error={errors.endTime?.message}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-lg font-medium text-slate-900 mb-4">Notes</h2>
            <div>
              <label htmlFor="notes" className="label">
                Notes pour le rendez-vous
              </label>
              <textarea
                id="notes"
                rows={4}
                {...register("notes")}
                className="input"
                placeholder="Entrez des notes ou informations supplémentaires pour ce rendez-vous"
              ></textarea>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/appointments")}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isSubmitting ? "Création en cours..." : "Créer le rendez-vous"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentPage;
