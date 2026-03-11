"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  FileUp,
  PenLine,
  Shield,
  Zap,
  Brain,
  ChevronRight,
  Clock,
  BarChart3,
  Pill,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import { ReportViewer } from "@/components/report-viewer";
import { ErrorRecoveryCard } from "@/components/error-recovery";
import { useAnnounce } from "@/components/accessibility";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { diagnosePDF, diagnoseText } from "@/lib/api";
import { generateThreadId } from "@/lib/utils";
import { saveReport } from "@/lib/save-report";
import { useAuth } from "@/lib/auth-context";
import { springPresets } from "@/styles/tokens/animations";

// Import ErrorState from the error recovery module
import { ErrorState } from "@/lib/use-error-recovery";

// Feature highlights data
const analysisFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced NLP models extract key medical information",
  },
  {
    icon: Pill,
    title: "Drug Interactions",
    description: "Automatic detection of potential medication conflicts",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description: "Comprehensive breakdown of diagnoses and treatments",
  },
];

export default function PrescriptionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  // Simple error state management
  const [pdfError, setPdfError] = useState<ErrorState | null>(null);
  const [textError, setTextError] = useState<ErrorState | null>(null);
  const MAX_RETRIES = 3;

  const { addReport } = useAppStore();
  const { announce } = useAnnounce();
  const { accessToken } = useAuth();

  // Announce status changes for screen readers
  useEffect(() => {
    if (analysisComplete && report) {
      announce("Analysis complete. Report is now available.", "polite");
    }
  }, [analysisComplete, report, announce]);

  useEffect(() => {
    if (pdfError) {
      announce(`Error: ${pdfError.message}. ${pdfError.canRetry ? `Retry attempt ${pdfError.retryCount + 1} of ${MAX_RETRIES} available.` : "Maximum retries reached."}`, "assertive");
    }
  }, [pdfError, announce]);

  useEffect(() => {
    if (textError) {
      announce(`Error: ${textError.message}. ${textError.canRetry ? `Retry attempt ${textError.retryCount + 1} of ${MAX_RETRIES} available.` : "Maximum retries reached."}`, "assertive");
    }
  }, [textError, announce]);

  const resetPdfError = useCallback(() => setPdfError(null), []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    resetPdfError();
    setAnalysisComplete(false);
    setReport(null);
    announce(`File ${file.name} selected. Ready for analysis.`, "polite");
  }, [resetPdfError, announce]);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setUploadStatus("idle");
    resetPdfError();
    setAnalysisComplete(false);
    setReport(null);
  }, [resetPdfError]);

  const analyzePDF = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setUploadStatus("uploading");
    setPdfError(null);

    const toastId = toast.loading("Analyzing your prescription...");
    
    try {
      const response = await diagnosePDF(selectedFile);
        
      if (response.status === "success" && response.report) {
        setReport(response.report);
        setUploadStatus("success");
        setAnalysisComplete(true);
        
        saveReport({
          type: "prescription",
          title: selectedFile.name,
          summary: "Medical document analysis",
          content: response.report,
          status: "completed",
        }, accessToken);
        
        toast.success("Analysis complete!", { id: toastId });
      } else {
        throw new Error(response.error || "Analysis failed");
      }
    } catch (err) {
      setUploadStatus("error");
      const currentRetryCount = pdfError?.retryCount ?? 0;
      setPdfError({
        message: err instanceof Error ? err.message : "Analysis failed. Please try again.",
        retryCount: currentRetryCount,
        canRetry: currentRetryCount < MAX_RETRIES - 1,
        isOffline: !navigator.onLine,
        timestamp: new Date(),
      });
      toast.error("Analysis failed. Please try again.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeText = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setTextError(null);

    const toastId = toast.loading("Analyzing your input...");
    
    try {
      const response = await diagnoseText(textInput);
        
      if (response.status === "success" && response.report) {
        setReport(response.report);
        setAnalysisComplete(true);
        
        saveReport({
          type: "text",
          title: "Manual Entry Analysis",
          summary: "Text-based medical analysis",
          content: response.report,
          status: "completed",
        }, accessToken);
        
        toast.success("Analysis complete!", { id: toastId });
      } else {
        throw new Error(response.error || "Analysis failed");
      }
    } catch (err) {
      const currentRetryCount = textError?.retryCount ?? 0;
      setTextError({
        message: err instanceof Error ? err.message : "Analysis failed. Please try again.",
        retryCount: currentRetryCount,
        canRetry: currentRetryCount < MAX_RETRIES - 1,
        isOffline: !navigator.onLine,
        timestamp: new Date(),
      });
      toast.error("Analysis failed. Please try again.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-gradient-to-bl from-[hsl(var(--brand-primary)/0.03)] via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-tr from-[hsl(var(--brand-secondary)/0.03)] via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 sm:space-y-8"
      >
        {/* Breadcrumb & Header */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/diagnosis"
              className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand-primary))] transition-colors group mb-4 sm:mb-6"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Diagnosis</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ...springPresets.smooth }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Animated Icon */}
              <motion.div 
                className="relative flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={springPresets.snappy}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-diagnosis))] to-[hsl(var(--brand-secondary))] rounded-xl sm:rounded-2xl blur-xl opacity-40" />
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[hsl(var(--color-diagnosis))] to-[hsl(var(--brand-secondary))] flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                  Prescription Analysis
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1 text-sm sm:text-lg">
                  AI-powered medical document analysis
                </p>
              </div>
            </div>

            {/* Trust badges - stack on mobile */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(var(--color-success))]" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-[hsl(var(--border))]" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(var(--color-warning))]" />
                <span>Instant Results</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid - Stack on mobile */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column - Input Section (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...springPresets.smooth }}
            className="lg:col-span-3 space-y-4 sm:space-y-6"
          >
            {/* Custom Tab Switcher */}
            <div className="bg-[hsl(var(--card))] rounded-xl sm:rounded-2xl border border-[hsl(var(--border))] p-1 sm:p-1.5 shadow-sm">
              <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={cn(
                    "relative flex items-center justify-center gap-2 py-3 sm:py-3.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 active:scale-[0.98]",
                    activeTab === "upload"
                      ? "text-[hsl(var(--foreground))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)]"
                  )}
                >
                  {activeTab === "upload" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--color-diagnosis)/0.15)] to-[hsl(var(--brand-secondary)/0.1)] rounded-xl border border-[hsl(var(--color-diagnosis)/0.3)]"
                      transition={springPresets.snappy}
                    />
                  )}
                  <FileUp className={cn("h-4 w-4 relative z-10", activeTab === "upload" && "text-[hsl(var(--color-diagnosis))]")} />
                  <span className="relative z-10">Upload Document</span>
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={cn(
                    "relative flex items-center justify-center gap-2 py-3 sm:py-3.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 active:scale-[0.98]",
                    activeTab === "manual"
                      ? "text-[hsl(var(--foreground))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)]"
                  )}
                >
                  {activeTab === "manual" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-secondary)/0.15)] to-[hsl(var(--color-diagnosis)/0.1)] rounded-xl border border-[hsl(var(--brand-secondary)/0.3)]"
                      transition={springPresets.snappy}
                    />
                  )}
                  <PenLine className={cn("h-4 w-4 relative z-10", activeTab === "manual" && "text-[hsl(var(--brand-secondary))]")} />
                  <span className="relative z-10">Manual Entry</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "upload" ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Upload Card */}
                  <div className="bg-[hsl(var(--card))] rounded-xl sm:rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
                    <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-[hsl(var(--border))]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))]">
                            Upload Medical Document
                          </h2>
                          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                            Drag & drop or tap to browse
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.5)] px-3 py-1.5 rounded-full">
                          <Clock className="h-3 w-3" />
                          <span>~30 sec analysis</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <FileUpload
                        accept={{ "application/pdf": [".pdf"] }}
                        onFileSelect={handleFileSelect}
                        onFileRemove={handleFileRemove}
                        selectedFile={selectedFile}
                        isUploading={isAnalyzing}
                        uploadStatus={uploadStatus}
                        title="Drop your PDF here"
                        description="Prescriptions, lab reports, medical records • Max 10MB"
                        icon={<FileText className="h-8 w-8" />}
                      />

                      {/* Error Recovery Section */}
                      <AnimatePresence>
                        {pdfError && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                          >
                            <ErrorRecoveryCard
                              error={pdfError}
                              onRetry={() => {
                                setPdfError(prev => prev ? { ...prev, retryCount: prev.retryCount + 1 } : null);
                                analyzePDF();
                              }}
                              showBackHome={false}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Analyze Button */}
                      <motion.div className="mt-4 sm:mt-6" whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={analyzePDF}
                          disabled={!selectedFile || isAnalyzing}
                          size="lg"
                          className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl bg-gradient-to-r from-[hsl(var(--color-diagnosis))] to-[hsl(var(--brand-secondary))] hover:opacity-90 shadow-lg shadow-[hsl(var(--color-diagnosis)/0.25)] transition-all duration-200 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                        >
                          {isAnalyzing ? (
                            <div className="flex items-center gap-3">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Analyzing Document...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Sparkles className="h-5 w-5" />
                              <span>Start AI Analysis</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Manual Entry Card */}
                  <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
                    <div className="p-6 pb-4 border-b border-[hsl(var(--border))]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                            Enter Medical Information
                          </h2>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                            Type or paste prescription details for analysis
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <Textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter prescription details, medications, dosages, symptoms, or any medical information...

Example:
• Paracetamol 500mg - Twice daily after meals for 5 days
• Amoxicillin 250mg - Three times daily for 7 days
• Patient complaints: Fever, headache, body pain"
                        className="min-h-[220px] text-base resize-none rounded-xl border-[hsl(var(--border))] focus:border-[hsl(var(--brand-secondary))] focus:ring-2 focus:ring-[hsl(var(--brand-secondary)/0.2)] transition-all"
                      />

                      {/* Character count */}
                      <div className="flex justify-end mt-2">
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {textInput.length} characters
                        </span>
                      </div>

                      {/* Error Recovery Section */}
                      <AnimatePresence>
                        {textError && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                          >
                            <ErrorRecoveryCard
                              error={textError}
                              onRetry={() => {
                                setTextError(prev => prev ? { ...prev, retryCount: prev.retryCount + 1 } : null);
                                analyzeText();
                              }}
                              showBackHome={false}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Analyze Button */}
                      <motion.div className="mt-6" whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={analyzeText}
                          disabled={!textInput.trim() || isAnalyzing}
                          size="lg"
                          className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-[hsl(var(--brand-secondary))] to-[hsl(var(--color-diagnosis))] hover:opacity-90 shadow-lg shadow-[hsl(var(--brand-secondary)/0.25)] transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
                        >
                          {isAnalyzing ? (
                            <div className="flex items-center gap-3">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Analyzing Text...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Sparkles className="h-5 w-5" />
                              <span>Analyze with AI</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feature Highlights - 1 col on mobile, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {analysisFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, ...springPresets.smooth }}
                  className="group p-3 sm:p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary)/0.3)] hover:shadow-md transition-all duration-200 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary)/0.1)] to-[hsl(var(--brand-secondary)/0.1)] flex items-center justify-center sm:mb-3 group-hover:scale-110 transition-transform flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-[hsl(var(--foreground))] mb-0.5 sm:mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-2">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Results Section (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, ...springPresets.smooth }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {analysisComplete && report ? (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReportViewer
                    content={report}
                    title="Analysis Report"
                    type="prescription"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:sticky lg:top-8"
                >
                  <div className="h-[400px] lg:h-[600px] rounded-xl sm:rounded-2xl border-2 border-dashed border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--muted)/0.3)] flex flex-col items-center justify-center text-center p-6 sm:p-8">
                    {/* Animated illustration */}
                    <div className="relative mb-8">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-r from-[hsl(var(--color-diagnosis)/0.2)] to-[hsl(var(--brand-secondary)/0.2)] blur-2xl"
                      />
                      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] flex items-center justify-center">
                        <Stethoscope className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.5)]" />
                      </div>
                      {/* Floating elements */}
                      <motion.div
                        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-[hsl(var(--color-diagnosis)/0.15)] border border-[hsl(var(--color-diagnosis)/0.3)] flex items-center justify-center"
                      >
                        <FileText className="h-4 w-4 text-[hsl(var(--color-diagnosis))]" />
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -6, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute -bottom-1 -left-3 w-7 h-7 rounded-lg bg-[hsl(var(--brand-secondary)/0.15)] border border-[hsl(var(--brand-secondary)/0.3)] flex items-center justify-center"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-secondary))]" />
                      </motion.div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
                      Ready to Analyze
                    </h3>
                    <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] max-w-xs leading-relaxed mb-4 sm:mb-6">
                      Upload a prescription or enter medical information to receive a comprehensive AI analysis
                    </p>

                    {/* Quick tips - hidden on small mobile */}
                    <div className="hidden sm:block w-full max-w-sm space-y-3">
                      <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                        What you&apos;ll get
                      </p>
                      {[
                        "Medication breakdown & dosage info",
                        "Potential drug interactions",
                        "Dietary recommendations",
                        "Follow-up questions answered by AI",
                      ].map((tip, i) => (
                        <div key={i} className="flex items-center gap-3 text-left">
                          <div className="w-5 h-5 rounded-full bg-[hsl(var(--color-success)/0.15)] flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-3 w-3 text-[hsl(var(--color-success))]" />
                          </div>
                          <span className="text-sm text-[hsl(var(--muted-foreground))]">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
