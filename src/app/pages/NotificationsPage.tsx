import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Bell,
  CheckCircle,
  WarningCircle,
  XCircle,
  ChatCircle,
  Trash,
} from 'phosphor-react'
import { notificationsApi } from '../../lib/api'
import { relativeTime } from '../../lib/utils'
import { EmptyState } from '../components/EmptyState'
import type { Notification } from '../../lib/types'
import { AnnouncementBanner } from '../components/AnnouncementBanner'

// ─── Type → label map ─────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  // Actual API types
  project_approved: 'Project Approved',
  changes_requested: 'Changes Requested',
  project_rejected: 'Project Rejected',
  new_comment: 'New Comment',
  change_request_approved: 'Change Request Approved',
  change_request_denied: 'Change Request Denied',
  teammate_added: 'Teammate Added',
  // Extended / future types
  project_status_change: 'Project Status Updated',
  revision_requested: 'Revision Requested',
  comment_posted: 'New Comment',
  change_request_submitted: 'Change Request Submitted',
  change_request_resolved: 'Change Request Resolved',
  new_submission: 'New Submission',
  system: 'System Notice',
}

// ─── Icon by type ─────────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  const iconProps = { size: 20, weight: 'fill' as const }
  if (type === 'project_approved' || type === 'change_request_approved' || type === 'change_request_resolved') {
    return <CheckCircle {...iconProps} className="text-green-500" />
  }
  if (type === 'changes_requested' || type === 'change_request_submitted' || type === 'revision_requested') {
    return <WarningCircle {...iconProps} className="text-amber-500" />
  }
  if (type === 'project_rejected' || type === 'change_request_denied') {
    return <XCircle {...iconProps} className="text-red-500" />
  }
  if (type === 'new_comment' || type === 'comment_posted') {
    return <ChatCircle {...iconProps} className="text-[#0066FF]" />
  }
  return <Bell {...iconProps} className="text-[#9AA0AD]" />
}

// ─── Date grouping ────────────────────────────────────────────────────────────

function getGroup(dateString: string): 'Today' | 'Yesterday' | 'This Week' | 'Earlier' {
  const now = new Date()
  const date = new Date(dateString)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000)

  if (date >= todayStart) return 'Today'
  if (date >= yesterdayStart) return 'Yesterday'
  if (date >= weekStart) return 'This Week'
  return 'Earlier'
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'Earlier'] as const
type Group = typeof GROUP_ORDER[number]

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-[#E4E7EC] dark:border-[#222229]">
      <div className="skeleton-shimmer rounded-full bg-[#F2F4F7] dark:bg-[#18181D] w-10 h-10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-shimmer rounded-full bg-[#F2F4F7] dark:bg-[#18181D] h-4 w-48" />
        <div className="skeleton-shimmer rounded-full bg-[#F2F4F7] dark:bg-[#18181D] h-3 w-full" />
        <div className="skeleton-shimmer rounded-full bg-[#F2F4F7] dark:bg-[#18181D] h-3 w-24" />
      </div>
    </div>
  )
}

// ─── Single notification card ─────────────────────────────────────────────────

interface NotifCardProps {
  notif: Notification
  onDelete: (id: string) => void
  onMarkRead: (id: string) => void
}

