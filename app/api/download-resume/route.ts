import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const content = searchParams.get("content") || "";
  const name = searchParams.get("name") || "resume";

  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", resolve);
    doc.on("error", reject);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text(name, { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Body
    doc.fontSize(11).font("Helvetica").text(content, {
      align: "left",
      lineGap: 4,
    });

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);
  const safeName = name.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}-resume.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}