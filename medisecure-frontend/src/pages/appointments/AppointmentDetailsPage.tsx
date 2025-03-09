// src/pages/appointments/AppointmentDetailsPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import appointmentService, {
  Appointment,
} from "../../api/services/appointmentService";
import Button from "../../components/common/Button/Button";
import Alert from "../../components/common/Alert/Alert";

const AppointmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // En environnement réel, nous utiliserions :
        // const data = await appointmentService.getAppointmentById(id);

        // Simuler un appel API
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Données de test
        const mockAppointment: Appointment = {
          id,
          patientId: "1",
          doctorId: "1",
          startTime: "2023-03-15T10:00:00Z",
          endTime: "2023-03-15T10:30:00Z",
          status: "confirmed",
          reason: "Consultation de routine",
          notes:
            "Patient se plaint de maux de tête fréquents depuis deux semaines.",
          createdAt: "2023-03-10T14:30:00Z",
          updatedAt: "2023-03-10T14:30:00Z",
        };

        // Simuler également les informations du patient et du médecin
        const patientName = "Sophie Martin";
        const doctorName = "Dr. Jean Dupont";

        setAppointment({
          ...mockAppointment,
          patientName, // Ajouter au type existant pour l'affichage
          doctorName, // Ajouter au type existant pour l'affichage
        } as Appointment & { patientName: string; doctorName: string });
      } catch (error) {
        console.error("Error fetching appointment:", error);
        setError("Erreur lors du chargement des détails du rendez-vous");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleStatusChange = async (newStatus: Appointment["status"]) => {
    if (!id || !appointment) return;

    try {
      setIsProcessing(true);

      // En environnement réel, nous utiliserions :
      // let updatedAppointment;
      // if (newStatus === "cancelled") {
      //   updatedAppointment = await appointmentService.cancelAppointment(id);
      // } else if (newStatus === "confirmed") {
      //   updatedAppointment = await appointmentService.confirmAppointment(id);
      // } else if (newStatus === "completed") {
      //   updatedAppointment = await appointmentService.completeAppointment(id);
      // }

      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mettre à jour l'état local
      setAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));

      const statusMessages = {
        confirmed: "Rendez-vous confirmé avec succès",
        cancelled: "Rendez-vous annulé avec succès",
        completed: "Rendez-vous marqué comme terminé",
        scheduled: "Rendez-vous reprogrammé avec succès",
      };

      toast.success(statusMessages[newStatus]);
    } catch (error) {
      console.error(
        `Error updating appointment status to ${newStatus}:`,
        error
      );
      setError(`Erreur lors de la mise à jour du statut du rendez-vous`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatage de la date et de l'heure
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
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

  if (!appointment) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
          Rendez-vous non trouvé
        </h2>
        <p className="text-neutral-600 mb-6">
          Le rendez-vous que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Button variant="primary" onClick={() => navigate("/appointments")}>
          Retour à la liste des rendez-vous
        </Button>
      </div>
    );
  }

  const startDateTime = formatDateTime(appointment.startTime);
  const endDateTime = formatDateTime(appointment.endTime);

  // Obtenir la classe de couleur en fonction du statut
  const getStatusClass = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-neutral-100 text-neutral-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmé";
      case "scheduled":
        return "Planifié";
      case "cancelled":
        return "Annulé";
      case "completed":
        return "Terminé";
      default:
        return "Inconnu";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Détails du rendez-vous
          </h1>
          <p className="text-neutral-500">
            {startDateTime.date} • {startDateTime.time} - {endDateTime.time}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Link to={`/appointments/${id}/edit`}>
            <Button variant="primary">Modifier</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium text-neutral-900">
              Informations du rendez-vous
            </h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                appointment.status
              )}`}
            >
              {getStatusLabel(appointment.status)}
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-500">
                  Patient
                </h3>
                <p className="mt-1 text-neutral-900">
                  {(appointment as any).patientName}
                </p>
                <Link
                  to={`/patients/${appointment.patientId}`}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Voir la fiche patient
                </Link>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-500">
                  Médecin
                </h3>
                <p className="mt-1 text-neutral-900">
                  {(appointment as any).doctorName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Date</h3>
                <p className="mt-1 text-neutral-900">{startDateTime.date}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-500">
                  Horaire
                </h3>
                <p className="mt-1 text-neutral-900">
                  {startDateTime.time} - {endDateTime.time}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-500">
                Motif du rendez-vous
              </h3>
              <p className="mt-1 text-neutral-900">
                {appointment.reason || "Non spécifié"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-500">Notes</h3>
              <div className="mt-1 text-neutral-900 whitespace-pre-line">
                {appointment.notes || "Aucune note"}
              </div>
            </div>
          </div>
        </div>

        {/* Actions et historique */}
        <div className="card">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Actions</h2>

          <div className="space-y-4">
            {appointment.status === "scheduled" && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleStatusChange("confirmed")}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                Confirmer le rendez-vous
              </Button>
            )}

            {appointment.status === "scheduled" ||
            appointment.status === "confirmed" ? (
              <>
                <Button
                  variant="success"
                  fullWidth
                  onClick={() => handleStatusChange("completed")}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                >
                  Marquer comme effectué
                </Button>

                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleStatusChange("cancelled")}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                >
                  Annuler le rendez-vous
                </Button>
              </>
            ) : null}

            <Link
              to={`/appointments/create?patientId=${appointment.patientId}`}
              className="block mt-4"
            >
              <Button variant="outline" fullWidth>
                Planifier un nouveau rendez-vous
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500 mb-3">
              Historique
            </h3>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="h-3 w-3 rounded-full bg-green-600"></span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">
                    Rendez-vous créé
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(appointment.createdAt).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>

              {appointment.updatedAt !== appointment.createdAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="h-3 w-3 rounded-full bg-blue-600"></span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">
                      Rendez-vous mis à jour
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(appointment.updatedAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;
