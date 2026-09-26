/**
 * HTML App Analyzer — Phase 4 foundation.
 *
 * Detection is probabilistic → report "Detection Confidence", never "quality".
 * Admin must confirm billable actions; detection does not auto-bill.
 */

export interface DetectedModule {
  name: string;
  category: string;
  confidence: number; // 0–100
  evidence: string[];
}

export interface DetectedAction {
  name: string;
  confidence: number;
  evidence: string[];
  suggestedBillable: boolean;
}

export interface AnalyzerResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  modules: DetectedModule[];
  actions: DetectedAction[];
  overallConfidence: number;
  scriptCount: number;
  hasFileInput: boolean;
  hasForm: boolean;
}

const MODULE_PATTERNS: Array<{
  name: string;
  category: string;
  patterns: RegExp[];
  weight: number;
}> = [
  {
    name: "File Picker",
    category: "FILES",
    patterns: [/type\s*=\s*["']file["']/i, /input.*file/i, /showOpenFilePicker/i],
    weight: 90,
  },
  {
    name: "Drag & Drop",
    category: "FILES",
    patterns: [/ondrop/i, /dragover/i, /DataTransfer/i],
    weight: 80,
  },
  {
    name: "PDF",
    category: "DOCUMENTS",
    patterns: [/pdf-lib|pdfjs|jspdf|application\/pdf/i],
    weight: 85,
  },
  {
    name: "Image",
    category: "MEDIA",
    patterns: [/canvas|createImageBitmap|image\/(png|jpeg|webp)/i],
    weight: 75,
  },
  {
    name: "ZIP",
    category: "FILES",
    patterns: [/JSZip|fflate|zip\.js/i],
    weight: 85,
  },
  {
    name: "OCR",
    category: "AI",
    patterns: [/tesseract|OCR/i],
    weight: 80,
  },
  {
    name: "Convert",
    category: "PROCESSING",
    patterns: [/convert|toBlob|toDataURL/i],
    weight: 50,
  },
];

const ACTION_PATTERNS: Array<{
  name: string;
  patterns: RegExp[];
  billableHint: boolean;
  weight: number;
}> = [
  { name: "upload", patterns: [/upload|file.*input|onchange.*file/i], billableHint: false, weight: 70 },
  { name: "download", patterns: [/download|saveAs|createObjectURL/i], billableHint: false, weight: 70 },
  { name: "process", patterns: [/process|run\(|startProcessing/i], billableHint: true, weight: 55 },
  { name: "convert", patterns: [/convert|transform/i], billableHint: true, weight: 60 },
  { name: "ocr", patterns: [/ocr|recognize/i], billableHint: true, weight: 75 },
  { name: "merge", patterns: [/merge|combine/i], billableHint: true, weight: 65 },
  { name: "split", patterns: [/split|extract.?page/i], billableHint: true, weight: 65 },
  { name: "compress", patterns: [/compress|optimize/i], billableHint: true, weight: 60 },
  { name: "generate", patterns: [/generate|create.*doc/i], billableHint: true, weight: 55 },
];

export function analyzeHtml(html: string): AnalyzerResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!html || !html.trim()) {
    return {
      valid: false,
      errors: ["Empty HTML"],
      warnings: [],
      modules: [],
      actions: [],
      overallConfidence: 0,
      scriptCount: 0,
      hasFileInput: false,
      hasForm: false,
    };
  }

  // Basic validation
  const lower = html.toLowerCase();
  if (lower.includes("<script") && /eval\s*\(|document\.write\s*\(/i.test(html)) {
    warnings.push("Potentially dangerous script patterns detected (eval/document.write)");
  }
  if (/<iframe/i.test(html)) {
    warnings.push("iframe tags found — Kaamora does not use iframe runtime; review carefully");
  }

  const scriptCount = (html.match(/<script/gi) || []).length;
  const hasFileInput = /type\s*=\s*["']file["']/i.test(html);
  const hasForm = /<form[\s>]/i.test(html);

  const modules: DetectedModule[] = [];
  for (const m of MODULE_PATTERNS) {
    const evidence: string[] = [];
    for (const p of m.patterns) {
      const match = html.match(p);
      if (match) evidence.push(match[0].slice(0, 80));
    }
    if (evidence.length) {
      const confidence = Math.min(
        100,
        Math.round(m.weight * (0.7 + 0.3 * (evidence.length / m.patterns.length)))
      );
      modules.push({
        name: m.name,
        category: m.category,
        confidence,
        evidence,
      });
    }
  }

  const actions: DetectedAction[] = [];
  for (const a of ACTION_PATTERNS) {
    const evidence: string[] = [];
    for (const p of a.patterns) {
      const match = html.match(p);
      if (match) evidence.push(match[0].slice(0, 80));
    }
    if (evidence.length) {
      const confidence = Math.min(
        100,
        Math.round(a.weight * (0.7 + 0.3 * (evidence.length / a.patterns.length)))
      );
      actions.push({
        name: a.name,
        confidence,
        evidence,
        suggestedBillable: a.billableHint,
      });
    }
  }

  const confidences = [
    ...modules.map((m) => m.confidence),
    ...actions.map((a) => a.confidence),
  ];
  const overallConfidence =
    confidences.length === 0
      ? 0
      : Math.round(confidences.reduce((s, c) => s + c, 0) / confidences.length);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    modules,
    actions,
    overallConfidence,
    scriptCount,
    hasFileInput,
    hasForm,
  };
}
