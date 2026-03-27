import React from 'react'
import { motion } from 'motion/react'

// ─── Default inline illustration ─────────────────────────────────────────────

function DefaultIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="20" width="56" height="44" rx="8" fill="currentColor" opacity="0.06" />
      <rect x="12" y="20" width="56" height="44" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <rect x="22" y="32" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.25" />
      <rect x="22" y="40" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.18" />
      <rect x="22" y="48" width="28" height="3" rx="1.5" fill="currentColor" opacity="0.14" />
      <circle cx="57" cy="23" r="10" fill="#0066FF" opacity="0.12" />
      <circle cx="57" cy="23" r="10" stroke="#0066FF" strokeWidth="1.5" opacity="0.35" />
      <path d="M53 23h8M57 19v8" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'py-20'}`}
    >
      <div className="mb-5 text-[#9AA0AD] dark:text-[#4A4D5E]">
        {icon ?? <DefaultIllustration />}
      </div>
      <h3
        className="text-[17px] text-[#0A0A0F] dark:text-[#F0F0F5] mb-2"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-[14px] text-[#9AA0AD] dark:text-[#4A4D5E] max-w-sm mb-6"
          style={{ fontFamily: 'var(--font-body)', lineHeight: 1.65 }}
        >
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  )
}
