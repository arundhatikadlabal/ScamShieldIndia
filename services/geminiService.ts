import { ScamShieldResult } from "../types";
import { extractTextFromImage } from "./ocrService";
import { analyzeTextWithRules } from "./riskEngine";

/**
 * Replaced Gemini Vision with local Tesseract OCR
 */
export async function analyzeImageOCR(base64Image: string, mimeType: string): Promise<string> {
  try {
    // Data URL construction for Tesseract
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    return await extractTextFromImage(dataUrl);
  } catch (error) {
    console.error("OCR Service Failure:", error);
    return "[Local OCR failed. Please describe the incident manually.]";
  }
}

/**
 * Replaced Gemini Pro with local deterministic risk engine
 */
export async function analyzeIncident(text: string): Promise<ScamShieldResult> {
  // Artificial delay to mimic analysis and maintain UX rhythm
  await new Promise(resolve => setTimeout(resolve, 800));
  return analyzeTextWithRules(text);
}
