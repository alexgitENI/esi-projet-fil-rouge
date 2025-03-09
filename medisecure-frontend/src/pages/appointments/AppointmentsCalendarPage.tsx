// src/pages/appointments/AppointmentsCalendarPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Types pour les rendez-vous
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

// Types pour les jours du calendrier
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

const AppointmentsCalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);

  // Charger les rendez-vous
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);

        // Simuler l'appel API
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Données de test
        const mockAppointments: Appointment[] = [
          {
            id: "1",
            patientId: "101",
            patientName: "Sophie Martin",
            startTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              15,
              10,
              0
            ).toISOString(),
            endTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              15,
              10,
              30
            ).toISOString(),
            status: "confirmed",
            notes: "Consultation de routine",
          },
          {
            id: "2",
            patientId: "102",
            patientName: "Thomas Dubois",
            startTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              15,
              11,
              0
            ).toISOString(),
            endTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              15,
              11,
              30
            ).toISOString(),
            status: "scheduled",
            notes: "Première consultation",
          },
          {
            id: "3",
            patientId: "103",
            patientName: "Emma Petit",
            startTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              18,
              14,
              0
            ).toISOString(),
            endTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              18,
              14,
              45
            ).toISOString(),
            status: "confirmed",
            notes: "Suivi traitement",
          },
          {
            id: "4",
            patientId: "104",
            patientName: "Lucas Bernard",
            startTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              22,
              9,
              30
            ).toISOString(),
            endTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              22,
              10,
              0
            ).toISOString(),
            status: "scheduled",
          },
          {
            id: "5",
            patientId: "105",
            patientName: "Julie Moreau",
            startTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              23,
              15,
              30
            ).toISOString(),
            endTime: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              23,
              16,
              0
            ).toISOString(),
            status: "confirmed",
          },
        ];

        setAppointments(mockAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Erreur lors du chargement des rendez-vous");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentMonth]);

  // Générer les jours du calendrier
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      // Premier jour du mois
      const firstDayOfMonth = new Date(year, month, 1);
      // Dernier jour du mois
      const lastDayOfMonth = new Date(year, month + 1, 0);

      // Jour de la semaine du premier jour (0: dimanche, 1: lundi, ..., 6: samedi)
      const firstDayOfWeek = firstDayOfMonth.getDay();
      // Nombre de jours dans le mois
      const daysInMonth = lastDayOfMonth.getDate();

      // Calculer le premier jour à afficher (peut être du mois précédent)
      const start = new Date(firstDayOfMonth);
      start.setDate(
        start.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
      );

      const days: CalendarDay[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Générer 42 jours (6 semaines)
      for (let i = 0; i < 42; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);

        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.getTime() === today.getTime();

        // Filtrer les rendez-vous pour cette journée
        const dayAppts = appointments.filter((appointment) => {
          const apptDate = new Date(appointment.startTime);
          return (
            apptDate.getFullYear() === date.getFullYear() &&
            apptDate.getMonth() === date.getMonth() &&
            apptDate.getDate() === date.getDate()
          );
        });

        days.push({
          date,
          isCurrentMonth,
          isToday,
          appointments: dayAppts,
        });
      }

      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentMonth, appointments]);

  // Mettre à jour les rendez-vous du jour sélectionné
  useEffect(() => {
    if (!selectedDay) {
      setDayAppointments([]);
      return;
    }

    const filteredAppointments = appointments.filter((appointment) => {
      const apptDate = new Date(appointment.startTime);
      return (
        apptDate.getFullYear() === selectedDay.getFullYear() &&
        apptDate.getMonth() === selectedDay.getMonth() &&
        apptDate.getDate() === selectedDay.getDate()
      );
    });

    // Trier par heure de début
    filteredAppointments.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    setDayAppointments(filteredAppointments);
  }, [selectedDay, appointments]);

  // Naviguer au mois précédent
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  // Naviguer au mois suivant
  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  // Naviguer au mois courant
  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  // Formater l'heure
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Gérer la sélection d'un jour
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day.date);
  };

  // Obtenir le statut d'un rendez-vous sous forme de badge
  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <span className="badge badge-success">Confirmé</span>;
      case "scheduled":
        return <span className="badge badge-warning">Planifié</span>;
      case "cancelled":
        return <span className="badge badge-error">Annulé</span>;
      case "completed":
        return (
          <span className="badge bg-slate-100 text-slate-800">Terminé</span>
        );
      default:
        return null;
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
        <h1 className="text-2xl font-semibold text-slate-900">
          Calendrier des rendez-vous
        </h1>
        <div className="flex space-x-2">
          <Link
            to="/appointments/create"
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
            Nouveau rendez-vous
          </Link>
        </div>
      </div>

      {/* Calendrier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier mensuel */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Navigation du calendrier */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {currentMonth.toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 text-slate-600 hover:text-primary-600 focus:outline-none"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={goToCurrentMonth}
                  className="p-2 text-slate-600 hover:text-primary-600 focus:outline-none"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 text-slate-600 hover:text-primary-600 focus:outline-none"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Grille des jours de la semaine */}
            <div className="grid grid-cols-7 gap-px bg-slate-200">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                (day, index) => (
                  <div
                    key={day}
                    className="bg-slate-100 text-center py-2 text-sm font-medium text-slate-600"
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            {/* Grille des jours */}
            <div className="grid grid-cols-7 gap-px bg-slate-200">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`bg-white min-h-[100px] p-2 ${
                    !day.isCurrentMonth ? "opacity-50" : ""
                  } ${day.isToday ? "bg-primary-50" : ""} ${
                    selectedDay &&
                    selectedDay.getFullYear() === day.date.getFullYear() &&
                    selectedDay.getMonth() === day.date.getMonth() &&
                    selectedDay.getDate() === day.date.getDate()
                      ? "ring-2 ring-primary-500 ring-inset"
                      : ""
                  } hover:bg-slate-50 cursor-pointer transition`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`text-sm font-medium ${
                        day.isToday ? "text-primary-600" : "text-slate-900"
                      }`}
                    >
                      {day.date.getDate()}
                    </div>
                    <div className="flex-1 overflow-y-auto mt-1 space-y-1">
                      {day.appointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`text-xs p-1 rounded truncate ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "scheduled"
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {formatTime(appointment.startTime)} -{" "}
                          {appointment.patientName}
                        </div>
                      ))}
                      {day.appointments.length > 3 && (
                        <div className="text-xs text-slate-500 p-1">
                          +{day.appointments.length - 3} autre(s)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Détails du jour sélectionné */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {selectedDay
              ? selectedDay.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Sélectionnez une date"}
          </h2>

          {selectedDay && dayAppointments.length === 0 ? (
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
              <p className="mt-2">Aucun rendez-vous pour cette date</p>
              <div className="mt-4">
                <Link
                  to={`/appointments/create?date=${
                    selectedDay.toISOString().split("T")[0]
                  }`}
                  className="btn btn-primary"
                >
                  Ajouter un rendez-vous
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-slate-900">
                      {formatTime(appointment.startTime)} -{" "}
                      {formatTime(appointment.endTime)}
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="text-slate-900 font-medium mb-1">
                    {appointment.patientName}
                  </div>
                  {appointment.notes && (
                    <div className="text-sm text-slate-600 mb-2">
                      {appointment.notes}
                    </div>
                  )}
                  <div className="flex mt-2 space-x-3">
                    <Link
                      to={`/appointments/${appointment.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Détails
                    </Link>
                    <Link
                      to={`/patients/${appointment.patientId}`}
                      className="text-sm text-secondary-600 hover:text-secondary-700"
                    >
                      Voir patient
                    </Link>
                  </div>
                </div>
              ))}
              {selectedDay && (
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    to={`/appointments/create?date=${
                      selectedDay.toISOString().split("T")[0]
                    }`}
                    className="btn btn-primary w-full"
                  >
                    Ajouter un rendez-vous
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsCalendarPage;