"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  Droplets,
  Edit3,
  Save,
  X,
  FileText,
  ImageIcon,
  Pill,
  Clock,
  Trash2,
  Eye,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Upload,
  BarChart3,
  Settings,
  History,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { springPresets } from "@/styles/tokens/animations";
import { GradientText } from "@/components/ui/aceternity";

// ============================================
// TYPES
// ============================================

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer-not-to-say";
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "";
  phone: string;
  avatarUrl: string;
}

// ============================================
// CONSTANTS
// ============================================

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

const typeConfig = {
  prescription: {
    icon: FileText,
    label: "Prescription",
    color: "text-[hsl(var(--color-diagnosis))]",
    bg: "bg-[hsl(var(--color-diagnosis)/0.1)]",
  },
  text: {
    icon: FileText,
    label: "Text Analysis",
    color: "text-[hsl(var(--color-diagnosis))]",
    bg: "bg-[hsl(var(--color-diagnosis)/0.1)]",
  },
  xray: {
    icon: ImageIcon,
    label: "X-Ray",
    color: "text-[hsl(var(--brand-secondary))]",
    bg: "bg-[hsl(var(--brand-secondary)/0.1)]",
  },
  medicine: {
    icon: Pill,
    label: "Medicine",
    color: "text-[hsl(var(--color-medicine))]",
    bg: "bg-[hsl(var(--color-medicine)/0.1)]",
  },
};

// ============================================
// QUICK ACTION BUTTONS
// ============================================

