// src/components/common/SelectField/SelectField.tsx
import React, { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      size = "md",
      fullWidth = true,
      className = "",
      id,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "py-1 text-xs",
      md: "py-2 text-sm",
      lg: "py-3 text-base",
    };

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={`
              ${fullWidth ? "w-full" : ""}
              ${sizeClasses[size]}
              rounded-md shadow-sm 
              ${
                error
                  ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                  : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
              }
              appearance-none bg-white
            `}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 20 20"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7l3-3 3 3m0 6l-3 3-3-3"
              />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;
