// src/components/common/Button/Button.tsx
import React, { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...rest
}) => {
  // Classes de base pour tous les boutons
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";

  // Classes spécifiques aux variantes
  const variantClasses = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary:
      "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500",
    outline:
      "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500",
    danger: "bg-error-500 text-white hover:bg-error-600 focus:ring-error-500",
    success:
      "bg-success-500 text-white hover:bg-success-600 focus:ring-success-500",
  };

  // Classes spécifiques aux tailles
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  // Classes pour la largeur
  const widthClasses = fullWidth ? "w-full" : "";

  // Classes pour l'état désactivé ou chargement
  const stateClasses =
    disabled || isLoading ? "opacity-70 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${stateClasses} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <svg
          className={`animate-spin h-4 w-4 ${
            iconPosition === "left" ? "mr-2 -ml-1" : "ml-2 -mr-1"
          }`}
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
      )}
      {!isLoading && icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {!isLoading && icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;
