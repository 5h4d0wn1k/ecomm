/**
 * File security utilities for content-based validation and sanitization
 * Provides comprehensive security measures against malicious file uploads
 */

import sharp from 'sharp';
import { readFile } from 'fs/promises';

// Magic numbers for file type validation
const MAGIC_NUMBERS = {
  // Images
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]],
  'image/bmp': [[0x42, 0x4D]],
  'image/tiff': [[0x49, 0x49, 0x2A, 0x00], [0x4D, 0x4D, 0x00, 0x2A]],
};

// Suspicious patterns that might indicate malware
const MALICIOUS_PATTERNS = [
  // Common malware signatures (hex patterns)
  Buffer.from('4D5A', 'hex'), // MZ header (Windows executable)
  Buffer.from('7F454C46', 'hex'), // ELF header (Linux executable)
  Buffer.from('CAFEBABE', 'hex'), // Java class file
  Buffer.from('504B0304', 'hex'), // ZIP file (could contain malware)
  Buffer.from('52617221', 'hex'), // RAR file
  Buffer.from('377ABCAF271C', 'hex'), // 7-Zip file
  // Script patterns
  Buffer.from('3C736372697074', 'hex'), // <script
  Buffer.from('6A617661736372697074', 'hex'), // javascript
  Buffer.from('7662736372697074', 'hex'), // vbscript
  Buffer.from('3C3F706870', 'hex'), // <?php
  Buffer.from('23696E636C756465', 'hex'), // #include
];

/**
 * Validates file type using magic numbers
 * @param {Buffer} buffer - File buffer
 * @param {string} expectedType - Expected MIME type
 * @returns {boolean} - True if file matches expected type
 */
export function validateFileSignature(buffer, expectedType) {
  if (!MAGIC_NUMBERS[expectedType]) {
    // If we don't have magic numbers for this type, allow it but log warning
    console.warn(`No magic number validation available for ${expectedType}`);
    return true;
  }

  const signatures = MAGIC_NUMBERS[expectedType];
  return signatures.some(signature => {
    return signature.every((byte, index) => {
      return byte === null || buffer[index] === byte;
    });
  });
}

/**
 * Performs basic malware detection by checking for suspicious patterns
 * @param {Buffer} buffer - File buffer
 * @returns {boolean} - True if no malicious patterns found
 */
export function detectMalware(buffer) {
  for (const pattern of MALICIOUS_PATTERNS) {
    if (buffer.includes(pattern)) {
      return true; // Malicious pattern found
    }
  }
  return false; // No malicious patterns found
}

/**
 * Strips EXIF metadata from image files
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimeType - MIME type of the image
 * @returns {Promise<Buffer>} - Sanitized image buffer
 */
export async function stripExifMetadata(buffer, mimeType) {
  try {
    // Only process image types that support EXIF
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];

    if (!supportedTypes.includes(mimeType)) {
      return buffer; // Return original buffer for unsupported types
    }

    // Use Sharp to remove metadata
    const sanitizedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF orientation, then remove EXIF
      .jpeg({ quality: 90, mozjpeg: true }) // Convert to JPEG with optimization
      .toBuffer();

    return sanitizedBuffer;
  } catch (error) {
    console.error('Error stripping EXIF metadata:', error);
    // Return original buffer if processing fails
    return buffer;
  }
}

/**
 * Validates file size against limits
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} - True if size is within limits
 */
export function validateFileSize(size, maxSize = 5 * 1024 * 1024) {
  return size <= maxSize;
}

/**
 * Comprehensive file validation
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - MIME type
 * @param {string} filename - Original filename
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} - Validation result
 */
export async function validateFile(buffer, mimeType, filename, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    stripMetadata = true
  } = options;

  const errors = [];
  let sanitizedBuffer = buffer;

  // 1. Validate file size
  if (!validateFileSize(buffer.length, maxSize)) {
    errors.push(`File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`);
  }

  // 2. Validate MIME type
  if (!allowedTypes.includes(mimeType)) {
    errors.push(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed`);
  }

  // 3. Validate file signature (magic numbers)
  if (!validateFileSignature(buffer, mimeType)) {
    errors.push('File signature does not match expected type. Possible malicious file.');
  }

  // 4. Malware detection
  if (detectMalware(buffer)) {
    errors.push('File contains suspicious patterns that may indicate malware');
  }

  // 5. Strip EXIF metadata if requested and no errors so far
  if (stripMetadata && errors.length === 0 && allowedTypes.includes(mimeType)) {
    try {
      sanitizedBuffer = await stripExifMetadata(buffer, mimeType);
    } catch (error) {
      console.warn('Failed to strip metadata:', error);
      // Continue with original buffer
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedBuffer,
    originalSize: buffer.length,
    sanitizedSize: sanitizedBuffer.length
  };
}

/**
 * Sanitizes filename to prevent path traversal and other issues
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  // Remove path separators and dangerous characters
  let sanitized = filename
    .replace(/[\/\\:*?"<>|]/g, '') // Remove dangerous characters
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .trim();

  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = 'unnamed_file';
  }

  // Limit length
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop();
    sanitized = sanitized.substring(0, 95) + '.' + ext;
  }

  return sanitized;
}