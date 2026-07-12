import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  disabled?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  disabled
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20"
    >
      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        {description}
      </p>

      <div className="flex items-center gap-4">
        {actionLabel && (
          <Button onClick={onAction} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && (
          <Button variant="outline" onClick={onSecondaryAction} disabled={disabled}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
