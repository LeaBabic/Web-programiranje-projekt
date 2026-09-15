import { v2 as cloudinary } from 'cloudinary';
import { env, cloudinaryEnabled } from '../config/env.js';

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Mapa u kojoj završavaju slike proizvoda. */
const FOLDER = 'atelier/proizvodi';

/**
 * Šalje sliku na Cloudinary i vraća trajni URL.
 * Slika se sprema kao WEBP širine do 1600 px — dovoljno za galeriju proizvoda,
 * a znatno lakše od originala s fotoaparata.
 */
export function uploadImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: 'image',
        transformation: [{ width: 1600, crop: 'limit' }, { quality: 'auto', fetch_format: 'webp' }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary nije vratio rezultat.'));
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
}
