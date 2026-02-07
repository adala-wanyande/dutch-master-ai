"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Camera, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { processImage } from "@/utils/image";

interface UploadZoneProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  onClear: () => void;
}

export default function UploadZone({
  onFilesSelect,
  selectedFiles,
  onClear,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter(
        (f) =>
          f.type.startsWith("image/") ||
          /\.(heic|heif|jpg|jpeg|png|gif|webp)$/i.test(f.name)
      );
      if (files.length === 0) return;

      setIsProcessing(true);
      setProcessingError(null);
      try {
        const processed = await Promise.all(files.map(processImage));
        const allFiles = [...selectedFiles, ...processed];
        onFilesSelect(allFiles);

        const newPreviews = await Promise.all(
          processed.map(
            (file) =>
              new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
              })
          )
        );
        setPreviews((prev) => [...prev, ...newPreviews]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to process image";
        setProcessingError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [onFilesSelect, selectedFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onFilesSelect(newFiles);
    setPreviews(newPreviews);
    if (newFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setPreviews([]);
    onClear();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  if (selectedFiles.length > 0 && previews.length > 0) {
    return (
      <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {selectedFiles.length} image{selectedFiles.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-2">
            <label
              htmlFor="file-upload-add"
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-orange-400 px-3 py-1 text-xs font-medium text-orange-600 hover:bg-orange-100"
            >
              <Upload className="h-3 w-3" />
              Add more
            </label>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
        </div>
        <input
          type="file"
          accept="image/*,image/heic,image/heif,.heic,.heif"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="file-upload-add"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((preview, index) => (
            <div key={index} className="group relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-28 w-full rounded-lg object-cover"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="mt-1 truncate text-xs text-gray-500">
                {selectedFiles[index]?.name} ({((selectedFiles[index]?.size || 0) / 1024).toFixed(0)} KB)
              </p>
            </div>
          ))}
        </div>
        {isProcessing && (
          <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing images...
          </div>
        )}
        {processingError && (
          <div className="mt-3 text-sm text-red-600">{processingError}</div>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragging
          ? "border-orange-500 bg-orange-50"
          : "border-gray-300 hover:border-orange-400"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/heic,image/heif,.heic,.heif"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        id="file-upload"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        id="camera-capture"
      />

      {isProcessing ? (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Converting and compressing...
          </p>
        </>
      ) : (
        <>
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Drop your homework images here
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Supports JPG, PNG, HEIC -- multiple images allowed
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </label>
            <label
              htmlFor="camera-capture"
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-orange-500 px-4 py-2 text-orange-500 hover:bg-orange-50"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </label>
          </div>
        </>
      )}
    </div>
  );
}
