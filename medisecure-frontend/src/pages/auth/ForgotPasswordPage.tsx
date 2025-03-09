// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import authService from "../../api/services/authService";

// Schéma de validation
const resetPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

type FormData = z.infer<typeof resetPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // En environnement réel, nous utiliserions :
      // await authService.resetPassword(data);

      setIsSubmitted(true);
      toast.success("Instructions envoyées par email");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        "Erreur lors de l'envoi des instructions. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-display font-bold text-primary-600">
            MediSecure
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-neutral-900">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Saisissez votre adresse email pour recevoir des instructions de
            réinitialisation.
          </p>
        </div>

        {isSubmitted ? (
          <div className="mt-8 bg-white py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-success-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">
                Email envoyé
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Si un compte existe avec cette adresse email, vous recevrez des
                instructions pour réinitialiser votre mot de passe.
              </p>
              <div className="mt-6">
                <Link to="/login" className="btn btn-primary w-full">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-white py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="label">
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input ${
                    errors.email
                      ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                      : ""
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className={`btn btn-primary w-full flex justify-center ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
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
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer les instructions"
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
