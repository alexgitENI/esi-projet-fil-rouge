// src/pages/medical-records/MedicalRecordsPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Patient } from "../../types/patient.types";
import patientService from "../../api/services/patientService";
import Button from "../../components/common/Button/Button";
import DataTable, { Column } from "../../components/common/DataTable/DataTable";

// Types pour les dossiers médicaux
interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  date: string;
  type: string;
  doctor: string;
  documentCount: number;
}

const MedicalRecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simuler un délai réseau
        await new Promise((resolve) => setTimeout(resolve, 800));

        // En environnement réel, nous récupérerions les données du patient
        // const patientData = await patientService.getPatientById(patientId);

        // Données simulées pour le patient
        const mockPatient: Patient = {
          id: patientId || "1",
          firstName: "Sophie",
          lastName: "Martin",
          dateOfBirth: "1985-06-15",
          gender: "female",
          email: "sophie.martin@example.com",
          phone: "06 12 34 56 78",
          address: "25 rue des Lilas, 75020 Paris",
          insuranceNumber: "1 85 06 75 042 042 12",
          createdAt: "2023-02-15T10:30:00Z",
          updatedAt: "2023-02-15T10:30:00Z",
        };

        setPatient(mockPatient);

        // En environnement réel, nous récupérerions également les dossiers médicaux
        // const recordsData = await medicalRecordService.getPatientRecords(patientId);

        // Données simulées pour les dossiers médicaux
        const mockRecords: MedicalRecord[] = [
          {
            id: "1",
            patientId: patientId || "1",
            title: "Consultation initiale",
            date: "2023-01-15T10:00:00Z",
            type: "Consultation",
            doctor: "Dr. Jean Dupont",
            documentCount: 2,
          },
          {
            id: "2",
            patientId: patientId || "1",
            title: "Analyse de sang",
            date: "2023-02-20T14:30:00Z",
            type: "Laboratoire",
            doctor: "Dr. Marie Lambert",
            documentCount: 1,
          },
          {
            id: "3",
            patientId: patientId || "1",
            title: "Radiographie thoracique",
            date: "2023-03-05T09:15:00Z",
            type: "Imagerie",
            doctor: "Dr. Robert Martin",
            documentCount: 3,
          },
        ];

        setRecords(mockRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  // Définition des colonnes pour le tableau des dossiers médicaux
  const columns: Column<MedicalRecord>[] = [
    {
      header: "Date",
      accessor: (record) => new Date(record.date).toLocaleDateString("fr-FR"),
    },
    {
      header: "Titre",
      accessor: "title",
    },
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Médecin",
      accessor: "doctor",
    },
    {
      header: "Documents",
      accessor: (record) => `${record.documentCount} document(s)`,
    },
    {
      header: "Actions",
      accessor: (record) => (
        <div className="flex space-x-2">
          <Link
            to={`/medical-records/${record.id}`}
            className="text-primary-600 hover:text-primary-800"
          >
            Voir
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/medical-records/${record.id}/edit`);
            }}
            className="text-secondary-600 hover:text-secondary-800"
          >
            Modifier
          </button>
        </div>
      ),
    },
  ];

  const handleRowClick = (record: MedicalRecord) => {
    navigate(`/medical-records/${record.id}`);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Dossiers médicaux
            {patient && (
              <span className="text-slate-500 text-lg ml-2">
                - {patient.firstName} {patient.lastName}
              </span>
            )}
          </h1>
          {patient && (
            <p className="text-slate-500">
              Né(e) le{" "}
              {new Date(patient.dateOfBirth).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Link
            to={`/medical-records/create${
              patientId ? `?patientId=${patientId}` : ""
            }`}
          >
            <Button variant="primary">Ajouter un dossier</Button>
          </Link>
        </div>
      </div>

      {/* Tableau des dossiers médicaux */}
      <div className="card">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Liste des dossiers médicaux
        </h2>

        <DataTable<MedicalRecord>
          columns={columns}
          data={records}
          keyExtractor={(record) => record.id}
          onRowClick={handleRowClick}
          isLoading={loading}
          emptyMessage="Aucun dossier médical trouvé"
        />
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
