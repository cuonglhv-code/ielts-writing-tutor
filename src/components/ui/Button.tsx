import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: Props) {
  const base =
    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 disabled:cursor-not-allowed disabled:opacity-60';

  const variants: Record<NonNullable<Props['variant']>, string> = {
    primary:
      'bg-brand-navy text-white hover:bg-slate-900 shadow-sm',
    secondary:
      'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-700 hover:bg-slate-100',
  };

  return (
    <button
      className={[base, variants[variant], className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
