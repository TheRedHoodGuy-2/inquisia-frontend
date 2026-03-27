import React, { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'phosphor-react'
import { authApi } from '../../lib/api'

// ─── ForgotPasswordPage ───────────────────────────────────────────────────────

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(email.trim())
      if (res.success) {
        setSubmittedEmail(email.trim())
        setSuccess(true)
      } else {
        setError(res.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:px-12 md:py-12">
      <div className="max-w-md mx-auto pt-24">
        <div className="rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-6">
          {success ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center py-4">
              {/* Checkmark icon */}
              <div className="mb-5">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="26" cy="26" r="26" fill="#0066FF1A" />
                  <circle cx="26" cy="26" r="20" stroke="#0066FF" strokeWidth="1.5" fill="none" />
                  <path
                    d="M18 26.5l5.5 5.5 10-11"
                    stroke="#0066FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1
                className="text-[22px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Check your email
              </h1>
              <p
                className="text-[14px] text-[#5C6070] dark:text-[#8B8FA8] mb-8 leading-relaxed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                We've sent a reset link to{' '}
                <span className="font-medium text-[#0A0A0F] dark:text-[#F0F0F5]">{submittedEmail}</span>.
                {' '}It expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl bg-[#0066FF] text-white hover:bg-[#0052CC] text-[14px] font-medium transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Back to login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Back link */}
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[13px] text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0066FF] transition-colors mb-6"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <ArrowLeft size={15} weight="bold" />
                Back to login
              </Link>

              <h1
                className="text-[22px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Forgot your password?
              </h1>
              <p
                className="text-[14px] text-[#5C6070] dark:text-[#8B8FA8] mb-6"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] text-[14px] text-[#0A0A0F] dark:text-[#F0F0F5] placeholder:text-[#9AA0AD] focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF26] transition-all"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0066FF] text-white hover:bg-[#0052CC] text-[14px] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>

                {error && (
                  <p
                    className="text-[13px] text-red-500 dark:text-red-400"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
