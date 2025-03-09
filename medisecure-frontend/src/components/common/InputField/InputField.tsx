// src/components/common/InputField/InputField.tsx
import React, { InputHTMLAttributes, forwardRef } from "react";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      fullWidth = true,
      className = "",
      id,
      ...rest
    },
    ref
  ) => {
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
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {startIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`${fullWidth ? "w-full" : ""} rounded-md shadow-sm ${
              error
                ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
            } ${startIcon ? "pl-10" : ""} ${endIcon ? "pr-10" : ""}`}
            {...rest}
          />
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
