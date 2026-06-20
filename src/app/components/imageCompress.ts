// Compress an image File into a base64 JPEG data URL bounded by maxBytes.
// Iteratively reduces dimensions and quality until the encoded size fits.
export async function compressImage(
  file: File,
  opts: { maxBytes?: number; maxDimension?: number; mimeType?: 'image/jpeg' | 'image/webp' } = {}
): Promise<string> {
  const maxBytes = opts.maxBytes ?? 1.5 * 1024 * 1024;
  let maxDim = opts.maxDimension ?? 1280;
  const mime = opts.mimeType ?? 'image/jpeg';

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  let quality = 0.85;
  let out = dataUrl;
  for (let attempt = 0; attempt < 8; attempt++) {
    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, maxDim);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas non supporté');
    ctx.drawImage(img, 0, 0, width, height);
    out = canvas.toDataURL(mime, quality);
    if (estimateBytes(out) <= maxBytes) return out;
    if (quality > 0.5) quality -= 0.1;
    else maxDim = Math.round(maxDim * 0.8);
  }
  return out;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ''));
    r.onerror = () => reject(r.error ?? new Error('Lecture du fichier impossible'));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image illisible'));
    img.src = src;
  });
}

function fitWithin(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w / h;
  return ratio >= 1
    ? { width: max, height: Math.round(max / ratio) }
    : { width: Math.round(max * ratio), height: max };
}

function estimateBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',', 2)[1] ?? '';
  return Math.floor((base64.length * 3) / 4);
}
