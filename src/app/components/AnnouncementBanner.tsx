import React, { useEffect, useState } from 'react'
import { X, Info, Warning, CheckCircle, Megaphone } from 'phosphor-react'
import { motion, AnimatePresence } from 'motion/react'
import { announcementsApi } from '../../lib/api'
import type { Announcement, AnnouncementPlacement, AnnouncementType } from '../../lib/types'
import ShinyText from './ui/ShinyText'

// ─── Style map ────────────────────────────────────────────────────────────────

const SHINE: Record<AnnouncementType, { color: string; shineColor: string }> = {
  info:    { color: '#003399',  shineColor: '#93C5FD' },
  warning: { color: '#92400E',  shineColor: '#FDE68A' },
  success: { color: '#14532D',  shineColor: '#86EFAC' },
  promo:   { color: '#7C2D12',  shineColor: '#FED7AA' },
}

const SHINE_DARK: Record<AnnouncementType, { color: string; shineColor: string }> = {
  info:    { color: '#60A5FA',  shineColor: '#FFFFFF' },
  warning: { color: '#FCD34D',  shineColor: '#FFFFFF' },
  success: { color: '#86EFAC',  shineColor: '#FFFFFF' },
  promo:   { color: '#FCA5A5',  shineColor: '#FFFFFF' },
}

const STYLES: Record<AnnouncementType, {
  bg: string; border: string; text: string; subtext: string; iconColor: string
}> = {
  info: {
    bg: 'bg-[#EBF2FF] dark:bg-[#0A1A3A]',
    border: 'border-[#BDD3FF] dark:border-[#1A3366]',
    text: 'text-[#003399] dark:text-[#93C5FD]',
    subtext: 'text-[#1A5276] dark:text-[#60A5FA]',
    iconColor: 'text-[#0066FF]',
  },
  warning: {
    bg: 'bg-[#FFFBEB] dark:bg-[#2D1B00]',
    border: 'border-[#FDE68A] dark:border-[#713F12]',
    text: 'text-[#92400E] dark:text-[#FCD34D]',
    subtext: 'text-[#B45309] dark:text-[#F59E0B]',
    iconColor: 'text-[#D97706]',
  },
  success: {
    bg: 'bg-[#F0FDF4] dark:bg-[#052E16]',
    border: 'border-[#BBF7D0] dark:border-[#14532D]',
    text: 'text-[#14532D] dark:text-[#86EFAC]',
    subtext: 'text-[#15803D] dark:text-[#4ADE80]',
    iconColor: 'text-[#16A34A]',
  },
  promo: {
    bg: 'bg-gradient-to-r from-[#FFF7ED] to-[#FFFBEB] dark:from-[#2D1500] dark:to-[#2D1B00]',
    border: 'border-[#FED7AA] dark:border-[#7C2D12]',
    text: 'text-[#7C2D12] dark:text-[#FCA5A5]',
    subtext: 'text-[#9A3412] dark:text-[#F97316]',
    iconColor: 'text-[#EA580C]',
  },
}

const ICONS: Record<AnnouncementType, React.ReactNode> = {
  info: <Info size={18} weight="fill" />,
  warning: <Warning size={18} weight="fill" />,
  success: <CheckCircle size={18} weight="fill" />,
  promo: <Megaphone size={18} weight="fill" />,
}

// ─── Single banner ────────────────────────────────────────────────────────────

function SingleBanner({ announcement, onDismiss }: { announcement: Announcement; onDismiss: () => void }) {
  const s = STYLES[announcement.type]
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const shine = isDark ? SHINE_DARK[announcement.type] : SHINE[announcement.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`overflow-hidden rounded-xl border ${s.bg} ${s.border} px-4 py-3 flex items-start gap-3`}
    >
      <span className={`flex-shrink-0 mt-0.5 ${s.iconColor}`}>
        {ICONS[announcement.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold leading-snug`} style={{ fontFamily: 'var(--font-display)' }}>
          <ShinyText
            text={announcement.title}
            color={shine.color}
            shineColor={shine.shineColor}
            speed={3}
            spread={100}
          />
        </p>
        {announcement.body && (
          <p className={`text-[12px] mt-0.5 leading-relaxed ${s.subtext}`} style={{ fontFamily: 'var(--font-body)' }}>
            {announcement.body}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className={`flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${s.text}`}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AnnouncementBannerProps {
  placement: AnnouncementPlacement
  className?: string
}

export function AnnouncementBanner({ placement, className = '' }: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    announcementsApi.forPlacement(placement).then((res) => {
      if (res.success) setAnnouncements(res.data)
    })
  }, [placement])

  const visible = announcements.filter((a) => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        {visible.map((a) => (
          <SingleBanner
            key={a.id}
            announcement={a}
            onDismiss={() => setDismissed((prev) => new Set([...prev, a.id]))}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
