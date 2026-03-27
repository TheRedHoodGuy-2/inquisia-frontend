/**
 * GlobalStatusBanner
 * Renders a persistent, non-dismissible banner when the authenticated user
 * has a 'warned' or 'restricted' account status.
 * Design: surface bg + left-border accent by severity.
 */
import React from 'react'
import { WarningCircle, ProhibitInset, Link as LinkIcon } from 'phosphor-react'
import { Link } from 'react-router'
import { useSession } from '../../context/SessionContext'

export function GlobalStatusBanner() {
  const { user } = useSession()

  if (!user || user.account_status === 'active' || user.account_status === 'banned') return null

  const isWarned = user.account_status === 'warned'
  const isRestricted = user.account_status === 'restricted'

  if (!isWarned && !isRestricted) return null

  const config = isWarned
    ? {
        borderColor: 'border-l-[#F59E0B]',
        icon: <WarningCircle size={16} weight="fill" className="text-[#F59E0B] flex-shrink-0 mt-0.5" />,
        label: 'Account Warning',
        labelClasses: 'text-amber-700 dark:text-amber-400',
        message: user.status_reason
          ?? 'Your account has received a formal warning. Continued violations may result in restrictions.',
        blockedActions: null,
      }
    : {
        borderColor: 'border-l-[#EF4444]',
        icon: <ProhibitInset size={16} weight="fill" className="text-[#EF4444] flex-shrink-0 mt-0.5" />,
        label: 'Account Restricted',
        labelClasses: 'text-red-700 dark:text-red-400',
        message: user.status_reason
          ?? 'Your account has been restricted. You cannot submit projects, post comments, or upload revisions.',
        blockedActions: ['Submit projects', 'Post comments', 'Request changes', 'Upload revisions'],
      }

  return (
    <div
      role="alert"
      className={`w-full bg-white dark:bg-[#111115] border-b border-[#E4E7EC] dark:border-[#222229] border-l-4 ${config.borderColor}`}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-3">
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1 min-w-0">
            <span
              className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${config.labelClasses}`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {config.label}
            </span>
            <p
              className="text-[13px] text-[#5C6070] dark:text-[#8B8FA8] mt-0.5 leading-relaxed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {config.message}
              {isRestricted && config.blockedActions && (
                <span className="ml-1 text-[#9AA0AD]">
                  Blocked: {config.blockedActions.join(' · ')}.
                </span>
              )}
              {' '}
              <Link
                to="/settings"
                className="text-[#0066FF] hover:underline inline-flex items-center gap-1"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                Contact support <LinkIcon size={11} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
