import jsPDF from "jspdf";
import type { ModelResponse } from "./api";

const MARGIN = 20;
const PAGE_BOTTOM = 275;
const LINE_HEIGHT = 5;

interface PDFContext {
  doc: jsPDF;
  y: number;
  contentWidth: number;
}

export function generateHomeworkPDF(
  responses: ModelResponse[],
  taskType: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;
  const ctx: PDFContext = { doc, y: 20, contentWidth };

  // Title bar
  doc.setFillColor(245, 130, 32);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("DutchMaster AI", MARGIN, 16);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Homework Analysis Report", MARGIN, 26);
  ctx.y = 45;

  // Metadata
  doc.setTextColor(100);
  doc.setFontSize(9);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated: ${date}`, MARGIN, ctx.y);
  ctx.y += 5;
  doc.text(`Task: ${formatTaskType(taskType)}`, MARGIN, ctx.y);
  ctx.y += 10;

  // Divider
  drawDivider(ctx);

  // Each model response
  responses.forEach((response, index) => {
    ensureSpace(ctx, 30);

    // Model header with colored background
    const color = getModelColor(response.model_name);
    doc.setFillColor(color.bg.r, color.bg.g, color.bg.b);
    doc.roundedRect(MARGIN, ctx.y - 5, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(`${index + 1}. ${response.model_name}`, MARGIN + 5, ctx.y + 3);
    ctx.y += 14;

    // Render the markdown content
    doc.setTextColor(30, 30, 30);
    renderMarkdown(ctx, response.content);

    ctx.y += 5;
    drawDivider(ctx);
  });

  // Page numbers
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }

  const filename = `dutchmaster-analysis-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

function renderMarkdown(ctx: PDFContext, text: string) {
  const lines = text.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    // Code block toggle
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      ensureSpace(ctx, LINE_HEIGHT);
      ctx.doc.setFont("courier", "normal");
      ctx.doc.setFontSize(8);
      ctx.doc.setTextColor(60, 60, 60);
      const wrapped = ctx.doc.splitTextToSize(line, ctx.contentWidth - 10);
      wrapped.forEach((wl: string) => {
        ensureSpace(ctx, LINE_HEIGHT);
        ctx.doc.text(wl, MARGIN + 5, ctx.y);
        ctx.y += LINE_HEIGHT - 1;
      });
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      ctx.y += 3;
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = cleanInline(headerMatch[2]);
      ensureSpace(ctx, 10);
      ctx.y += 3;
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setTextColor(20, 20, 20);

      if (level <= 2) {
        ctx.doc.setFontSize(12);
        ctx.y += 2;
      } else if (level === 3) {
        ctx.doc.setFontSize(11);
      } else {
        ctx.doc.setFontSize(10);
      }

      const wrapped = ctx.doc.splitTextToSize(headerText, ctx.contentWidth);
      wrapped.forEach((wl: string) => {
        ensureSpace(ctx, LINE_HEIGHT);
        ctx.doc.text(wl, MARGIN, ctx.y);
        ctx.y += LINE_HEIGHT + 1;
      });
      ctx.y += 1;
      continue;
    }

    // Numbered list
    const numberedMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (numberedMatch) {
      const indent = Math.min(numberedMatch[1].length, 12);
      const itemText = numberedMatch[2];
      renderListItem(ctx, itemText, indent, "numbered", line);
      continue;
    }

    // Bullet list
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.+)/);
    if (bulletMatch) {
      const indent = Math.min(bulletMatch[1].length, 12);
      const itemText = bulletMatch[2];
      renderListItem(ctx, itemText, indent, "bullet");
      continue;
    }

    // Blockquote
    if (line.trim().startsWith(">")) {
      const quoteText = cleanInline(line.replace(/^>\s?/, ""));
      ensureSpace(ctx, LINE_HEIGHT);
      ctx.doc.setFont("helvetica", "italic");
      ctx.doc.setFontSize(9);
      ctx.doc.setTextColor(80, 80, 80);
      const wrapped = ctx.doc.splitTextToSize(quoteText, ctx.contentWidth - 15);
      const blockHeight = wrapped.length * LINE_HEIGHT + 4;
      ensureSpace(ctx, blockHeight);
      ctx.doc.setFillColor(240, 240, 240);
      ctx.doc.roundedRect(MARGIN, ctx.y - 4, ctx.contentWidth, blockHeight, 1, 1, "F");
      ctx.doc.setDrawColor(200, 200, 200);
      ctx.doc.line(MARGIN + 3, ctx.y - 3, MARGIN + 3, ctx.y - 3 + blockHeight - 2);
      wrapped.forEach((wl: string) => {
        ctx.doc.text(wl, MARGIN + 8, ctx.y);
        ctx.y += LINE_HEIGHT;
      });
      ctx.y += 2;
      continue;
    }

    // Regular paragraph
    renderParagraph(ctx, line);
  }
}

function renderListItem(
  ctx: PDFContext,
  text: string,
  indent: number,
  type: "bullet" | "numbered",
  rawLine?: string
) {
  const indentPx = MARGIN + 5 + Math.floor(indent / 2) * 5;
  ensureSpace(ctx, LINE_HEIGHT);

  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(30, 30, 30);

  let marker: string;
  if (type === "numbered" && rawLine) {
    const numMatch = rawLine.match(/(\d+)\./);
    marker = numMatch ? `${numMatch[1]}.` : "1.";
  } else {
    marker = "\u2022";
  }

  ctx.doc.text(marker, indentPx, ctx.y);
  const textX = indentPx + (type === "numbered" ? 8 : 5);
  const availableWidth = ctx.contentWidth - (textX - MARGIN);

  renderInlineFormatted(ctx, text, textX, availableWidth);
}

