import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { Robot, PaperPlaneTilt, Plus, PencilSimple, Trash, List, X, Gear, ArrowUpRight } from 'phosphor-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { useSession } from '../../context/SessionContext'
import { aiApi, conversationsApi, elaraSettingsApi, elaraUsageApi } from '../../lib/api'
import type { ChatMessage, ElaraConversation, ElaraSettings, ElaraUsage } from '../../lib/types'
import { ElaraLogo } from '../components/ui/ElaraLogo'
import { relativeTime } from '../../lib/utils'

function useTypewriter(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!active) { setDisplayed(text); return }
    setDisplayed('')
    if (!text) return
    const msPerChar = Math.min(1400 / text.length, 22)
    let i = 0
    const iv = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) clearInterval(iv) }, msPerChar)
    return () => clearInterval(iv)
  }, [text, active])
  return displayed
}

// ─── Custom markdown components ────────────────────────────────────────────────

const PROJECT_URL_RE = /\/projects\/([a-f0-9-]{36})/

const markdownComponents: Components = {
  a({ href, children }) {
    const isProject = href && PROJECT_URL_RE.test(href)

    if (isProject) {
      return (
        <Link
          to={href ?? '/'}
          className="group flex items-center justify-between gap-3 my-2 px-4 py-3 rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#18181D] hover:border-[#0066FF] hover:bg-[rgba(0,102,255,0.04)] transition-all duration-200 no-underline shadow-sm hover:shadow-md"
          style={{ fontFamily: 'var(--font-body)', display: 'flex' }}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-[rgba(0,102,255,0.1)] flex items-center justify-center flex-shrink-0">
              <ArrowUpRight size={14} weight="bold" className="text-[#0066FF]" />
            </span>
            <span className="text-[13px] font-medium text-[#0A0A0F] dark:text-[#F5F5F5] group-hover:text-[#0066FF] truncate transition-colors">
              {children}
            </span>
          </span>
          <span className="text-[11px] text-[#9CA3AF] flex-shrink-0 group-hover:text-[#0066FF] transition-colors">View →</span>
        </Link>
      )
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#0066FF] underline underline-offset-2 hover:opacity-80 transition-opacity"
      >
        {children}
      </a>
    )
  },
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────

function Bubble({
  msg,
  isLatest,
  modelUsed,
  showIndicator,
}: {
  msg: ChatMessage
  isLatest: boolean
  modelUsed?: string
  showIndicator?: boolean
}) {
  const isUser = msg.role === 'user'
  const text = useTypewriter(msg.content, !isUser && isLatest)
  const isLoading = !isUser && !text

  return (
    <div className={`flex items-end gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#0066FF] flex items-center justify-center flex-shrink-0 mb-1 overflow-hidden p-1.5">
          <ElaraLogo variant="blue" className="w-full h-full" />
        </div>
      )}
      <div className={`flex flex-col max-w-[80%] min-w-0 overflow-hidden ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`text-[15px] leading-relaxed ${
            isLoading
              ? 'px-3 py-2.5 bg-[#F2F4F7] dark:bg-[#18181D] rounded-2xl rounded-bl-sm border border-[#E4E7EC] dark:border-[#222229]'
              : isUser
              ? 'px-4 py-3 bg-[#0066FF] text-white rounded-2xl rounded-br-sm'
              : 'px-4 py-3 bg-[#F2F4F7] dark:bg-[#18181D] text-[#0A0A0F] dark:text-[#F5F5F5] rounded-2xl rounded-bl-sm border border-[#E4E7EC] dark:border-[#222229]'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {isLoading ? (
            <TypingDots />
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-a:no-underline prose-pre:bg-[#F2F4F7] dark:prose-pre:bg-[#111115] prose-pre:border prose-pre:border-[#E4E7EC] dark:prose-pre:border-[#222229]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {text}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && !isLoading && showIndicator && modelUsed && (
          <p className="text-[11px] text-[#9AA0AD] mt-1 ml-1" style={{ fontFamily: 'var(--font-body)' }}>
            {modelUsed}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Conversation sidebar item ─────────────────────────────────────────────────

function ConvItem({
  conv,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  conv: ElaraConversation
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (newTitle: string) => void
}) {
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(conv.title ?? 'New Chat')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  function commitRename() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== conv.title) onRename(trimmed)
    setRenaming(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') { setDraft(conv.title ?? 'New Chat'); setRenaming(false) }
  }

  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-left w-full ${
        isActive
          ? 'bg-[rgba(0,102,255,0.1)] text-[#0066FF]'
          : 'hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] text-[#0A0A0F] dark:text-[#F0F0F5]'
      }`}
      onClick={() => { if (!renaming) onSelect() }}
    >
      <div className="flex-1 min-w-0">
        {renaming ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitRename}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent outline-none text-[13px] border-b border-[#0066FF]"
            style={{ fontFamily: 'var(--font-body)' }}
          />
        ) : (
          <p className="text-[13px] truncate" style={{ fontFamily: 'var(--font-body)' }}>
            {conv.title ?? 'New Chat'}
          </p>
        )}
      </div>

      {!renaming && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setDraft(conv.title ?? 'New Chat'); setRenaming(true) }}
            className="p-1 rounded hover:bg-[#E4E7EC] dark:hover:bg-[#222229] text-[#9AA0AD] hover:text-[#5C6070]"
          >
            <PencilSimple size={12} weight="bold" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-[#2D1515] text-[#9AA0AD] hover:text-red-500"
          >
            <Trash size={12} weight="bold" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Input bar ─────────────────────────────────────────────────────────────────

function InputBar({
  input,
  setInput,
  sending,
  onSend,
  inputRef,
  user,
}: {
  input: string
  setInput: (v: string) => void
  sending: boolean
  onSend: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  user: ReturnType<typeof useSession>['user']
}) {
  if (!user) {
    return (
      <div className="text-center p-4 rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-[#F2F4F7] dark:bg-[#18181D]">
        <p className="text-[14px] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
          <Link to="/login" className="text-[#0066FF] hover:underline">Log in</Link> to chat with Elara
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-[#18181D] rounded-2xl border border-[#E4E7EC] dark:border-[#222229] px-5 py-3.5 focus-within:border-[#0066FF] focus-within:shadow-[0_0_0_3px_rgba(0,102,255,0.12)] transition-all shadow-sm">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder="Ask Elara something..."
        className="flex-1 bg-transparent outline-none text-[15px] text-[#0A0A0F] dark:text-[#F5F5F5] placeholder-[#9CA3AF]"
        style={{ fontFamily: 'var(--font-body)' }}
        disabled={sending}
      />
      <button
        onClick={onSend}
        disabled={!input.trim() || sending}
        className={`transition-colors flex-shrink-0 ${input.trim() && !sending ? 'text-[#0066FF]' : 'text-[#D1D5DB] dark:text-[#3A3D4A]'}`}
      >
        <PaperPlaneTilt size={20} weight={input.trim() ? 'fill' : 'regular'} />
      </button>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function ElaraPage() {
  const { user } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [latestAIId, setLatestAIId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [conversations, setConversations] = useState<ElaraConversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const [convsError, setConvsError] = useState<string | null>(null)

  const [elaraSettings, setElaraSettings] = useState<ElaraSettings | null>(null)
  const [modelMap, setModelMap] = useState<Record<string, string>>({})
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [usage, setUsage] = useState<ElaraUsage | null>(null)

  const refreshUsage = useCallback(() => {
    elaraUsageApi.get().then((res) => { if (res.success) setUsage(res.data) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!user) {
      setMessages([])
      setInput('')
      setLatestAIId(null)
      setConversations([])
      setActiveConvId(null)
    }
  }, [user])

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!user) return
    conversationsApi.list().then((res) => {
      if (res.success) setConversations(res.data)
      else setConvsError(res.error ?? 'Failed to load conversations')
    }).catch((e) => setConvsError(e?.message ?? 'Network error'))
  }, [user])

  useEffect(() => {
    if (!user) return
    elaraSettingsApi.get().then((res) => {
      if (res.success) setElaraSettings(res.data)
    }).catch(() => {})
    refreshUsage()
  }, [user, refreshUsage])

  const selectConversation = useCallback(async (id: string) => {
    setActiveConvId(id)
    setLatestAIId(null)
    setMessages([])
    setLoadingMessages(true)
    try {
      const res = await conversationsApi.messages(id)
      if (res.success) {
        const mapped: ChatMessage[] = res.data.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        }))
        setMessages(mapped)
      }
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  const startNewChat = useCallback(() => {
    setActiveConvId(null)
    setMessages([])
    setLatestAIId(null)
    inputRef.current?.focus()
  }, [])

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      await conversationsApi.rename(id, newTitle)
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)))
    } catch {}
  }, [])

  const deleteConversation = useCallback(async (id: string) => {
    if (!window.confirm('Delete this conversation?')) return
    try {
      await conversationsApi.delete(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConvId === id) { setActiveConvId(null); setMessages([]); setLatestAIId(null) }
    } catch {}
  }, [activeConvId])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    const userId = `u-${Date.now()}`
    const aiId = `a-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', content: text, timestamp: new Date().toISOString() },
      { id: aiId, role: 'assistant', content: '', timestamp: new Date().toISOString() },
    ])
    setInput('')
    setSending(true)

    let convId = activeConvId
    if (!convId) {
      try {
        const res = await conversationsApi.create()
        if (res.success) {
          convId = res.data.id
          setActiveConvId(convId)
          setConversations((prev) => [res.data, ...prev])
        }
      } catch {}
    }

    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    const res = await aiApi.elara(
      text,
      history,
      convId ?? undefined,
      elaraSettings?.model,
      elaraSettings?.response_style,
    )
    setMessages((prev) =>
      prev.map((m) =>
        m.id === aiId
          ? { ...m, content: res.success ? (res.data as { reply: string }).reply : 'Sorry, something went wrong.' }
          : m
      )
    )
    if (res.success && (res.data as { modelUsed?: string }).modelUsed) {
      setModelMap((prev) => ({ ...prev, [aiId]: (res.data as { modelUsed: string }).modelUsed }))
    }
    setLatestAIId(aiId)
    setSending(false)
    refreshUsage()

    if (convId && res.success && (res.data as { conversation_title?: string }).conversation_title) {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: (res.data as { conversation_title: string }).conversation_title } : c))
      )
    }
  }, [input, sending, messages, activeConvId, elaraSettings])

  const suggestions = user?.role === 'supervisor'
    ? ['What are common submission mistakes?', 'How should I write useful feedback?', 'What makes a strong methodology?', 'How do I evaluate plagiarism scores?']
    : user?.role === 'admin'
    ? ['How do I flag a comment?', 'What does the plagiarism score measure?', 'How are user roles assigned?', 'What can admins do?']
    : user?.role === 'student'
    ? ['How do I submit my project?', 'What does "changes requested" mean?', 'How do I find a supervisor?', 'Can I add co-authors after submitting?']
    : ['What projects are trending?', 'Help me find ML projects', 'How do I submit a thesis?', 'Who are the top supervisors?']

  const hasChatted = messages.length > 0 || loadingMessages

  return (
    /* Full viewport: minus top navbar (64px) and on mobile also minus bottom dock (~65px) */
    <div className="h-[calc(100dvh-64px-65px)] md:h-[calc(100dvh-64px)] flex overflow-hidden bg-white dark:bg-[#0C0C0F]">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      {user && (
        <>
          {/* Mobile overlay — starts below the top navbar */}
          {sidebarOpen && (
            <div
              className="fixed top-16 inset-x-0 bottom-0 bg-black/30 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`
              flex-shrink-0 flex flex-col border-r border-[#E4E7EC] dark:border-[#222229]
              bg-[#F8F9FB] dark:bg-[#111115] transition-[width] duration-200 overflow-hidden
              ${sidebarOpen ? 'w-[260px]' : 'w-0 lg:w-0'}
              fixed top-16 bottom-0 left-0 z-30 lg:static lg:top-auto lg:bottom-auto lg:z-auto
            `}
          >
            {/* Top actions */}
            <div className="flex items-center justify-between px-3 py-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[#0066FF] flex items-center justify-center overflow-hidden p-1">
                  <ElaraLogo variant="blue" className="w-full h-full" />
                </div>
                <span className="text-[13px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5]" style={{ fontFamily: 'var(--font-display)' }}>
                  Elara
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to="/elara/settings"
                  className="p-1.5 rounded-lg hover:bg-[#E4E7EC] dark:hover:bg-[#18181D] text-[#9AA0AD] hover:text-[#5C6070] dark:hover:text-[#8B8FA8] transition-colors"
                  title="Elara settings"
                >
                  <Gear size={15} weight="regular" />
                </Link>
                <button
                  onClick={startNewChat}
                  className="p-1.5 rounded-lg hover:bg-[#E4E7EC] dark:hover:bg-[#18181D] text-[#9AA0AD] hover:text-[#0066FF] transition-colors"
                  title="New chat"
                >
                  <Plus size={15} weight="bold" />
                </button>
              </div>
            </div>

            {/* Conversations label */}
            <div className="px-4 pb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
                Conversations
              </span>
            </div>

            {/* Usage pill */}
            {usage !== null && elaraSettings?.show_usage_stats !== false && (
              <div className="px-4 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
                    {usage.elara}/30 messages this hour
                  </span>
                  {usage.reset_at && (
                    <span className="text-[10px] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
                      resets {new Date(usage.reset_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="h-1 rounded-full bg-[#E4E7EC] dark:bg-[#222229] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0066FF] transition-all duration-500"
                    style={{ width: `${Math.min((usage.elara / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Conversations label */}
            <div className="px-4 pb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
                Conversations
              </span>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
              {convsError ? (
                <p
                  className="text-center text-[11px] text-red-400 py-6 px-3"
                  style={{ fontFamily: 'var(--font-body)' }}
                  title={convsError}
                >
                  Could not load conversations.
                  <br />
                  <span className="text-[10px] opacity-70 break-all">{convsError}</span>
                </p>
              ) : conversations.length === 0 ? (
                <p
                  className="text-center text-[12px] text-[#9AA0AD] dark:text-[#4A4D5E] py-8 px-3"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  No conversations yet.
                </p>
              ) : (
                conversations.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    isActive={activeConvId === conv.id}
                    onSelect={() => { void selectConversation(conv.id); if (window.innerWidth < 1024) setSidebarOpen(false) }}
                    onDelete={() => void deleteConversation(conv.id)}
                    onRename={(title) => void renameConversation(conv.id, title)}
                  />
                ))
              )}
            </div>
          </aside>
        </>
      )}

      {/* ── Main chat area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">

        {/* Top bar — mobile toggle + new chat */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[#E4E7EC] dark:border-[#222229] lg:border-none">
          {user && (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] text-[#9AA0AD] hover:text-[#5C6070] transition-colors"
            >
              {sidebarOpen ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
            </button>
          )}
          {hasChatted && (
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <Plus size={14} weight="bold" />
              New chat
            </button>
          )}
        </div>

        {/* Content: empty state OR messages */}
        {!hasChatted ? (
          /* ── Empty / landing state (ChatGPT-like center) ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
            <div className="w-14 h-14 rounded-full bg-[#0066FF] flex items-center justify-center mb-5 overflow-hidden p-3">
              <ElaraLogo variant="blue" className="w-full h-full" />
            </div>
            <h1
              className="text-[28px] text-[#0A0A0F] dark:text-[#F0F0F5] mb-8 text-center"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              What can I help with?
            </h1>

            {/* Input bar */}
            <div className="w-full max-w-[640px] mb-5">
              <InputBar
                input={input}
                setInput={setInput}
                sending={sending}
                onSend={() => void send()}
                inputRef={inputRef}
                user={user}
              />
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-[640px]">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus() }}
                  className="px-4 py-2 rounded-full border border-[#E4E7EC] dark:border-[#222229] text-[13px] text-[#5C6070] dark:text-[#8B8FA8] hover:border-[#0066FF] hover:text-[#0066FF] hover:bg-[rgba(0,102,255,0.04)] transition-all"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Active chat state ── */
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-[680px] mx-auto">
                {messages.map((msg) => (
                  <Bubble
                    key={msg.id}
                    msg={msg}
                    isLatest={msg.id === latestAIId}
                    modelUsed={modelMap[msg.id]}
                    showIndicator={elaraSettings?.show_model_indicator ?? false}
                  />
                ))}
              </div>
            </div>

            {/* Bottom input */}
            <div className="flex-shrink-0 px-4 pb-5 pt-3 border-t border-[#E4E7EC] dark:border-[#222229]">
              <div className="max-w-[680px] mx-auto">
                <InputBar
                  input={input}
                  setInput={setInput}
                  sending={sending}
                  onSend={() => void send()}
                  inputRef={inputRef}
                  user={user}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
