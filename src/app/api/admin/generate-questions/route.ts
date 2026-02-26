import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthenticated' },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'teacher'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 },
    );
  }

  const {
    task,
    count = 3,
    task1_type,
    task2_question_type,
  } = await req.json();

  let query = supabase
    .from('writing_prompts')
    .select(
      'task, task1_type, task2_question_type, prompt_text, difficulty, topic_tags, visual_description, metadata',
    )
    .eq('task', task)
    .limit(10);

  if (task === 'task1' && task1_type) {
    query = query.eq('task1_type', task1_type);
  }
  if (task === 'task2' && task2_question_type) {
    query = query.eq('task2_question_type', task2_question_type);
  }

  const { data: samples } = await query;

  const anthropic = new Anthropic();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system:
      'You are an expert IELTS test writer. Generate original questions matching the style of examples. Return ONLY valid JSON with a "questions" array. No markdown.',
    messages: [
      {
        role: 'user',
        content: `Examples:\n${JSON.stringify(
          samples,
          null,
          2,
        )}\n\nGenerate ${count} new original IELTS ${task} questions${
          task1_type ? ` of type ${task1_type}` : ''
        }${
          task2_question_type
            ? ` of type ${task2_question_type}`
            : ''
        }.\nReturn: { "questions": [...] }`,
      },
    ],
  });

  const raw = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('');

  const data = JSON.parse(
    raw.replace(/```json\n?|```/g, '').trim(),
  );

  return NextResponse.json({
    candidates: data.questions ?? [],
  });
}
