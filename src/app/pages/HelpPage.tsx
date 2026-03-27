'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import {
  MagnifyingGlass,
  CaretDown,
  Question,
  BookOpen,
  Robot,
  User,
  Star,
  Wrench,
  Headset,
} from 'phosphor-react'
import { useSession } from '../../context/SessionContext'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface QAItem {
  q: string
  a: string
}

interface HelpSection {
  id: string
  title: string
  icon: React.ReactNode
  items: QAItem[]
}

const SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <BookOpen size={16} weight="bold" />,
    items: [
      {
        q: 'What is Inquisia?',
        a: 'Inquisia is a repository for Babcock University final year academic projects. It makes student research discoverable, reviewable, and accessible to the wider academic community.',
      },
      {
        q: 'What account types exist?',
        a: 'There are four account types: Student, Supervisor, Admin, and Public (read-only). Each has different permissions and dashboard capabilities.',
      },
      {
        q: 'How do I verify my email?',
        a: "Check your inbox after registration for a verification email from Inquisia. Click the link inside to confirm your address. If you didn't receive it, check your spam folder or resend from your profile settings.",
      },
      {
        q: 'Is Inquisia free to use?',
        a: 'Yes. Inquisia is free for all Babcock University students, supervisors, and staff. Public users can also create a free read-only account to browse the repository.',
      },
    ],
  },
  {
    id: 'submitting-projects',
    title: 'Submitting Projects',
    icon: <Star size={16} weight="bold" />,
    items: [
      {
        q: 'How do I submit a project?',
        a: 'Navigate to Upload from your dashboard. Fill in your project details, upload your PDF file, and click Submit. Your supervisor will be notified automatically.',
      },
      {
        q: 'What file format is required?',
        a: 'PDF only, maximum 50 MB. Ensure your document is complete and properly formatted before uploading.',
      },
      {
        q: 'Can I add co-authors?',
        a: 'Yes. Use the co-author field on the upload form and search by matriculation number. Co-authors will be able to view the project in their own dashboard.',
      },
      {
        q: 'Can I edit a project after submitting it?',
        a: 'You cannot edit a project directly after submission. If changes are needed, your supervisor will send a Change Request. You can then upload a revised version from your dashboard.',
      },
    ],
  },
  {
    id: 'using-elara',
    title: 'Using Elara AI',
    icon: <Robot size={16} weight="bold" />,
    items: [
      {
        q: 'What is Elara?',
        a: "Elara is an AI assistant integrated into Inquisia. It helps you explore research, find relevant projects, get quick answers about academic topics, and assists with research discovery across the archive.",
      },
      {
        q: 'What can Elara do?',
        a: 'Elara can answer questions about projects in the repository, summarise papers, suggest related work, help with academic writing guidance, and assist supervisors with feedback drafts.',
      },
      {
        q: 'Are there usage limits?',
        a: '30 messages per hour per user. Limits reset at the top of each hour. If you hit the limit, the interface will show your reset time — try again shortly after.',
      },
      {
        q: 'Is my conversation with Elara private?',
        a: 'Yes. Conversations are stored per-user and are not shared with other users. Only you and platform administrators can access your conversation history.',
      },
    ],
  },
  {
    id: 'account-profile',
    title: 'Account & Profile',
    icon: <User size={16} weight="bold" />,
    items: [
      {
        q: 'How do I change my avatar?',
        a: 'Go to Settings → Profile. Upload a new photo or choose a generated avatar from the options provided.',
      },
      {
        q: 'How do I reset my password?',
        a: "Use the \"Forgot password?\" link on the login page. Enter your email and we'll send you a reset link that expires in 1 hour.",
      },
      {
        q: 'Can I change my display name?',
        a: 'Yes. Navigate to Settings → Profile, update your display name in the form, and save. Changes take effect immediately.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to Settings → Danger Zone and follow the account deletion steps. This action is permanent and cannot be undone.',
      },
    ],
  },
  {
    id: 'reviewing-feedback',
    title: 'Reviewing & Feedback',
    icon: <Star size={16} weight="bold" />,
    items: [
      {
        q: 'What happens after I submit?',
        a: "Your supervisor will review the submission and either approve it, request changes, or reject it. You'll receive a notification for each status change.",
      },
      {
        q: 'What does "Changes Requested" mean?',
        a: "Your supervisor wants edits before approving. Review their feedback in your dashboard, make the necessary changes, and upload a revision to re-enter the review queue.",
      },
      {
        q: 'Can I resubmit a rejected project?',
        a: "Yes, once per rejection cycle. Address the supervisor's feedback, then upload a revised version to re-enter the review queue.",
      },
      {
        q: 'How do supervisors request changes?',
        a: 'Supervisors open the project from their dashboard and click "Request Changes". They write specific feedback describing what needs to be revised, which is then sent to you as a notification.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: <Wrench size={16} weight="bold" />,
    items: [
      {
        q: 'My file upload failed. What should I do?',
        a: 'Check that your file is a valid PDF under 50 MB. Try a different browser or disable browser extensions that may interfere with uploads. If the problem persists, contact support.',
      },
      {
        q: "I can't log in to my account.",
        a: "Ensure your email and password are correct. If you've forgotten your password, use the \"Forgot password?\" link. If your account has been deactivated, contact the platform administrator.",
      },
      {
        q: "I'm not receiving email notifications.",
        a: "Check your spam folder. Add noreply@inquisia.edu.ng to your contacts. Verify that email notifications are enabled in Settings → Notifications.",
      },
      {
        q: 'The page is loading slowly or not at all.',
        a: 'Try refreshing the page or clearing your browser cache. If the issue continues, check your internet connection. You can also try a different browser.',
      },
    ],
  },
]

// ─── Filtering ────────────────────────────────────────────────────────────────

function filterSections(sections: HelpSection[], query: string): HelpSection[] {
  if (!query.trim()) return sections
  const q = query.toLowerCase()
  return sections
    .map((section) => {
      if (section.title.toLowerCase().includes(q)) return section
      const filteredItems = section.items.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      )
      if (filteredItems.length === 0) return null
      return { ...section, items: filteredItems }
    })
    .filter(Boolean) as HelpSection[]
}

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({ item }: { item: QAItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[#E4E7EC] dark:border-[#222229] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full cursor-pointer py-3.5 text-[14px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5] flex items-center justify-between gap-4 text-left select-none"
        style={{ fontFamily: 'var(--font-body)' }}
        aria-expanded={open}
      >
        <span>{item.q}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={`flex-shrink-0 text-[#9AA0AD] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className="pb-4 text-[13px] text-[#5C6070] dark:text-[#8B8FA8] leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {item.a}
        </div>
      )}
    </div>
  )
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({ section }: { section: HelpSection }) {
  return (
    <div
      id={section.id}
      className="rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-6 mb-4 scroll-mt-24"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-[#0066FF]">{section.icon}</span>
        <h2
          className="text-[17px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {section.title}
        </h2>
      </div>
      <div>
        {section.items.map((item, i) => (
          <AccordionItem key={i} item={item} />
        ))}
      </div>
    </div>
  )
}

// ─── Sidebar TOC ──────────────────────────────────────────────────────────────

interface SidebarProps {
  activeId: string
}

function Sidebar({ activeId }: SidebarProps) {
  return (
    <nav className="w-56 flex-shrink-0">
      <div className="sticky top-24 space-y-0.5">
        <p
          className="text-[11px] font-semibold text-[#9AA0AD] dark:text-[#4A4D5E] uppercase tracking-wider mb-3 px-2"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          On this page
        </p>
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
              activeId === s.id
                ? 'text-[#0066FF] bg-[rgba(0,102,255,0.12)]'
                : 'text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0066FF] hover:bg-[rgba(0,102,255,0.06)]'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <span className={activeId === s.id ? 'text-[#0066FF]' : 'text-[#9AA0AD] dark:text-[#5C6070]'}>
              {s.icon}
            </span>
            {s.title}
          </a>
        ))}
      </div>
    </nav>
  )
}

// ─── HelpPage ─────────────────────────────────────────────────────────────────

export function HelpPage() {
  const { user } = useSession()
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const sectionRefs = useRef<Record<string, IntersectionObserverEntry>>({})

  const filteredSections = filterSections(SECTIONS, search)

  // IntersectionObserver to track which TOC section is active while scrolling
  useEffect(() => {
    if (search) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionRefs.current[entry.target.id] = entry
        })
        const visible = SECTIONS.filter((s) => sectionRefs.current[s.id]?.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].id)
      },
      { rootMargin: '-64px 0px -40% 0px', threshold: 0 },
    )

    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean)
    els.forEach((el) => observer.observe(el!))
    return () => observer.disconnect()
  }, [search])

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0C0C0F]">
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:px-12 md:py-12">

        {/* ── Hero ── */}
        <div className="text-center mb-12 pt-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[rgba(0,102,255,0.12)] mb-4">
            <Question size={24} weight="bold" className="text-[#0066FF]" />
          </div>
          <h1
            className="text-[36px] md:text-[44px] font-bold text-[#0A0A0F] dark:text-[#F0F0F5] mb-3 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            How can we help?
          </h1>
          <p
            className="text-[16px] text-[#5C6070] dark:text-[#8B8FA8] mb-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Browse answers to common questions about Inquisia
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <MagnifyingGlass
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0AD] pointer-events-none"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] text-[14px] text-[#0A0A0F] dark:text-[#F0F0F5] placeholder:text-[#9AA0AD] focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[rgba(0,102,255,0.15)] transition-all shadow-sm"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>

          {/* Section pills for mobile / tablet quick-nav */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 md:hidden">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] text-[12px] font-medium text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0066FF] hover:border-[#0066FF] transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <span className="text-[#9AA0AD]">{s.icon}</span>
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex gap-8 items-start">

          {/* Sidebar TOC — desktop only */}
          <div className="hidden md:block">
            <Sidebar activeId={activeId} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {filteredSections.length === 0 ? (
              <div className="rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-12 text-center">
                <Question size={32} className="text-[#9AA0AD] dark:text-[#4A4D5E] mx-auto mb-3" />
                <p
                  className="text-[15px] text-[#9AA0AD] dark:text-[#4A4D5E]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  No results for &ldquo;{search}&rdquo;. Try a different search term.
                </p>
              </div>
            ) : (
              filteredSections.map((section) => (
                <SectionBlock key={section.id} section={section} />
              ))
            )}

            {/* ── Contact support card ── */}
            <div className="mt-6 rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[rgba(0,102,255,0.12)] flex items-center justify-center">
                  <Headset size={18} weight="bold" className="text-[#0066FF]" />
                </div>
                <div>
                  <h3
                    className="text-[15px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] mb-0.5"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Still need help?
                  </h3>
                  <p
                    className="text-[13px] text-[#5C6070] dark:text-[#8B8FA8]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Can&apos;t find what you&apos;re looking for? Reach out via your account settings.
                  </p>
                </div>
              </div>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] text-white hover:bg-[#0052CC] text-[14px] font-medium transition-colors whitespace-nowrap flex-shrink-0"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <Headset size={15} weight="bold" />
                {user ? 'Go to Settings' : 'Contact support'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
