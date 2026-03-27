import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSession } from '../../context/SessionContext'

const SECTIONS = [
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'file-requirements', label: 'File Requirements' },
  { id: 'metadata-requirements', label: 'Metadata Requirements' },
  { id: 'co-author-policy', label: 'Co-Author Policy' },
  { id: 'plagiarism-policy', label: 'Plagiarism Policy' },
  { id: 'revision-policy', label: 'Revision Policy' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'version-history', label: 'Version History' },
]

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em' }}
      className="text-[#0A0A0F] dark:text-[#F0F0F5] mt-12 mb-4 first:mt-0 scroll-mt-24"
    >
      {children}
    </h2>
  )
}

function ProseList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[#5C6070] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-body)' }}>
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function SubmissionRulesPage() {
  const { user } = useSession()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string>('eligibility')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const sections = SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[]

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // find the topmost intersecting section
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (intersecting.length > 0) {
          setActiveSection(intersecting[0].target.id)
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )

    sections.forEach((el) => observerRef.current!.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const handleCTA = () => {
    if (user && user.role === 'student') {
      navigate('/upload')
    } else {
      navigate('/register')
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:px-12 md:py-12">
      {/* Page heading */}
      <div className="mb-10">
        <h1
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', letterSpacing: '-0.02em' }}
          className="text-[#0A0A0F] dark:text-[#F0F0F5] mb-2"
        >
          Submission Guidelines
        </h1>
        <p className="text-[16px] text-[#5C6070] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-body)' }}>
          Everything you need to know before submitting your project.
        </p>
      </div>

      <div className="flex gap-12 items-start">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <nav className="sticky top-24 space-y-0.5">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest text-[#9AA0AD] dark:text-[#4A4D5E] mb-3 px-3"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              On this page
            </p>
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                  setActiveSection(id)
                }}
                className={`block px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                  activeSection === id
                    ? 'text-[#0066FF] font-medium bg-[#0066FF1A]'
                    : 'text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D]'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* 1. Eligibility */}
          <SectionHeading id="eligibility">Eligibility</SectionHeading>
          <ProseList items={[
            'Only registered students with a student.babcock.edu.ng email address may submit projects.',
            'Each student may have one active submission per academic year.',
            'Co-authors must also be registered students on Inquisia.',
          ]} />

          {/* 2. File Requirements */}
          <SectionHeading id="file-requirements">File Requirements</SectionHeading>
          <ProseList items={[
            'Files must be in PDF format only.',
            'Maximum file size is 50 MB.',
            'The PDF must contain selectable text — scanned image-only documents are not accepted.',
            'Files that cannot be parsed for text extraction will be automatically rejected.',
          ]} />

          {/* 3. Metadata Requirements */}
          <SectionHeading id="metadata-requirements">Metadata Requirements</SectionHeading>
          <ProseList items={[
            'Title must be between 10 and 200 characters.',
            'Abstract must be between 100 and 1,000 characters.',
            'Year, department, and supervisor are required fields and must be completed before submission.',
            'Tags are optional but are strongly recommended to improve discoverability.',
          ]} />

          {/* 4. Co-Author Policy */}
          <SectionHeading id="co-author-policy">Co-Author Policy</SectionHeading>
          <ProseList items={[
            'Add co-authors by searching their matriculation number in the submission form.',
            'Co-authors must have registered Inquisia accounts before they can be added.',
            'All listed authors share attribution for the submitted work.',
            'A maximum of 5 co-authors may be added per submission.',
          ]} />

          {/* 5. Plagiarism Policy */}
          <SectionHeading id="plagiarism-policy">Plagiarism Policy</SectionHeading>
          <ProseList items={[
            'Submissions with a similarity score above 30% to existing work are automatically flagged.',
            'AI analysis checks your submission against the full Inquisia repository at the time of submission.',
            'Flagged submissions require supervisor review and approval before they can be published.',
            'Repeated offences may result in account restriction.',
          ]} />

          {/* 6. Revision Policy */}
          <SectionHeading id="revision-policy">Revision Policy</SectionHeading>
          <ProseList items={[
            'Students may submit revisions when changes are requested by their supervisor.',
            'Each revision creates a new version record in the system.',
            'Rejected projects may be resubmitted once after addressing the feedback provided.',
            'Version history is permanently preserved and cannot be deleted.',
          ]} />

          {/* 7. Intellectual Property */}
          <SectionHeading id="intellectual-property">Intellectual Property</SectionHeading>
          <ProseList items={[
            'Students retain full ownership of all submitted work.',
            'Inquisia stores projects solely for academic display and discovery — not for commercial purposes.',
            'Submitted work is never published commercially or transferred to third parties.',
            'Removal requests can be submitted through Settings → Danger Zone.',
          ]} />

          {/* 8. Version History */}
          <SectionHeading id="version-history">Version History</SectionHeading>
          <ProseList items={[
            'Every submission and revision creates a permanent, immutable version record.',
            'Versions cannot be deleted by students, supervisors, or admins.',
            'Supervisors and admins can view the full version history for any project.',
            'The most recently approved version is the one shown publicly on the project page.',
          ]} />

          {/* Bottom CTA */}
          <div className="mt-14 rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-8 text-center">
            <h3
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em' }}
              className="text-[#0A0A0F] dark:text-[#F0F0F5] mb-2"
            >
              Ready to submit?
            </h3>
            <p className="text-[14px] text-[#5C6070] dark:text-[#8B8FA8] mb-6" style={{ fontFamily: 'var(--font-body)' }}>
              Make sure you have read and understood all of the guidelines above before proceeding.
            </p>
            <button
              onClick={handleCTA}
              className="px-4 py-2.5 rounded-xl bg-[#0066FF] text-white hover:bg-[#0052CC] text-[14px] font-medium transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              I understand the submission guidelines
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
