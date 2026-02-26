import type { Task1Prompt } from '@/types/prompt';
import { Tag } from './ui/Tag';

type Props = {
  prompt: Task1Prompt;
};

export function Task1Instructions({ prompt }: Props) {
  const checklist: string[] = [];
  const metaLines: string[] = [];

  switch (prompt.task1_type) {
    case 'graph':
      checklist.push(
        'Write an overview of the main trends.',
        'Group data logically (e.g. highest vs lowest).',
        'Use a range of comparison phrases and data.',
        'Highlight at least two key similarities and differences.',
        'Avoid giving reasons that are not in the chart.',
      );
      break;
    case 'table':
      checklist.push(
        'Introduce what the table shows in your own words.',
        'Summarise the most important high and low values.',
        'Compare rows and columns, not each number individually.',
        'Use accurate figures to support your overview.',
        'Avoid listing every number mechanically.',
      );
      break;
    case 'process':
      checklist.push(
        'Describe the process from the first to last stage.',
        'Group stages logically (e.g. preparation / main / final).',
        'Use passive voice and sequencing language.',
        'Mention all inputs, transformations and outputs.',
        'Do not explain why the process happens; only describe it.',
      );
      if (
        typeof prompt.metadata === 'object' &&
        'stages' in prompt.metadata
      ) {
        metaLines.push(
          `Number of stages: ${
            (prompt.metadata as any).stages
          } (${(prompt.metadata as any).flow ?? 'linear'} process).`,
        );
      }
      break;
    case 'map':
      checklist.push(
        'Describe the location in the first map clearly.',
        'Explain the main changes in layout and land use.',
        'Group changes by area (e.g. north, centre, south).',
        'Highlight what has been removed, added and retained.',
        'Avoid speculating about reasons for the changes.',
      );
      if (
        typeof prompt.metadata === 'object' &&
        'years' in prompt.metadata
      ) {
        const meta = prompt.metadata as any;
        metaLines.push(
          `Compare changes between ${meta.years?.[0]} and ${meta.years?.[1]}.`,
        );
        if (meta.key_changes?.length) {
          metaLines.push(
            `Key changes: ${meta.key_changes.join(', ')}.`,
          );
        }
      }
      break;
  }

  return (
    <section className="rounded-lg border border-sky-100 bg-sky-50/60 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Tag color="indigo">Task 1 — {prompt.task1_type}</Tag>
        </div>
      </div>
      <p className="mt-2 text-slate-700">{prompt.prompt_text}</p>

      <p className="mt-2 text-xs text-slate-500">
        Visual description: {prompt.visual_description}
      </p>

      {metaLines.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600">
          {metaLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Checklist before you submit
        </p>
        <ul className="list-disc space-y-1 pl-4 text-xs text-slate-700">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
