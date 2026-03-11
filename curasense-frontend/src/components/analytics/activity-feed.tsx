"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Stethoscope,
  Pill,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type ActivityEvent } from "@/lib/use-filtered-analytics";
import { springPresets, staggerConfig } from "@/styles/tokens/animations";

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
  className?: string;
}

const typeConfig = {
  report_completed: {
    icon: CheckCircle2,
    color: "text-[hsl(var(--color-success))]",
    bg: "bg-[hsl(var(--color-success)/0.1)]",
    dotColor: "bg-[hsl(var(--color-success))]",
  },
  report_error: {
    icon: XCircle,
    color: "text-[hsl(var(--color-error))]",
    bg: "bg-[hsl(var(--color-error)/0.1)]",
    dotColor: "bg-[hsl(var(--color-error))]",
  },
  report_created: {
    icon: FileText,
    color: "text-[hsl(var(--color-info))]",
    bg: "bg-[hsl(var(--color-info)/0.1)]",
    dotColor: "bg-[hsl(var(--color-info))]",
  },
};

const reportTypeIcons = {
  prescription: Stethoscope,
  xray: Image,
  text: FileText,
  medicine: Pill,
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityFeed({
  events,
  maxItems = 8,
  className,
}: ActivityFeedProps) {
  const displayEvents = events.slice(0, maxItems);

  if (displayEvents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className={className}
      >
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
            Recent Activity
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              No recent activity
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.smooth}
      className={className}
    >
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Recent Activity
          </h3>
          <span className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
            {events.length} events
          </span>
        </div>

        <motion.div
          className="space-y-0 max-h-[340px] overflow-y-auto scrollbar-thin pr-1"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: staggerConfig.fast,
            },
          }}
        >
          {displayEvents.map((event, index) => {
            const config = typeConfig[event.type];
            const StatusIcon = config.icon;
            const ReportIcon =
              reportTypeIcons[
                event.reportType as keyof typeof reportTypeIcons
              ] || FileText;

            return (
              <motion.div
                key={event.id}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={springPresets.snappy}
                className="relative flex gap-3 py-3 group"
              >
                {/* Timeline connector */}
                {index < displayEvents.length - 1 && (
                  <div className="absolute left-[15px] top-[42px] bottom-0 w-px bg-[hsl(var(--border)/0.5)]" />
                )}

                {/* Status dot with icon */}
                <div
                  className={cn(
                    "relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
                    config.bg
                  )}
                >
                  <StatusIcon className={cn("h-4 w-4", config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                      {event.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReportIcon className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {event.description}
                    </span>
                  </div>
                  {event.confidenceScore !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-1 w-12 rounded-full bg-[hsl(var(--muted)/0.5)] overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            event.confidenceScore >= 0.8
                              ? "bg-[hsl(var(--color-success))]"
                              : event.confidenceScore >= 0.5
                              ? "bg-[hsl(var(--color-warning))]"
                              : "bg-[hsl(var(--color-error))]"
                          )}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${event.confidenceScore * 100}%`,
                          }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-[hsl(var(--muted-foreground))]">
                        {(event.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Time */}
                <span className="flex-shrink-0 text-[11px] tabular-nums text-[hsl(var(--muted-foreground))] pt-0.5">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
