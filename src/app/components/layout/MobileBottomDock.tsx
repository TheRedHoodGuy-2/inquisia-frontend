import React from 'react'
import { Link, useLocation } from 'react-router'
import {
  House,
  MagnifyingGlass,
  SquaresFour,
  User,
  UploadSimple,
  BookmarkSimple,
  Bell,
  SignIn,
} from 'phosphor-react'
import { useSession } from '../../../context/SessionContext'

interface DockItem {
  icon: React.ReactNode
  activeIcon: React.ReactNode
  label: string
  href: string
}

export function MobileBottomDock() {
  const { user } = useSession()
  const location = useLocation()

  const getRoleItem = (): DockItem => {
    if (!user) {
      return {
        icon: <SignIn size={22} weight="regular" />,
        activeIcon: <SignIn size={22} weight="fill" />,
        label: 'Login',
        href: '/login',
      }
    }
    if (user.role === 'student') {
      return {
        icon: <UploadSimple size={22} weight="regular" />,
        activeIcon: <UploadSimple size={22} weight="fill" />,
        label: 'Upload',
        href: '/upload',
      }
    }
    if (user.role === 'public') {
      return {
        icon: <BookmarkSimple size={22} weight="regular" />,
        activeIcon: <BookmarkSimple size={22} weight="fill" />,
        label: 'Saved',
        href: '/bookmarks',
      }
    }
    return {
      icon: <SquaresFour size={22} weight="regular" />,
      activeIcon: <SquaresFour size={22} weight="fill" />,
      label: 'Dashboard',
      href: '/dashboard',
    }
  }

  const items: DockItem[] = [
    {
      icon: <House size={22} weight="regular" />,
      activeIcon: <House size={22} weight="fill" />,
      label: 'Home',
      href: '/',
    },
    {
      icon: <MagnifyingGlass size={22} weight="regular" />,
      activeIcon: <MagnifyingGlass size={22} weight="fill" />,
      label: 'Browse',
      href: '/projects',
    },
    getRoleItem(),
    {
      icon: <Bell size={22} weight="regular" />,
      activeIcon: <Bell size={22} weight="fill" />,
      label: 'Alerts',
      href: '/notifications',
    },
    {
      icon: <User size={22} weight="regular" />,
      activeIcon: <User size={22} weight="fill" />,
      label: 'Profile',
      href: user ? `/profile/${user.id}` : '/login',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-white dark:bg-[#111115] border-t border-[#E4E7EC] dark:border-[#222229] shadow-[0_-1px_0_0_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive =
            item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href)

          return (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[56px]"
            >
              <span className={`transition-colors duration-150 ${isActive ? 'text-[#0066FF]' : 'text-[--color-text-muted]'}`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span
                className={`text-[10px] transition-colors duration-150 ${isActive ? 'text-[#0066FF] font-semibold' : 'text-[--color-text-muted]'}`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-[#0066FF]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
