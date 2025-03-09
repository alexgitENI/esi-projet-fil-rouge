// src/pages/patients/PatientsListPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Patient } from "../../types/patient.types";
import patientService from "../../api/services/patientService";
import toast from "react-hot-toast";

const PatientsListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // En environnement réel, nous utiliserions :
        // const data = await patientService.getAllPatients();

        // Pour l'instant, nous simulons des données
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockPatients: Patient[] = [
          {
            id: "1",
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
          },
          {
            id: "2",
            firstName: "Thomas",
            lastName: "Dubois",
            dateOfBirth: "1992-03-22",
            gender: "male",
            email: "thomas.dubois@example.com",
            phone: "06 23 45 67 89",
            address: "8 avenue Victor Hugo, 69002 Lyon",
            insuranceNumber: "1 92 03 69 123 456 78",
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
            address: "12 boulevard de la Liberté, 59800 Lille",
            insuranceNumber: "2 78 11 59 789 012 34",
            createdAt: "2023-02-13T09:45:00Z",
            updatedAt: "2023-02-13T09:45:00Z",
          },
          {
            id: "4",
            firstName: "Lucas",
            lastName: "Bernard",
            dateOfBirth: "1995-08-17",
            gender: "male",
            email: "lucas.bernard@example.com",
            phone: "06 45 67 89 01",
            address: "5 rue de la Paix, 44000 Nantes",
            insuranceNumber: "1 95 08 44 345 678 90",
            createdAt: "2023-02-12T16:20:00Z",
            updatedAt: "2023-02-12T16:20:00Z",
          },
          {
            id: "5",
            firstName: "Camille",
            lastName: "Leroy",
            dateOfBirth: "1988-02-29",
            gender: "female",
            email: "camille.leroy@example.com",
            phone: "06 56 78 90 12",
            address: "18 rue des Carmes, 31000 Toulouse",
            insuranceNumber: "2 88 02 31 567 890 12",
            createdAt: "2023-02-11T11:10:00Z",
            updatedAt: "2023-02-11T11:10:00Z",
          },
        ];

        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Erreur lors du chargement des patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filtrer les patients en fonction de la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(query) ||
        patient.lastName.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.phone?.includes(query)
    );

    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  // Calculer l'âge à partir de la date de naissance
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

  // Gérer la suppression d'un patient
  const handleDeletePatient = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
      return;
    }

    try {
      // En environnement réel, nous utiliserions :
      // await patientService.deletePatient(id);

      // Pour l'instant, nous simulons la suppression
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPatients(patients.filter((patient) => patient.id !== id));
      setFilteredPatients(
        filteredPatients.filter((patient) => patient.id !== id)
      );
      toast.success("Patient supprimé avec succès");
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Erreur lors de la suppression du patient");
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-semibold text-neutral-900">Patients</h1>
        <Link
          to="/patients/create"
          className="btn btn-primary inline-flex items-center"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Nouveau patient
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-neutral-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder="Rechercher un patient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Liste des patients */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Informations
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Numéro d'assurance
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-neutral-500"
                  >
                    Aucun patient trouvé
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-neutral-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                          {patient.firstName.charAt(0) +
                            patient.lastName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-neutral-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            ID: {patient.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {new Date(patient.dateOfBirth).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {calculateAge(patient.dateOfBirth)} ans -{" "}
                        {patient.gender === "male" ? "Homme" : "Femme"}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {patient.email}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {patient.phone}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {patient.insuranceNumber}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Détails
                      </Link>
                      <Link
                        to={`/patients/${patient.id}/edit`}
                        className="text-secondary-600 hover:text-secondary-900 mr-3"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="text-error-500 hover:text-error-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientsListPage;
