'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 ${className}`}
            {...props}
          />
          {label && (
            <label htmlFor={props.id} className="ml-2 block text-sm text-gray-700">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';




