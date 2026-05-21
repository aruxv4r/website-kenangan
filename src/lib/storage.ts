import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure local uploads directory exists
function ensureLocalUploadsDirExists() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Configure Cloudinary if env variables are present
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = !!(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; storageType: 'local' | 'cloudinary' }> {
  // If Cloudinary is configured, upload to Cloudinary
  if (isConfigured) {
    try {
      const isVideo = mimeType.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'digital-memories',
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve({
                url: result!.secure_url,
                storageType: 'cloudinary',
              });
            }
          }
        );
        
        // Stream the buffer directly to Cloudinary
        uploadStream.end(buffer);
      });
    } catch (err) {
      console.error('Cloudinary upload failed, falling back to local storage:', err);
    }
  }

  // Local Storage Fallback
  ensureLocalUploadsDirExists();
  const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(UPLOADS_DIR, safeFilename);
  
  await fs.promises.writeFile(filePath, buffer);
  
  return {
    url: `/uploads/${safeFilename}`,
    storageType: 'local',
  };
}

export function isCloudinaryConfigured(): boolean {
  return isConfigured;
}

export async function deleteFile(mediaUrl: string): Promise<void> {
  if (isConfigured && mediaUrl.includes('cloudinary.com')) {
    try {
      const parts = mediaUrl.split('/upload/');
      if (parts.length > 1) {
        const pathParts = parts[1].split('/');
        if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
          pathParts.shift();
        }
        const joinedPath = pathParts.join('/');
        const publicId = joinedPath.substring(0, joinedPath.lastIndexOf('.'));
        
        const isVideo = mediaUrl.includes('/video/upload/');
        const resourceType = isVideo ? 'video' : 'image';

        const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`Cloudinary deletion response for ${publicId}:`, res);
      }
    } catch (err) {
      console.error('Failed to delete file from Cloudinary:', err);
    }
  } else if (mediaUrl.startsWith('/uploads/')) {
    try {
      const filename = mediaUrl.replace('/uploads/', '');
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(`Deleted local file: ${filePath}`);
      }
    } catch (err) {
      console.error('Failed to delete local file:', err);
    }
  }
}