function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: "New Prescription",
      icon: FileText,
      href: "/diagnosis/prescription",
      color: "from-[hsl(var(--color-diagnosis))] to-[hsl(var(--accent-cyan))]",
      description: "Upload & analyze",
    },
    {
      label: "X-Ray Analysis",
      icon: ImageIcon,
      href: "/diagnosis/xray",
      color: "from-[hsl(var(--brand-secondary))] to-[hsl(var(--accent-rose))]",
      description: "AI-powered imaging",
    },
    {
      label: "Medicine Lookup",
      icon: Pill,
      href: "/medicine",
      color: "from-[hsl(var(--color-medicine))] to-[hsl(var(--brand-primary))]",
      description: "Drug information",
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      href: "/analytics",
      color: "from-[hsl(var(--color-warning))] to-[hsl(var(--accent-amber))]",
      description: "Usage statistics",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
          Quick Actions
        </CardTitle>
        <CardDescription>Jump to common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => router.push(action.href)}
                className={cn(
                  "group relative p-4 rounded-xl border border-[hsl(var(--border))]",
                  "bg-[hsl(var(--card))] hover:border-[hsl(var(--brand-primary)/0.5)]",
                  "transition-all duration-200 text-left"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                    "bg-gradient-to-br shadow-lg",
                    action.color
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-medium text-sm text-[hsl(var(--foreground))]">
                  {action.label}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {action.description}
                </p>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// SUMMARY STATISTICS
// ============================================

function SummaryStatistics() {
  const reports = useAppStore((state) => state.reports);
  const getAnalytics = useAppStore((state) => state.getAnalytics);

  const stats = useMemo(() => {
    const analytics = getAnalytics();
    const completedReports = reports.filter((r) => r.status === "completed");
    const thisWeek = reports.filter((r) => {
      const reportDate = new Date(r.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reportDate >= weekAgo;
    });

    return {
      totalReports: reports.length,
      completedReports: completedReports.length,
      thisWeekReports: thisWeek.length,
      avgConfidence: analytics.accuracyMetrics.averageConfidence * 100,
      prescriptions: analytics.reportsByType.prescription || 0,
      xrays: analytics.reportsByType.xray || 0,
    };
  }, [reports, getAnalytics]);

  const statCards = [
    {
      label: "Total Reports",
      value: stats.totalReports,
      icon: FileText,
      color: "text-[hsl(var(--color-info))]",
      bg: "bg-[hsl(var(--color-info)/0.1)]",
    },
    {
      label: "Completed",
      value: stats.completedReports,
      icon: CheckCircle,
      color: "text-[hsl(var(--color-success))]",
      bg: "bg-[hsl(var(--color-success)/0.1)]",
    },
    {
      label: "This Week",
      value: stats.thisWeekReports,
      icon: TrendingUp,
      color: "text-[hsl(var(--brand-secondary))]",
      bg: "bg-[hsl(var(--brand-secondary)/0.1)]",
    },
    {
      label: "Avg Confidence",
      value: `${stats.avgConfidence.toFixed(0)}%`,
      icon: Activity,
      color: "text-[hsl(var(--color-warning))]",
      bg: "bg-[hsl(var(--color-warning)/0.1)]",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
          Summary Statistics
        </CardTitle>
        <CardDescription>Your activity overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {stat.value}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// RECENT UPLOADS / REPORTS
// ============================================

function RecentUploads() {
  const router = useRouter();
  const reports = useAppStore((state) => state.reports);
  const removeReport = useAppStore((state) => state.removeReport);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const recentReports = useMemo(() => {
    return [...reports]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [reports]);

  const handleDelete = (id: string) => {
    removeReport(id);
    toast.success("Report deleted successfully");
    setDeleteId(null);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (recentReports.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
            Recent Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Upload className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-3" />
            <p className="text-[hsl(var(--muted-foreground))]">
              No uploads yet
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push("/diagnosis/prescription")}
            >
              Upload your first document
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
              Recent Uploads
            </CardTitle>
            <CardDescription>Your latest reports</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/history")}
            className="text-[hsl(var(--brand-primary))]"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {recentReports.map((report, idx) => {
            const config = typeConfig[report.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center gap-4 p-3 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary)/0.3)] transition-colors"
              >
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[hsl(var(--foreground))] truncate">
                    {report.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <Calendar className="h-3 w-3" />
                    {formatDate(report.createdAt)}
                    <Clock className="h-3 w-3 ml-2" />
                    {formatTime(report.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.push(`/reports/${report.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <AlertDialog
                    open={deleteId === report.id}
                    onOpenChange={(open: boolean) => !open && setDeleteId(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[hsl(var(--color-error))] hover:text-[hsl(var(--color-error))]"
                        onClick={() => setDeleteId(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Report</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{report.title}
                          &quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(report.id)}
                          className="bg-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error))]/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ============================================
// USER PROFILE SECTION
// ============================================

function getInitialProfile(authUser?: { firstName: string; lastName: string; email: string; avatarUrl?: string | null } | null): UserProfile {
  const defaultProfile: UserProfile = {
    firstName: "Demo",
    lastName: "User",
    email: "demo@curasense.com",
    dateOfBirth: "1990-01-15",
    gender: "prefer-not-to-say",
    bloodType: "",
    phone: "",
    avatarUrl: "",
  };

  if (typeof window === "undefined") {
    return authUser ? {
      ...defaultProfile,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      email: authUser.email,
      avatarUrl: authUser.avatarUrl || "",
    } : defaultProfile;
  }
  
  const savedProfile = localStorage.getItem("curasense-profile");
  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile);
      // If we have an authenticated user, merge their data with saved profile
      if (authUser) {
        return {
          ...parsed,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          email: authUser.email,
          avatarUrl: authUser.avatarUrl || parsed.avatarUrl || "",
        };
      }
      return parsed;
    } catch {
      // Ignore parse errors
    }
  }
  
  // Return profile with auth user data if available
  if (authUser) {
    return {
      ...defaultProfile,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      email: authUser.email,
      avatarUrl: authUser.avatarUrl || "",
    };
  }
  
  return defaultProfile;
}

function ProfileSection() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => getInitialProfile(user));
  const [editedProfile, setEditedProfile] = useState<UserProfile>(() => getInitialProfile(user));

  // Sync profile with auth user when user changes (login/logout)
  useEffect(() => {
    if (user && isAuthenticated) {
      const updatedProfile = getInitialProfile(user);
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Mark as mounted after first render
    const timer = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Save to localStorage for guest mode or additional fields
    localStorage.setItem("curasense-profile", JSON.stringify(editedProfile));
    
    // If authenticated, also update the server
    if (isAuthenticated) {
      const result = await updateProfile({
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        displayName: `${editedProfile.firstName} ${editedProfile.lastName}`,
      });
      
      if (!result.success) {
        toast.error(result.error || "Failed to update profile on server");
        setIsSaving(false);
        return;
      }
    }
    
    setProfile(editedProfile);
    setIsEditing(false);
    setIsSaving(false);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const getInitials = () => {
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  const getAge = () => {
    if (!profile.dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(profile.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (!hasMounted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--muted))]" />
              <div className="space-y-2">
                <div className="h-6 w-32 bg-[hsl(var(--muted))] rounded" />
                <div className="h-4 w-48 bg-[hsl(var(--muted))] rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal and medical details
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="gap-2"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-2" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getInitials()}
              </div>
              {profile.bloodType && (
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  {profile.bloodType}
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    First Name
                  </label>
                  <Input
                    value={editedProfile.firstName}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    Last Name
                  </label>
                  <Input
                    value={editedProfile.lastName}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={editedProfile.dateOfBirth}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    Gender
                  </label>
                  <Select
                    value={editedProfile.gender}
                    onValueChange={(value: UserProfile["gender"]) =>
                      setEditedProfile({ ...editedProfile, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    Blood Type
                  </label>
                  <Select
                    value={editedProfile.bloodType}
                    onValueChange={(value: UserProfile["bloodType"]) =>
                      setEditedProfile({ ...editedProfile, bloodType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((bt) => (
                        <SelectItem key={bt} value={bt}>
                          {bt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+91 90000 00000"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {profile.email}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {profile.dateOfBirth && (
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Age
                      </p>
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {getAge()} years
                      </p>
                    </div>
                  )}
                  {profile.gender !== "prefer-not-to-say" && (
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Gender
                      </p>
                      <p className="font-medium text-[hsl(var(--foreground))] capitalize">
                        {profile.gender}
                      </p>
                    </div>
                  )}
                  {profile.bloodType && (
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Blood Type
                      </p>
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {profile.bloodType}
                      </p>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Phone
                      </p>
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {profile.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[hsl(var(--brand-primary)/0.06)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl" />

    <div className="container max-w-6xl mx-auto py-6 px-4 sm:px-6 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.3)]">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <GradientText>My Profile</GradientText>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Manage your account settings and view your activity
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileSection />
          <SummaryStatistics />
          <RecentUploads />
        </div>

        {/* Right Column - Quick Actions & Settings */}
        <div className="space-y-6">
          <QuickActions />

          {/* Settings Shortcut */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4" />
                App Settings
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => router.push("/help")}
              >
                <AlertCircle className="h-4 w-4" />
                Help & Support
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
