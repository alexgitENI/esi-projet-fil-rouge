// src/pages/patients/EditPatientPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Patient, PatientUpdateDto } from "../../types/patient.types";
import patientService from "../../api/services/patientService";
import InputField from "../../components/common/InputField/InputField";
import SelectField from "../../components/common/SelectField/SelectField";
import Button from "../../components/common/Button/Button";
import Alert from "../../components/common/Alert/Alert";

// Schéma de validation
const patientSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date de naissance invalide",
  }),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Veuillez sélectionner un genre" }),
  }),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  insuranceNumber: z.string().optional().or(z.literal("")),
  medicalHistory: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof patientSchema>;

const EditPatientPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // En environnement réel, nous utiliserions :
        // const data = await patientService.getPatientById(id);

        // Simuler un appel API
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Données de test
        const mockPatient: Patient = {
          id,
          firstName: "Sophie",
          lastName: "Martin",
          dateOfBirth: "1985-06-15",
          gender: "female",
          email: "sophie.martin@example.com",
          phone: "06 12 34 56 78",
          address: "25 rue des Lilas, 75020 Paris",
          insuranceNumber: "1 85 06 75 042 042 12",
          medicalHistory:
            "Allergie aux arachides.\nAsthme léger.\nAntécédents familiaux de diabète de type 2.",
          createdAt: "2023-02-15T10:30:00Z",
          updatedAt: "2023-02-15T10:30:00Z",
        };

        setPatient(mockPatient);

        // Pré-remplir le formulaire
        reset({
          firstName: mockPatient.firstName,
          lastName: mockPatient.lastName,
          dateOfBirth: mockPatient.dateOfBirth.split("T")[0],
          gender: mockPatient.gender,
          email: mockPatient.email || "",
          phone: mockPatient.phone || "",
          address: mockPatient.address || "",
          insuranceNumber: mockPatient.insuranceNumber || "",
          medicalHistory: mockPatient.medicalHistory || "",
        });
      } catch (error) {
        console.error("Error fetching patient:", error);
        setError("Erreur lors du chargement des données du patient");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, reset]);

  // Dans src/pages/patients/EditPatientPage.tsx

const onSubmit = async (data: FormData) => {
  if (!id) return;

  try {
    setIsSubmitting(true);
    setError(null);

    const updateData: PatientUpdateDto = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      insuranceNumber: data.insuranceNumber || undefined,
      medicalHistory: data.medicalHistory || undefined,
    };

    await patientService.updatePatient(id, updateData);

    toast.success("Patient mis à jour avec succès");
    navigate(`/patients/${id}`);
  } catch (error) {
    console.error("Error updating patient:", error);
    setError("Une erreur est survenue lors de la mise à jour du patient");
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

  if (!patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Patient non trouvé
        </h2>
        <p className="text-slate-600 mb-6">
          Le patient que vous cherchez n'existe pas ou a été supprimé.
        </p>
        <Button variant="primary" onClick={() => navigate("/patients")}>
          Retour à la liste des patients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Modifier le patient
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
          {/* Informations personnelles */}
          <div>
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                id="firstName"
                label="Prénom"
                {...register("firstName")}
                error={errors.firstName?.message}
                required
              />

              <InputField
                id="lastName"
                label="Nom"
                {...register("lastName")}
                error={errors.lastName?.message}
                required
              />

              <InputField
                id="dateOfBirth"
                label="Date de naissance"
                type="date"
                {...register("dateOfBirth")}
                error={errors.dateOfBirth?.message}
                required
              />

              <SelectField
                id="gender"
                label="Genre"
                {...register("gender")}
                error={errors.gender?.message}
                options={[
                  { value: "male", label: "Homme" },
                  { value: "female", label: "Femme" },
                  { value: "other", label: "Autre" },
                ]}
                required
              />
            </div>
          </div>

          {/* Coordonnées */}
          <div>
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Coordonnées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                id="email"
                label="Email"
                type="email"
                {...register("email")}
                error={errors.email?.message}
              />

              <InputField
                id="phone"
                label="Téléphone"
                type="tel"
                {...register("phone")}
                error={errors.phone?.message}
              />

              <div className="md:col-span-2">
                <InputField
                  id="address"
                  label="Adresse"
                  {...register("address")}
                  error={errors.address?.message}
                />
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div>
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Informations médicales
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <InputField
                id="insuranceNumber"
                label="Numéro d'assurance"
                {...register("insuranceNumber")}
                error={errors.insuranceNumber?.message}
              />

              <div>
                <label htmlFor="medicalHistory" className="label">
                  Antécédents médicaux
                </label>
                <textarea
                  id="medicalHistory"
                  rows={4}
                  {...register("medicalHistory")}
                  className={`input ${
                    errors.medicalHistory
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                ></textarea>
                {errors.medicalHistory && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.medicalHistory.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/patients/${id}`)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isSubmitting
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientPage;
