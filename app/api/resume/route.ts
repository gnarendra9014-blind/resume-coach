import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role, skills, education, projects, experience, language, template } = body;

    const languageInstruction = language && language !== "english"
      ? `Write the entire resume in ${language} language.`
      : "";

    const templateMap: Record<string, string> = {
      classic: `Use a traditional resume format with sections: Summary, Education, Skills, Projects, Experience. Use plain text with clear headers in ALL CAPS.`,
      modern: `Use a modern resume format. Use bold section headers with a line separator (---) under each. Include a brief professional summary at the top.`,
      minimal: `Use a minimal resume format. Keep it concise and to the point. No fluff. Only the most important details. Max 1 page worth of content.`,
      creative: `Use a creative resume format. Start with a strong personal branding statement. Use unique section names like "What I Know", "What I've Built", "Where I've Studied". Make it memorable and stand out.`,
    };

    const templateInstruction = templateMap[template] || templateMap["classic"];

    const prompt = `Create a professional resume for a fresher with the following details:
Name: ${name}
Email: ${email}
Phone: ${phone}
Target Role: ${role}
Skills: ${skills}
Projects: ${projects}
Experience: ${experience}
Education: ${education}

Template Style: ${templateInstruction}
${languageInstruction}
Make it ATS friendly and impressive. Use plain text formatting.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error: any) {
    console.error("Groq error:", error.message);
    return NextResponse.json({ result: "Error: " + error.message }, { status: 500 });
  }
}