import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { EXAMINER_SYSTEM } from '@/lib/examiner-prompt';

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { essay, promptText, taskType, wordCount } =
    await req.json();

  if (!essay || !promptText) {
    return NextResponse.json(
      { error: 'Missing fields' },
      { status: 400 },
    );
  }

  const anthropic = new Anthropic();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: EXAMINER_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `IELTS ${taskType === 'task2'
          ? 'Writing Task 2'
          : 'Writing Task 1'
          } Question:\n${promptText}\n\nStudent Essay (${wordCount} words):\n${essay}\n\nMark strictly. Return ONLY the JSON object.`,
      },
    ],
  });

  const raw = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('');

  const cleaned = raw.replace(/```json\n?|```/g, '').trim();
  const feedback = JSON.parse(cleaned);

  if (user) {
    await supabase.from('submissions').insert({
      student_id: user.id,
      task_type: taskType,
      essay_text: essay,
      word_count: wordCount,
      overall_band: feedback.overallBand,
      criteria_scores: {
        TR: feedback.criteriaScores?.TR?.band,
        CC: feedback.criteriaScores?.CC?.band,
        LR: feedback.criteriaScores?.LR?.band,
        GRA: feedback.criteriaScores?.GRA?.band,
      },
      feedback_json: feedback,
    });
  }

  return NextResponse.json({ feedback });
}
