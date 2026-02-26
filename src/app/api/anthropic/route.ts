import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
    try {
        const { prompt, maxTokens } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
        }

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: maxTokens || 2000,
            messages: [{ role: "user", content: prompt }]
        });

        const raw = message.content
            .filter((b) => b.type === 'text')
            .map((b) => (b as { text: string }).text)
            .join('');

        return NextResponse.json({ content: [{ text: raw }] }); // Emulate Anthropic response shape for the frontend
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
