import React, { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { useTheme } from '../../../context/ThemeContext'
import {
  SquaresFour,
  FolderOpen,
  UploadSimple,
  User,
  Gear,
  BookmarkSimple,
  Sun,
  Moon,
  ArrowLineLeft,
  ArrowLineRight,
} from 'phosphor-react'
import { useSession } from '../../../context/SessionContext'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidebarItem {
  icon: React.ReactNode
  label: string
  key: string
  badge?: number
  href?: string
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  projects: 'My Projects',
  pending: 'Pending Review',
  changes: 'Changes Requested',
  studentrequests: 'Student Requests',
  approved: 'Approved',
  rejected: 'Rejected',
  students: 'My Students',
  upload: 'Upload New',
  profile: 'Profile',
  bookmarks: 'Bookmarks',
  settings: 'Settings',
}

function DashboardBreadcrumbs({
  activeSection,
  onNavigate,
  baseLabel = 'Dashboard',
}: {
  activeSection: string
  onNavigate?: (k: string) => void
  baseLabel?: string
}) {
  if (activeSection === 'overview') return null
  const label = SECTION_LABELS[activeSection] ?? activeSection
  return (
    <nav className="flex items-center gap-1.5 mb-6" aria-label="Breadcrumb">
      {onNavigate ? (
        <button
          onClick={() => onNavigate('overview')}
          className="text-[13px] text-[#0066FF] hover:underline"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
        >
          {baseLabel}
        </button>
      ) : (
        <Link
          to="/dashboard"
          className="text-[13px] text-[#0066FF] hover:underline"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
        >
          {baseLabel}
        </Link>
      )}
      <span className="text-[--color-border-strong] text-[13px]">/</span>
      <span className="text-[13px] text-[--color-text-secondary]" style={{ fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
    </nav>
  )
}

// ─── Mobile Section Nav ───────────────────────────────────────────────────────

function MobileSectionNav({
  items,
  active,
  onSelect,
}: {
  items: SidebarItem[]
  active: string
  onSelect: (k: string) => void
}) {
  return (
    <div className="md:hidden mb-5 -mx-1">
      <div className="flex gap-1.5 overflow-x-auto pb-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => {
          const isActive = active === item.key
          if (item.href && !isActive) {
            return (
              <Link
                key={item.key}
                to={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] whitespace-nowrap flex-shrink-0 border border-[--color-border] text-[--color-text-secondary] hover:border-[#0066FF] hover:text-[#0066FF] transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          }
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] whitespace-nowrap flex-shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#0066FF] text-white'
                  : 'border border-[--color-border] text-[--color-text-secondary] hover:border-[#0066FF] hover:text-[#0066FF]'
              }`}
              style={{ fontFamily: 'var(--font-body)', fontWeight: isActive ? 600 : 500 }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.badge ? (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-white text-[#0066FF]' : 'bg-[#0066FF] text-white'}`}
                  style={{ fontWeight: 700 }}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function DashboardSidebar({
  items,
  active,
  onSelect,
}: {
  items: SidebarItem[]
  active: string
  onSelect: (k: string) => void
}) {
  const { toggle, isDark } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="flex-shrink-0 hidden md:flex flex-col transition-all duration-200"
      style={{ width: collapsed ? '64px' : '240px' }}
    >
      <div className="sticky top-24 flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = active === item.key

          const inner = collapsed ? (
            <span className={isActive ? 'text-[#0066FF]' : 'text-[--color-text-muted]'}>
              {item.icon}
            </span>
          ) : (
            <>
              <span className={isActive ? 'text-[#0066FF]' : 'text-[--color-text-muted]'}>
                {item.icon}
              </span>
              <span className="flex-1 text-[13px]">{item.label}</span>
              {item.badge ? (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#0066FF] text-white"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                >
                  {item.badge}
                </span>
              ) : null}
            </>
          )

          const cls = `flex items-center gap-3 py-2.5 text-[13px] transition-colors duration-150 w-full text-left border-l-[3px] ${
            collapsed ? 'px-[22px] justify-center' : 'px-4'
          } ${
            isActive
              ? 'border-l-[#0066FF] bg-[--color-brand-dim] text-[#0066FF]'
              : 'border-l-transparent text-[--color-text-secondary] hover:bg-[--color-surface-raised] hover:text-[--color-text-primary]'
          }`
          const styleObj = { fontFamily: 'var(--font-body)', fontWeight: isActive ? 600 : 400 }

          return item.href && !isActive ? (
            <Link
              key={item.key}
              to={item.href}
              className={cls}
              style={styleObj}
              title={collapsed ? item.label : undefined}
            >
              {inner}
            </Link>
          ) : (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={cls}
              style={styleObj}
              title={collapsed ? item.label : undefined}
            >
              {inner}
            </button>
          )
        })}

        <div className="mt-6 pt-4 border-t border-[--color-border] flex flex-col gap-0.5">
          <button
            onClick={toggle}
            className="flex items-center gap-3 py-2.5 text-[13px] text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[--color-surface-raised] transition-colors w-full border-l-[3px] border-l-transparent"
            style={{ fontFamily: 'var(--font-body)', paddingLeft: collapsed ? '22px' : '16px' }}
            title={collapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-3 py-2.5 text-[13px] text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[--color-surface-raised] transition-colors w-full border-l-[3px] border-l-transparent"
            style={{ fontFamily: 'var(--font-body)', paddingLeft: collapsed ? '22px' : '16px' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ArrowLineRight size={18} /> : <ArrowLineLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Layout Component ─────────────────────────────────────────────────────────

export function DashboardLayout({
  children,
  activeSection,
  onNavigate,
  sidebarItems,
}: {
  children: React.ReactNode
  activeSection: string
  onNavigate?: (k: string) => void
  sidebarItems?: SidebarItem[]
}) {
  const { user } = useSession()

  const defaultSidebarItems: SidebarItem[] = user
    ? [
        ...(user.role === 'student'
          ? [
              { icon: <SquaresFour size={18} />, label: 'Overview', key: 'overview', href: '/dashboard' },
              { icon: <FolderOpen size={18} />, label: 'My Projects', key: 'projects', href: '/dashboard' },
              { icon: <UploadSimple size={18} />, label: 'Upload New', key: 'upload', href: '/upload' },
            ]
          : []),
        { icon: <User size={18} />, label: 'Profile', key: 'profile', href: `/profile/${user.id}` },
        { icon: <BookmarkSimple size={18} />, label: 'Bookmarks', key: 'bookmarks', href: '/bookmarks' },
        { icon: <Gear size={18} />, label: 'Settings', key: 'settings', href: '/settings' },
      ]
    : []

  const items = sidebarItems || defaultSidebarItems

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-12 md:py-10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <DashboardSidebar
          items={items}
          active={activeSection}
          onSelect={(k) => onNavigate?.(k)}
        />

        <div className="flex-1 min-w-0">
          <MobileSectionNav
            items={items}
            active={activeSection}
            onSelect={(k) => onNavigate?.(k)}
          />

          <DashboardBreadcrumbs
            activeSection={activeSection}
            onNavigate={onNavigate}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
