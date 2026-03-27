import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Lightning, Brain, ChatTeardropText, Gauge, Check, ArrowLeft } from 'phosphor-react'
import { elaraSettingsApi, elaraUsageApi } from '../../lib/api'
import type { ElaraSettings, ElaraUsage } from '../../lib/types'

// ─── Model definitions ────────────────────────────────────────────────────────

const MODELS = [
  {
    id: 'gemma-3-27b-it',
    label: 'Academic Standard',
    speed: 7,
    depth: 7,
    available: true,
  },
  {
    id: 'gemini-2.0-flash',
    label: 'Quick & Conversational',
    isDefault: true,
    speed: 9,
    depth: 5,
    available: false,
    unavailableReason: 'Google services experiencing disruptions',
  },
  {
    id: 'gemini-2.0-flash-lite',
    label: 'Lightweight & Fast',
    speed: 10,
    depth: 4,
    available: false,
    unavailableReason: 'Google services experiencing disruptions',
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Deep Research',
    speed: 4,
    depth: 10,
    available: false,
    unavailableReason: 'Google services experiencing disruptions',
  },
] as const

type ModelId = (typeof MODELS)[number]['id']
type ResponseStyle = 'concise' | 'balanced' | 'verbose'

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBar({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`w-[4px] h-[8px] rounded-sm ${i < value ? 'bg-[#0066FF]' : 'bg-[#E4E7EC] dark:bg-[#222229]'}`}
        />
      ))}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group select-none">
      <span className="text-[14px] text-[#0A0A0F] dark:text-[#F0F0F5]" style={{ fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-[#0066FF]' : 'bg-[#E4E7EC] dark:bg-[#222229]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  )
}

function SectionTitle({ children, saved }: { children: React.ReactNode; saved?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2
        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}
        className="text-[#0A0A0F] dark:text-[#F0F0F5]"
      >
        {children}
      </h2>
      <span
        className={`flex items-center gap-1 text-[12px] text-[#0066FF] transition-opacity duration-300 ${
          saved ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <Check size={12} weight="bold" />
        Saved
      </span>
    </div>
  )
}

function SkeletonPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-0 md:py-12 animate-pulse">
      <div className="h-4 w-24 bg-[#E4E7EC] dark:bg-[#222229] rounded mb-8" />
      <div className="h-8 w-48 bg-[#E4E7EC] dark:bg-[#222229] rounded mb-10" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-10">
          <div className="h-4 w-32 bg-[#E4E7EC] dark:bg-[#222229] rounded mb-4" />
          <div className="rounded-xl border border-[#E4E7EC] dark:border-[#222229] p-4 space-y-3">
            <div className="h-16 bg-[#E4E7EC] dark:bg-[#222229] rounded-lg" />
            <div className="h-16 bg-[#E4E7EC] dark:bg-[#222229] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ElaraSettingsPage() {
  const [settings, setSettings] = useState<ElaraSettings | null>(null)
  const [usage, setUsage] = useState<ElaraUsage | null>(null)
  const [loading, setLoading] = useState(true)

  // Per-section saved indicators
  const [savedModel, setSavedModel] = useState(false)
  const [savedStyle, setSavedStyle] = useState(false)
  const [savedDisplay, setSavedDisplay] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load settings + usage on mount
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [sRes, uRes] = await Promise.all([elaraSettingsApi.get(), elaraUsageApi.get()])
        if (sRes.success) {
          const data = sRes.data
          // If saved model is unavailable, silently switch to gemma-3-27b-it
          const savedModel = MODELS.find((m) => m.id === data.model)
          if (!savedModel || !savedModel.available) {
            data.model = 'gemma-3-27b-it'
            void elaraSettingsApi.update({ model: 'gemma-3-27b-it' })
          }
          setSettings(data)
        }
        if (uRes.success) setUsage(uRes.data)
      } catch {
        toast.error('Failed to load Elara settings.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  // Generic auto-save helper
  const autoSave = useCallback(
    (field: Partial<ElaraSettings>, showSaved: () => void) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await elaraSettingsApi.update(field)
          if (res.success) {
            showSaved()
            setTimeout(() => showSaved(), 2000) // showSaved(false) controlled by caller
          } else {
            toast.error('Failed to save settings.')
          }
        } catch {
          toast.error('Failed to save settings.')
        }
      }, 800)
    },
    []
  )

  function flashSaved(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  // Settings change handlers
  function handleModelChange(model: ModelId) {
    if (!settings) return
    const next = { ...settings, model }
    setSettings(next)
    autoSave({ model }, () => flashSaved(setSavedModel))
  }

  function handleStyleChange(response_style: ResponseStyle) {
    if (!settings) return
    const next = { ...settings, response_style }
    setSettings(next)
    autoSave({ response_style }, () => flashSaved(setSavedStyle))
  }

  function handleDisplayChange(field: 'show_model_indicator' | 'show_usage_stats', value: boolean) {
    if (!settings) return
    const next = { ...settings, [field]: value }
    setSettings(next)
    autoSave({ [field]: value }, () => flashSaved(setSavedDisplay))
  }

  if (loading) return <SkeletonPage />

  if (!settings) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center text-[#5C6070] dark:text-[#8B8FA8] text-[14px]" style={{ fontFamily: 'var(--font-body)' }}>
        Could not load Elara settings.
      </div>
    )
  }

  const RESPONSE_STYLES: { id: ResponseStyle; label: string; desc: string }[] = [
    { id: 'concise', label: 'Concise', desc: 'Short, direct answers. Best for quick lookups.' },
    { id: 'balanced', label: 'Balanced', desc: 'Clear with just enough context. Good default.' },
    { id: 'verbose', label: 'Verbose', desc: 'In-depth explanations with examples and reasoning.' },
  ]

  // Usage helpers
  const usedMessages = usage?.messages_used ?? 0
  const totalMessages = usage?.messages_limit ?? 30
  const usagePercent = Math.min(100, Math.round((usedMessages / totalMessages) * 100))
  const resetInMinutes = usage?.reset_at
    ? Math.max(0, Math.ceil((new Date(usage.reset_at).getTime() - Date.now()) / 60000))
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-0 md:py-12">
      {/* Back link */}
      <Link
        to="/elara"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0066FF] transition-colors mb-8"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <ArrowLeft size={14} weight="bold" />
        Back to Elara
      </Link>

      {/* Page heading */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-[#0066FF1A] flex items-center justify-center flex-shrink-0">
          <Brain size={18} weight="duotone" className="text-[#0066FF]" />
        </div>
        <h1
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', letterSpacing: '-0.02em' }}
          className="text-[#0A0A0F] dark:text-[#F0F0F5]"
        >
          Elara Settings
        </h1>
      </div>

      {/* ── Section 1: AI Model ─────────────────────────────────────────────── */}
      <section className="mb-10">
        <SectionTitle saved={savedModel}>
          <span className="flex items-center gap-2">
            <Lightning size={15} weight="fill" className="text-[#0066FF]" />
            AI Model
          </span>
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODELS.map((m) => {
            const isSelected = settings.model === m.id
            const unavailable = !m.available
            return (
              <button
                key={m.id}
                onClick={() => !unavailable && handleModelChange(m.id)}
                disabled={unavailable}
                className={`rounded-xl border-2 transition-all p-4 text-left relative overflow-hidden ${
                  unavailable
                    ? 'border-[#E4E7EC] dark:border-[#222229] opacity-50 cursor-not-allowed'
                    : isSelected
                      ? 'border-[#0066FF] bg-[#0066FF08] cursor-pointer'
                      : 'border-[#E4E7EC] dark:border-[#222229] hover:border-[#0066FF40] cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p
                    className="text-[13px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] leading-snug break-all"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {m.id}
                  </p>
                  {isSelected && !unavailable && (
                    <span className="w-4 h-4 rounded-full bg-[#0066FF] flex items-center justify-center flex-shrink-0 ml-2 mt-0.5">
                      <Check size={9} weight="bold" className="text-white" />
                    </span>
                  )}
                  {unavailable && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-medium flex-shrink-0" style={{ fontFamily: 'var(--font-body)' }}>
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#5C6070] dark:text-[#8B8FA8] mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                  {m.label}
                  {'isDefault' in m && m.isDefault && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-[#0066FF1A] text-[#0066FF] text-[10px] font-medium">
                      Default
                    </span>
                  )}
                </p>
                {'unavailableReason' in m && m.unavailableReason && (
                  <p className="text-[11px] text-orange-500 dark:text-orange-400 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                    ⚠ {m.unavailableReason}
                  </p>
                )}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#9AA0AD] dark:text-[#4A4D5E] w-10" style={{ fontFamily: 'var(--font-body)' }}>
                      Speed
                    </span>
                    <StatBar value={m.speed} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#9AA0AD] dark:text-[#4A4D5E] w-10" style={{ fontFamily: 'var(--font-body)' }}>
                      Depth
                    </span>
                    <StatBar value={m.depth} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Section 2: Response Style ───────────────────────────────────────── */}
      <section className="mb-10">
        <SectionTitle saved={savedStyle}>
          <span className="flex items-center gap-2">
            <ChatTeardropText size={15} weight="fill" className="text-[#0066FF]" />
            Response Style
          </span>
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {RESPONSE_STYLES.map(({ id, label, desc }) => {
            const isActive = settings.response_style === id
            return (
              <button
                key={id}
                onClick={() => handleStyleChange(id)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                  isActive
                    ? 'border-[#0066FF] bg-[#0066FF08]'
                    : 'border-[#E4E7EC] dark:border-[#222229] hover:border-[#0066FF40]'
                }`}
              >
                {isActive && (
                  <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#0066FF] flex items-center justify-center">
                    <Check size={9} weight="bold" className="text-white" />
                  </span>
                )}
                <p className="text-[14px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                  {label}
                </p>
                <p className="text-[12px] text-[#5C6070] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-body)' }}>
                  {desc}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Section 3: Display Preferences ─────────────────────────────────── */}
      <section className="mb-10">
        <SectionTitle saved={savedDisplay}>
          Display Preferences
        </SectionTitle>
        <div className="rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] divide-y divide-[#E4E7EC] dark:divide-[#222229]">
          <div className="px-5 py-4">
            <Toggle
              checked={settings.show_model_indicator ?? false}
              onChange={(val) => handleDisplayChange('show_model_indicator', val)}
              label="Show model indicator on messages"
            />
          </div>
          <div className="px-5 py-4">
            <Toggle
              checked={settings.show_usage_stats ?? false}
              onChange={(val) => handleDisplayChange('show_usage_stats', val)}
              label="Show usage stats counter"
            />
          </div>
        </div>
      </section>

      {/* ── Section 4: Usage Stats ──────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <h2
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}
            className="text-[#0A0A0F] dark:text-[#F0F0F5] flex items-center gap-2"
          >
            <Gauge size={15} weight="fill" className="text-[#0066FF]" />
            Usage Stats
          </h2>
        </div>
        <div className="rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-5 space-y-4">
          {usage ? (
            <>
              {/* Main counter */}
              <div>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-[14px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5]" style={{ fontFamily: 'var(--font-body)' }}>
                    {usedMessages} / {totalMessages} messages used this hour
                  </p>
                  <span className="text-[13px] text-[#9AA0AD] dark:text-[#4A4D5E]" style={{ fontFamily: 'var(--font-body)' }}>
                    {usagePercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E4E7EC] dark:bg-[#222229] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0066FF] transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                {resetInMinutes !== null && (
                  <p className="mt-2 text-[12px] text-[#9AA0AD] dark:text-[#4A4D5E]" style={{ fontFamily: 'var(--font-body)' }}>
                    Resets in {resetInMinutes} minute{resetInMinutes !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Per-feature breakdown */}
              <div className="pt-3 border-t border-[#E4E7EC] dark:border-[#222229] space-y-2">
                <p className="text-[12px] text-[#9AA0AD] dark:text-[#4A4D5E] mb-3 uppercase tracking-wide font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                  Breakdown
                </p>
                {[
                  { label: 'Elara Chat', count: usage.breakdown?.elara_chat ?? 0 },
                  { label: 'Page Assistant', count: usage.breakdown?.page_assistant ?? 0 },
                  { label: 'Project Chat', count: usage.breakdown?.project_chat ?? 0 },
                ].map(({ label, count }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#5C6070] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-body)' }}>
                      {label}
                    </span>
                    <span className="text-[13px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5]" style={{ fontFamily: 'var(--font-body)' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[14px] text-[#9AA0AD] dark:text-[#4A4D5E]" style={{ fontFamily: 'var(--font-body)' }}>
              Usage data unavailable.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
