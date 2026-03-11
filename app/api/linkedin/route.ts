import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import * as cheerio from "cheerio";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, role, linkedinUrl } = body;

    let scrapedProfile = "";
    if (linkedinUrl && linkedinUrl.includes("linkedin.com/in/")) {
      try {
        const res = await fetch(linkedinUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          },
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const title = $("title").text() || "";
        const description = $('meta[name="description"]').attr("content") || "";
        // Extracting basic public meta data since full LinkedIn scraping requires auth.
        scrapedProfile = `Public Title: ${title}\nPublic Description: ${description}`;
      } catch (err: any) {
        console.warn("Could not scrape URL, falling back to pure generation:", err.message);
      }
    }

    const prompt = `You are an expert LinkedIn profile optimizer and career coach. 
    
    The user wants to optimize their LinkedIn profile for the role of: ${role}.
    Here is their current resume:
    ${resume}
    
    ${
      linkedinUrl
        ? `The user has provided their current LinkedIn URL: ${linkedinUrl}
        Here is the public metadata we could scrape from it:
        ${scrapedProfile}
        
        CRITICAL TASK: Since they provided a URL, you MUST audit their current profile.
        Output exactly 3 sections:
        1. [CURRENT ISSUES]: Based on what a typical profile for this role should look like vs their current metadata/resume, what are they likely missing on their LinkedIn?
        2. [RECOMMENDED HEADLINE]: A highly engaging, keyword-rich LinkedIn headline (under 120 chars) they should change to.
        3. [WHAT TO CHANGE IN ABOUT]: Specific, actionable bullet points on what they need to rewrite in their "About" section to secure interviews for this specific role.`
        : `Return exactly two sections in plain text:
        1. [HEADLINE]: A highly engaging, keyword-rich LinkedIn headline (under 120 characters) that stands out to recruiters looking for this role.
        2. [ABOUT]: A persuasive, story-driven "About" section that highlights their top skills, experience, and passion. Make it sound professional yet approachable. Do not use cheesy buzzwords. Break it into readable paragraphs.`
    }`;

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
