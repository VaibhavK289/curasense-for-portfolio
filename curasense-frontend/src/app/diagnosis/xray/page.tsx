"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ScanLine,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Send,
  MessageCircle,
  ImageIcon,
  X,
  CheckCircle,
  Bot,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReportViewer } from "@/components/report-viewer";
import { GradientText, SpotlightCard } from "@/components/ui/aceternity";
import { useAppStore } from "@/lib/store";
import { uploadXrayImage, queryXrayImage, getXrayAnswer } from "@/lib/api";
import { generateThreadId, cn } from "@/lib/utils";
import { saveReport } from "@/lib/save-report";
import { useAuth } from "@/lib/auth-context";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function XRayPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { addReport } = useAppStore();
  const { accessToken } = useAuth();

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select an image file");
          return;
        }
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setError(null);
        setReport(null);
        setImageUploaded(false);
        setChatMessages([]);
      }
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setReport(null);
      setImageUploaded(false);
      setChatMessages([]);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUploaded(false);
    setReport(null);
    setError(null);
    setChatMessages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const analyzeImage = async () => {
    if (!selectedImage) return;

    const newThreadId = generateThreadId();
    setThreadId(newThreadId);
    setIsUploading(true);
    setError(null);

    try {
      toast.loading("Uploading image...", { id: "xray-upload" });

      // Upload image
      const uploadResult = await uploadXrayImage(newThreadId, selectedImage);
      if (!uploadResult.success) {
        throw new Error("Failed to upload image");
      }

      setImageUploaded(true);
      toast.loading("Generating AI analysis...", { id: "xray-upload" });

      setIsAnalyzing(true);

      // Generate initial report
      const initialQuery =
        "Please provide a comprehensive analysis of this medical image including: 1) Image quality and type, 2) Anatomical structures visible, 3) Any abnormalities or findings, 4) Clinical significance, and 5) Recommendations.";

      await queryXrayImage(newThreadId, initialQuery);

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get the answer
      const answer = await getXrayAnswer(newThreadId);

      setReport(answer);
      
      saveReport({
        type: "xray",
        title: selectedImage.name,
        summary: "Medical image analysis",
        content: answer,
        status: "completed",
      }, accessToken);

      toast.success("Analysis complete!", { id: "xray-upload" });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze image"
      );
      toast.error("Analysis failed. Make sure the X-ray server is running.", {
        id: "xray-upload",
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !imageUploaded || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsChatLoading(true);

    try {
      await queryXrayImage(threadId, userMessage);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const answer = await getXrayAnswer(threadId);
      setChatMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/diagnosis"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Diagnosis
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
            <ScanLine className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              <GradientText>Medical Image Analysis</GradientText>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Upload X-rays, CT scans, or MRI images for AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Medical Image</CardTitle>
              <CardDescription>
                Supported formats: JPG, PNG, DICOM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  "relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
                  selectedImage
                    ? "border-purple-500/30 bg-purple-50/30 dark:bg-purple-900/10"
                    : "border-slate-200 hover:border-purple-500/50 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {!selectedImage ? (
                  <div
                    className="flex flex-col items-center justify-center p-8 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                      <ImageIcon className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                      Drop your image here
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      or click to browse files
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      X-rays, CT scans, MRI images
                    </p>
                  </div>
                ) : (
                  <div className="relative aspect-square max-h-[400px]">
                    <Image
                      src={imagePreview!}
                      alt="Medical image preview"
                      fill
                      className="object-contain p-4"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {imageUploaded && (
                      <div className="absolute top-2 left-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500 text-white text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Uploaded
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <Button
                onClick={analyzeImage}
                disabled={!selectedImage || isUploading || isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                {isUploading || isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isUploading ? "Uploading..." : "Analyzing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Analyze Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Chat Section - Only shown after analysis */}
          {imageUploaded && report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-500" />
                    Ask Questions About The Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {chatMessages.length > 0 && (
                    <ScrollArea className="h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="space-y-4" ref={chatScrollRef}>
                        {chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "flex gap-3",
                              msg.role === "user" && "flex-row-reverse"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                msg.role === "user"
                                  ? "bg-slate-200 dark:bg-slate-700"
                                  : "bg-gradient-to-br from-purple-500 to-pink-500"
                              )}
                            >
                              {msg.role === "user" ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div
                              className={cn(
                                "max-w-[240px] rounded-2xl px-4 py-2.5 text-sm",
                                msg.role === "user"
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                  : "bg-slate-100 dark:bg-slate-800"
                              )}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isChatLoading && (
                          <div className="flex gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5">
                              <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                              <span className="text-sm text-slate-500">
                                Thinking...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
                      placeholder="Ask about findings, severity, recommendations..."
                      disabled={isChatLoading}
                    />
                    <Button
                      onClick={handleChatSubmit}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tips Card */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Tips for Best Results
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Use high-quality, clear images
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Ensure proper orientation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Include the full area of interest
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Ask specific follow-up questions
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div
                key="report"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ReportViewer
                  content={report}
                  title="X-Ray Analysis Report"
                  type="xray"
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SpotlightCard className="h-[500px] flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                    <ScanLine className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    Upload a medical image to get started with AI-powered
                    analysis and receive detailed findings.
                  </p>
                </SpotlightCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Important Disclaimer
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This AI analysis is for educational and informational purposes
                  only. It should NOT be used as a substitute for professional
                  medical diagnosis. Always consult with qualified healthcare
                  providers for medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
