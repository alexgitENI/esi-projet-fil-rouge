// src/pages/settings/SettingsPage.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/common/InputField/InputField";
import Button from "../../components/common/Button/Button";
import Alert from "../../components/common/Alert/Alert";

// Schémas de validation
const profileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "notifications"
  >("profile");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "Jean", // Simulé
      lastName: "Dupont", // Simulé
      email: user?.email || "",
      phone: "06 12 34 56 78", // Simulé
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setIsSubmittingProfile(true);
      setProfileError(null);

      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError(
        "Une erreur est survenue lors de la mise à jour du profil"
      );
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      setIsSubmittingPassword(true);
      setPasswordError(null);

      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Mot de passe modifié avec succès");
      resetPassword();
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(
        "Une erreur est survenue lors de la modification du mot de passe"
      );
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Paramètres</h1>
        <p className="mt-1 text-neutral-500">
          Gérez vos préférences et informations personnelles
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-neutral-200">
        <nav className="flex -mb-px">
          <button
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profil
          </button>
          <button
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === "password"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
            onClick={() => setActiveTab("password")}
          >
            Mot de passe
          </button>
          <button
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="space-y-6">
        {/* Onglet Profil */}
        {activeTab === "profile" && (
          <div className="card">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">
              Informations personnelles
            </h2>

            {profileError && (
              <Alert
                variant="error"
                message={profileError}
                onClose={() => setProfileError(null)}
                className="mb-4"
              />
            )}

            <form
              onSubmit={handleSubmitProfile(onSubmitProfile)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  id="firstName"
                  label="Prénom"
                  {...registerProfile("firstName")}
                  error={profileErrors.firstName?.message}
                  required
                />

                <InputField
                  id="lastName"
                  label="Nom"
                  {...registerProfile("lastName")}
                  error={profileErrors.lastName?.message}
                  required
                />

                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  {...registerProfile("email")}
                  error={profileErrors.email?.message}
                  required
                />

                <InputField
                  id="phone"
                  label="Téléphone"
                  type="tel"
                  {...registerProfile("phone")}
                  error={profileErrors.phone?.message}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingProfile}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Onglet Mot de passe */}
        {activeTab === "password" && (
          <div className="card">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">
              Modification du mot de passe
            </h2>

            {passwordError && (
              <Alert
                variant="error"
                message={passwordError}
                onClose={() => setPasswordError(null)}
                className="mb-4"
              />
            )}

            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <InputField
                  id="currentPassword"
                  label="Mot de passe actuel"
                  type="password"
                  {...registerPassword("currentPassword")}
                  error={passwordErrors.currentPassword?.message}
                  required
                />

                <InputField
                  id="newPassword"
                  label="Nouveau mot de passe"
                  type="password"
                  {...registerPassword("newPassword")}
                  error={passwordErrors.newPassword?.message}
                  required
                  helperText="8 caractères minimum"
                />

                <InputField
                  id="confirmPassword"
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  {...registerPassword("confirmPassword")}
                  error={passwordErrors.confirmPassword?.message}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingPassword}
                >
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Onglet Notifications */}
        {activeTab === "notifications" && (
          <div className="card">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">
              Préférences de notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="notifications-email"
                    name="notifications-email"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="notifications-email"
                    className="font-medium text-neutral-900"
                  >
                    Notifications par email
                  </label>
                  <p className="text-neutral-500">
                    Recevoir les notifications concernant les rendez-vous et
                    autres mises à jour par email.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="notifications-sms"
                    name="notifications-sms"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="notifications-sms"
                    className="font-medium text-neutral-900"
                  >
                    Notifications par SMS
                  </label>
                  <p className="text-neutral-500">
                    Recevoir des rappels de rendez-vous par SMS.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="notifications-appointments"
                    name="notifications-appointments"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="notifications-appointments"
                    className="font-medium text-neutral-900"
                  >
                    Rappels de rendez-vous
                  </label>
                  <p className="text-neutral-500">
                    Recevoir un rappel 24h avant chaque rendez-vous.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="notifications-system"
                    name="notifications-system"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="notifications-system"
                    className="font-medium text-neutral-900"
                  >
                    Notifications système
                  </label>
                  <p className="text-neutral-500">
                    Recevoir des notifications concernant les mises à jour du
                    système.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() =>
                  toast.success("Préférences de notifications enregistrées")
                }
              >
                Enregistrer les préférences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;