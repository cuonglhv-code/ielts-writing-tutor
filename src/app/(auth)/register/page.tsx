'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSiteUrl } from '@/lib/get-url';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

const BAND_OPTIONS = Array.from({ length: 19 }, (_, i) => i * 0.5);

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentBand, setCurrentBand] = useState(0);
  const [targetBand, setTargetBand] = useState(6.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function validate(): boolean {
    if (!fullName.trim()) {
      setError('Full name is required.');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (age) {
      const ageNum = Number(age);
      if (Number.isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
        setError('Age must be between 10 and 100.');
        return false;
      }
    }
    if (targetBand < currentBand) {
      setError('Target band should be higher than or equal to your current band.');
      return false;
    }
    setError(null);
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();
    const siteUrl = getSiteUrl();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}auth/callback`,
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: fullName.trim(),
        age: age ? Number(age) : null,
        phone: phone || null,
        address: address || null,
        current_band: currentBand,
        target_band: targetBand,
        onboarded: true,
      });

      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }
    }

    setLoading(false);
    setSuccessMessage('Check your email to confirm your account.');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create your Jaxtina IELTS account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tell us a bit about you so we can personalise your practice plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4">
          <Field label="Full name" required>
            <input
              type="text"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>

          <Field label="Password" required>
            <input
              type="password"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Age">
              <input
                type="number"
                min={10}
                max={100}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label="Address">
              <input
                type="text"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Current band" required>
              <select
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={currentBand}
                onChange={(e) => setCurrentBand(Number(e.target.value))}
              >
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b.toFixed(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target band" required>
              <select
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={targetBand}
                onChange={(e) => setTargetBand(Number(e.target.value))}
              >
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b.toFixed(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-sm text-emerald-600" role="status">
              {successMessage}
            </p>
          )}

          <Button
            type="submit"
            className="mt-2 w-full justify-center"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="font-medium text-brand-accent hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
