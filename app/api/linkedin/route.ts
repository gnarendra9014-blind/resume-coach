import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, role } = body;

    const prompt = `You are an expert LinkedIn profile optimizer and career coach. Based on the candidate's following resume and their target role of ${role}, generate optimized content for their LinkedIn profile. 

Return exactly two sections in plain text:
1. [HEADLINE]: A highly engaging, keyword-rich LinkedIn headline (under 120 characters) that stands out to recruiters looking for this role.
2. [ABOUT]: A persuasive, story-driven "About" section that highlights their top skills, experience, and passion. Make it sound professional yet approachable. Do not use cheesy buzzwords. Break it into readable paragraphs.

Candidate's Resume:
${resume}

Please ensure the output only contains the headline and the about section.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ linkedInOptimized: response.choices[0].message.content });
  } catch (error: any) {
    console.error("LinkedIn Optimizer error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
