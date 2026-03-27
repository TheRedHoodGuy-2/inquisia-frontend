import React, { useEffect, useState } from 'react'
import { Plus, Trash, PencilSimple, X, Check } from 'phosphor-react'
import { adminApi } from '../../../lib/api'
import type { Announcement, AnnouncementType, AnnouncementPlacement } from '../../../lib/types'
import { toast } from 'sonner'

const TYPE_OPTIONS: { value: AnnouncementType; label: string; color: string }[] = [
  { value: 'info', label: 'Info', color: '#0066FF' },
  { value: 'warning', label: 'Warning', color: '#D97706' },
  { value: 'success', label: 'Success', color: '#16A34A' },
  { value: 'promo', label: 'Promo', color: '#EA580C' },
]

const PLACEMENT_OPTIONS: { value: AnnouncementPlacement; label: string }[] = [
  { value: 'home', label: 'Home Page' },
  { value: 'upload_1', label: 'Upload Step 1' },
  { value: 'upload_2', label: 'Upload Step 2' },
  { value: 'upload_3', label: 'Upload Step 3' },
  { value: 'upload_4', label: 'Upload Step 4' },
  { value: 'upload_5', label: 'Upload Step 5' },
  { value: 'notifications', label: 'Notifications Page' },
]

const EMPTY_FORM = {
  title: '',
  body: '',
  type: 'info' as AnnouncementType,
  placements: [] as AnnouncementPlacement[],
  expires_at: '',
}

type FormState = typeof EMPTY_FORM

