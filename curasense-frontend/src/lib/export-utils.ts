"use client";

/**
 * Enhanced Export Utilities
 * Healthcare-compliant data export functionality
 * Supports PDF, FHIR, secure sharing
 */

import { marked } from "marked";

// Types
export interface ReportData {
  id: string;
  title: string;
  content: string;
  type: "prescription" | "xray" | "medicine";
  createdAt: Date;
  patientInfo?: PatientInfo;
}

export interface PatientInfo {
  name?: string;
  dateOfBirth?: string;
  mrn?: string; // Medical Record Number
}

export interface ExportOptions {
  includeDisclaimer?: boolean;
  includeTimestamp?: boolean;
  includeLogo?: boolean;
  format?: "pdf" | "fhir" | "txt" | "html";
}

// FHIR R4 DiagnosticReport structure (simplified)
interface FHIRDiagnosticReport {
  resourceType: "DiagnosticReport";
  id: string;
  status: "final" | "preliminary";
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    text: string;
  };
  subject?: {
    display: string;
  };
  effectiveDateTime: string;
  issued: string;
  conclusion: string;
  presentedForm: Array<{
    contentType: string;
    data: string;
  }>;
}

/**
 * Generate PDF from report content
 * Uses browser print to PDF
 */
export function generatePrintableHTML(
  report: ReportData,
  options: ExportOptions = {}
): string {
  const {
    includeDisclaimer = true,
    includeTimestamp = true,
    includeLogo = true,
  } = options;

  const htmlContent = marked.parse(report.content);
  const timestamp = new Date().toLocaleString();
  const reportDate = report.createdAt.toLocaleDateString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title} - CuraSense Report</title>
  <style>
    /* Print-optimized styles */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0d9488;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #0d9488, #7c3aed);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    
    .logo-text {
      font-size: 24px;
      font-weight: 700;
      color: #0d9488;
    }
    
    .logo-text span {
      color: #7c3aed;
    }
    
    .report-meta {
      text-align: right;
      color: #666;
      font-size: 14px;
    }
    
    .report-type {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    /* Content */
    .content {
      margin-bottom: 40px;
    }
    
    .content h1 {
      font-size: 28px;
      color: #0d9488;
      margin-bottom: 20px;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 10px;
    }
    
    .content h2 {
      font-size: 20px;
      color: #1a1a1a;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    
    .content h3 {
      font-size: 16px;
      color: #333;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    .content p {
      margin-bottom: 12px;
    }
    
    .content ul, .content ol {
      margin-left: 24px;
      margin-bottom: 16px;
    }
    
    .content li {
      margin-bottom: 6px;
    }
    
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    
    .content th, .content td {
      border: 1px solid #e5e5e5;
      padding: 10px 12px;
      text-align: left;
    }
    
    .content th {
      background: #f5f5f5;
      font-weight: 600;
    }
    
    .content code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }
    
    .content pre {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
    }
    
    /* Footer */
    .footer {
      border-top: 1px solid #e5e5e5;
      padding-top: 20px;
      margin-top: 40px;
      color: #666;
      font-size: 12px;
    }
    
    .disclaimer {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    
    .disclaimer-title {
      color: #b45309;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .disclaimer p {
      color: #92400e;
      margin: 0;
    }
    
    /* Print-specific */
    @media print {
      body {
        padding: 20px;
      }
      
      .header {
        break-inside: avoid;
      }
      
      .footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        background: white;
      }
      
      @page {
        margin: 1cm;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    ${includeLogo ? `
    <div class="logo">
      <div class="logo-icon">+</div>
      <div class="logo-text">Cura<span>Sense</span></div>
    </div>
    ` : ''}
    <div class="report-meta">
      <div class="report-type">${report.type} Analysis</div>
      <div>Report Date: ${reportDate}</div>
      ${includeTimestamp ? `<div>Generated: ${timestamp}</div>` : ''}
      ${report.id ? `<div>Report ID: ${report.id.substring(0, 8)}</div>` : ''}
    </div>
  </div>
  
  <div class="content">
    <h1>${report.title}</h1>
    ${htmlContent}
  </div>
  
  ${includeDisclaimer ? `
  <div class="disclaimer">
    <div class="disclaimer-title">
      ⚠️ Medical Disclaimer
    </div>
    <p>
      This report was generated using AI-powered analysis and is intended for informational purposes only. 
      It should not be used as a substitute for professional medical advice, diagnosis, or treatment. 
      Always consult with qualified healthcare professionals for medical decisions.
    </p>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Generated by CuraSense AI Healthcare Assistant</p>
    <p>© ${new Date().getFullYear()} CuraSense. For informational purposes only.</p>
  </div>
</body>
</html>
`;
}

/**
 * Export to PDF using browser print dialog
 */
export function exportToPDF(report: ReportData, options?: ExportOptions): void {
  const html = generatePrintableHTML(report, options);
  const printWindow = window.open("", "_blank");
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Export to FHIR R4 DiagnosticReport format
 * Healthcare interoperability standard
 */
export function exportToFHIR(report: ReportData): FHIRDiagnosticReport {
  const categoryCode = {
    prescription: { code: "LAB", display: "Laboratory" },
    xray: { code: "RAD", display: "Radiology" },
    medicine: { code: "OTH", display: "Other" },
  };

  const category = categoryCode[report.type] || categoryCode.medicine;

  const fhirReport: FHIRDiagnosticReport = {
    resourceType: "DiagnosticReport",
    id: report.id,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0074",
            code: category.code,
            display: category.display,
          },
        ],
      },
    ],
    code: {
      text: report.title,
    },
    subject: report.patientInfo?.name
      ? { display: report.patientInfo.name }
      : undefined,
    effectiveDateTime: report.createdAt.toISOString(),
    issued: new Date().toISOString(),
    conclusion: report.content.substring(0, 500) + "...",
    presentedForm: [
      {
        contentType: "text/markdown",
        data: btoa(unescape(encodeURIComponent(report.content))),
      },
    ],
  };

  return fhirReport;
}