function NotifCard({ notif, onDelete, onMarkRead }: NotifCardProps) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  function handleClick() {
    if (!notif.is_read) onMarkRead(notif.id)
    navigate('/dashboard')
  }

  return (
    <div
      className={`relative flex items-start gap-0 border-b border-[#E4E7EC] dark:border-[#222229] cursor-pointer transition-colors group ${
        !notif.is_read ? 'bg-[#0066FF08]' : 'hover:bg-[#F2F4F7] dark:hover:bg-[#18181D]'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Unread bar */}
      <div
        className={`w-[3px] self-stretch flex-shrink-0 rounded-r-full transition-colors ${
          !notif.is_read ? 'bg-[#0066FF]' : 'bg-transparent'
        }`}
      />

      <div className="flex items-start gap-3 flex-1 px-4 py-4">
        {/* Icon */}
        <div className="mt-0.5 w-9 h-9 rounded-full bg-[#F2F4F7] dark:bg-[#18181D] flex items-center justify-center flex-shrink-0">
          <NotifIcon type={notif.type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5] mb-0.5"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {TYPE_LABELS[notif.type] ?? 'Notification'}
          </p>
          <p
            className="text-[13px] text-[#5C6070] dark:text-[#8B8FA8] leading-relaxed line-clamp-2"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {notif.message}
          </p>
          <p
            className="text-[12px] text-[#9AA0AD] dark:text-[#4A4D5E] mt-1"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {relativeTime(notif.created_at)}
          </p>
        </div>

        {/* Trash button — always visible on touch, hover-only on pointer devices */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notif.id)
          }}
          className={`flex-shrink-0 p-1.5 rounded-lg text-[#9AA0AD] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 ${hovered ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'}`}
          aria-label="Delete notification"
        >
          <Trash size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── NotificationsPage ────────────────────────────────────────────────────────

type TabType = 'all' | 'unread' | 'read'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    notificationsApi.list().then((res) => {
      if (res.success && res.data) {
        setNotifications(res.data)
      }
      setLoading(false)
    })
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const readCount = notifications.filter((n) => n.is_read).length

  const filtered =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : activeTab === 'read'
      ? notifications.filter((n) => n.is_read)
      : notifications

  // Group filtered notifications
  const grouped = GROUP_ORDER.reduce<Record<Group, Notification[]>>(
    (acc, g) => ({ ...acc, [g]: [] }),
    {} as Record<Group, Notification[]>,
  )
  for (const n of filtered) {
    grouped[getGroup(n.created_at)].push(n)
  }

  async function handleMarkAllRead() {
    await notificationsApi.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  async function handleClearAll() {
    await notificationsApi.deleteAll()
    setNotifications([])
    setShowClearConfirm(false)
  }

  async function handleDeleteOne(id: string) {
    // Optimistic
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await (notificationsApi as typeof notificationsApi & { deleteOne: (id: string) => Promise<unknown> }).deleteOne(id)
  }

  function handleMarkOneRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read', label: 'Read', count: readCount },
  ]

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:px-12 md:py-12">
      <AnnouncementBanner placement="notifications" className="mb-5" />
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1
            className="text-[22px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Notifications
          </h1>
          {notifications.length > 0 && (
            <span
              className="px-2 py-0.5 rounded-full bg-[#0066FF1A] text-[#0066FF] text-[12px] font-medium"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {notifications.length}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-2 rounded-xl border border-[#E4E7EC] dark:border-[#222229] text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] text-[13px] font-medium transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <>
              {showClearConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#5C6070] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-body)' }}>
                    Clear all?
                  </span>
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 text-[13px] font-medium transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-2 rounded-xl border border-[#E4E7EC] dark:border-[#222229] text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] text-[13px] font-medium transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-2 rounded-xl border border-[#E4E7EC] dark:border-[#222229] text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] text-[13px] font-medium transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Clear all
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-[#E4E7EC] dark:border-[#222229]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[14px] font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-[#0066FF] text-[#0066FF]'
                : 'border-transparent text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5]'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {tab.label}
            <span
              className={`text-[12px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-[#0066FF1A] text-[#0066FF]'
                  : 'bg-[#F2F4F7] dark:bg-[#18181D] text-[#9AA0AD] dark:text-[#4A4D5E]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] overflow-hidden">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              activeTab === 'unread'
                ? 'No unread notifications'
                : activeTab === 'read'
                ? 'No read notifications'
                : 'No notifications yet'
            }
            description={
              activeTab === 'unread'
                ? "You're all caught up."
                : "Notifications about your projects and activity will appear here."
            }
            compact
          />
        ) : (
          GROUP_ORDER.map((group) => {
            const items = grouped[group]
            if (items.length === 0) return null
            return (
              <div key={group}>
                {/* Group header */}
                <div className="px-5 py-2.5 bg-[#F8F9FB] dark:bg-[#0E0E12] border-b border-[#E4E7EC] dark:border-[#222229]">
                  <span
                    className="text-[12px] font-semibold text-[#9AA0AD] dark:text-[#4A4D5E] uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {group}
                  </span>
                </div>
                {items.map((n) => (
                  <NotifCard
                    key={n.id}
                    notif={n}
                    onDelete={handleDeleteOne}
                    onMarkRead={handleMarkOneRead}
                  />
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
