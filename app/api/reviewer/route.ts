import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { resume } = await req.json();

  const prompt = `You are an expert resume reviewer. Review the following resume and give detailed feedback:

${resume}

Provide feedback in these sections:
1. Overall Score (out of 10)
2. Strengths (what is good)
3. Areas to Improve (specific suggestions)
4. Missing Sections (what should be added)
5. ATS Friendliness (will it pass automated screening)
6. One Line Summary (overall verdict)

Be honest, specific and encouraging.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
  });

  return NextResponse.json({
    result: response.choices[0].message.content,
  });
}