'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadFile, validateFile, FILE_UPLOAD_CONFIG, extractPathFromUrl, deleteFile } from '@/lib/supabase/storage';

interface FileUploadProps {
    /** Storage bucket name */
    bucket: string;
    /** Path within bucket (without extension), e.g., "{tenant_id}/company/logo" */
    path: string;
    /** Accepted file types (default: image/*) */
    accept?: string;
    /** Max file size in bytes (default: 5MB) */
    maxSize?: number;
    /** Current file URL (for preview and delete) */
    currentUrl?: string | null;
    /** Callback when file is uploaded successfully */
    onUpload: (url: string) => void;
    /** Callback when file is deleted */
    onDelete?: () => void;
    /** Label text */
    label?: string;
    /** Helper text */
    helperText?: string;
}

export function FileUpload({
    bucket,
    path,
    accept = 'image/*',
    maxSize = FILE_UPLOAD_CONFIG.maxSize,
    currentUrl,
    onUpload,
    onDelete,
    label = 'Upload Image',
    helperText,
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        setError(null);

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            setError(validation.error ?? 'Invalid file');
            return;
        }

        // Check custom max size
        if (file.size > maxSize) {
            setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
            return;
        }

        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Upload
        setIsUploading(true);
        try {
            const result = await uploadFile(bucket, path, file);
            if (result.error) {
                setError(result.error);
                setPreview(null);
            } else if (result.url) {
                onUpload(result.url);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Upload failed. Please try again.');
            setPreview(null);
        } finally {
            setIsUploading(false);
        }
    }, [bucket, path, maxSize, onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDelete = useCallback(async () => {
        if (!currentUrl) return;

        setIsDeleting(true);
        setError(null);

        try {
            // Extract path from URL and delete
            const filePath = extractPathFromUrl(currentUrl, bucket);
            if (filePath) {
                await deleteFile(bucket, filePath);
            }
            setPreview(null);
            onDelete?.();
        } catch (err) {
            console.error('Delete failed:', err);
            setError('Failed to delete file');
        } finally {
            setIsDeleting(false);
        }
    }, [currentUrl, bucket, onDelete]);

    const displayUrl = preview || currentUrl;

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-neutral-700">
                    {label}
                </label>
            )}

            {/* Upload Area */}
            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-6 transition-colors
                    ${isDragOver ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-neutral-400'}
                    ${isUploading || isDeleting ? 'opacity-50 pointer-events-none' : ''}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {displayUrl ? (
                    /* Preview */
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={displayUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Image uploaded</p>
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    disabled={isUploading || isDeleting}
                                >
                                    Replace
                                </button>
                                {onDelete && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                        disabled={isUploading || isDeleting}
                                    >
                                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Upload Prompt */
                    <div
                        className="text-center cursor-pointer"
                        onClick={() => inputRef.current?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="w-10 h-10 text-primary-500 mx-auto animate-spin" />
                        ) : (
                            <div className="w-10 h-10 mx-auto rounded-full bg-primary-100 flex items-center justify-center">
                                {isDragOver ? (
                                    <ImageIcon className="w-5 h-5 text-primary-600" />
                                ) : (
                                    <Upload className="w-5 h-5 text-primary-600" />
                                )}
                            </div>
                        )}
                        <p className="mt-2 text-sm text-neutral-600">
                            {isUploading ? 'Uploading...' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                            JPEG, PNG, WebP • Max {maxSize / 1024 / 1024}MB
                        </p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                />
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Helper Text */}
            {helperText && !error && (
                <p className="text-xs text-neutral-500">{helperText}</p>
            )}
        </div>
    );
}