function renderParagraph(ctx: PDFContext, line: string) {
  ensureSpace(ctx, LINE_HEIGHT);
  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(30, 30, 30);
  renderInlineFormatted(ctx, line, MARGIN, ctx.contentWidth);
}

function renderInlineFormatted(
  ctx: PDFContext,
  text: string,
  startX: number,
  maxWidth: number
) {
  const segments = parseInlineSegments(text);

  // Flatten for line wrapping
  const fullClean = segments.map((s) => s.text).join("");
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(9);
  const wrappedLines = ctx.doc.splitTextToSize(fullClean, maxWidth);

  let charPos = 0;
  for (const wrappedLine of wrappedLines) {
    ensureSpace(ctx, LINE_HEIGHT);
    const lineLen = wrappedLine.length;

    // Find starting segment for this line
    let segIdx = 0;
    let segCharPos = 0;
    let consumed = 0;
    for (let i = 0; i < segments.length; i++) {
      if (consumed + segments[i].text.length > charPos) {
        segIdx = i;
        segCharPos = charPos - consumed;
        break;
      }
      consumed += segments[i].text.length;
    }

    let x = startX;
    let remaining = lineLen;

    while (remaining > 0 && segIdx < segments.length) {
      const seg = segments[segIdx];
      const availFromSeg = seg.text.length - segCharPos;
      const take = Math.min(remaining, availFromSeg);
      const chunk = seg.text.substring(segCharPos, segCharPos + take);

      if (seg.bold && seg.italic) {
        ctx.doc.setFont("helvetica", "bolditalic");
      } else if (seg.bold) {
        ctx.doc.setFont("helvetica", "bold");
      } else if (seg.italic) {
        ctx.doc.setFont("helvetica", "italic");
      } else {
        ctx.doc.setFont("helvetica", "normal");
      }
      ctx.doc.setFontSize(9);
      ctx.doc.text(chunk, x, ctx.y);
      x += ctx.doc.getTextWidth(chunk);

      remaining -= take;
      segCharPos += take;
      if (segCharPos >= seg.text.length) {
        segIdx++;
        segCharPos = 0;
      }
    }

    charPos += lineLen;
    ctx.y += LINE_HEIGHT;
  }

  ctx.doc.setFont("helvetica", "normal");
}

interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

function parseInlineSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1] !== undefined) {
      segments.push({ text: match[1], bold: true, italic: false });
    } else if (match[2] !== undefined) {
      segments.push({ text: match[2], bold: false, italic: true });
    } else if (match[3] !== undefined) {
      segments.push({ text: match[3], bold: false, italic: false });
    } else if (match[4] !== undefined) {
      segments.push({ text: match[4], bold: false, italic: false });
    }
  }

  if (segments.length === 0) {
    segments.push({ text, bold: false, italic: false });
  }

  return segments;
}

function cleanInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

function ensureSpace(ctx: PDFContext, needed: number) {
  if (ctx.y + needed > PAGE_BOTTOM) {
    ctx.doc.addPage();
    ctx.y = 20;
  }
}

function drawDivider(ctx: PDFContext) {
  ctx.doc.setDrawColor(220, 220, 220);
  ctx.doc.line(MARGIN, ctx.y, MARGIN + ctx.contentWidth, ctx.y);
  ctx.y += 8;
}

function formatTaskType(taskType: string): string {
  const labels: Record<string, string> = {
    tekst: "Tekst (Chapter Text)",
    oefening_1_vragen: "Oefening 1 - Vragen",
    oefening_2_formulering: "Oefening 2 - Formulering",
    oefening_3_woordvolgorde: "Oefening 3 - Woordvolgorde",
    oefening_4_uitdrukkingen: "Oefening 4 - Uitdrukkingen",
    oefening_5_voorzetsels: "Oefening 5 - Voorzetsels",
    oefening_6_spelling: "Oefening 6 - Spelling",
    oefening_7_woordenschat: "Oefening 7 - Woordenschat",
    oefening_8_opstel: "Oefening 8 - Opstel",
    oefening_9_luisteren_spreken: "Oefening 9 - Luisteren/Spreken",
  };
  return labels[taskType] || taskType;
}

function getModelColor(modelName: string): {
  r: number; g: number; b: number;
  bg: { r: number; g: number; b: number };
} {
  const name = modelName.toLowerCase();
  if (name.includes("gpt") || name.includes("o1") || name.includes("o3") || name.includes("openai")) {
    return { r: 22, g: 100, b: 22, bg: { r: 235, g: 250, b: 235 } };
  }
  if (name.includes("claude")) {
    return { r: 100, g: 20, b: 120, bg: { r: 245, g: 235, b: 250 } };
  }
  if (name.includes("gemini")) {
    return { r: 20, g: 80, b: 170, bg: { r: 230, g: 240, b: 255 } };
  }
  return { r: 0, g: 0, b: 0, bg: { r: 240, g: 240, b: 240 } };
}
