import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
    try {
        const { taskType, type, topic } = await req.json();

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        const isTask2 = taskType === "task2";

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 400,
            system: "You are an IELTS test writer. Generate an authentic IELTS writing question. Respond with ONLY the question text, no preamble.",
            messages: [{
                role: "user",
                content: `Generate an authentic IELTS Academic Writing ${isTask2 ? "Task 2" : "Task 1"} question.\nType: ${type}\nTopic: ${topic}\n${!isTask2 ? "Include brief chart/graph data in square brackets." : ""}\nWrite exactly as it would appear on an IELTS exam paper.`
            }]
        });

        const raw = message.content
            .filter((b) => b.type === 'text')
            .map((b) => (b as { text: string }).text)
            .join('');

        return NextResponse.json({ text: raw });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
