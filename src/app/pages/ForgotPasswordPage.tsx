import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'phosphor-react'
import { authApi } from '../../lib/api'

// ─── ForgotPasswordPage ───────────────────────────────────────────────────────
// Flow: enter email → enter 6-digit OTP → redirect to /reset-password?token=...

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step === 'otp') inputRefs.current[0]?.focus()
  }, [step])

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(email.trim())
      if (res.success) {
        setStep('otp')
      } else {
        setError((res as any).error ?? 'Something went wrong.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError(null)
    try {
      await authApi.forgotPassword(email.trim())
    } catch {}
    setResending(false)
  }

  function handleOtpChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (!digit && idx > 0) inputRefs.current[idx - 1]?.focus()
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the full 6-digit code.'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.verifyResetOtp(email.trim(), code)
      if (res.success) {
        navigate(`/reset-password?token=${res.data.reset_token}`)
      } else {
        setError((res as any).error ?? 'Invalid or expired code.')
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
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
          {step === 'email' ? (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[13px] text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0066FF] transition-colors mb-6"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <ArrowLeft size={15} weight="bold" />
                Back to login
              </Link>
              <h1 className="text-[22px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Forgot your password?
              </h1>
              <p className="text-[14px] text-[#5C6070] dark:text-[#8B8FA8] mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                Enter your email and we'll send you a 6-digit reset code.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[13px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5]" style={{ fontFamily: 'var(--font-body)' }}>
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
                  {loading ? <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Sending…</> : 'Send code'}
                </button>
                {error && <p className="text-[13px] text-red-500 dark:text-red-400" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>}
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(null) }}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0066FF] transition-colors mb-6"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <ArrowLeft size={15} weight="bold" />
                Change email
              </button>
              <h1 className="text-[22px] font-semibold text-[#0A0A0F] dark:text-[#F0F0F5] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Enter your code
              </h1>
              <p className="text-[14px] text-[#5C6070] dark:text-[#8B8FA8] mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                We sent a 6-digit code to <span className="font-medium text-[#0A0A0F] dark:text-[#F0F0F5]">{email}</span>. It expires in 15 minutes.
              </p>
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) inputRefs.current[i - 1]?.focus() }}
                      className="w-11 h-12 text-center text-[20px] font-bold rounded-xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] text-[#0A0A0F] dark:text-[#F0F0F5] focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF26] transition-all"
                      style={{ fontFamily: 'var(--font-display)' }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0066FF] text-white hover:bg-[#0052CC] text-[14px] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {loading ? <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Verifying…</> : 'Verify code'}
                </button>
                {error && <p className="text-[13px] text-red-500 dark:text-red-400 text-center" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>}
                <p className="text-center text-[13px] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
                  Didn't receive it?{' '}
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResend}
                    className="text-[#0066FF] hover:underline disabled:opacity-50"
                  >
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
