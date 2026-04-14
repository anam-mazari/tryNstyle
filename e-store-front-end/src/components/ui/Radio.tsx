'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        <div className="flex items-center">
          <input
            ref={ref}
            type="radio"
            className={`h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900 ${className}`}
            {...props}
          />
          <label htmlFor={props.id} className="ml-2 block text-sm text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

interface RadioGroupProps {
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export function RadioGroup({ name, options, value, onChange, error }: RadioGroupProps) {
  return (
    <div>
      <div className="space-y-2">
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            label={option.label}
          />
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}




