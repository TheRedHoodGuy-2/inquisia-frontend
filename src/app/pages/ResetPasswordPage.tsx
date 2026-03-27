import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { Eye, EyeSlash } from 'phosphor-react'
import { toast } from 'sonner'
import { authApi } from '../../lib/api'

// ─── ResetPasswordPage ────────────────────────────────────────────────────────

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)

  function validate(): boolean {
    const errors: { password?: string; confirm?: string } = {}
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }
    if (password !== confirm) {
      errors.confirm = 'Passwords do not match.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authApi.resetPassword(token!, password)
      if (res.success) {
        toast.success('Password updated. Please sign in.')
        navigate('/login')
      } else {
        const msg = res.error ?? ''
        if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('token')) {
          setApiError('This reset link is invalid or has expired.')
        } else {
          setApiError(msg || 'Something went wrong. Please try again.')
        }
      }
    } catch {
      setApiError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── No token guard ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:px-12 md:py-12">
        <div className="max-w-md mx-auto pt-24">
          <div className="rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-6 text-center">
            <div className="mb-4">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                <circle cx="24" cy="24" r="24" fill="#FEF2F2" />
                <path d="M24 14v14M24 32v2" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h1
              className="text-[20px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Invalid reset link
            </h1>
            <p
              className="text-[14px] text-[#5C6070] dark:text-[#8B8FA8] mb-6"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Invalid or missing reset token.
            </p>
            <Link
              to="/forgot-password"
              className="px-4 py-2.5 rounded-xl bg-[#0066FF] text-white hover:bg-[#0052CC] text-[14px] font-medium transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:px-12 md:py-12">
      <div className="max-w-md mx-auto pt-24">
        <div className="rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-6">
          <h1
            className="text-[22px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Set a new password
          </h1>
          <p
            className="text-[14px] text-[#5C6070] dark:text-[#8B8FA8] mb-6"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Choose a strong password for your account.
          </p>

          {/* Token-level API error */}
          {apiError && apiError.includes('invalid or has expired') && (
            <div className="mb-4 p-3.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
              <p
                className="text-[13px] text-red-600 dark:text-red-400 mb-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {apiError}
              </p>
              <Link
                to="/forgot-password"
                className="text-[13px] font-medium text-[#0066FF] hover:text-[#0052CC] transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Request a new link →
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }))
                  }}
                  placeholder="Min. 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] text-[14px] text-[#0A0A0F] dark:text-[#F0F0F5] placeholder:text-[#9AA0AD] focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF26] transition-all"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA0AD] hover:text-[#5C6070] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="text-[12px] text-red-500 dark:text-red-400" style={{ fontFamily: 'var(--font-body)' }}>
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="text-[12px] text-[#9AA0AD] dark:text-[#4A4D5E]" style={{ fontFamily: 'var(--font-body)' }}>
                  At least 8 characters
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm"
                className="block text-[13px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value)
                    if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: undefined }))
                  }}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] text-[14px] text-[#0A0A0F] dark:text-[#F0F0F5] placeholder:text-[#9AA0AD] focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF26] transition-all"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA0AD] hover:text-[#5C6070] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirm && (
                <p className="text-[12px] text-red-500 dark:text-red-400" style={{ fontFamily: 'var(--font-body)' }}>
                  {fieldErrors.confirm}
                </p>
              )}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Updating…
                </>
              ) : (
                'Update password'
              )}
            </button>

            {/* Generic API error (non-token) */}
            {apiError && !apiError.includes('invalid or has expired') && (
              <p
                className="text-[13px] text-red-500 dark:text-red-400"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {apiError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
