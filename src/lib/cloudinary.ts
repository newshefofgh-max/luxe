import { v2 as cloudinary } from 'cloudinary';

// ─── Configuration ────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface OptimizeOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'pad';
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
  gravity?: 'auto' | 'face' | 'center';
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Cloudinary.
 * @param file  Raw buffer of the image
 * @param folder  Cloudinary folder path (e.g. "products", "avatars")
 */
export async function uploadImage(
  file: Buffer,
  folder: string = 'luxe-accessories'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        max_bytes: 10 * 1024 * 1024,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(file);
  });
}

/**
 * Upload from a base64 data URL string.
 */
export async function uploadBase64Image(
  dataUrl: string,
  folder: string = 'luxe-accessories'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
  });

  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete an image from Cloudinary by its public ID.
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
    return result.result === 'ok';
  } catch (error) {
    console.error(`Failed to delete image ${publicId}:`, error);
    return false;
  }
}

/**
 * Delete multiple images by their public IDs.
 */
export async function deleteImages(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;
  await cloudinary.api.delete_resources(publicIds, { resource_type: 'image' });
}

// ─── Optimized URL ────────────────────────────────────────────────────────────

/**
 * Generate an optimized/transformed Cloudinary URL.
 */
export function getOptimizedUrl(
  publicId: string,
  options: OptimizeOptions = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
  } = options;

  const transformations: Record<string, unknown>[] = [
    { quality, fetch_format: format },
  ];

  if (width || height) {
    transformations.push({ width, height, crop, gravity });
  }

  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations,
  });
}

/**
 * Get a thumbnail URL for product listing pages.
 */
export function getProductThumbnail(publicId: string): string {
  return getOptimizedUrl(publicId, {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'auto',
  });
}

/**
 * Get a large image URL for product detail pages.
 */
export function getProductFullImage(publicId: string): string {
  return getOptimizedUrl(publicId, {
    width: 800,
    height: 800,
    crop: 'fit',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Extract the public ID from a full Cloudinary URL.
 */
export function extractPublicId(cloudinaryUrl: string): string {
  const regex = /\/v\d+\/(.+)\.[a-z]+$/i;
  const match = cloudinaryUrl.match(regex);
  return match?.[1] ?? cloudinaryUrl;
}

export default cloudinary;
