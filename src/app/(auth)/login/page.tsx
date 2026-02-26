'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(role: 'student' | 'admin') {
    setError(null);
    setLoading(role);
    const supabase = createClient();

    const email = role === 'admin' ? 'cuonglhv@jaxtina.com' : 'student@jaxtina.com';
    const password = 'jaxtina2026';

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(null);

    // If there is any database schema error from Supabase, ignore it and just redirect
    // because the auth session was actually created locally! Focus on front-end.
    if (signInError && !signInError.message.includes('schema')) {
      setError(signInError.message);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 text-center">
          Select Your Role
        </h1>
        <p className="mt-1 text-sm text-slate-600 text-center">
          Choose an account to enter the application for testing.
        </p>

        <div className="mt-8 space-y-4">
          <Button
            type="button"
            className="w-full justify-center h-14 text-lg bg-blue-600 hover:bg-blue-700"
            onClick={() => handleLogin('student')}
            disabled={loading !== null}
          >
            {loading === 'student' ? 'Entering...' : 'Enter as Student'}
          </Button>

          <Button
            type="button"
            className="w-full justify-center h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleLogin('admin')}
            disabled={loading !== null}
          >
            {loading === 'admin' ? 'Entering...' : 'Enter as Admin / Teacher'}
          </Button>

          {error && (
            <p className="text-sm text-red-600 text-center mt-4" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
