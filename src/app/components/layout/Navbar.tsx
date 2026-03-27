import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  BookOpen,
  Sun,
  Moon,
  Bell,
  User,
  SquaresFour,
  SignOut,
  Gear,
  ShieldStar,
  List,
  X,
  ArrowUpRight,
  Question,
  FileText,
} from 'phosphor-react'
import { ElaraLogo } from '../ui/ElaraLogo'
import { motion, AnimatePresence } from 'motion/react'
import { useSession } from '../../../context/SessionContext'
import { useTheme } from '../../../context/ThemeContext'
import { getAvatarColor, getInitials, relativeTime } from '../../../lib/utils'
import type { Notification } from '../../../lib/types'
import { notificationsApi } from '../../../lib/api'
import { InquisiaLogo as BaseInquisiaLogo } from '../ui/InquisiaLogo'

// ─── Logo ─────────────────────────────────────────────────────────────────────

function InquisiaLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 select-none group">
      <BaseInquisiaLogo className="w-7 h-7 transition-transform duration-150 group-hover:scale-105" />
      <span
        className="text-[#0A0A0F] dark:text-[#F0F0F5] text-[17px] leading-none"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }}
      >
        inquisia.
      </span>
    </Link>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function UserAvatar({
  id,
  name,
  avatarUrl,
  size = 32,
}: {
  id: string
  name: string | null
  avatarUrl?: string | null
  size?: number
}) {
  const bg = getAvatarColor(id)
  const initials = getInitials(name)
  if (avatarUrl) {
    return (
      <div
        className="rounded-full flex-shrink-0 overflow-hidden border border-[#E4E7EC] dark:border-[#222229]"
        style={{ width: size, height: size }}
      >
        <img src={avatarUrl} alt={name ?? 'Avatar'} className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 border border-[#E4E7EC] dark:border-[#222229]"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      <span
        className="text-white select-none"
        style={{
          fontSize: size * 0.38,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {initials}
      </span>
    </div>
  )
}

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  const hasUnread = notifications.some((n) => !n.is_read)

  useEffect(() => {
    notificationsApi.list().then((res) => {
      if (res.success) setNotifications(res.data)
    })
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    notificationsApi.markAllRead()
  }

  const handleDeleteAll = () => {
    setNotifications([])
    notificationsApi.deleteAll()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] transition-colors duration-150"
        aria-label="Notifications"
      >
        <Bell size={20} weight="regular" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#111115]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-[300px] sm:w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#111115] rounded-2xl border border-[#E4E7EC] dark:border-[#222229] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E7EC] dark:border-[#222229]">
              <span className="text-[14px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5]" style={{ fontFamily: 'var(--font-display)' }}>
                Notifications
              </span>
              <div className="flex items-center gap-3">
                {hasUnread && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] text-[#0066FF] hover:underline"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="text-[12px] text-[#9AA0AD] hover:text-red-500 transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[#9AA0AD] text-[14px]" style={{ fontFamily: 'var(--font-body)' }}>
                No notifications
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E7EC] dark:divide-[#222229]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 ${!n.is_read ? 'bg-[rgba(0,102,255,0.1)]' : ''}`}
                  >
                    {!n.is_read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2" />
                    )}
                    <div className={`flex-1 min-w-0 ${n.is_read ? 'pl-[18px]' : ''}`}>
                      <p className="text-[13px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5] leading-snug" style={{ fontFamily: 'var(--font-body)' }}>
                        {n.message}
                      </p>
                      <p className="text-[11px] text-[#9AA0AD] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer — link to full page */}
            <div className="border-t border-[#E4E7EC] dark:border-[#222229] px-4 py-2.5">
              <button
                onClick={() => { setOpen(false); navigate('/notifications') }}
                className="w-full flex items-center justify-center gap-1.5 text-[13px] text-[#0066FF] hover:underline"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                View all notifications <ArrowUpRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── User Menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!user) return null

  const displayName = user.display_name ?? user.full_name ?? user.email.split('@')[0]
  const dashboardLink = user.role === 'admin' ? '/admin' : user.role === 'public' ? `/profile/${user.id}` : '/dashboard'
  const dashboardLabel = user.role === 'admin' ? 'Admin Panel' : user.role === 'public' ? 'My Profile' : 'Dashboard'

  const menuItems = [
    { icon: <User size={16} />, label: 'Profile', href: `/profile/${user.id}` },
    {
      icon: user.role === 'admin' ? <ShieldStar size={16} /> : <SquaresFour size={16} />,
      label: dashboardLabel,
      href: dashboardLink,
    },
    { icon: <Gear size={16} />, label: 'Settings', href: '/settings' },
    { icon: <Question size={16} />, label: 'Help', href: '/help', divider: true },
    { icon: <FileText size={16} />, label: 'Submission Rules', href: '/submission-rules' },
  ].filter((item, i, self) => i === self.findIndex((t) => t.href === item.href))

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] transition-colors duration-150"
      >
        <UserAvatar id={user.id} name={user.full_name ?? user.display_name} avatarUrl={user.avatar_url} size={32} />
        <span
          className="text-[14px] text-[#0A0A0F] dark:text-[#F0F0F5] hidden sm:block max-w-[120px] truncate"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
        >
          {displayName}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#111115] rounded-2xl border border-[#E4E7EC] dark:border-[#222229] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-hidden py-1.5"
          >
            <div className="px-4 py-3 border-b border-[#E4E7EC] dark:border-[#222229] mb-1">
              <p className="text-[13px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] truncate" style={{ fontFamily: 'var(--font-display)' }}>
                {displayName}
              </p>
              <p className="text-[12px] text-[#9AA0AD] truncate mt-0.5">{user.email}</p>
            </div>

            {menuItems.map((item) => (
              <React.Fragment key={item.href}>
                {(item as any).divider && (
                  <div className="border-t border-[#E4E7EC] dark:border-[#222229] my-1" />
                )}
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#0A0A0F] dark:text-[#F0F0F5] hover:bg-[rgba(0,102,255,0.08)] hover:text-[#0066FF] transition-colors duration-100"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <span className="text-[#9AA0AD]">{item.icon}</span>
                  {item.label}
                </Link>
              </React.Fragment>
            ))}

            <div className="border-t border-[#E4E7EC] dark:border-[#222229] mt-1 pt-1">
              <button
                onClick={async () => {
                  setOpen(false)
                  await logout()
                  navigate('/')
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-100"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <SignOut size={16} />
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const { user, logout } = useSession()
  const { toggle, isDark } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    {
      to: '/projects',
      label: 'Browse',
      icon: <BookOpen size={16} weight={isActive('/projects') ? 'fill' : 'regular'} />,
    },
    {
      to: '/elara',
      label: 'Elara',
      icon: <ElaraLogo className="w-4 h-4" />,
    },
  ]

  const displayName = user ? (user.display_name ?? user.full_name ?? user.email.split('@')[0]) : null

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled || location.pathname.startsWith('/elara')
            ? 'bg-white dark:bg-[#111115] border-b border-[#E4E7EC] dark:border-[#222229]'
            : 'bg-white dark:bg-[#111115]'
        }`}
      >
        <div className={`h-16 flex items-center ${location.pathname.startsWith('/elara') ? 'w-full px-4' : 'max-w-[1200px] mx-auto px-5 md:px-12'}`}>

          {/* Left — Logo */}
          <div className="flex-1 flex items-center">
            <InquisiaLogo />
          </div>

          {/* Center — Nav links (desktop only) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] transition-colors duration-150 ${
                  isActive(link.to)
                    ? 'text-[#0066FF] bg-[rgba(0,102,255,0.1)]'
                    : 'text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D]'
                }`}
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right — User controls */}
          <div className="flex-1 flex items-center justify-end gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-full text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] transition-colors duration-150"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <NotificationBell />
                <UserMenu />
              </>
            ) : (
              <Link
                to="/login"
                className="ml-1 px-4 py-2 rounded-full text-[14px] text-white bg-[#0066FF] hover:bg-[#0052CC] transition-colors duration-150 hidden sm:block"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                Get Started
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 ml-1 rounded-full text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] transition-colors"
              aria-label="Open menu"
            >
              <List size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-over drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white dark:bg-[#111115] border-l border-[#E4E7EC] dark:border-[#222229] shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-[#E4E7EC] dark:border-[#222229]">
                <span
                  className="text-[15px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] text-[#9AA0AD] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-colors ${
                      isActive(link.to)
                        ? 'bg-[rgba(0,102,255,0.1)] text-[#0066FF]'
                        : 'text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5]'
                    }`}
                    style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/notifications"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-colors ${
                    isActive('/notifications')
                      ? 'bg-[rgba(0,102,255,0.1)] text-[#0066FF]'
                      : 'text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5]'
                  }`}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  <Bell size={16} weight={isActive('/notifications') ? 'fill' : 'regular'} />
                  Notifications
                </Link>
                <div className="border-t border-[#E4E7EC] dark:border-[#222229] my-1" />
                <Link
                  to="/help"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-colors ${
                    isActive('/help')
                      ? 'bg-[rgba(0,102,255,0.1)] text-[#0066FF]'
                      : 'text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5]'
                  }`}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  <Question size={16} weight={isActive('/help') ? 'fill' : 'regular'} />
                  Help
                </Link>
                <Link
                  to="/submission-rules"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-colors ${
                    isActive('/submission-rules')
                      ? 'bg-[rgba(0,102,255,0.1)] text-[#0066FF]'
                      : 'text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5]'
                  }`}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  <FileText size={16} weight={isActive('/submission-rules') ? 'fill' : 'regular'} />
                  Submission Rules
                </Link>
              </div>

              {/* User section */}
              {user ? (
                <div className="mt-auto border-t border-[#E4E7EC] dark:border-[#222229] p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-4 py-3 mb-1">
                    <UserAvatar
                      id={user.id}
                      name={user.full_name ?? user.display_name}
                      avatarUrl={user.avatar_url}
                      size={36}
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] truncate" style={{ fontFamily: 'var(--font-display)' }}>
                        {displayName}
                      </p>
                      <p className="text-[12px] text-[#9AA0AD] truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <User size={16} /> Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] text-[#5C6070] dark:text-[#8B8FA8] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D] transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <Gear size={16} /> Settings
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileOpen(false)
                      await logout()
                      navigate('/')
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full text-left"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <SignOut size={16} /> Log Out
                  </button>
                </div>
              ) : (
                <div className="mt-auto p-4">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-[14px] text-white bg-[#0066FF] hover:bg-[#0052CC] transition-colors"
                    style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
