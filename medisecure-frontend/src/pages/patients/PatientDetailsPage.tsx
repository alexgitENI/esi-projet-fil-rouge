// src/pages/patients/PatientDetailsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Patient } from "../../types/patient.types";
import patientService from "../../api/services/patientService";
import toast from "react-hot-toast";

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Simuler l'appel à l'API
        await new Promise((resolve) => setTimeout(resolve, 800));

        // En environnement réel, nous utiliserions :
        // const data = await patientService.getPatientById(id);

        // Simulation de données
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
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Erreur lors du chargement des détails du patient");
        navigate("/patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  // Calculer l'âge
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
          Le patient que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Link to="/patients" className="btn btn-primary">
          Retour à la liste des patients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-semibold">
            {patient.firstName.charAt(0) + patient.lastName.charAt(0)}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-slate-500">
              {patient.gender === "male" ? "Homme" : "Femme"} •{" "}
              {calculateAge(patient.dateOfBirth)} ans
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/appointments/create?patientId=${patient.id}`}
            className="btn btn-primary"
          >
            Nouveau rendez-vous
          </Link>
          <Link to={`/patients/${patient.id}/edit`} className="btn btn-outline">
            Modifier
          </Link>
          <button onClick={() => navigate(-1)} className="btn btn-outline">
            Retour
          </button>
        </div>
      </div>

      {/* Informations du patient */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="card">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Informations personnelles
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Nom complet
              </h3>
              <p className="mt-1 text-slate-900">
                {patient.firstName} {patient.lastName}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Date de naissance
              </h3>
              <p className="mt-1 text-slate-900">
                {formatDate(patient.dateOfBirth)} (
                {calculateAge(patient.dateOfBirth)} ans)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Genre</h3>
              <p className="mt-1 text-slate-900">
                {patient.gender === "male"
                  ? "Homme"
                  : patient.gender === "female"
                  ? "Femme"
                  : "Autre"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Numéro d'assurance
              </h3>
              <p className="mt-1 text-slate-900">
                {patient.insuranceNumber || "Non renseigné"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Dossier créé le
              </h3>
              <p className="mt-1 text-slate-900">
                {formatDate(patient.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="card">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Coordonnées
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Email</h3>
              <p className="mt-1 text-slate-900">
                {patient.email || "Non renseigné"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Téléphone
              </h3>
              <p className="mt-1 text-slate-900">
                {patient.phone || "Non renseigné"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Adresse</h3>
              <p className="mt-1 text-slate-900">
                {patient.address || "Non renseignée"}
              </p>
            </div>
          </div>
        </div>

        {/* Antécédents médicaux */}
        <div className="card">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Antécédents médicaux
          </h2>
          {patient.medicalHistory ? (
            <div className="prose prose-sm max-w-none">
              {patient.medicalHistory.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">
              Aucun antécédent médical renseigné
            </p>
          )}
        </div>
      </div>

      {/* Rendez-vous récents */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-slate-900">
            Rendez-vous récents
          </h2>
          <Link
            to={`/appointments?patientId=${patient.id}`}
            className="text-primary-600 hover:text-primary-800"
          >
            Voir tous
          </Link>
        </div>
        <div className="text-center py-6 text-slate-500">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2">Aucun rendez-vous récent</p>
          <div className="mt-4">
            <Link
              to={`/appointments/create?patientId=${patient.id}`}
              className="btn btn-primary"
            >
              Planifier un rendez-vous
            </Link>
          </div>
        </div>
      </div>

      {/* Documents médicaux */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-slate-900">
            Documents médicaux
          </h2>
          <Link
            to={`/medical-records/${patient.id}`}
            className="text-primary-600 hover:text-primary-800"
          >
            Voir tous
          </Link>
        </div>
        <div className="text-center py-6 text-slate-500">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2">Aucun document médical</p>
          <div className="mt-4">
            <Link
              to={`/medical-records/${patient.id}/upload`}
              className="btn btn-primary"
            >
              Ajouter un document
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;
