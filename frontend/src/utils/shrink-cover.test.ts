import { afterEach, describe, expect, it, vi } from 'vitest';
import { COVER_MAX_WIDTH, shrinkCover } from './shrink-cover';

const original = new File([new Uint8Array(1000)], 'photo.jpg', { type: 'image/jpeg' });

/** jsdom has no canvas or `createImageBitmap`: fakes both and returns the canvas `drawImage` mock. */
const mockCanvas = (width: number, height: number, resultBytes: number) => {
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width, height, close: vi.fn() }));
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as never);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) =>
    callback(new Blob([new Uint8Array(resultBytes)], { type: 'image/jpeg' })),
  );
  return drawImage;
};

describe('shrinkCover', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('scales a wide image down, keeping the ratio, name and type', async () => {
    const drawImage = mockCanvas(1200, 1800, 100);

    const result = await shrinkCover(original);

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, COVER_MAX_WIDTH, 900);
    expect(result).not.toBe(original);
    expect(result.size).toBe(100);
    expect(result.name).toBe('photo.jpg');
    expect(result.type).toBe('image/jpeg');
  });

  it('never scales a small image up', async () => {
    const drawImage = mockCanvas(300, 450, 100);

    await shrinkCover(original);

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 300, 450);
  });

  it('keeps the original when the result is not smaller', async () => {
    mockCanvas(300, 450, 1000);

    expect(await shrinkCover(original)).toBe(original);
  });

  it('keeps the original when the image cannot be decoded', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('bad image')));

    expect(await shrinkCover(original)).toBe(original);
  });

  it('keeps the original when the browser has no createImageBitmap', async () => {
    expect(await shrinkCover(original)).toBe(original);
  });
});
