"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type PhotoDropzoneProps = {
  file: File | null;
  onFileSelect: (file: File | null) => Promise<void>;
  error?: string;
  uploadProgress: number;
};

export function PhotoDropzone({
  file,
  onFileSelect,
  error,
  uploadProgress,
}: PhotoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleFiles = async (fileList: FileList | null) => {
    const nextFile = fileList?.[0] ?? null;
    await onFileSelect(nextFile);
  };

  return (
    <div className="space-y-2">
      <motion.label
        htmlFor="photo-upload"
        className={`relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed bg-white/70 p-5 text-center transition ${
          isDragging
            ? "border-cyan-500 bg-cyan-50"
            : "border-slate-300 hover:border-blue-400"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={async (event) => {
          event.preventDefault();
          setIsDragging(false);
          await handleFiles(event.dataTransfer.files);
        }}
        whileHover={{ scale: 1.005 }}
      >
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            await handleFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            Drag and drop your photo here
          </p>
          <p className="text-xs text-slate-500">
            or click to browse (max 400x400 and 100KB)
          </p>
        </div>
      </motion.label>

      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="relative h-44 w-full">
              <Image
                src={previewUrl}
                alt="Selected profile preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-slate-600">
              <span className="truncate">{file?.name}</span>
              <span>{file ? `${Math.round(file.size / 1024)}KB` : ""}</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {uploadProgress > 0 ? (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Uploading: {uploadProgress}%
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? (
        <motion.p
          className="pl-1 text-xs text-rose-600"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      ) : null}
    </div>
  );
}
