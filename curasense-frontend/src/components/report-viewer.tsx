"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  Printer, 
  Mail, 
  Copy, 
  Check,
  ChevronDown,
  FileJson,
  FileType,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAnnounce } from "@/components/accessibility";
import {
  exportToPDF,
  exportToText,
  downloadFHIR,
  emailReport,
  copyToClipboard,
  generateShareLink,
  ReportData,
} from "@/lib/export-utils";

interface ReportViewerProps {
  content: string;
  title?: string;
  type?: "prescription" | "xray" | "medicine";
  reportId?: string;
}

export function ReportViewer({
  content,
  title = "Analysis Report",
  type = "prescription",
  reportId,
}: ReportViewerProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { announcePolite } = useAnnounce();

  const htmlContent = useMemo(() => {
    if (!content) return "";
    return marked.parse(content);
  }, [content]);

  // Construct report data for export utilities
  const reportData: ReportData = useMemo(() => ({
    id: reportId || crypto.randomUUID(),
    title,
    content,
    type,
    createdAt: new Date(),
  }), [reportId, title, content, type]);

  const handleExportPDF = () => {
    exportToPDF(reportData);
    toast.success("Opening print dialog for PDF export");
    announcePolite("Print dialog opened for PDF export");
    setIsExportMenuOpen(false);
  };

  const handleExportText = () => {
    exportToText(reportData);
    toast.success("Report downloaded as text file");
    announcePolite("Report downloaded as text file");
    setIsExportMenuOpen(false);
  };

  const handleExportFHIR = () => {
    downloadFHIR(reportData);
    toast.success("FHIR DiagnosticReport downloaded");
    announcePolite("FHIR format report downloaded");
    setIsExportMenuOpen(false);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      toast.success("Report copied to clipboard");
      announcePolite("Report copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard");
    }
    setIsExportMenuOpen(false);
  };

  const handleShare = () => {
    const link = generateShareLink(reportData);
    copyToClipboard(link);
    toast.success("Share link copied to clipboard", {
      description: "Link is valid for 24 hours",
    });
    announcePolite("Secure share link copied to clipboard");
    setIsExportMenuOpen(false);
  };

  const handleEmail = () => {
    emailReport(reportData);
    toast.info("Opening email client...");
    announcePolite("Opening email client");
    setIsExportMenuOpen(false);
  };

  const exportOptions = [
    { icon: Printer, label: "Print / PDF", action: handleExportPDF, description: "Open print dialog" },
    { icon: FileType, label: "Plain Text", action: handleExportText, description: "Download .txt file" },
    { icon: FileJson, label: "FHIR Format", action: handleExportFHIR, description: "Healthcare standard" },
    { divider: true },
    { icon: Copy, label: copied ? "Copied!" : "Copy Text", action: handleCopy, description: "Copy to clipboard" },
    { icon: Link2, label: "Share Link", action: handleShare, description: "Secure 24h link" },
    { icon: Mail, label: "Email Report", action: handleEmail, description: "Open email client" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden" role="article" aria-label="Analysis Report">
        <CardHeader className="border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--brand-primary)/0.05)] to-[hsl(var(--brand-secondary)/0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Report Info */}
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
                aria-hidden="true"
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Generated {new Date().toLocaleDateString()} • {type} analysis
                </p>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex gap-2">
              {/* Quick actions */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className="gap-2"
                aria-label={copied ? "Copied to clipboard" : "Copy report to clipboard"}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </Button>

              {/* Export dropdown */}
              <div className="relative">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="gap-2"
                  aria-expanded={isExportMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Export options"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExportMenuOpen && "rotate-180"
                    )} 
                    aria-hidden="true"
                  />
                </Button>

                <AnimatePresence>
                  {isExportMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsExportMenuOpen(false)}
                        aria-hidden="true"
                      />
                      
                      {/* Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 z-50 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden"
                        role="menu"
                        aria-label="Export formats"
                      >
                        <div className="p-1.5">
                          {exportOptions.map((option, index) => {
                            if ('divider' in option) {
                              return (
                                <div 
                                  key={`divider-${index}`} 
                                  className="my-1 h-px bg-[hsl(var(--border))]" 
                                  role="separator"
                                />
                              );
                            }
                            
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.label}
                                onClick={option.action}
                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                                role="menuitem"
                              >
                                <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                                <div className="flex-1 text-left">
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                    {option.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <article
              className="prose prose-slate dark:prose-invert max-w-none p-6 prose-headings:text-[hsl(var(--brand-primary))] dark:prose-headings:text-[hsl(var(--brand-primary-light))] prose-a:text-[hsl(var(--brand-primary))]"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              aria-label="Report content"
            />
          </ScrollArea>
        </CardContent>

        {/* Accessibility: Hidden live region for status updates */}
        <div className="sr-only" role="status" aria-live="polite">
          Report loaded: {title}
        </div>
      </Card>
    </motion.div>
  );
}
