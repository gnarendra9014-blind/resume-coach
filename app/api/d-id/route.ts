import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    const response = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${process.env.D_ID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_url: "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg",
        script: {
          type: "text",
          input: text,
          provider: {
            type: "microsoft",
            voice_id: "en-US-JennyNeural",
          },
        },
        config: {
          fluent: true,
          pad_audio: 0,
        },
      }),
    });

    const data = await response.json();
    const talkId = data.id;

    // Poll for video result
    let videoUrl = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          "Authorization": `Basic ${process.env.D_ID_API_KEY}`,
        },
      });
      const pollData = await poll.json();
      if (pollData.status === "done") {
        videoUrl = pollData.result_url;
        break;
      }
    }

    if (!videoUrl) {
      return NextResponse.json({ error: "Video generation timed out" }, { status: 500 });
    }

    return NextResponse.json({ videoUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}