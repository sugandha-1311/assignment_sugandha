import * as React from "react"
import { cn } from "../../lib/utils"

export interface StatusChipProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'APPROVED' | 'PENDING' | 'ERROR' | 'IMPORTED' | 'DRAFT' | 'REVIEW' | 'WARNING'
}

const statusConfig = {
  APPROVED: { label: "Approved", icon: "🟢", classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" },
  PENDING: { label: "Pending", icon: "🟡", classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  ERROR: { label: "Error", icon: "🔴", classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  IMPORTED: { label: "Imported", icon: "🔵", classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  DRAFT: { label: "Draft", icon: "🟣", classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  REVIEW: { label: "Review", icon: "🟠", classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  WARNING: { label: "Warning", icon: "🟡", classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
}

export function StatusChip({ status, className, ...props }: StatusChipProps) {
  const config = statusConfig[status] || statusConfig['DRAFT']
  
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm transition-colors",
        config.classes,
        className
      )}
      {...props}
    >
      <span className="mr-1.5 text-[10px] leading-none">{config.icon}</span>
      {config.label}
    </div>
  )
}
