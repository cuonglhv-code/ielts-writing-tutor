import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/profile';
import type { Submission } from '@/types/submission';
import { StudentDashboard } from '@/components/StudentDashboard';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/register');
  }

  const { data: submissions = [] } = await supabase
    .from('submissions')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <StudentDashboard
      profile={profile as Profile}
      submissions={submissions as Submission[]}
    />
  );
}
