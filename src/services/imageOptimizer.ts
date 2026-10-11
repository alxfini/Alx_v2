/**
 * Image optimization utility that compresses uploaded images client-side
 * before storing them in local storage, database, or media proxy.
 * Ensures images and icons look crisp and high-definition.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  isLogoOrIcon?: boolean;
  compressAsJpg?: boolean;
}

/**
 * Optimizes an image File into a compact, high-quality data URL
 * suitable for permanent storage and immediate browser display.
 */
export async function optimizeImageFile(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const fileNameLower = (file.name || '').toLowerCase();
  const fileTypeLower = (file.type || '').toLowerCase();

  // Se o arquivo for SVG, ICO ou GIF (para manter animações intactas), mantém o formato original exato sem passar pelo canvas
  if (
    fileTypeLower === 'image/svg+xml' ||
    fileNameLower.endsWith('.svg') ||
    fileTypeLower.includes('icon') ||
    fileNameLower.endsWith('.ico') ||
    fileTypeLower.includes('gif') ||
    fileNameLower.endsWith('.gif')
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo de ícone/GIF/SVG'));
      reader.readAsDataURL(file);
    });
  }

  const {
    maxWidth = options.isLogoOrIcon ? 512 : 1600,
    maxHeight = options.isLogoOrIcon ? 512 : 1600,
    quality = options.quality ?? (options.compressAsJpg ? 0.88 : 0.9),
    format = options.format || (options.compressAsJpg ? 'image/jpeg' : (options.isLogoOrIcon ? 'image/png' : 'image/webp')),
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem não reconhecido'));

      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const ratio = Math.min(widthRatio, heightRatio);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return resolve(event.target?.result as string);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Preserve transparent background for logos/icons
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let dataUrl = canvas.toDataURL(format, quality);

          // Fallback se o navegador não suportar o formato solicitado
          if (format === 'image/png' && !dataUrl.startsWith('data:image/png')) {
            dataUrl = canvas.toDataURL('image/png');
          }

          resolve(dataUrl);
        } catch (err) {
          console.warn('Canvas optimization fallback to original:', err);
          resolve(event.target?.result as string);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
