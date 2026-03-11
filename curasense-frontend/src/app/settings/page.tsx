"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Sun,
  Moon,
  Bell,
  Shield,
  Trash2,
  User,
  Globe,
  Volume2,
  VolumeX,
  Download,
  ChevronRight,
  Monitor,
  Smartphone,
  Clock,
  Languages,
  FileDown,
  Database,
  Lock,
  Eye,
  EyeOff,
  History,
  BarChart3,
  UserX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { GradientText } from "@/components/ui/aceternity";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { springPresets } from "@/styles/tokens/animations";

interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  language: string;
  timezone: string;
  autoDeleteDays: number;
  dataExportFormat: "json" | "csv" | "pdf";
  anonymousMode: boolean;
  trackHistory: boolean;
  shareAnalytics: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications: true,
  soundEnabled: true,
  language: "en",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  autoDeleteDays: 0,
  dataExportFormat: "json",
  anonymousMode: false,
  trackHistory: true,
  shareAnalytics: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { clearReports, clearChatHistory, reports } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setIsMounted(true);
    const savedSettings = localStorage.getItem("curasense-settings");
    if (savedSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
    }
  }, []);

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("curasense-settings", JSON.stringify(newSettings));
    toast.success("Setting updated");
  };

  const handleClearData = () => {
    clearReports();
    clearChatHistory();
    toast.success("All data cleared successfully");
  };

  const handleExportData = () => {
    const data = {
      reports: reports,
      exportedAt: new Date().toISOString(),
      format: settings.dataExportFormat,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curasense-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  if (!isMounted) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-[hsl(var(--muted))] rounded-xl" />
          <div className="h-48 bg-[hsl(var(--muted))] rounded-xl" />
          <div className="h-48 bg-[hsl(var(--muted))] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[hsl(var(--brand-primary)/0.06)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[hsl(var(--brand-secondary)/0.06)] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className="container max-w-4xl mx-auto py-6 px-4 relative z-10"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] shadow-lg shadow-[hsl(var(--brand-primary)/0.3)]">
              <Settings className="h-6 w-6 text-white" />
            </div>
          <div>
            <h1 className="text-3xl font-bold">
              <GradientText>Settings</GradientText>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Customize your CuraSense experience
            </p>
          </div>
        </div>

        {/* Quick Link to Profile */}
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push("/profile")}
        >
          <User className="h-4 w-4" />
          Edit Profile
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how CuraSense looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Theme
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Choose your preferred color mode
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Anonymous Mode */}
        <Card className={cn(
          settings.anonymousMode && "border-[hsl(var(--accent-amber)/0.5)] bg-[hsl(var(--accent-amber)/0.05)]"
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {settings.anonymousMode ? (
                <UserX className="h-5 w-5 text-[hsl(var(--accent-amber))]" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
              Privacy & Anonymous Mode
              {settings.anonymousMode && (
                <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-[hsl(var(--accent-amber)/0.2)] text-[hsl(var(--accent-amber))]">
                  Active
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Control your privacy and activity tracking preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Anonymous Mode
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Disable all history tracking and activity logging
                </p>
              </div>
              <Button
                variant={settings.anonymousMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newValue = !settings.anonymousMode;
                  updateSetting("anonymousMode", newValue);
                  if (newValue) {
                    updateSetting("trackHistory", false);
                    updateSetting("shareAnalytics", false);
                    toast.info("Anonymous mode enabled - no activity will be tracked");
                  } else {
                    updateSetting("trackHistory", true);
                    toast.success("Anonymous mode disabled");
                  }
                }}
                className={cn(
                  "gap-2",
                  settings.anonymousMode && "bg-[hsl(var(--accent-amber))] hover:bg-[hsl(var(--accent-amber)/0.9)]"
                )}
              >
                {settings.anonymousMode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {settings.anonymousMode ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Activity History
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Track your report history and recent activity
                </p>
              </div>
              <Button
                variant={settings.trackHistory ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting("trackHistory", !settings.trackHistory)}
                disabled={settings.anonymousMode}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                {settings.trackHistory ? "Tracking" : "Off"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Share Usage Analytics
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Help improve CuraSense with anonymous analytics
                </p>
              </div>
              <Button
                variant={settings.shareAnalytics ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting("shareAnalytics", !settings.shareAnalytics)}
                disabled={settings.anonymousMode}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                {settings.shareAnalytics ? "Sharing" : "Off"}
              </Button>
            </div>
            {settings.anonymousMode && (
              <div className="p-3 rounded-lg bg-[hsl(var(--accent-amber)/0.1)] border border-[hsl(var(--accent-amber)/0.3)]">
                <p className="text-sm text-[hsl(var(--accent-amber))] flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>
                    <strong>Anonymous Mode Active:</strong> Your activity is not being tracked. 
                    Reports are still saved but won't appear in your history.
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications & Sound */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications & Sound
            </CardTitle>
            <CardDescription>
              Manage alerts and audio feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Analysis Notifications
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Get notified when analysis is complete
                </p>
              </div>
              <Button
                variant={settings.notifications ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateSetting("notifications", !settings.notifications)
                }
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                {settings.notifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Sound Effects
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Play sounds for notifications and actions
                </p>
              </div>
              <Button
                variant={settings.soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateSetting("soundEnabled", !settings.soundEnabled)
                }
                className="gap-2"
              >
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                {settings.soundEnabled ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription>
              Set your preferred language and timezone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Language
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Select your preferred language
                </p>
              </div>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting("language", value)}
              >
                <SelectTrigger className="w-40">
                  <Languages className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Timezone
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Used for report timestamps
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Clock className="h-4 w-4" />
                {settings.timezone}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription>
              Export your data and manage storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Export Data
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Download all your reports and data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export ({reports.length} reports)
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Auto-Delete Old Reports
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Automatically remove reports after a period
                </p>
              </div>
              <Select
                value={settings.autoDeleteDays.toString()}
                onValueChange={(value) =>
                  updateSetting("autoDeleteDays", parseInt(value))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Never</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Backend server information (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Backend API URL
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Lock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  defaultValue="http://localhost:8000"
                  className="flex-1"
                  disabled
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Vision Server URL
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Lock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  defaultValue="http://localhost:8001"
                  className="flex-1"
                  disabled
                />
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              API endpoints are configured automatically via environment
              variables.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-[hsl(var(--color-error)/0.3)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--color-error))]">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for data management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[hsl(var(--color-error)/0.05)] border border-[hsl(var(--color-error)/0.2)]">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  Clear All Data
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Remove all reports, chat history, and cached data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[hsl(var(--color-error))] border-[hsl(var(--color-error)/0.3)] hover:bg-[hsl(var(--color-error)/0.1)]"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your reports, chat history, and cached data from this
                      device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      className="bg-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error))]/90"
                    >
                      Yes, Clear Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Version Info */}
        <div className="text-center text-sm text-[hsl(var(--muted-foreground))] py-4">
          <p>CuraSense v1.0.0 • AI Healthcare Platform</p>
          <p className="text-xs mt-1">
            © 2026 CuraSense. All rights reserved.
          </p>
        </div>
      </div>
    </motion.div>
    </div>
  );
}
