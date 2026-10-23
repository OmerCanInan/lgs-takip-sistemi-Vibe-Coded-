/**
 * Utility to compress images on the client side using HTML5 Canvas.
 * Greatly reduces image payload size (from 5-15MB to ~70-130KB) so that
 * base64 storage in localStorage and Supabase never triggers QuotaExceededError.
 */

export function compressImage(
  fileOrDataUrl: File | string,
  maxDimension = 1100,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve) => {
    // If it's a web URL (http/https), no need to compress
    if (
      typeof fileOrDataUrl === 'string' &&
      (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))
    ) {
      return resolve(fileOrDataUrl);
    }

    const processSrc = (src: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (!width || !height) {
            return resolve(src);
          }

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(src);
          }

          // Fill white background in case of transparent PNG/JPEG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.warn('Image compression canvas error, using original:', err);
          resolve(src);
        }
      };

      img.onerror = () => {
        resolve(src);
      };

      img.src = src;
    };

    if (typeof fileOrDataUrl === 'string') {
      processSrc(fileOrDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          processSrc(result);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
