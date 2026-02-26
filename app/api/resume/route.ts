import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { name, email, phone, role, skills, education, projects, experience } = await req.json();

  const prompt = `Create a professional resume for a fresher with the following details:

Name: ${name}
Email: ${email}
Phone: ${phone}
Target Role: ${role}
Skills: ${skills}
Education: ${education}
Projects: ${projects}
Experience: ${experience}

Format it as a clean, professional resume with proper sections:
- Contact Information
- Objective Statement (2 lines, tailored to the role)
- Education
- Skills
- Projects
- Experience (if any)

Make it ATS friendly and impressive. Use plain text formatting with clear section headers.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });

  return NextResponse.json({
    result: response.choices[0].message.content,
  });
}