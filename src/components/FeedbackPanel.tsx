'use client';

import { useState } from 'react';
import { Tag } from './ui/Tag';

type CriterionKey = 'TR' | 'CC' | 'LR' | 'GRA';

type CriterionDetail = {
  band: number;
  label: string;
  feedback: string;
  bandRationale: string;
};

type FeedbackJson = {
  taskType: string;
  wordCount: number;
  wordCountNote: string;
  criteriaScores: Record<CriterionKey, CriterionDetail>;
  overallBand: number;
  examinerSummary: string;
  taskSpecificFeedback: string;
  priorityImprovements: string[];
  vocabularyHighlights: {
    effective: string[];
    problematic: string[];
  };
  errorAnnotations: {
    quote: string;
    type: 'Grammar' | 'Vocabulary' | 'Spelling' | 'Punctuation';
    issue: string;
    correction: string;
  }[];
  modelParagraph: string;
  originalParagraph: string;
  comparativeLevel: string;
};

type Props = {
  feedback: FeedbackJson;
  essay: string;
};

const TABS = ['Overview', 'Criteria', 'Errors', 'Improve', 'Model'] as const;

export function FeedbackPanel({ feedback, essay }: Props) {
  const [tab, setTab] =
    useState<(typeof TABS)[number]>('Overview');

  const criteriaEntries = Object.entries(
    feedback.criteriaScores,
  ) as [CriterionKey, CriterionDetail][];

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="bg-brand-navy px-6 py-4 text-sm text-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Overall band score
            </p>
            <p className="text-3xl font-semibold text-white">
              {feedback.overallBand.toFixed(1)}
            </p>
            <p className="mt-1 text-xs text-slate-200">
              {feedback.taskType} • {feedback.wordCount} words •{' '}
              {feedback.wordCountNote}
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            {criteriaEntries.map(([key, detail]) => (
              <div
                key={key}
                className="rounded-md bg-slate-900/50 px-3 py-2 text-right"
              >
                <p className="text-[10px] uppercase tracking-wide text-slate-300">
                  {key}
                </p>
                <p className="text-lg font-semibold text-white">
                  {detail.band.toFixed(1)}
                </p>
                <p className="text-[11px] text-slate-200">
                  {detail.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-slate-50 px-4">
        <nav className="flex gap-2 text-xs font-medium text-slate-600">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-b-2 px-3 py-2 ${
                tab === t
                  ? 'border-brand-accent text-brand-accent'
                  : 'border-transparent hover:border-slate-200 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4 px-6 py-4 text-sm text-slate-800">
        {tab === 'Overview' && (
          <>
            <p className="font-semibold">
              Examiner summary
            </p>
            <p className="text-slate-700">
              {feedback.examinerSummary}
            </p>

            <p className="mt-4 text-sm font-semibold">
              Task-specific feedback
            </p>
            <p className="text-slate-700">
              {feedback.taskSpecificFeedback}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {criteriaEntries.map(([key, detail]) => (
                <div
                  key={key}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="text-xs font-semibold text-slate-600">
                    {key} — {detail.label}
                  </p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${(detail.band / 9) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {detail.feedback}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Comparative level: {feedback.comparativeLevel}
            </p>
          </>
        )}

        {tab === 'Criteria' && (
          <div className="grid gap-4 md:grid-cols-2">
            {criteriaEntries.map(([key, detail]) => (
              <article
                key={key}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <header className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    {key} — {detail.label}
                  </p>
                  <Tag color="emerald">
                    Band {detail.band.toFixed(1)}
                  </Tag>
                </header>
                <p className="mt-2 text-sm text-slate-700">
                  {detail.feedback}
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-700">
                  Why not higher?
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {detail.bandRationale}
                </p>
              </article>
            ))}
          </div>
        )}

        {tab === 'Errors' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Error annotations
              </p>
              {feedback.errorAnnotations.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">
                  No specific errors were highlighted.
                </p>
              ) : (
                <ul className="mt-2 space-y-3 text-sm">
                  {feedback.errorAnnotations.map((err, idx) => (
                    <li
                      key={`${err.quote}-${idx}`}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Tag color="red">{err.type}</Tag>
                      </div>
                      <p className="mt-2 text-xs italic text-slate-700">
                        “{err.quote}”
                      </p>
                      <p className="mt-1 text-xs text-slate-700">
                        Issue: {err.issue}
                      </p>
                      <p className="mt-1 text-xs text-emerald-700">
                        Suggested correction: {err.correction}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Vocabulary highlights
              </p>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-emerald-700">
                    Effective use
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-slate-700">
                    {feedback.vocabularyHighlights.effective.map(
                      (v) => (
                        <li key={v}>• {v}</li>
                      ),
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700">
                    Problematic
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-slate-700">
                    {feedback.vocabularyHighlights.problematic.map(
                      (v) => (
                        <li key={v}>• {v}</li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'Improve' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              Top priorities for your next essay
            </p>
            <ol className="space-y-2 text-sm text-slate-700">
              {feedback.priorityImprovements.map((item, idx) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 h-5 w-5 flex-none rounded-full bg-brand-navy text-center text-xs font-semibold text-white">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {tab === 'Model' && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Your original paragraph
              </p>
              <div className="mt-2 max-h-80 overflow-auto rounded-md border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800">
                {feedback.originalParagraph || essay}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Examiner&apos;s model
              </p>
              <div className="mt-2 max-h-80 overflow-auto rounded-md border border-emerald-100 bg-emerald-50/60 p-3 text-xs leading-relaxed text-slate-900">
                {feedback.modelParagraph}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
