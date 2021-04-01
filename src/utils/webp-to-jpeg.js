/**
 * Converts 'image/webp' blob to 'image/jpeg' blob.
 *
 * The returning promise is never failed and returns either JPEG or the original
 * blob (if it is not a WebP or something bad happened).
 *
 * @param {Blob} blob
 * @returns {Promise<Blob>}
 */
export async function webpToJpeg(blob) {
  if (blob.type !== 'image/webp') {
    return blob;
  }

  const src = window.URL.createObjectURL(blob);

  try {
    const image = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Cannot load image'));
      image.src = src;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    jpeg.name = blob.name.replace(/\.webp$/, '.jpg');
    return jpeg;
  } catch {
    // skip any errors
  } finally {
    window.URL.revokeObjectURL(src);
  }
  return blob;
}
