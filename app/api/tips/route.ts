import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { role } = await req.json();

  const prompt = `You are an expert career coach. Give interview preparation tips for a fresher applying for a ${role} position.

Include:
1. Top 5 commonly asked interview questions for this role
2. Key skills to highlight
3. 3 important tips to crack the interview
4. One common mistake freshers make in this role's interview

Keep it concise, practical and encouraging.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
  });

  return NextResponse.json({
    result: response.choices[0].message.content,
  });
}