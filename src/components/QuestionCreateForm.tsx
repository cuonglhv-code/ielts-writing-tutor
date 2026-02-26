'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  Task1Type,
  Task2QuestionType,
} from '@/types/prompt';
import { Button } from './ui/Button';
import { Field } from './ui/Field';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function QuestionCreateForm({
  open,
  onClose,
  onCreated,
}: Props) {
  const [task, setTask] = useState<'task1' | 'task2'>('task2');
  const [task1Type, setTask1Type] = useState<Task1Type | ''>('');
  const [task2Type, setTask2Type] =
    useState<Task2QuestionType | ''>('');
  const [promptText, setPromptText] = useState('');
  const [visualDescription, setVisualDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [topicTags, setTopicTags] = useState('');
  const [metadata, setMetadata] = useState('{}');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function validate(): Record<string, any> | null {
    if (!promptText.trim()) {
      setError('Prompt text is required.');
      return null;
    }
    if (task === 'task1' && !task1Type) {
      setError('Please select a Task 1 type.');
      return null;
    }
    if (task === 'task2' && !task2Type) {
      setError('Please select a Task 2 question type.');
      return null;
    }
    if (task === 'task1' && !visualDescription.trim()) {
      setError('Visual description is required for Task 1.');
      return null;
    }

    let parsedMetadata: Record<string, unknown> = {};
    if (metadata.trim()) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        setError('Metadata must be valid JSON.');
        return null;
      }
    }

    const body: Record<string, any> = {
      task,
      prompt_text: promptText.trim(),
      difficulty,
      topic_tags: topicTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      metadata: parsedMetadata,
    };

    if (task === 'task1') {
      body.task1_type = task1Type;
      body.visual_description = visualDescription.trim();
    } else {
      body.task2_question_type = task2Type;
      body.visual_description = null;
    }

    if (imageUrl.trim()) {
      body.image_url = imageUrl.trim();
    }

    return body;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body = validate();
    if (!body) return;

    setLoading(true);
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from('writing_prompts')
      .insert(body);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onCreated?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Add writing prompt
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 text-sm"
        >
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="radio"
                checked={task === 'task1'}
                onChange={() => setTask('task1')}
              />
              Task 1
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="radio"
                checked={task === 'task2'}
                onChange={() => setTask('task2')}
              />
              Task 2
            </label>
          </div>

          {task === 'task1' ? (
            <Field label="Task 1 type" required>
              <select
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={task1Type}
                onChange={(e) =>
                  setTask1Type(e.target.value as Task1Type)
                }
              >
                <option value="">Select type…</option>
                <option value="graph">Graph</option>
                <option value="table">Table</option>
                <option value="process">Process</option>
                <option value="map">Map</option>
              </select>
            </Field>
          ) : (
            <Field label="Task 2 question type" required>
              <select
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={task2Type}
                onChange={(e) =>
                  setTask2Type(
                    e.target.value as Task2QuestionType,
                  )
                }
              >
                <option value="">Select type…</option>
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
            </Field>
          )}

          <Field label="Prompt text" required>
            <textarea
              className="block min-h-[80px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </Field>

          {task === 'task1' && (
            <Field
              label="Visual description"
              required
              hint="Briefly describe the chart, process or map so students can visualise it."
            >
              <textarea
                className="block min-h-[60px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={visualDescription}
                onChange={(e) =>
                  setVisualDescription(e.target.value)
                }
              />
            </Field>
          )}

          <Field label="Image URL">
            <input
              type="url"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Difficulty" required>
              <select
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(Number(e.target.value))
                }
              >
                <option value={1}>1 — Foundation</option>
                <option value={2}>2 — Intermediate</option>
                <option value={3}>3 — Advanced</option>
              </select>
            </Field>
            <Field
              label="Topic tags"
              hint="Comma-separated, e.g. health, society"
            >
              <input
                type="text"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={topicTags}
                onChange={(e) => setTopicTags(e.target.value)}
              />
            </Field>
            <Field
              label="Metadata (JSON)"
              hint="Optional schema for charts/maps/processes."
            >
              <textarea
                className="block min-h-[60px] w-full rounded-md border border-slate-300 px-3 py-2 text-xs shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
              />
            </Field>
          </div>

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
