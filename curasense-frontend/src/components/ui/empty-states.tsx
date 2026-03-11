'use client';

import { motion } from 'framer-motion';
import { Button } from './button';
import { animationVariants, springPresets } from '@/styles/tokens/animations';

// ================================================
// EMPTY STATE ICONS (Custom SVG)
// ================================================

function SearchEmptyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="52" cy="52" r="32" stroke="currentColor" strokeWidth="4" opacity="0.3" />
      <line
        x1="76"
        y1="76"
        x2="100"
        y2="100"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.3"
      />
      <motion.circle
        cx="52"
        cy="52"
        r="16"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="100"
        initial={{ strokeDashoffset: 100 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        opacity="0.5"
      />
    </svg>
  );
}

function NoDataIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="20"
        y="30"
        width="80"
        height="60"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.3"
      />
      <motion.line
        x1="35"
        y1="50"
        x2="85"
        y2="50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        opacity="0.4"
      />
      <motion.line
        x1="35"
        y1="60"
        x2="70"
        y2="60"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        opacity="0.4"
      />
      <motion.line
        x1="35"
        y1="70"
        x2="55"
        y2="70"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        opacity="0.4"
      />
    </svg>
  );
}

function UploadEmptyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="25"
        y="35"
        width="70"
        height="55"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="8 4"
        opacity="0.3"
      />
      <motion.path
        d="M60 70 L60 50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ y: 5 }}
        animate={{ y: -5 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        opacity="0.5"
      />
      <motion.path
        d="M50 55 L60 45 L70 55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ y: 5 }}
        animate={{ y: -5 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        opacity="0.5"
      />
    </svg>
  );
}

function MedicalEmptyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.rect
        x="40"
        y="20"
        width="40"
        height="80"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.3"
        initial={{ rotate: -5 }}
        animate={{ rotate: 5 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.path
        d="M55 50 H65 V40 H75 V50 H85 V60 H75 V70 H65 V60 H55 V50"
        fill="currentColor"
        opacity="0.2"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  );
}

function ErrorEmptyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <motion.path
        d="M60 40 V65"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.circle
        cx="60"
        cy="78"
        r="3"
        fill="currentColor"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  );
}

function ConnectionEmptyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="35" cy="60" r="12" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <circle cx="85" cy="60" r="12" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <motion.line
        x1="50"
        y1="60"
        x2="70"
        y2="60"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="4 4"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: 16 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        opacity="0.5"
      />
    </svg>
  );
}

// ================================================
// EMPTY STATE TYPES
// ================================================

type EmptyStateType = 'search' | 'data' | 'upload' | 'medical' | 'error' | 'connection';

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

// ================================================
// MAIN COMPONENT
// ================================================

const iconMap: Record<EmptyStateType, React.FC<{ className?: string }>> = {
  search: SearchEmptyIcon,
  data: NoDataIcon,
  upload: UploadEmptyIcon,
  medical: MedicalEmptyIcon,
  error: ErrorEmptyIcon,
  connection: ConnectionEmptyIcon,
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  const IconComponent = iconMap[type];

  return (
    <motion.div
      className={`empty-state ${className}`}
      variants={animationVariants.scaleIn}
      initial="initial"
      animate="animate"
      transition={springPresets.gentle}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...springPresets.bouncy, delay: 0.1 }}
      >
        <IconComponent className="empty-state-icon" />
      </motion.div>

      <motion.h3
        className="empty-state-title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="empty-state-description"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>

      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          className="empty-state-action flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {actionLabel && onAction && (
            <Button onClick={onAction} variant="default">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline">
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ================================================
// PRESET EMPTY STATES
// ================================================

export function SearchEmpty({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      type="search"
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try adjusting your search terms.`
          : 'Start typing to search for patients, records, or medications.'
      }
      actionLabel={query ? 'Clear search' : undefined}
      onAction={onClear}
    />
  );
}

export function NoDataEmpty({
  entityName = 'data',
  onAdd,
}: {
  entityName?: string;
  onAdd?: () => void;
}) {
  return (
    <EmptyState
      type="data"
      title={`No ${entityName} yet`}
      description={`You haven't added any ${entityName} yet. Get started by adding your first entry.`}
      actionLabel={`Add ${entityName}`}
      onAction={onAdd}
    />
  );
}

export function UploadEmpty({
  fileTypes = 'PDF, JPEG, PNG',
  onUpload,
}: {
  fileTypes?: string;
  onUpload?: () => void;
}) {
  return (
    <EmptyState
      type="upload"
      title="Upload a file"
      description={`Drag and drop your file here, or click to browse. Supported formats: ${fileTypes}`}
      actionLabel="Browse files"
      onAction={onUpload}
    />
  );
}

export function DiagnosisEmpty({ onStart }: { onStart?: () => void }) {
  return (
    <EmptyState
      type="medical"
      title="No diagnosis history"
      description="Start an AI-powered diagnosis session to analyze symptoms and get medical insights."
      actionLabel="Start diagnosis"
      onAction={onStart}
    />
  );
}

export function ConnectionError({
  onRetry,
  onGoHome,
}: {
  onRetry?: () => void;
  onGoHome?: () => void;
}) {
  return (
    <EmptyState
      type="connection"
      title="Connection issue"
      description="We're having trouble connecting to the server. Please check your internet connection and try again."
      actionLabel="Try again"
      onAction={onRetry}
      secondaryActionLabel="Go home"
      onSecondaryAction={onGoHome}
    />
  );
}

export function GenericError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      type="error"
      title="Something went wrong"
      description={message || "An unexpected error occurred. Please try again or contact support if the issue persists."}
      actionLabel="Try again"
      onAction={onRetry}
    />
  );
}
