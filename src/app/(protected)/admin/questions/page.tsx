'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type {
  Task1Type,
  Task2QuestionType,
  WritingPrompt,
} from '@/types/prompt';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { QuestionCreateForm } from '@/components/QuestionCreateForm';

const PAGE_SIZE = 20;

type TaskFilter = 'all' | 'task1' | 'task2';

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);
  const [filters, setFilters] = useState<{
    task: TaskFilter;
    task1_type?: Task1Type | '';
    task2_type?: Task2QuestionType | '';
    difficulty?: number | '';
  }>({ task: 'all' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [aiCandidates, setAiCandidates] = useState<any[] | null>(
    null,
  );
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (
        !profile ||
        !['admin', 'teacher'].includes(profile.role)
      ) {
        router.replace('/dashboard');
        return;
      }
      setRoleChecked(true);
    }
    void checkRole();
  }, [router]);

  useEffect(() => {
    if (!roleChecked) return;
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('writing_prompts')
        .select(
          'id, task, task1_type, task2_question_type, prompt_text, difficulty, topic_tags, image_url, visual_description, metadata, created_at',
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (filters.task !== 'all') {
        query = query.eq('task', filters.task);
      }
      if (filters.task1_type) {
        query = query.eq('task1_type', filters.task1_type);
      }
      if (filters.task2_type) {
        query = query.eq(
          'task2_question_type',
          filters.task2_type,
        );
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      const { data, count, error } = await query;

      if (!cancelled) {
        if (error) {
          setError(error.message);
        } else {
          setPrompts((data ?? []) as WritingPrompt[]);
          setTotal(count ?? 0);
        }
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [filters, page, roleChecked]);

  async function handleGenerateAI() {
    setLoadingAI(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task:
            filters.task === 'all'
              ? 'task2'
              : filters.task,
          task1_type: filters.task1_type || undefined,
          task2_question_type:
            filters.task2_type || undefined,
          count: 3,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to generate questions.');
      }
      const data = await res.json();
      setAiCandidates(data.candidates ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Unexpected error while generating.');
    } finally {
      setLoadingAI(false);
    }
  }

  async function insertCandidate(index: number) {
    const supabase = createClient();
    const candidate = aiCandidates?.[index];
    if (!candidate) return;

    const { error } = await supabase
      .from('writing_prompts')
      .insert(candidate);
    if (error) {
      setError(error.message);
      return;
    }
    setAiCandidates(null);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!roleChecked) {
    return (
      <p className="text-sm text-slate-600">
        Checking permissions…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Writing prompts
          </h1>
          <p className="text-xs text-slate-600">
            Manage Task 1 and Task 2 questions for Jaxtina students.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowCreate(true)}
          >
            Add question
          </Button>
          <Button
            type="button"
            onClick={() => void handleGenerateAI()}
            disabled={loadingAI}
          >
            {loadingAI ? 'Generating…' : 'AI Generate'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs">
        <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1"
          value={filters.task}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              task: e.target.value as TaskFilter,
            }))
          }
        >
          <option value="all">All tasks</option>
          <option value="task1">Task 1</option>
          <option value="task2">Task 2</option>
        </select>

        {filters.task !== 'task2' && (
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1"
            value={filters.task1_type ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                task1_type: e.target.value as Task1Type | '',
              }))
            }
          >
            <option value="">All Task 1 types</option>
            <option value="graph">Graph</option>
            <option value="table">Table</option>
            <option value="process">Process</option>
            <option value="map">Map</option>
          </select>
        )}

        {filters.task !== 'task1' && (
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1"
            value={filters.task2_type ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                task2_type: e.target.value as Task2QuestionType | '',
              }))
            }
          >
            <option value="">All Task 2 types</option>
            <option value="agree_disagree">
              Agree / Disagree
            </option>
            <option value="discuss_both_views">
              Discuss both views
            </option>
            <option value="problem_solution">
              Problem / Solution
            </option>
            <option value="advantages_disadvantages">
              Advantages / Disadvantages
            </option>
            <option value="two_direct_questions">
              Two direct questions
            </option>
          </select>
        )}

        <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1"
          value={filters.difficulty ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              difficulty: e.target.value
                ? Number(e.target.value)
                : '',
            }))
          }
        >
          <option value="">All difficulty</option>
          <option value={1}>1 — Foundation</option>
          <option value={2}>2 — Intermediate</option>
          <option value={3}>3 — Advanced</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
          {loading
            ? 'Loading prompts…'
            : `Showing ${prompts.length} of ${total} prompts`}
        </div>
        <ul className="divide-y divide-slate-100">
          {prompts.map((p) => (
            <li key={p.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                    <Tag color="indigo">
                      {p.task === 'task1'
                        ? `Task 1 — ${p.task1_type ?? ''}`
                        : `Task 2 — ${
                            p.task2_question_type ?? ''
                          }`}
                    </Tag>
                    <Tag color="amber">
                      Difficulty {p.difficulty}
                    </Tag>
                    {p.topic_tags?.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <p className="text-sm text-slate-800">
                    {p.prompt_text}
                  </p>
                </div>
              </div>
            </li>
          ))}
          {!loading && prompts.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-600">
              No prompts match these filters.
            </li>
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page === totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      {showCreate && (
        <QuestionCreateForm
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setPage(1);
          }}
        />
      )}

      {aiCandidates && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-6 shadow-xl text-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Review AI-generated questions
              </h2>
              <button
                type="button"
                onClick={() => setAiCandidates(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <ul className="mt-4 space-y-4">
              {aiCandidates.map((q, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs text-slate-500">
                    Candidate {idx + 1}
                  </p>
                  <p className="mt-2 text-sm text-slate-800">
                    {q.prompt_text}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {q.task && <Tag>{q.task}</Tag>}
                    {q.task1_type && (
                      <Tag>Task 1 — {q.task1_type}</Tag>
                    )}
                    {q.task2_question_type && (
                      <Tag>Task 2 — {q.task2_question_type}</Tag>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => void insertCandidate(idx)}
                    >
                      Insert question
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
