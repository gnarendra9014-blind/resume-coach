import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export const generateAndDownloadDocx = async (resumeText: string, filename: string = "resume.docx") => {
  // Simple parser: split by lines, assume lines with NO indentation and shorter length are headings
  const lines = resumeText.split("\n").filter(l => l.trim().length > 0);
  
  const children: Paragraph[] = [];
  
  for (const line of lines) {
    if (line.match(/^[A-Z][A-Z\s]+$/) || (line.length < 30 && !line.includes(":") && !line.includes("-"))) {
      // Treat as heading
      children.push(
        new Paragraph({
          text: line.trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else {
      // Treat as regular body text
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              size: 22, // 11pt
            })
          ],
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};