/**
 * Download FHIR JSON
 */
export function downloadFHIR(report: ReportData): void {
  const fhir = exportToFHIR(report);
  const blob = new Blob([JSON.stringify(fhir, null, 2)], {
    type: "application/fhir+json",
  });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `curasense-report-${report.id.substring(0, 8)}.fhir.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Export to plain text
 */
export function exportToText(report: ReportData): void {
  const text = `
CuraSense Report
================

Title: ${report.title}
Type: ${report.type}
Date: ${report.createdAt.toLocaleString()}
ID: ${report.id}

---

${report.content}

---

DISCLAIMER: This report was generated using AI-powered analysis and is intended 
for informational purposes only. Always consult with qualified healthcare 
professionals for medical decisions.

Generated by CuraSense AI Healthcare Assistant
  `.trim();

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `curasense-report-${report.id.substring(0, 8)}.txt`;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Generate shareable link (simulated - in production would use backend)
 */
export function generateShareLink(report: ReportData): string {
  // In production, this would:
  // 1. Encrypt the report
  // 2. Upload to secure storage
  // 3. Return a time-limited, authenticated URL
  
  // For demo, we create a data URL with base64 encoded content
  const data = {
    id: report.id,
    title: report.title,
    type: report.type,
    content: report.content,
    createdAt: report.createdAt.toISOString(),
  };
  
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  
  // Simulated share URL
  return `${window.location.origin}/reports/shared?data=${encoded.substring(0, 50)}...`;
}

/**
 * Copy report to clipboard
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = content;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Open email client with report
 */
export function emailReport(report: ReportData, recipientEmail?: string): void {
  const subject = encodeURIComponent(`CuraSense Report: ${report.title}`);
  const body = encodeURIComponent(`
Hello,

I am sharing a medical analysis report from CuraSense.

Report Title: ${report.title}
Report Type: ${report.type}
Generated: ${report.createdAt.toLocaleString()}

---

${report.content.substring(0, 500)}...

[Full report attached or available at the secure link]

---

IMPORTANT: This report was generated using AI-powered analysis and is intended 
for informational purposes only. Please consult with qualified healthcare 
professionals for medical advice.

Sent via CuraSense AI Healthcare Assistant
  `.trim());

  const mailto = recipientEmail
    ? `mailto:${recipientEmail}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;

  window.location.href = mailto;
}
