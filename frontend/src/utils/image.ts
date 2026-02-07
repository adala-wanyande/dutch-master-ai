const MAX_WIDTH = 2048;
const MAX_HEIGHT = 2048;
const JPEG_QUALITY = 0.8;

/**
 * Process an image file: convert HEIC if needed, then compress.
 * Returns a JPEG File ready for upload.
 */
export async function processImage(file: File): Promise<File> {
  let blob: Blob = file;

  if (isHeic(file)) {
    // Strategy: try native browser decoding first (Safari, Chrome 118+ on macOS),
    // then fall back to heic2any library if native fails.
    try {
      const compressed = await compressImage(blob);
      return new File([compressed], cleanFileName(file.name), { type: "image/jpeg" });
    } catch {
      // Native decoding not supported, try heic2any
      try {
        const heic2anyModule = await import("heic2any");
        const heic2any = heic2anyModule.default || heic2anyModule;
        const result = await (heic2any as (opts: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]>)({
          blob: file,
          toType: "image/jpeg",
          quality: JPEG_QUALITY,
        });
        blob = Array.isArray(result) ? result[0] : result;
      } catch {
        throw new Error(
          "Could not convert HEIC image. Please convert it to JPG (e.g. open in Preview > Export as JPEG) and try again."
        );
      }
    }
  }

  const compressed = await compressImage(blob);
  return new File([compressed], cleanFileName(file.name), { type: "image/jpeg" });
}

function cleanFileName(name: string): string {
  const baseName = name.replace(/\.(heic|heif)$/i, "");
  return baseName.endsWith(".jpg") || baseName.endsWith(".jpeg")
    ? baseName
    : `${baseName}.jpg`;
}

function isHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

function compressImage(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if exceeds max dimensions
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
