import React, { useEffect, useState } from 'react'
import { Bug, Lightbulb, ChatTeardropText, Trash, CheckCircle, Eye, ArrowsClockwise } from 'phosphor-react'
import { adminFeedbackApi } from '../../../lib/api'
import { toast } from 'sonner'
import { relativeTime } from '../../../lib/utils'

type FeedbackStatus = 'new' | 'read' | 'resolved'
type FeedbackType = 'bug' | 'suggestion' | 'other'

interface FeedbackItem {
  id: string
  type: FeedbackType
  subject: string
  message: string
  status: FeedbackStatus
  admin_note: string | null
  created_at: string
  submitter: { id: string; display_name: string | null; full_name: string | null; email: string; role: string } | null
}

const TYPE_META: Record<FeedbackType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  bug:        { label: 'Bug Report',  icon: <Bug size={13} weight="bold" />,              color: '#EF4444', bg: 'bg-red-50 dark:bg-red-900/10' },
  suggestion: { label: 'Suggestion',  icon: <Lightbulb size={13} weight="bold" />,        color: '#F59E0B', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
  other:      { label: 'Other',       icon: <ChatTeardropText size={13} weight="bold" />, color: '#6B7280', bg: 'bg-[#F3F4F6] dark:bg-[#18181D]' },
}

const STATUS_META: Record<FeedbackStatus, { label: string; color: string }> = {
  new:      { label: 'New',      color: 'text-[#0066FF] bg-[#0066FF]/10 border-[#0066FF]/20' },
  read:     { label: 'Read',     color: 'text-[#F59E0B] bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' },
  resolved: { label: 'Resolved', color: 'text-[#16A34A] bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
}

function FeedbackCard({ item, onUpdate, onDelete }: { item: FeedbackItem; onUpdate: (id: string, data: Partial<FeedbackItem>) => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState(item.admin_note ?? '')
  const [savingNote, setSavingNote] = useState(false)

  const typeMeta = TYPE_META[item.type]
  const statusMeta = STATUS_META[item.status]
  const submitterName = item.submitter?.display_name ?? item.submitter?.full_name ?? 'Anonymous'

  async function handleStatusChange(status: FeedbackStatus) {
    const res = await adminFeedbackApi.update(item.id, { status })
    if (res.success) onUpdate(item.id, { status })
    else toast.error('Failed to update status.')
  }

  async function handleSaveNote() {
    setSavingNote(true)
    const res = await adminFeedbackApi.update(item.id, { admin_note: note })
    setSavingNote(false)
    if (res.success) { onUpdate(item.id, { admin_note: note }); toast.success('Note saved.') }
    else toast.error('Failed to save note.')
  }

  async function handleDelete() {
    if (!confirm('Delete this feedback entry?')) return
    const res = await adminFeedbackApi.delete(item.id)
    if (res.success) onDelete(item.id)
    else toast.error('Failed to delete.')
  }

  // Mark as read when expanded
  useEffect(() => {
    if (expanded && item.status === 'new') {
      void adminFeedbackApi.update(item.id, { status: 'read' }).then((r) => {
        if (r.success) onUpdate(item.id, { status: 'read' })
      })
    }
  }, [expanded])

  return (
    <div className={`rounded-2xl border bg-white dark:bg-[#111115] overflow-hidden transition-all ${item.status === 'new' ? 'border-[#0066FF]/30' : 'border-[#E4E7EC] dark:border-[#222229]'}`}>
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-[#F8F9FB] dark:hover:bg-[#18181D] transition-colors"
      >
        {/* Type icon */}
        <span className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${typeMeta.bg}`} style={{ color: typeMeta.color }}>
          {typeMeta.icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[14px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {item.subject}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMeta.color}`} style={{ fontFamily: 'var(--font-body)' }}>
              {statusMeta.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]" style={{ fontFamily: 'var(--font-body)' }}>
            <span style={{ color: typeMeta.color }} className="font-medium">{typeMeta.label}</span>
            <span>·</span>
            <span>{submitterName}</span>
            {item.submitter && <span className="text-[#C4C9D4]">({item.submitter.email})</span>}
            <span>·</span>
            <span>{relativeTime(item.created_at)}</span>
          </div>
        </div>

        <span className="text-[#9CA3AF] text-[11px] flex-shrink-0 mt-1">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#E4E7EC] dark:border-[#222229] pt-4 space-y-4">
          {/* Message */}
          <div>
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>Message</p>
            <p className="text-[13px] text-[#0A0A0F] dark:text-[#E0E0E5] leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-body)' }}>
              {item.message}
            </p>
          </div>

          {/* Status actions */}
          <div>
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>Status</p>
            <div className="flex gap-2">
              {(['new', 'read', 'resolved'] as FeedbackStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => void handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${item.status === s ? STATUS_META[s].color : 'border-[#E4E7EC] dark:border-[#222229] text-[#5C6070] dark:text-[#8B8FA8] hover:border-[#0066FF]/40'}`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin note */}
          <div>
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>Internal Note</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note (not visible to users)…"
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#18181D] text-[13px] text-[#0A0A0F] dark:text-[#F0F0F5] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 transition-all resize-none"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <button
              onClick={() => void handleSaveNote()}
              disabled={savingNote || note === (item.admin_note ?? '')}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#0066FF] text-white text-[12px] font-medium hover:bg-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {savingNote ? 'Saving…' : 'Save note'}
            </button>
          </div>

          {/* Delete */}
          <div className="pt-1 border-t border-[#E4E7EC] dark:border-[#222229] flex justify-end">
            <button
              onClick={() => void handleDelete()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <Trash size={13} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | FeedbackStatus>('all')

  async function load() {
    setLoading(true)
    const res = await adminFeedbackApi.list(filter === 'all' ? undefined : filter)
    if (res.success) setItems(res.data)
    else toast.error('Failed to load feedback.')
    setLoading(false)
  }

  useEffect(() => { void load() }, [filter])

  function handleUpdate(id: string, data: Partial<FeedbackItem>) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...data } : item))
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    toast.success('Feedback deleted.')
  }

  const newCount = items.filter((i) => i.status === 'new').length

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#0A0A0F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Feedback & Reports
          </h1>
          <p className="text-[13px] text-[#9CA3AF] mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            Bug reports and suggestions from users
            {newCount > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#0066FF] text-white text-[11px] font-semibold">{newCount} new</span>}
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="p-2 rounded-xl border border-[#E4E7EC] dark:border-[#222229] text-[#9CA3AF] hover:text-[#0066FF] hover:border-[#0066FF]/40 transition-colors"
        >
          <ArrowsClockwise size={16} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'new', 'read', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all capitalize ${
              filter === f
                ? 'border-[#0066FF] bg-[#0066FF]/8 text-[#0066FF]'
                : 'border-[#E4E7EC] dark:border-[#222229] text-[#5C6070] dark:text-[#8B8FA8] hover:border-[#0066FF]/40'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {f === 'all' ? 'All' : STATUS_META[f].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#F3F4F6] dark:bg-[#18181D] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115]">
          <CheckCircle size={36} weight="thin" className="text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-[#9CA3AF]" style={{ fontFamily: 'var(--font-display)' }}>No feedback here</p>
          <p className="text-[13px] text-[#C4C9D4] mt-1" style={{ fontFamily: 'var(--font-body)' }}>Nothing to show for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FeedbackCard key={item.id} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
