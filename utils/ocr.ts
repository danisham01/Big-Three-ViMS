// Lightweight OCR helper using Tesseract.js loaded from CDN at runtime.
// Falls back gracefully if the library fails to load; callers should handle partial/empty results.
export interface OcrResult {
  name?: string;
  icNumber?: string;
  rawText?: string;
}

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

const loadTesseract = async () => {
  if (typeof window === 'undefined') return null;
  if ((window as any).Tesseract) return (window as any).Tesseract;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TESSERACT_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Tesseract'));
    document.body.appendChild(script);
  });
  return (window as any).Tesseract || null;
};

const extractIcNumber = (text: string): string | undefined => {
  const match = text.match(/(\d{6}[-\s]?\d{2}[-\s]?\d{4})/);
  return match ? match[1].replace(/\s+/g, '') : undefined;
};

const extractName = (text: string): string | undefined => {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const nameLine = lines.find(l => /^name[:\s]/i.test(l));
  if (nameLine) return nameLine.replace(/^name[:\s]*/i, '').trim();

  const candidate = lines.find(l => /^[A-Z][A-Z\s'.-]{3,}$/i.test(l) && !/\d/.test(l));
  return candidate?.trim();
};

export const extractIdFields = async (imageDataUrl: string): Promise<OcrResult> => {
  try {
    const Tesseract = await loadTesseract();
    if (!Tesseract) throw new Error('Tesseract not available');

    const { data } = await Tesseract.recognize(imageDataUrl, 'eng');
    const text = data.text || '';

    const icNumber = extractIcNumber(text);
    const name = extractName(text);

    return { name, icNumber, rawText: text };
  } catch (err) {
    console.error('OCR failed', err);
    return { rawText: '' };
  }
};
