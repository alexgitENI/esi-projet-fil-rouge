// src/pages/patients/CreatePatientPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { PatientCreateDto } from "../../types/patient.types";
import patientService from "../../api/services/patientService";

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

const CreatePatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "male",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Simuler l'appel à l'API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // En environnement réel, nous utiliserions :
      // await patientService.createPatient(data);

      toast.success("Patient créé avec succès !");
      reset();
      navigate("/patients");
    } catch (error) {
      console.error("Error creating patient:", error);
      toast.error("Erreur lors de la création du patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Créer un nouveau patient
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

      {/* Formulaire */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations personnelles */}
          <div>
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="label">
                  Prénom <span className="text-error-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register("firstName")}
                  className={`input ${
                    errors.firstName
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="label">
                  Nom <span className="text-error-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register("lastName")}
                  className={`input ${
                    errors.lastName
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="label">
                  Date de naissance <span className="text-error-500">*</span>
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className={`input ${
                    errors.dateOfBirth
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="label">
                  Genre <span className="text-error-500">*</span>
                </label>
                <select
                  id="gender"
                  {...register("gender")}
                  className={`input ${
                    errors.gender
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                >
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div>
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Coordonnées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`input ${
                    errors.email
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className={`input ${
                    errors.phone
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="label">
                  Adresse
                </label>
                <input
                  id="address"
                  type="text"
                  {...register("address")}
                  className={`input ${
                    errors.address
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div>
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Informations médicales
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="insuranceNumber" className="label">
                  Numéro d'assurance
                </label>
                <input
                  id="insuranceNumber"
                  type="text"
                  {...register("insuranceNumber")}
                  className={`input ${
                    errors.insuranceNumber
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                />
                {errors.insuranceNumber && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.insuranceNumber.message}
                  </p>
                )}
              </div>

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
            <button
              type="button"
              onClick={() => reset()}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Création en cours...
                </>
              ) : (
                "Créer le patient"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePatientPage;
