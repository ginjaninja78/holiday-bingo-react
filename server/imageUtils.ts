import sharp from 'sharp';

export async function resizeAndConvertToBase64(
  filePath: string,
  maxWidth: number = 200
): Promise<string> {
  try {
    const buffer = await sharp(filePath)
      .resize(maxWidth, maxWidth, { fit: 'inside' })
      .png()
      .toBuffer();
    
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error(`Failed to resize and convert image: ${filePath}`, error);
    throw error;
  }
}
