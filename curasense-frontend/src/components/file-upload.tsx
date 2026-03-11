"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";


interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadStatus?: "idle" | "uploading" | "success" | "error";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function FileUpload({
  accept = { "application/pdf": [".pdf"] },
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileSelect,
  onFileRemove,
  selectedFile,
  isUploading = false,
  uploadProgress = 0,
  uploadStatus = "idle",
  title = "Upload your file",
  description = "Drag and drop or click to browse",
  icon,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    noClick: !!selectedFile,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileRemove?.();
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-xl sm:rounded-2xl border-2 border-dashed transition-all duration-300 active:scale-[0.99]",
          isDragActive
            ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20"
            : "border-slate-200 hover:border-teal-500/50 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/50",
          selectedFile && "border-solid border-teal-500/30 bg-teal-50/30 dark:bg-teal-900/10",
          isUploading && "pointer-events-none"
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-6 sm:p-8 text-center"
            >
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className={cn(
                  "mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl transition-colors",
                  isDragActive
                    ? "bg-teal-500 text-white"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                )}
              >
                {icon || <Upload className="h-7 w-7 sm:h-8 sm:w-8" />}
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">
                {title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-[250px]">
                {description}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Max file size: {formatFileSize(maxSize)}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30 flex-shrink-0">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  {isUploading && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {uploadStatus === "uploading" && (
                    <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                  )}
                  {uploadStatus === "success" && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                  {uploadStatus === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemove}
                      className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg text-slate-400 hover:text-red-500 active:scale-95"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!selectedFile && (
        <div className="mt-3 sm:mt-4 flex items-center justify-center">
          <Button variant="outline" onClick={open} className="gap-2 h-11 sm:h-10 px-6 active:scale-95">
            <Upload className="h-4 w-4" />
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}
