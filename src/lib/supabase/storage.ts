import { createClient } from '@/lib/supabase/client';

/**
 * File upload validation constants
 */
export const FILE_UPLOAD_CONFIG = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};

/**
 * Validate a file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${FILE_UPLOAD_CONFIG.maxSize / 1024 / 1024}MB`,
        };
    }

    // Check file type
    if (!FILE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Allowed: JPEG, PNG, WebP',
        };
    }

    return { valid: true };
}

/**
 * Upload a file to Supabase Storage
 * 
 * @param bucket - Storage bucket name
 * @param path - Path within the bucket (e.g., "{tenant_id}/company/logo")
 * @param file - File to upload
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(
    bucket: string,
    path: string,
    file: File
): Promise<{ url: string | null; error: string | null }> {
    const supabase = createClient();

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
        return { url: null, error: validation.error ?? 'Invalid file' };
    }

    // Get file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fullPath = `${path}.${ext}`;

    // Upload file (upsert to replace if exists)
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
            upsert: true,
            contentType: file.type,
        });

    if (uploadError) {
        console.error('Upload error:', uploadError);
        return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPath);

    return { url: urlData.publicUrl, error: null };
}

/**
 * Delete a file from Supabase Storage
 * 
 * @param bucket - Storage bucket name
 * @param path - Full path to the file (e.g., "{tenant_id}/company/logo.png")
 */
export async function deleteFile(
    bucket: string,
    path: string
): Promise<{ error: string | null }> {
    const supabase = createClient();

    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) {
        console.error('Delete error:', error);
        return { error: error.message };
    }

    return { error: null };
}

/**
 * Extract the storage path from a public URL
 * Useful for deleting files when you only have the URL
 */
export function extractPathFromUrl(url: string, bucket: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathMatch = urlObj.pathname.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)`));
        return pathMatch ? pathMatch[1] : null;
    } catch {
        return null;
    }
}
