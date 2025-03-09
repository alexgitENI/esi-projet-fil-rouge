// src/pages/dashboard/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import { ENDPOINTS } from "../../api/endpoints";
import { Patient } from "../../types/patient.types";

// Types pour les statistiques
interface DashboardStats {
  totalPatients: number;
  totalAppointmentsToday: number;
  upcomingAppointments: number;
  pendingMedicalRecords: number;
}

// Type pour les rendez-vous simplifiés
interface AppointmentPreview {
  id: string;
  patientName: string;
  startTime: string;
  status: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalAppointmentsToday: 0,
    upcomingAppointments: 0,
    pendingMedicalRecords: 0,
  });
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    AppointmentPreview[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Dans un environnement réel, ces appels API seraient implémentés
        // Pour l'instant, nous simulons les données

        // Simuler un délai réseau
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Données simulées pour les stats
        setStats({
          totalPatients: 248,
          totalAppointmentsToday: 15,
          upcomingAppointments: 43,
          pendingMedicalRecords: 7,
        });

        // Données simulées pour les patients récents
        setRecentPatients([
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
        ]);

        // Données simulées pour les rendez-vous à venir
        setUpcomingAppointments([
          {
            id: "101",
            patientName: "Sophie Martin",
            startTime: "2023-02-18T10:00:00Z",
            status: "confirmed",
          },
          {
            id: "102",
            patientName: "Thomas Dubois",
            startTime: "2023-02-18T11:30:00Z",
            status: "scheduled",
          },
          {
            id: "103",
            patientName: "Emma Petit",
            startTime: "2023-02-19T14:15:00Z",
            status: "confirmed",
          },
          {
            id: "104",
            patientName: "Lucas Bernard",
            startTime: "2023-02-19T16:00:00Z",
            status: "scheduled",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Formatage de la date pour affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
          Tableau de bord
        </h1>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-slate-500 text-sm font-medium mb-2">
            Patients totaux
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">
              {stats.totalPatients}
            </div>
            <div className="text-success-500 text-sm font-medium">
              +5 cette semaine
            </div>
          </div>
        </div>

        <div className="card">
          <div className="text-slate-500 text-sm font-medium mb-2">
            Rendez-vous aujourd'hui
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">
              {stats.totalAppointmentsToday}
            </div>
            <div className="text-slate-500 text-sm font-medium">
              3 à venir
            </div>
          </div>
        </div>

        <div className="card">
          <div className="text-slate-500 text-sm font-medium mb-2">
            Rendez-vous à venir
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">
              {stats.upcomingAppointments}
            </div>
            <div className="text-slate-500 text-sm font-medium">7 jours</div>
          </div>
        </div>

        <div className="card">
          <div className="text-slate-500 text-sm font-medium mb-2">
            Dossiers en attente
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">
              {stats.pendingMedicalRecords}
            </div>
            <div className="text-warning-500 text-sm font-medium">
              Action requise
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients récents */}
        <div className="card overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Patients récents
            </h2>
            <Link
              to="/patients"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Voir tous
            </Link>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date de naissance
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                          {patient.firstName.charAt(0) +
                            patient.lastName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {patient.gender === "male" ? "Homme" : "Femme"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {new Date(patient.dateOfBirth).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date().getFullYear() -
                          new Date(patient.dateOfBirth).getFullYear()}{" "}
                        ans
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {patient.email}
                      </div>
                      <div className="text-xs text-slate-500">
                        {patient.phone}
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
                        to={`/appointments/create?patientId=${patient.id}`}
                        className="text-secondary-600 hover:text-secondary-900"
                      >
                        RDV
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rendez-vous à venir */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Rendez-vous à venir
            </h2>
            <Link
              to="/appointments"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Voir tous
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex p-3 border border-slate-100 rounded-lg hover:bg-slate-50"
              >
                <div className="mr-4 flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
                    <svg
                      className="h-6 w-6"
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
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {appointment.patientName}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status === "confirmed"
                        ? "Confirmé"
                        : "Planifié"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(appointment.startTime)}
                  </p>
                  <div className="mt-2 flex">
                    <Link
                      to={`/appointments/${appointment.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 mr-4"
                    >
                      Détails
                    </Link>
                    <button className="text-sm text-slate-500 hover:text-slate-700">
                      Reprogrammer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
