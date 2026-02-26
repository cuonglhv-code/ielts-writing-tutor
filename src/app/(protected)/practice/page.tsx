'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  Task1Prompt,
  Task2Prompt,
  WritingPrompt,
} from '@/types/prompt';
import { Task1Instructions } from '@/components/Task1Instructions';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';

type TaskType = 'task1' | 'task2';

type FeedbackJson = Parameters<
  typeof FeedbackPanel
>[0]['feedback'];

const TASK_LIMITS: Record<TaskType, number> = {
  task1: 150,
  task2: 250,
};

const TASK_TIME_SECONDS: Record<TaskType, number> = {
  task1: 20 * 60,
  task2: 40 * 60,
};

export default function PracticePage() {
  const [task, setTask] = useState<TaskType>('task2');
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [essay, setEssay] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackJson | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(
    TASK_TIME_SECONDS[task],
  );
  const [timerRunning, setTimerRunning] = useState(false);

  const wordCount = useMemo(
    () =>
      essay
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
    [essay],
  );

  const selectedPrompt = useMemo(() => {
    const filtered = prompts.filter((p) => p.task === task);
    return filtered[0] ?? null;
  }, [prompts, task]);

  useEffect(() => {
    let cancelled = false;
    async function loadPrompts() {
      setLoadingPrompts(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('writing_prompts')
        .select(
          'id, task, task1_type, task2_question_type, prompt_text, difficulty, topic_tags, image_url, visual_description, metadata, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (!cancelled) {
        if (error) {
          setError(error.message);
        } else {
          setPrompts((data ?? []) as WritingPrompt[]);
        }
        setLoadingPrompts(false);
      }
    }
    loadPrompts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSecondsLeft(TASK_TIME_SECONDS[task]);
    setTimerRunning(false);
    setEssay('');
    setFeedback(null);
    setError(null);
  }, [task]);

  useEffect(() => {
    if (!timerRunning) return;
    if (secondsLeft <= 0) {
      setTimerRunning(false);
      void handleSubmit(true);
      return;
    }
    const id = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [timerRunning, secondsLeft]);

  async function handleSubmit(auto = false) {
    if (!selectedPrompt) return;
    if (!essay.trim()) {
      if (!auto) setError('Please write your essay before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay,
          promptText: selectedPrompt.prompt_text,
          taskType: task,
          wordCount,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to mark essay.');
      }

      const data = await res.json();
      setFeedback(data.feedback as FeedbackJson);
      setTimerRunning(false);
    } catch (e: any) {
      setError(e.message ?? 'Unexpected error while marking essay.');
    } finally {
      setSubmitting(false);
    }
  }

  const minWords = TASK_LIMITS[task];
  const progress =
    minWords === 0 ? 0 : Math.min(100, (wordCount / minWords) * 100);
  const progressColor =
    wordCount >= minWords ? 'bg-emerald-500' : 'bg-amber-500';

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Practice session
          </h1>
          <p className="text-xs text-slate-600">
            Choose a task, write your essay, and receive AI examiner
            feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tag color="slate">
            Time limit:{' '}
            {task === 'task1' ? '20 minutes' : '40 minutes'}
          </Tag>
          <Tag color={timerRunning ? 'emerald' : 'amber'}>
            Timer: {minutes}:{seconds}
          </Tag>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setTimerRunning((v) => !v)}
          >
            {timerRunning ? 'Pause' : 'Start'} timer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <Button
          type="button"
          variant={task === 'task1' ? 'primary' : 'secondary'}
          onClick={() => setTask('task1')}
        >
          Task 1
        </Button>
        <Button
          type="button"
          variant={task === 'task2' ? 'primary' : 'secondary'}
          onClick={() => setTask('task2')}
        >
          Task 2
        </Button>
      </div>

      {loadingPrompts && (
        <p className="text-sm text-slate-600">
          Loading prompts…
        </p>
      )}
      {!loadingPrompts && !selectedPrompt && (
        <p className="text-sm text-red-600">
          No prompts available. Please seed the database.
        </p>
      )}

      {selectedPrompt && (
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-3">
            {task === 'task1' ? (
              <Task1Instructions
                prompt={selectedPrompt as Task1Prompt}
              />
            ) : (
              <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
                <Tag color="indigo">Task 2</Tag>
                <p className="mt-2 text-slate-700">
                  {selectedPrompt.prompt_text}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Question type:{' '}
                  {(selectedPrompt as Task2Prompt)
                    .task2_question_type ?? '—'}
                </p>
              </section>
            )}
          </div>

          <div className="space-y-3">
            <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <div className="flex items-center justify-between text-xs">
                <p className="font-medium text-slate-800">
                  Your essay
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">
                    Words:{' '}
                    <span className="font-semibold">
                      {wordCount}
                    </span>{' '}
                    / {minWords}
                  </span>
                </div>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${progressColor}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <textarea
                className="mt-3 h-64 w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                placeholder={
                  task === 'task1'
                    ? 'Aim for at least 150 words describing the key features of the chart, process or map...'
                    : 'Aim for at least 250 words presenting and supporting your position...'
                }
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
              />

              {error && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Your work is only saved once feedback has been
                  generated.
                </p>
                <Button
                  type="button"
                  onClick={() => void handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? 'Sending to examiner…' : 'Submit for band score'}
                </Button>
              </div>
            </section>

            {feedback && (
              <FeedbackPanel feedback={feedback} essay={essay} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
