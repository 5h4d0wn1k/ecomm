import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import {
    validateFile,
    sanitizeFilename
} from '@/lib/fileSecurity';

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file received" }, { status: 400 });
        }

        // Convert file to buffer for validation
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Comprehensive file validation
        const validationOptions = {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            stripMetadata: true
        };

        const validation = await validateFile(buffer, file.type, file.name, validationOptions);

        if (!validation.isValid) {
            return NextResponse.json({
                error: validation.errors.join('. ')
            }, { status: 400 });
        }

        // Use sanitized buffer if metadata was stripped
        const finalBuffer = validation.sanitizedBuffer;

        // Sanitize filename
        const sanitizedName = sanitizeFilename(file.name);
        const timestamp = Date.now();
        const extension = path.extname(sanitizedName) || '.jpg'; // Default to .jpg if no extension
        const filename = `${userId}_${timestamp}${extension}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'returns');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        // Save the sanitized file
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, finalBuffer);

        // Return the public URL
        const imageUrl = `/uploads/returns/${filename}`;

        return NextResponse.json({
            message: "File uploaded and secured successfully",
            imageUrl,
            originalSize: validation.originalSize,
            sanitizedSize: validation.sanitizedSize
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}