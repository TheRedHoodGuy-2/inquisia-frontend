import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle, WarningCircle } from 'phosphor-react'
import { motion } from 'motion/react'
import { authApi } from '../../lib/api'
import { useSession } from '../../context/SessionContext'
import { InquisiaLogo } from '../components/ui/InquisiaLogo'
import { toast } from 'sonner'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const { user, refresh } = useSession()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // If already verified, skip to dashboard
    if (user?.is_verified) {
      navigate('/dashboard', { replace: true })
    }
    inputRefs.current[0]?.focus()
  }, [user, navigate])

  function handleChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (otp[idx]) {
        const next = [...otp]; next[idx] = ''; setOtp(next)
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus()
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the full 6-digit code.'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(code)
      if (res.success) {
        await refresh?.()
        toast.success('Email verified! Welcome to Inquisia.')
        navigate('/dashboard', { replace: true })
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

  async function handleResend() {
    setResending(true)
    setError(null)
    try {
      await authApi.resendOtp()
      setResent(true)
      setTimeout(() => setResent(false), 5000)
    } catch {}
    setResending(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <InquisiaLogo className="w-7 h-7" />
          <span className="text-[17px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            inquisia.
          </span>
        </div>

        <div className="rounded-2xl border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] p-7 shadow-sm">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#0066FF]/10 flex items-center justify-center">
              <CheckCircle size={24} weight="fill" className="text-[#0066FF]" />
            </div>
          </div>

          <h1
            className="text-[22px] font-bold text-center text-[#0A0A0F] dark:text-[#F5F5F5] mb-2"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Verify your email
          </h1>
          <p className="text-[14px] text-center text-[#5C6070] dark:text-[#8B8FA8] mb-6" style={{ fontFamily: 'var(--font-body)' }}>
            We sent a 6-digit code to{' '}
            <span className="font-medium text-[#0A0A0F] dark:text-[#F5F5F5]">{user?.email ?? 'your email'}</span>.
            <br />Enter it below to activate your account.
          </p>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            {/* OTP inputs */}
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-13 text-center text-[22px] font-bold rounded-xl border transition-all
                    ${d ? 'border-[#0066FF] bg-[#0066FF]/5 text-[#0066FF]' : 'border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] text-[#0A0A0F] dark:text-[#F5F5F5]'}
                    focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF26]`}
                  style={{ fontFamily: 'var(--font-display)', height: '52px', width: '44px' }}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-[13px] text-red-500"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <WarningCircle size={14} />{error}
              </motion.p>
            )}

            {/* Resent confirmation */}
            {resent && (
              <p className="text-center text-[13px] text-[#16A34A]" style={{ fontFamily: 'var(--font-body)' }}>
                Code resent — check your inbox.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full py-3 rounded-full text-[14px] text-white bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              {loading
                ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : 'Verify account'}
            </button>

            <p className="text-center text-[13px] text-[#9CA3AF]" style={{ fontFamily: 'var(--font-body)' }}>
              Didn't receive it?{' '}
              <button
                type="button"
                disabled={resending}
                onClick={() => void handleResend()}
                className="text-[#0066FF] hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
