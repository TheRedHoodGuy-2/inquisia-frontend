import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Eye, EyeSlash, WarningCircle } from 'phosphor-react'
import { motion } from 'motion/react'
import { useSession } from '../../context/SessionContext'
import { authApi } from '../../lib/api'
import { toast } from 'sonner'
import { InquisiaLogo } from '../components/ui/InquisiaLogo'
import GridMotion from '../components/ui/GridMotion'

// ─── Auth split layout ────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Machine Learning': '#6366F1', 'AI': '#8B5CF6', 'Computer Vision': '#0EA5E9',
  'NLP': '#10B981', 'Cybersecurity': '#EF4444', 'Security': '#F97316',
  'IoT': '#14B8A6', 'Data Science': '#F59E0B', 'Blockchain': '#3B82F6',
  'Robotics': '#EC4899', 'Distributed Systems': '#6B7280', 'Networks': '#84CC16',
  'Software Engineering': '#0066FF', 'Programming Languages': '#A855F7',
}

function ProjectCard({ title, category, year, downloads, tag }: { title: string; category: string; year: number; downloads: number; tag: string }) {
  const accent = CATEGORY_COLORS[category] ?? '#0066FF'
  return (
    <div className="w-full h-full flex flex-col select-none overflow-hidden">
      {/* Colored accent bar */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}66)` }} />
      <div className="flex flex-col justify-between flex-1 p-3">
        <div>
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide" style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}>{category}</span>
          </div>
          <p className="text-white text-[11px] font-semibold leading-snug line-clamp-3" style={{ fontFamily: 'var(--font-display)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{title}</p>
        </div>
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10">
          <span className="text-white/50 text-[9px] font-medium">{tag}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-white/35 text-[9px]">↓{downloads}</span>
            <span className="text-white/25 text-[9px]">·</span>
            <span className="text-white/35 text-[9px]">{year}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const GRID_ITEMS = [
  <ProjectCard key="p1" title="AI-Powered Crop Disease Detection Using Convolutional Neural Networks" category="Machine Learning" year={2025} downloads={312} tag="Agriculture" />,
  <ProjectCard key="p2" title="Blockchain-Based Student Result Verification System" category="Cybersecurity" year={2024} downloads={198} tag="Blockchain" />,
  <ProjectCard key="p3" title="Real-Time Sign Language Translation Using MediaPipe" category="Computer Vision" year={2026} downloads={445} tag="Accessibility" />,
  <ProjectCard key="p4" title="Automated Malware Detection in Android Applications" category="Security" year={2025} downloads={267} tag="Mobile" />,
  <ProjectCard key="p5" title="Smart Campus Energy Management with IoT Sensors" category="IoT" year={2024} downloads={183} tag="Green Tech" />,
  <ProjectCard key="p6" title="Natural Language Processing for Yoruba-English Translation" category="NLP" year={2026} downloads={521} tag="Language" />,
  <ProjectCard key="p7" title="Predictive Analytics for Student Academic Performance" category="Data Science" year={2025} downloads={388} tag="Education" />,
  <ProjectCard key="p8" title="Distributed File Storage System Using IPFS Protocol" category="Distributed Systems" year={2024} downloads={142} tag="Storage" />,
  <ProjectCard key="p9" title="Mental Health Chatbot with Sentiment Analysis" category="AI" year={2026} downloads={609} tag="Health Tech" />,
  <ProjectCard key="p10" title="Autonomous Drone Navigation in GPS-Denied Environments" category="Robotics" year={2025} downloads={234} tag="Embedded" />,
  <ProjectCard key="p11" title="Face Recognition Attendance System Using Deep Learning" category="Computer Vision" year={2024} downloads={477} tag="Biometrics" />,
  <ProjectCard key="p12" title="Decentralized Voting System with Smart Contracts" category="Blockchain" year={2026} downloads={356} tag="E-Governance" />,
  <ProjectCard key="p13" title="Anomaly Detection in Network Traffic Using Autoencoders" category="Cybersecurity" year={2025} downloads={291} tag="Networks" />,
  <ProjectCard key="p14" title="A Recommendation Engine for Nigerian E-Commerce Platforms" category="Machine Learning" year={2024} downloads={418} tag="E-Commerce" />,
  <ProjectCard key="p15" title="Speech-to-Text System for Low-Resource Nigerian Languages" category="NLP" year={2026} downloads={537} tag="Igbo · Hausa" />,
  <ProjectCard key="p16" title="Smart Irrigation System Using Soil Moisture Prediction" category="IoT" year={2025} downloads={165} tag="Agritech" />,
  <ProjectCard key="p17" title="Real-Time Object Detection for Visually Impaired Users" category="Computer Vision" year={2024} downloads={392} tag="Assistive Tech" />,
  <ProjectCard key="p18" title="Federated Learning for Privacy-Preserving Medical Diagnosis" category="AI" year={2026} downloads={488} tag="Healthcare" />,
  <ProjectCard key="p19" title="Optimizing Campus Wi-Fi Coverage with Genetic Algorithms" category="Networks" year={2025} downloads={129} tag="Optimization" />,
  <ProjectCard key="p20" title="Deepfake Detection Using Frequency Domain Analysis" category="Cybersecurity" year={2024} downloads={573} tag="Media" />,
  <ProjectCard key="p21" title="Cloud-Based Electronic Health Records System" category="Software Engineering" year={2026} downloads={341} tag="Healthcare" />,
  <ProjectCard key="p22" title="Traffic Flow Prediction Using LSTM Neural Networks" category="Data Science" year={2025} downloads={256} tag="Smart City" />,
  <ProjectCard key="p23" title="Compiler Design for a Nigerian Pidgin Programming Language" category="Programming Languages" year={2024} downloads={712} tag="🇳🇬 Unique" />,
  <ProjectCard key="p24" title="Quantum-Resistant Cryptography Implementation Study" category="Cybersecurity" year={2026} downloads={198} tag="Quantum" />,
  <ProjectCard key="p25" title="Stroke Prediction Using Ensemble Machine Learning" category="Machine Learning" year={2025} downloads={429} tag="Healthcare" />,
  <ProjectCard key="p26" title="Scalable Microservices Architecture for EdTech Platforms" category="Software Engineering" year={2024} downloads={317} tag="Education" />,
  <ProjectCard key="p27" title="Emotion Recognition From EEG Signals Using CNN-LSTM" category="AI" year={2026} downloads={483} tag="Neuroscience" />,
  <ProjectCard key="p28" title="Automated Code Review Using Large Language Models" category="AI" year={2025} downloads={596} tag="DevTools" />,
]

function RightPanel() {
  return (
    <div className="hidden lg:flex relative flex-1 bg-[#020B18] overflow-hidden">
      {/* Grid fills the entire panel */}
      <div className="absolute inset-0">
        <GridMotion items={GRID_ITEMS} gradientColor="rgba(0,10,30,0.8)" />
      </div>
      {/* Dark vignette overlay so the center text pops */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020B18]/60 via-transparent to-[#020B18]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020B18]/40 via-transparent to-[#020B18]/40 pointer-events-none" />
      {/* Center label */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full text-center px-12 pointer-events-none">
        <h2 className="text-white text-[38px] leading-tight mb-3 drop-shadow-lg" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em' }}>
          The academic research<br />platform Babcock deserves.
        </h2>
        <p className="text-white/60 text-[15px]" style={{ fontFamily: 'var(--font-body)' }}>
          Browse thousands of final year projects<br />from Nigeria's leading university.
        </p>
      </div>
    </div>
  )
}

// ─── Floating label input ─────────────────────────────────────────────────────

interface FloatingInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string
  autoComplete?: string
}

function FloatingInput({ id, label, type = 'text', value, onChange, error, autoComplete }: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const raised = focused || value.length > 0
  const inputType = type === 'password' ? (showPwd ? 'text' : 'password') : type

  return (
    <div className="relative">
      <div
        className={`relative rounded-full border transition-all duration-150 ${error
          ? 'border-red-500'
          : focused
            ? 'border-[#0066FF] shadow-[0_0_0_3px_rgba(0,102,255,0.15)]'
            : 'border-[#E4E7EC] dark:border-[#222229]'
          } bg-white dark:bg-[#111115]`}
      >
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-150 pointer-events-none ${raised
            ? 'top-1.5 text-[11px] text-[#9CA3AF]'
            : 'top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF]'
            }`}
          style={{ fontFamily: 'var(--font-body)', fontWeight: raised ? 500 : 400 }}
        >
          {label}
        </label>
        <input
          id={id}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-transparent outline-none px-4 rounded-full text-[14px] text-[#0A0A0F] dark:text-[#F5F5F5] ${raised ? 'pt-5 pb-2' : 'py-3.5'}`}
          style={{ fontFamily: 'var(--font-body)' }}
        />
        {type === 'password' && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5C6070]"
          >
            {showPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 mt-1.5 ml-4 text-[12px] text-red-500" style={{ fontFamily: 'var(--font-body)' }}>
          <WarningCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────

export function LoginPage() {
  const { login } = useSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError(null)

    const res = await authApi.login(email, password)
    if (res.success) {
      login(res.data)
      toast.success('Welcome back!')
      navigate(returnUrl, { replace: true })
    } else {
      setError(res.error || 'Invalid email or password. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col px-8 py-12 max-w-lg mx-auto lg:mx-0">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-12">
          <InquisiaLogo className="w-7 h-7" />
          <span className="text-[17px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            inquisia.
          </span>
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em' }}
            className="mb-2 text-[#0A0A0F] dark:text-[#F5F5F5]"
          >
            Welcome Back
          </h1>
          <p className="text-[15px] text-[#5C6070] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-body)' }}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
            >
              <p className="text-[13px] text-red-600 dark:text-red-400 flex items-center gap-2" style={{ fontFamily: 'var(--font-body)' }}>
                <WarningCircle size={14} />
                {error}
              </p>
            </motion.div>
          )}

          <FloatingInput
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />

          <FloatingInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[13px] text-[#5C6070] hover:text-[#0066FF] transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-[14px] text-white bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E4E7EC] dark:bg-[#222229]" />
          <span className="text-[12px] text-[#9CA3AF]">or</span>
          <div className="flex-1 h-px bg-[#E4E7EC] dark:bg-[#222229]" />
        </div>

        <p className="mt-6 text-center text-[14px] text-[#5C6070] dark:text-[#8B8FA8]" style={{ fontFamily: 'var(--font-body)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="text-[#0066FF] hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>

      {/* Right — Decorative */}
      <RightPanel />
    </div>
  )
}
