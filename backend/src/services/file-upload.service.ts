import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Request } from 'express';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  size: number;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'fill' | 'crop' | 'thumb';
  quality?: 'auto' | number;
  format?: 'jpg' | 'png' | 'webp' | 'gif';
}

/**
 * File Upload Service
 * Handles file uploads to Cloudinary
 */
export class FileUploadService {
  /**
   * Configure multer for memory storage
   */
  static getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5, // Max 5 files at once
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb) => {
        // Allow only specific file types
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
        ];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only images and PDF files are allowed.'));
        }
      },
    });
  }

  /**
   * Upload single file to Cloudinary
   */
  static async uploadFile(
    file: Express.Multer.File,
    folder: string,
    options?: ImageTransformOptions
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder,
        resource_type: 'auto',
        unique_filename: true,
        overwrite: false,
      };

      // Add transformation options for images
      if (file.mimetype.startsWith('image/') && options) {
        uploadOptions.transformation = [];
        
        if (options.width || options.height) {
          uploadOptions.transformation.push({
            width: options.width,
            height: options.height,
            crop: options.crop || 'fit',
          });
        }

        if (options.quality) {
          uploadOptions.transformation.push({ quality: options.quality });
        }

        if (options.format) {
          uploadOptions.format = options.format;
        }
      }

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error('File upload failed'));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              size: result.bytes,
            });
          } else {
            reject(new Error('Upload failed - no result'));
          }
        }
      ).end(file.buffer);
    });
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string,
    options?: ImageTransformOptions
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, folder, options)
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Multiple file upload error:', error);
      throw new Error('Failed to upload multiple files');
    }
  }

  /**
   * Delete file from Cloudinary
   */
  static async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Delete multiple files
   */
  static async deleteMultipleFiles(publicIds: string[]): Promise<boolean> {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return Object.values(result.deleted).every(status => status === 'deleted');
    } catch (error) {
      console.error('Multiple file deletion error:', error);
      return false;
    }
  }

  /**
   * Upload product images with different sizes
   */
  static async uploadProductImages(files: Express.Multer.File[], productId: number): Promise<{
    original: UploadResult[];
    thumbnail: UploadResult[];
    medium: UploadResult[];
  }> {
    const folder = `products/${productId}`;

    try {
      // Upload original images
      const originalImages = await this.uploadMultipleFiles(files, `${folder}/original`);

      // Create thumbnails
      const thumbnailImages = await Promise.all(
        files.map(file => 
          this.uploadFile(file, `${folder}/thumbnail`, {
            width: 200,
            height: 200,
            crop: 'fill',
            quality: 'auto',
            format: 'webp',
          })
        )
      );

      // Create medium-sized images
      const mediumImages = await Promise.all(
        files.map(file => 
          this.uploadFile(file, `${folder}/medium`, {
            width: 500,
            height: 500,
            crop: 'fit',
            quality: 'auto',
            format: 'webp',
          })
        )
      );

      return {
        original: originalImages,
        thumbnail: thumbnailImages,
        medium: mediumImages,
      };
    } catch (error) {
      console.error('Product images upload error:', error);
      throw new Error('Failed to upload product images');
    }
  }

  /**
   * Upload user avatar
   */
  static async uploadUserAvatar(file: Express.Multer.File, userId: number): Promise<UploadResult> {
    try {
      return await this.uploadFile(file, `users/${userId}`, {
        width: 200,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Upload category image
   */
  static async uploadCategoryImage(file: Express.Multer.File, categoryId: number): Promise<{
    banner: UploadResult;
    icon: UploadResult;
  }> {
    try {
      const folder = `categories/${categoryId}`;

      // Upload banner image
      const banner = await this.uploadFile(file, `${folder}/banner`, {
        width: 800,
        height: 400,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
      });

      // Create icon version
      const icon = await this.uploadFile(file, `${folder}/icon`, {
        width: 64,
        height: 64,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
      });

      return { banner, icon };
    } catch (error) {
      console.error('Category image upload error:', error);
      throw new Error('Failed to upload category image');
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  static getOptimizedImageUrl(
    publicId: string,
    options: ImageTransformOptions
  ): string {
    const transformations: any = {};

    if (options.width || options.height) {
      transformations.width = options.width;
      transformations.height = options.height;
      transformations.crop = options.crop || 'fit';
    }

    if (options.quality) {
      transformations.quality = options.quality;
    }

    if (options.format) {
      transformations.format = options.format;
    }

    return cloudinary.url(publicId, transformations);
  }

  /**
   * Get file info from Cloudinary
   */
  static async getFileInfo(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error) {
      console.error('Get file info error:', error);
      throw new Error('Failed to get file information');
    }
  }

  /**
   * Generate upload signature for client-side uploads
   */
  static generateUploadSignature(folder: string, timestamp: number): {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
  } {
    const params = {
      folder,
      timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'ecommerce',
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    };
  }
}