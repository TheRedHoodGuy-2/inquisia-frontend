import React from 'react'
import type { ProjectStatus } from '../../lib/types'

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  pending: {
    label: 'Pending Review',
    classes: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  },
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  published: {
    label: 'Published',
    classes: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  changes_requested: {
    label: 'Changes Requested',
    classes: 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  },
  under_review: {
    label: 'Under Review',
    classes: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400',
  },
}

interface StatusBadgeProps {
  status: ProjectStatus | string
  small?: boolean
  className?: string
}

export function StatusBadge({ status, small = false, className = '' }: StatusBadgeProps) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium tracking-[0.01em] ${
        small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[12px]'
      } ${s.classes} ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {s.label}
    </span>
  )
}
