import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: NextRequest) {
  const { resumeText } = await req.json();

  return new Promise<NextResponse>((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(
        new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=improved-resume.pdf",
          },
        })
      );
    });

    const lines = resumeText.split("\n");
    lines.forEach((line: string) => {
      const trimmed = line.trim();
      if (!trimmed) {
        doc.moveDown(0.3);
        return;
      }
      // Detect headings (all caps or short lines)
      const isHeading = trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 40;
      const isBullet = trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*");

      if (isHeading) {
        doc.moveDown(0.5)
          .font("Helvetica-Bold")
          .fontSize(13)
          .text(trimmed)
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(0.3);
      } else if (isBullet) {
        doc.font("Helvetica")
          .fontSize(10)
          .text(trimmed, { indent: 15 });
      } else {
        doc.font("Helvetica")
          .fontSize(10)
          .text(trimmed);
      }
    });

    doc.end();
  });
}