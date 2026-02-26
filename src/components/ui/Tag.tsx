import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  color?: 'slate' | 'emerald' | 'amber' | 'red' | 'indigo';
};

export function Tag({ children, color = 'slate' }: Props) {
  const colors: Record<NonNullable<Props['color']>, string> = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${colors[color]}`}
    >
      {children}
    </span>
  );
}
