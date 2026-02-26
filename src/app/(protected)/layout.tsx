import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const firstName =
    (profile?.full_name ?? '')
      .trim()
      .split(' ')
      .filter(Boolean)[0] ?? 'Student';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-navy px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Jaxtina
            </span>
            <span className="text-sm font-medium text-slate-700">
              IELTS Writing Tutor
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-700">
            <Link href="/dashboard" className="hover:text-brand-accent">
              Dashboard
            </Link>
            <Link href="/practice" className="hover:text-brand-accent">
              Practice
            </Link>
            {(profile?.role === 'admin' || profile?.role === 'teacher') && (
              <Link
                href="/admin/questions"
                className="hover:text-brand-accent"
              >
                Admin
              </Link>
            )}
            <span className="text-xs text-slate-500">
              Hi, {firstName}
            </span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
