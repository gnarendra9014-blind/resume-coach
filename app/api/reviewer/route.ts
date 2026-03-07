export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    let resumeText = "";

    if (file) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      if (file.type === "application/pdf" || file.name?.endsWith(".pdf")) {
        try {
          const pdfParse = require("pdf-parse");
          const parsed = await pdfParse(Buffer.from(bytes));
          resumeText = parsed.text;
        } catch (e) {
          // fallback if pdf-parse fails
          resumeText = new TextDecoder().decode(bytes);
        }
      } else {
        resumeText = new TextDecoder().decode(bytes);
      }
    } else if (pastedText) {
      resumeText = pastedText;
    }

    if (!resumeText || resumeText.trim().length < 10) {
      return NextResponse.json(
        { error: "Could not read resume content. Please try pasting the text instead." },
        { status: 400 }
      );
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are a professional resume editor.

Here is the candidate's resume:
${resumeText}

Do two things:
1. Give a brief review with key feedback points
2. Rewrite the FULL resume with improvements — keep the EXACT same structure and sections as the original, just improve the wording, fix grammar, strengthen bullet points, and make it more ATS-friendly.

Format your response EXACTLY like this:

REVIEW:
[Your review feedback here]

REWRITTEN RESUME:
[Full rewritten resume here in plain text, keeping same format as original]`,
        },
      ],
      max_tokens: 2000,
    });

    const result = response.choices[0].message.content || "";
    const parts = result.split("REWRITTEN RESUME:");
    const review = parts[0].replace("REVIEW:", "").trim();
    const rewritten = parts[1]?.trim() || "";

    return NextResponse.json({ review, rewritten, original: resumeText });
  } catch (err: any) {
    console.error("Reviewer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}