export function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    adminApi.announcements().then((res) => {
      if (res.success) setAnnouncements(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (a: Announcement) => {
    setEditId(a.id)
    setForm({
      title: a.title,
      body: a.body,
      type: a.type,
      placements: [...a.placements],
      expires_at: a.expires_at ? a.expires_at.slice(0, 16) : '',
    })
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditId(null) }

  const togglePlacement = (p: AnnouncementPlacement) => {
    setForm((prev) => ({
      ...prev,
      placements: prev.placements.includes(p)
        ? prev.placements.filter((x) => x !== p)
        : [...prev.placements, p],
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim() || form.placements.length === 0) {
      toast.error('Title, body, and at least one placement are required.')
      return
    }
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      type: form.type,
      placements: form.placements,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    }
    const res = editId
      ? await adminApi.updateAnnouncement(editId, payload)
      : await adminApi.createAnnouncement(payload)
    if (res.success) {
      toast.success(editId ? 'Announcement updated.' : 'Announcement created.')
      closeForm()
      load()
    } else {
      toast.error((res as any).error ?? 'Failed to save announcement.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    setDeleting(id)
    const res = await adminApi.deleteAnnouncement(id)
    if (res.success) {
      toast.success('Announcement deleted.')
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } else {
      toast.error((res as any).error ?? 'Failed to delete.')
    }
    setDeleting(null)
  }

  const handleToggleActive = async (a: Announcement) => {
    const res = await adminApi.updateAnnouncement(a.id, { is_active: !a.is_active })
    if (res.success) {
      setAnnouncements((prev) => prev.map((x) => x.id === a.id ? { ...x, is_active: !x.is_active } : x))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0A0A0F] dark:text-[#F5F5F5] mb-1"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', letterSpacing: '-0.02em' }}>
            Announcements
          </h1>
          <p className="text-[14px] text-[#9CA3AF]" style={{ fontFamily: 'var(--font-body)' }}>
            {announcements.length} total
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0066FF] text-white text-[13px] font-medium hover:bg-[#0052CC] transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <Plus size={15} />
          New Announcement
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#111115] rounded-2xl border border-[#E4E7EC] dark:border-[#222229] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC] dark:border-[#222229]">
              <h2 className="text-[15px] font-semibold text-[#0A0A0F] dark:text-[#F5F5F5]"
                style={{ fontFamily: 'var(--font-display)' }}>
                {editId ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button onClick={closeForm} className="p-1 rounded-full hover:bg-[#F2F4F7] dark:hover:bg-[#222229] transition-colors">
                <X size={16} className="text-[#9CA3AF]" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[12px] font-medium text-[#5C6070] dark:text-[#8B8FA8] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. System maintenance tonight"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#18181D] text-[14px] text-[#0A0A0F] dark:text-[#F5F5F5] outline-none focus:border-[#0066FF] transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
              {/* Body */}
              <div>
                <label className="block text-[12px] font-medium text-[#5C6070] dark:text-[#8B8FA8] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Message</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  placeholder="Brief message shown to users..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#18181D] text-[14px] text-[#0A0A0F] dark:text-[#F5F5F5] outline-none focus:border-[#0066FF] transition-colors resize-none"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
              {/* Type */}
              <div>
                <label className="block text-[12px] font-medium text-[#5C6070] dark:text-[#8B8FA8] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors`}
                      style={{
                        fontFamily: 'var(--font-body)',
                        borderColor: form.type === t.value ? t.color : '#E4E7EC',
                        color: form.type === t.value ? t.color : '#9CA3AF',
                        backgroundColor: form.type === t.value ? `${t.color}18` : 'transparent',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Placements */}
              <div>
                <label className="block text-[12px] font-medium text-[#5C6070] dark:text-[#8B8FA8] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Show on</label>
                <div className="flex flex-wrap gap-2">
                  {PLACEMENT_OPTIONS.map((pl) => {
                    const active = form.placements.includes(pl.value)
                    return (
                      <button
                        key={pl.value}
                        onClick={() => togglePlacement(pl.value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors`}
                        style={{
                          fontFamily: 'var(--font-body)',
                          borderColor: active ? '#0066FF' : '#E4E7EC',
                          color: active ? '#0066FF' : '#9CA3AF',
                          backgroundColor: active ? '#0066FF18' : 'transparent',
                        }}
                      >
                        {active && <Check size={11} weight="bold" />}
                        {pl.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Expires */}
              <div>
                <label className="block text-[12px] font-medium text-[#5C6070] dark:text-[#8B8FA8] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Expires (optional)</label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#18181D] text-[14px] text-[#0A0A0F] dark:text-[#F5F5F5] outline-none focus:border-[#0066FF] transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E4E7EC] dark:border-[#222229]">
              <button onClick={closeForm} className="px-4 py-2 rounded-full text-[13px] text-[#5C6070] hover:text-[#0A0A0F] dark:hover:text-[#F5F5F5] transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}>Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-full bg-[#0066FF] text-white text-[13px] font-medium hover:bg-[#0052CC] transition-colors disabled:opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl bg-white dark:bg-[#111115] border border-[#E4E7EC] dark:border-[#222229] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div className="py-16 text-center"><div className="w-6 h-6 rounded-full border-2 border-[#E4E7EC] border-t-[#0066FF] animate-spin mx-auto" /></div>
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center"><p className="text-[14px] text-[#9CA3AF]">No announcements yet.</p></div>
        ) : (
          announcements.map((a, i) => {
            const typeOption = TYPE_OPTIONS.find((t) => t.value === a.type) ?? TYPE_OPTIONS[0]
            return (
              <div key={a.id}
                className={`flex flex-col sm:flex-row sm:items-start gap-3 px-5 py-4 hover:bg-[#0066FF08] transition-colors group ${i > 0 ? 'border-t border-[#E4E7EC] dark:border-[#222229]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[13px] font-semibold text-[#0A0A0F] dark:text-[#F5F5F5]"
                      style={{ fontFamily: 'var(--font-display)' }}>{a.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ backgroundColor: `${typeOption.color}18`, color: typeOption.color, fontFamily: 'var(--font-body)' }}>
                      {typeOption.label}
                    </span>
                    {!a.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F2F4F7] dark:bg-[#222229] text-[#9CA3AF]"
                        style={{ fontFamily: 'var(--font-body)' }}>Inactive</span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#9CA3AF] mb-1.5 line-clamp-1" style={{ fontFamily: 'var(--font-body)' }}>{a.body}</p>
                  <div className="flex flex-wrap gap-1">
                    {a.placements.map((pl) => (
                      <span key={pl} className="px-2 py-0.5 rounded-full text-[10px] bg-[#F0F2F5] dark:bg-[#1A1A1F] text-[#5C6070] dark:text-[#8B8FA8]"
                        style={{ fontFamily: 'var(--font-body)' }}>
                        {PLACEMENT_OPTIONS.find((p) => p.value === pl)?.label ?? pl}
                      </span>
                    ))}
                    {a.expires_at && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FFF7ED] text-[#D97706]"
                        style={{ fontFamily: 'var(--font-body)' }}>
                        Expires {new Date(a.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleActive(a)}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${a.is_active ? 'border-[#9CA3AF] text-[#9CA3AF] hover:border-[#DC2626] hover:text-[#DC2626]' : 'border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A18]'}`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {a.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => openEdit(a)}
                    className="p-1.5 rounded-full hover:bg-[#0066FF18] text-[#9CA3AF] hover:text-[#0066FF] transition-colors">
                    <PencilSimple size={14} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id}
                    className="p-1.5 rounded-full hover:bg-[#DC262618] text-[#9CA3AF] hover:text-[#DC2626] transition-colors">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
