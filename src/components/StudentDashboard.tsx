'use client';

import type { Profile } from '@/types/profile';
import type { Submission } from '@/types/submission';
import {
  buildPersonalisation,
  computeRecentBand,
} from '@/lib/dashboard';
import { Tag } from './ui/Tag';

type Props = {
  profile: Profile;
  submissions: Submission[];
};

export function StudentDashboard({ profile, submissions }: Props) {
  const recentBand = computeRecentBand(submissions) ?? profile.current_band;
  const personalisation = buildPersonalisation(profile, submissions);

  const firstName =
    profile.full_name.trim().split(' ').filter(Boolean)[0] ?? 'Student';

  const progress =
    profile.target_band === 0
      ? 0
      : Math.min(
          100,
          (Math.max(recentBand, 0) / profile.target_band) * 100,
        );

  const lastFive = submissions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Welcome back, {firstName}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Let&apos;s keep moving towards Band {profile.target_band.toFixed(1)}.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              Current trajectory:{' '}
              <span className="font-semibold">
                {recentBand.toFixed(1)}
              </span>
            </span>
            <span className="text-slate-700">
              Target:{' '}
              <span className="font-semibold">
                {profile.target_band.toFixed(1)}
              </span>
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            Band gap: {personalisation.bandGap.toFixed(1)} band
            {personalisation.bandGap === 1 ? '' : 's'}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Tag color="amber">
            Focus: {personalisation.emphasisCriteria.join(' / ')}
          </Tag>
          <Tag color="indigo">
            Level: {personalisation.difficulty}
          </Tag>
          <Tag color="emerald">
            Recommended practice: {personalisation.recommendedTask}
          </Tag>
        </div>

        <p className="mt-4 text-sm text-slate-700">
          {personalisation.coachingNote}
        </p>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Recent submissions
          </h3>
          <span className="text-xs text-slate-500">
            Showing last {lastFive.length} of {submissions.length}
          </span>
        </div>

        {lastFive.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            You haven&apos;t submitted any essays yet. Start a{' '}
            <span className="font-medium">Task 2</span> practice to get
            your first band score.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {lastFive.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {s.task_type === 'task1'
                      ? 'Task 1'
                      : 'Task 2'}{' '}
                    essay
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    Overall band
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {s.overall_band?.toFixed(1) ?? '—'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
