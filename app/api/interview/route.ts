import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { role, question, answer } = await req.json();

  const prompt = answer
    ? `You are an expert interview coach. The candidate is applying for a ${role} position.
       Question asked: "${question}"
       Candidate's answer: "${answer}"
       Give constructive feedback on their answer in 3-4 sentences. Be encouraging but honest.`
    : `You are an expert interview coach. Generate 1 interview question for a ${role} position fresher.
       Just give the question directly, nothing else.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
  });

  return NextResponse.json({
    result: response.choices[0].message.content,
  });
}