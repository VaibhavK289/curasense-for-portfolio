"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  User,
  Search,
  FileCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradientText } from "@/components/ui/aceternity";
import { springPresets } from "@/styles/tokens/animations";
import { useAuth } from "@/lib/auth-context";

interface Report {
  id: string;
  title: string;
  type: "lab_result" | "diagnosis" | "prescription" | "imaging" | "summary";
  date: string;
  doctor: string;
  status: "completed" | "pending" | "processing";
  fileSize: string;
}

// Mock data for reports
const mockReports: Report[] = [
  {
    id: "1",
    title: "Complete Blood Count (CBC)",
    type: "lab_result",
    date: "2026-01-15",
    doctor: "Dr. Sarah Johnson",
    status: "completed",
    fileSize: "245 KB"
  },
  {
    id: "2", 
    title: "AI Diagnostic Summary",
    type: "diagnosis",
    date: "2026-01-14",
    doctor: "AI Analysis",
    status: "completed",
    fileSize: "512 KB"
  },
  {
    id: "3",
    title: "Chest X-Ray Analysis",
    type: "imaging",
    date: "2026-01-12",
    doctor: "Dr. Michael Chen",
    status: "completed",
    fileSize: "2.3 MB"
  },
  {
    id: "4",
    title: "Medication Prescription",
    type: "prescription",
    date: "2026-01-10",
    doctor: "Dr. Emily Davis",
    status: "completed",
    fileSize: "128 KB"
  },
  {
    id: "5",
    title: "Monthly Health Summary",
    type: "summary",
    date: "2026-01-01",
    doctor: "CuraSense AI",
    status: "processing",
    fileSize: "1.1 MB"
  }
];

const reportTypeLabels: Record<Report["type"], string> = {
  lab_result: "Lab Result",
  diagnosis: "Diagnosis",
  prescription: "Prescription",
  imaging: "Imaging",
  summary: "Summary"
};

const statusColors: Record<Report["status"], string> = {
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20"
};

export default function ReportsPage() {
  const { isAuthenticated, isGuest } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading reports
    const timer = setTimeout(() => {
      setReports(mockReports);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesType;
  });

  if (!isAuthenticated && !isGuest) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <FileText className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            Please sign in to view your medical reports.
          </p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Medical <GradientText>Reports</GradientText>
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          View and download your medical reports and AI analyses
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.smooth, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          <Button
            variant={filterType === "lab_result" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("lab_result")}
          >
            Lab Results
          </Button>
          <Button
            variant={filterType === "imaging" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("imaging")}
          >
            Imaging
          </Button>
          <Button
            variant={filterType === "diagnosis" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("diagnosis")}
          >
            Diagnoses
          </Button>
        </div>
      </motion.div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-6 bg-[hsl(var(--muted))] rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-[hsl(var(--muted))] rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="p-8 text-center">
          <FileCheck className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            {searchQuery || filterType !== "all" 
              ? "Try adjusting your search or filters"
              : "Your medical reports will appear here"}
          </p>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springPresets.smooth, delay: index * 0.05 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[hsl(var(--brand-primary)/0.1)]">
                      <FileText className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[hsl(var(--foreground))]">
                        {report.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {report.doctor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs">{report.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[report.status]}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                      {reportTypeLabels[report.type]}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Guest Mode Notice */}
      {isGuest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-4 bg-[hsl(var(--brand-primary)/0.05)] border-[hsl(var(--brand-primary)/0.2)]">
            <p className="text-sm text-center text-[hsl(var(--muted-foreground))]">
              You&apos;re viewing sample data in guest mode.{" "}
              <a href="/register" className="text-[hsl(var(--brand-primary))] hover:underline">
                Create an account
              </a>{" "}
              to save your medical reports securely.
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
