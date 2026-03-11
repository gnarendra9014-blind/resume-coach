import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
// @ts-ignore
import pdfParse from "pdf-parse";

// Using the same Groq client configuration that your app currently uses
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let text = "";

    // Extract text depending on file type
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      text = await file.text();
    } else {
      // Very basic fallback for DOCX or unknown: try to read it as text, 
      // though typically DOCX needs a specific parser. For now, text/pdf is best.
      try {
        text = await file.text();
      } catch (e) {
        return NextResponse.json({ error: "Unsupported file type or unable to read text" }, { status: 400 });
      }
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
    }

    // Use AI to extract structured info
    const prompt = `
      Extract the following information from the provided resume text.
      Return ONLY a raw JSON object with these exact keys, and no markdown formatting or backticks around it:
      {
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "role": "", // Infer their primary job title
        "experience": "", // Summarize years of experience (e.g., "3 years")
        "skills": "", // Comma-separated list of top skills
        "education": "", // Summarize highest degree and university
        "projects": "", // Brief bullet points of projects
        "achievements": "" // Brief bullet points of achievements
      }
      
      If a field is not found in the resume, leave it as an empty string. Do not invent information.

      Resume Text:
      ${text.substring(0, 4000)} /* Truncating to avoid token limits */
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192", // Using a fast, standard model
      temperature: 0.1, // Low temp for more deterministic extraction
    });

    let resultRaw = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Clean up potential markdown wrapper from AI
    resultRaw = resultRaw.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const parsedData = JSON.parse(resultRaw);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("AI returned malformed JSON:", resultRaw);
      return NextResponse.json({ error: "Failed to parse AI output into JSON" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Parse Resume API Error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
