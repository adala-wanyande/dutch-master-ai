"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Camera, X, Image as ImageIcon } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export default function UploadZone({
  onFileSelect,
  selectedFile,
  onClear,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        onFileSelect(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClear = () => {
    setPreview(null);
    onClear();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  if (selectedFile && preview) {
    return (
      <div className="relative rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
        <button
          onClick={handleClear}
          className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-4">
          <img
            src={preview}
            alt="Preview"
            className="h-24 w-24 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
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
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        id="file-upload"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        id="camera-capture"
      />

      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-4 text-lg font-medium text-gray-700">
        Drop your homework image here
      </p>
      <p className="mt-1 text-sm text-gray-500">or use the buttons below</p>

      <div className="mt-6 flex justify-center gap-4">
        <label
          htmlFor="file-upload"
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </label>
        <label
          htmlFor="camera-capture"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-orange-500 px-4 py-2 text-orange-500 hover:bg-orange-50"
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </label>
      </div>
    </div>
  );
}
