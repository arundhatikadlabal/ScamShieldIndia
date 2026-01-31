import Tesseract from 'tesseract.js';

/**
 * Extracts text from an image using Tesseract.js (Client-side)
 */
export async function extractTextFromImage(fileOrBase64: File | string): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      fileOrBase64,
      'eng',
      { 
        logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`),
      }
    );
    return result.data.text || "[No text found in image]";
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to process image locally.");
  }
}
