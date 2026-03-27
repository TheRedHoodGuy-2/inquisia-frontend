import React from 'react'
import { Link } from 'react-router'
import { InquisiaLogo } from '../ui/InquisiaLogo'

// ─── Dot-text wordmark ─────────────────────────────────────────────────────────
// Uses SVG clipPath to render dots only inside the letterforms — matching the
// particle/stipple wordmark style from the brand reference.

function DotWordmark() {
  return (
    <svg
      viewBox="0 0 1200 220"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      className="w-full"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Dense dot grid */}
        <pattern id="footer-dot-grid" x="0" y="0" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="2.2" fill="white" />
        </pattern>
        {/* Clip the dots to the wordmark letterforms */}
        <clipPath id="wordmark-clip">
          <text
            x="50%"
            y="195"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontSize="200"
            fontWeight="800"
            letterSpacing="-8"
          >
            inquisia.
          </text>
        </clipPath>
      </defs>
      {/* Full rect, clipped to text shape → dots only inside letters */}
      <rect
        x="0" y="0" width="1200" height="220"
        fill="url(#footer-dot-grid)"
        clipPath="url(#wordmark-clip)"
        opacity="0.9"
      />
    </svg>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer
      className="overflow-hidden relative"
      style={{ backgroundColor: '#0066FF' }}
    >
      {/* ── Content ── */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-12 pt-14 pb-0">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0 mb-10">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 select-none group">
            <InquisiaLogo variant="dark" className="w-7 h-7" />
            <span
              className="text-white text-[18px] leading-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              inquisia.
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {[
              { to: '/projects', label: 'Browse Projects' },
              { to: '/elara', label: 'Elara AI' },
              { to: '/help', label: 'Help' },
              { to: '/submission-rules', label: 'Submission Rules' },
              { to: '/login', label: 'Sign In' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-[rgba(255,255,255,0.7)] hover:text-white text-[14px] transition-colors duration-150"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.2)] mb-5" />

        {/* Bottom strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-0 pb-5">
          <span
            className="text-[rgba(255,255,255,0.55)] text-[13px]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            © {new Date().getFullYear()} Inquisia. All rights reserved.
          </span>
          <span
            className="text-[rgba(255,255,255,0.55)] text-[13px]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Developed by Babcock University CS Department
          </span>
        </div>
      </div>

      {/* ── Dot wordmark (decorative, bleeds out at bottom) ── */}
      <div className="relative w-full -mb-2 pointer-events-none select-none" style={{ marginTop: '-10px' }}>
        <DotWordmark />
      </div>
    </footer>
  )
}
