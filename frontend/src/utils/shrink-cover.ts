import { COVER_TYPE } from './cover';

/** Covers are shown at most ~250 px wide, so 600 px stays sharp on high-density screens. */
export const COVER_MAX_WIDTH = 600;
const QUALITY = 0.8;

/**
 * Scales a cover down to {@link COVER_MAX_WIDTH} and re-encodes it as JPEG before upload, in the browser, so the
 * small server never decodes large images. Returns the original file if the result isn't smaller or anything fails.
 */
export const shrinkCover = async (file: File): Promise<File> => {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, COVER_MAX_WIDTH / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, COVER_TYPE, QUALITY));
    return blob && blob.size < file.size ? new File([blob], file.name, { type: COVER_TYPE }) : file;
  } catch {
    return file;
  }
};
