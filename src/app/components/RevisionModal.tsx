/**
 * RevisionModal
 * Used by students to submit a revision (for changes_requested)
 * or resubmit a rejected project.
 * Builds a FormData payload and calls the appropriate API endpoint.
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, FilePdf, UploadSimple, Check, WarningCircle } from 'phosphor-react'
import { toast } from 'sonner'
import { projectsApi } from '../../lib/api'
import type { Project } from '../../lib/types'

interface RevisionModalProps {
  project: Project
  mode: 'revision' | 'resubmit'
  onClose: () => void
  onSuccess: (updated: Project) => void
}

function DropZone({ file, onFile }: { file: File | null; onFile: (f: File | null) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  if (file) {
    return (
      <div className="rounded-2xl border border-[#0066FF] bg-[#0066FF08] p-4 flex items-center gap-3">
        <FilePdf size={24} className="text-[#0066FF] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#0A0A0F] dark:text-[#F5F5F5] truncate" style={{ fontFamily: 'var(--font-body)' }}>{file.name}</p>
          <p className="text-[11px] text-[#6B7280]" style={{ fontFamily: 'var(--font-body)' }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
        <button onClick={() => onFile(null)} className="p-1.5 rounded-full hover:bg-[#F2F4F7] dark:hover:bg-[#18181D]">
          <X size={13} className="text-[#6B7280]" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-150 ${dragging ? 'border-[#0066FF] bg-[#0066FF08]' : 'border-[#C9D0DA] dark:border-[#222229] hover:border-[#0066FF] hover:bg-[#0066FF08]'
        }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <UploadSimple size={28} className={`mx-auto mb-2 ${dragging ? 'text-[#0066FF]' : 'text-[#6B7280]'}`} />
      <p className="text-[13px] text-[#374151] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-body)' }}>
        Drop your updated PDF here or click to browse
      </p>
      <p className="text-[11px] text-[#6B7280] mt-1" style={{ fontFamily: 'var(--font-body)' }}>PDF only, max 50MB</p>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
    </div>
  )
}

export function RevisionModal({ project, mode, onClose, onSuccess }: RevisionModalProps) {
  const isRevision = mode === 'revision'

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Resubmit-only fields
  const [editTitle, setEditTitle] = useState(project.title)
  const [editAbstract, setEditAbstract] = useState(project.abstract ?? '')
  const currentCoAuthors = (project.authors ?? []).filter((a) => a.id !== project.authors?.[0]?.id)
  const [coAuthorMatrics, setCoAuthorMatrics] = useState<string[]>(
    currentCoAuthors.map((a) => a.matric_no).filter(Boolean) as string[]
  )
  const [matricInput, setMatricInput] = useState('')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const modalTitle = isRevision ? 'Submit Revision' : 'Resubmit Project'

  const addCoAuthor = () => {
    const m = matricInput.trim()
    if (m && !coAuthorMatrics.includes(m)) {
      setCoAuthorMatrics((prev) => [...prev, m])
    }
    setMatricInput('')
  }

  const handleSubmit = async () => {
    if (!pdfFile) {
      toast.error('Please upload your updated PDF before submitting.')
      return
    }
    if (!isRevision && !editTitle.trim()) {
      toast.error('Title is required.')
      return
    }
    if (!isRevision && editAbstract.trim().length < 50) {
      toast.error('Abstract must be at least 50 characters.')
      return
    }
    setSubmitting(true)

    const res = isRevision
      ? await projectsApi.submitRevision(project.id, pdfFile, notes.trim())
      : await projectsApi.resubmit(project.id, pdfFile, {
          notes: notes.trim() || undefined,
          title: editTitle.trim(),
          abstract: editAbstract.trim(),
          co_authors: coAuthorMatrics,
        })

    if (res.success) {
      setDone(true)
      toast.success(isRevision ? 'Revision submitted!' : 'Project resubmitted!')
      onSuccess(res.data)
    } else {
      toast.error(res.error ?? 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  const inputClass = "w-full rounded-2xl border border-[#C9D0DA] dark:border-[#222229] bg-white dark:bg-[#181818] px-4 py-3 text-[13px] text-[#0A0A0F] dark:text-[#F5F5F5] placeholder-[#6B7280] outline-none focus:border-[#0066FF] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.12)] transition-all"
  const labelClass = "text-[11px] text-[#374151] dark:text-[#8B8FA8] uppercase tracking-wider mb-1.5 block font-semibold"

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className={`fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto bg-white dark:bg-[#111115] z-50 rounded-2xl border border-[#C9D0DA] dark:border-[#222229] shadow-2xl overflow-hidden ${isRevision ? 'max-w-[500px]' : 'max-w-[600px]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9D0DA] dark:border-[#222229]">
          <div>
            <h2 className="text-[16px] text-[#0A0A0F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {modalTitle}
            </h2>
            {!isRevision && (
              <p className="text-[12px] text-[#6B7280] mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                Update your project details and upload a new PDF.
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] text-[#6B7280]">
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EBF2FF] flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-[#0066FF]" weight="bold" />
            </div>
            <h3 className="text-[16px] text-[#0A0A0F] dark:text-[#F5F5F5] mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {isRevision ? 'Revision Submitted' : 'Project Resubmitted'}
            </h3>
            <p className="text-[13px] text-[#6B7280] mb-6" style={{ fontFamily: 'var(--font-body)', lineHeight: 1.65 }}>
              {isRevision
                ? 'Your supervisor has been notified and will review your changes.'
                : 'Your project is back in the review queue. AI has re-analysed it and your supervisor will be notified.'}
            </p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-full text-[13px] text-white bg-[#0066FF] hover:bg-[#0052CC] transition-colors" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 space-y-5 max-h-[68vh] overflow-y-auto">

              {/* Supervisor feedback banner (resubmit only) */}
              {!isRevision && project.supervisor_feedback && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-body)' }}>Supervisor Feedback</p>
                  <p className="text-[12px] text-amber-800 dark:text-amber-300 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{project.supervisor_feedback}</p>
                </div>
              )}

              {/* Revision: simple project context */}
              {isRevision && (
                <div className="p-3 rounded-2xl bg-[#F4F6F9] dark:bg-[#181818] border border-[#C9D0DA] dark:border-[#222229]">
                  <p className="text-[11px] text-[#6B7280] mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>Project</p>
                  <p className="text-[13px] text-[#0A0A0F] dark:text-[#F5F5F5] line-clamp-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{project.title}</p>
                </div>
              )}

              {/* Resubmit: editable title */}
              {!isRevision && (
                <div>
                  <label className={labelClass}>Title <span className="text-red-500">*</span></label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Project title"
                    className={inputClass}
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>
              )}

              {/* Resubmit: editable abstract */}
              {!isRevision && (
                <div>
                  <label className={labelClass}>Abstract <span className="text-red-500">*</span></label>
                  <textarea
                    value={editAbstract}
                    onChange={(e) => setEditAbstract(e.target.value)}
                    rows={5}
                    placeholder="Describe your project (minimum 50 characters)..."
                    className={`${inputClass} resize-none`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                  <p className={`text-[11px] mt-1 ${editAbstract.length < 50 ? 'text-red-400' : 'text-[#9CA3AF]'}`} style={{ fontFamily: 'var(--font-body)' }}>
                    {editAbstract.length} / 50 min
                  </p>
                </div>
              )}

              {/* Resubmit: co-authors */}
              {!isRevision && (
                <div>
                  <label className={labelClass}>Co-Authors (matric numbers)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={matricInput}
                      onChange={(e) => setMatricInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCoAuthor() } }}
                      placeholder="e.g. 20/0123"
                      className={`${inputClass} flex-1`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                    <button
                      onClick={addCoAuthor}
                      type="button"
                      className="px-4 py-2.5 rounded-2xl text-[13px] bg-[#F4F6F9] dark:bg-[#181818] border border-[#C9D0DA] dark:border-[#222229] text-[#374151] dark:text-[#8B8FA8] hover:border-[#0066FF] hover:text-[#0066FF] transition-colors"
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                    >
                      Add
                    </button>
                  </div>
                  {coAuthorMatrics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {coAuthorMatrics.map((m) => (
                        <span key={m} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] bg-[#F4F6F9] dark:bg-[#181818] border border-[#C9D0DA] dark:border-[#222229] text-[#374151] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-mono)' }}>
                          {m}
                          <button onClick={() => setCoAuthorMatrics((prev) => prev.filter((x) => x !== m))} className="text-[#9CA3AF] hover:text-red-500 transition-colors">
                            <X size={11} weight="bold" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PDF upload */}
              <div>
                <label className={labelClass}>
                  {isRevision ? 'Updated PDF' : 'New PDF'} <span className="text-red-500">*</span>
                </label>
                <DropZone file={pdfFile} onFile={setPdfFile} />
              </div>

              {/* Notes / what changed */}
              <div>
                <label className={labelClass}>
                  {isRevision ? 'What did you change?' : 'Notes (optional)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={isRevision
                    ? 'Briefly describe what you revised and how you addressed the feedback...'
                    : 'Any additional context for your supervisor...'}
                  className={`${inputClass} resize-none`}
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#C9D0DA] dark:border-[#222229] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full text-[13px] border border-[#C9D0DA] dark:border-[#222229] text-[#374151] hover:border-[#0066FF] hover:text-[#0066FF] transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting || !pdfFile}
                className="flex-1 py-2.5 rounded-full text-[13px] text-white bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                {submitting
                  ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Submitting...</>
                  : modalTitle}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
