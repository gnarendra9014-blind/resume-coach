import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume } = body;

    const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility and give:
1. A score out of 100
2. 3-5 specific tips to improve it

Resume:
${resume}

Respond in this exact format:
SCORE: [number]
TIPS:
- [tip 1]
- [tip 2]
- [tip 3]`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ result: "Error: " + error.message }, { status: 500 });
  }
}