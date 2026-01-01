
import { useState, useCallback } from 'react';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Custom hook for handling file uploads to Convex storage
 * 
 * Usage:
 * const { uploadFile, isUploading, error } = useFileUpload();
 * const url = await uploadFile(file, 'profile');
 */
export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFileReference = useMutation(api.files.saveFileReference);

    const uploadFile = useCallback(async (
        file: File,
        fileType: 'profile' | 'cover' | 'discovery' | 'quest',
        userId: string,
        metadata?: Record<string, any>
    ): Promise<string | null> => {
        setIsUploading(true);
        setError(null);
        setProgress(0);

        try {
            // Step 1: Get upload URL from Convex
            const uploadUrl = await generateUploadUrl();

            setProgress(25);

            // Step 2: Upload the file directly to Convex storage
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            setProgress(75);

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const { storageId } = await response.json();

            // Step 3: Save the file reference and get the public URL
            const result = await saveFileReference({
                storageId,
                userId,
                fileType,
                metadata,
            });

            setProgress(100);
            setIsUploading(false);

            return result?.url || null;
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            setIsUploading(false);
            return null;
        }
    }, [generateUploadUrl, saveFileReference]);

    // Helper to upload from a data URL (Base64)
    const uploadFromDataUrl = useCallback(async (
        dataUrl: string,
        fileName: string,
        fileType: 'profile' | 'cover' | 'discovery' | 'quest',
        userId: string
    ): Promise<string | null> => {
        try {
            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: blob.type });

            return await uploadFile(file, fileType, userId);
        } catch (err: any) {
            setError(err.message || 'Failed to convert data URL');
            return null;
        }
    }, [uploadFile]);

    const reset = useCallback(() => {
        setIsUploading(false);
        setError(null);
        setProgress(0);
    }, []);

    return {
        uploadFile,
        uploadFromDataUrl,
        isUploading,
        error,
        progress,
        reset,
    };
};

export default useFileUpload;
