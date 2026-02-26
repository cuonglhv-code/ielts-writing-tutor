import type { ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
};

export function Field({ label, children, required, hint, error }: Props) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-flex items-center gap-1 font-medium text-slate-800">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}
