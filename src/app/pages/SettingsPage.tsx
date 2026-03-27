import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  User, Lock, Palette, Link as LinkIcon, Plus, X, Check,
  Eye, EyeSlash, Sun, Moon, WarningCircle, Laptop, Camera, Trash,
} from 'phosphor-react'
import { motion, AnimatePresence } from 'motion/react'
import { useSession } from '../../context/SessionContext'
import { useTheme } from '../../context/ThemeContext'
import { usersApi } from '../../lib/api'
import { getAvatarColor, getInitials } from '../../lib/utils'
import { toast } from 'sonner'
import type { UserLink } from '../../lib/types'
import { DashboardLayout } from '../components/layout/DashboardLayout'

// ─── Floating label input ─────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, type = 'text', disabled = false, mono = false, rows,
}: {
  id: string; label: string; value: string; onChange?: (v: string) => void
  type?: string; disabled?: boolean; mono?: boolean; rows?: number
}) {
  const [focused, setFocused] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const raised = focused || value.length > 0
  const inputType = type === 'password' ? (showPwd ? 'text' : 'password') : type

  if (rows) {
    return (
      <div className={`relative rounded-2xl border transition-all duration-150 ${
        disabled
          ? 'opacity-60 bg-[#F2F4F7] dark:bg-[#18181D]'
          : focused
          ? 'border-[#0066FF] shadow-[0_0_0_3px_rgba(0,102,255,0.15)]'
          : 'border-[#E4E7EC] dark:border-[#222229]'
        } bg-white dark:bg-[#111115] overflow-hidden`}>
        <label htmlFor={id} className="absolute left-4 top-3 text-[11px] text-[#9CA3AF]"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>{label}</label>
        <textarea
          id={id} value={value} rows={rows} disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full bg-transparent outline-none px-4 pt-7 pb-3 text-[14px] text-[#0A0A0F] dark:text-[#F5F5F5] resize-none"
          style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)' }}
        />
      </div>
    )
  }

  return (
    <div className={`relative rounded-full border transition-all duration-150 ${
      disabled
        ? 'opacity-60 bg-[#F2F4F7] dark:bg-[#18181D]'
        : focused
        ? 'border-[#0066FF] shadow-[0_0_0_3px_rgba(0,102,255,0.15)]'
        : 'border-[#E4E7EC] dark:border-[#222229]'
      } bg-white dark:bg-[#111115]`}>
      <label htmlFor={id} className={`absolute left-4 transition-all duration-150 pointer-events-none ${
        raised ? 'top-1.5 text-[11px] text-[#9CA3AF]' : 'top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF]'
        }`} style={{ fontFamily: 'var(--font-body)', fontWeight: raised ? 500 : 400 }}>
        {label}
      </label>
      <input
        id={id} type={inputType} value={value} disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full bg-transparent outline-none px-4 rounded-full text-[14px] text-[#0A0A0F] dark:text-[#F5F5F5] ${
          raised ? 'pt-5 pb-2' : 'py-3.5'
        } ${type === 'password' ? 'pr-12' : ''}`}
        style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)' }}
      />
      {type === 'password' && (
        <button type="button" onClick={() => setShowPwd((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5C6070]">
          {showPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative rounded-full transition-all duration-200 flex-shrink-0 ${
        checked ? 'bg-[#0066FF]' : 'bg-[#E5E7EB] dark:bg-[#1C1C1C]'
      }`}
      style={{ height: 22, width: 40 }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'account' | 'appearance'

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'account', label: 'Account' },
  { key: 'appearance', label: 'Appearance' },
]

// ─── Save button states ───────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function SaveBar({
  saveState,
  onSave,
  saveError,
}: {
  saveState: SaveState
  onSave: () => void
  saveError?: string
}) {
  return (
    <div className="flex flex-col gap-2 pt-4 mt-6 border-t border-[#E4E7EC] dark:border-[#222229]">
      {saveState === 'error' && saveError && (
        <p className="text-[13px] text-[#EF4444] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
          <WarningCircle size={14} weight="fill" />{saveError}
        </p>
      )}
      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] transition-all duration-200 disabled:cursor-not-allowed ${
            saveState === 'saved'
              ? 'bg-[#16A34A] text-white'
              : saveState === 'error'
              ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
              : 'bg-[#0066FF] text-white hover:bg-[#0052CC] disabled:opacity-60'
          }`}
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
        >
          {saveState === 'saving' && (
            <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</>
          )}
          {saveState === 'saved' && (
            <><Check size={14} weight="bold" />Saved!</>
          )}
          {(saveState === 'idle' || saveState === 'error') && 'Save changes'}
        </button>
      </div>
    </div>
  )
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, refresh } = useSession()
  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [links, setLinks] = useState<UserLink[]>(user?.links ?? [])
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveError, setSaveError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const handleSave = async () => {
    setSaveState('saving')
    setSaveError('')
    const res = await usersApi.update(user.id, { display_name: displayName, full_name: fullName, bio, links })
    if (res.success) {
      await refresh()
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } else {
      setSaveError('Failed to update profile. Please try again.')
      setSaveState('error')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB.')
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    const res = await usersApi.uploadAvatar(user.id, file)
    if (res.success) {
      await refresh()
      toast.success('Profile photo updated!')
    } else {
      toast.error('Failed to upload photo.')
      setAvatarPreview(user.avatar_url ?? null)
    }
    setUploadingAvatar(false)
  }

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true)
    const res = await usersApi.removeAvatar(user.id)
    if (res.success) {
      setAvatarPreview(null)
      await refresh()
      toast.success('Profile photo removed.')
    } else {
      toast.error('Failed to remove photo.')
    }
    setUploadingAvatar(false)
  }

  const addLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return
    setLinks((prev) => [...prev, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }])
    setNewLinkTitle('')
    setNewLinkUrl('')
  }

  const bgColor = getAvatarColor(user.id)
  const initials = getInitials(user.full_name ?? user.display_name)

  return (
    <div className="space-y-8">

      {/* Avatar row */}
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#9AA0AD] mb-4"
          style={{ fontFamily: 'var(--font-body)' }}>
          Profile Photo
        </h3>
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-[26px] ring-4 ring-[#F0F2F5] dark:ring-[#1C1C1C]"
              style={{ backgroundColor: bgColor, fontFamily: 'var(--font-display)', fontWeight: 700 }}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                : initials}
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </div>
            )}
          </div>

          {/* Info + actions */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[15px] text-[#0A0A0F] dark:text-[#F0F0F5]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {user.full_name ?? user.display_name}
            </p>
            <p className="text-[13px] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => void handleAvatarChange(e)}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] border border-[#E4E7EC] dark:border-[#222229] text-[#0A0A0F] dark:text-[#F0F0F5] hover:border-[#0066FF] hover:text-[#0066FF] transition-colors disabled:opacity-50"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                <Camera size={13} />
                {avatarPreview ? 'Change photo' : 'Upload photo'}
              </button>
              {avatarPreview && (
                <button
                  onClick={() => void handleRemoveAvatar()}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  <Trash size={13} />
                  Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
              JPEG, PNG, WebP or GIF · max 2 MB
            </p>
          </div>
        </div>
      </div>

      <hr className="border-[#E4E7EC] dark:border-[#222229]" />

      {/* Basic info */}
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#9AA0AD] mb-4"
          style={{ fontFamily: 'var(--font-body)' }}>
          Basic Information
        </h3>
        <div className="space-y-4">
          <Field id="disp" label="Display name" value={displayName} onChange={setDisplayName} />
          <Field id="full" label="Full name" value={fullName} onChange={setFullName} />
          <Field id="bio" label="Bio" value={bio} onChange={setBio} rows={3} />

          {user.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="matric" label="Matric number" value={user.matric_no ?? ''} disabled mono />
              <Field id="level" label="Level" value={user.level ? `${user.level} Level` : ''} disabled />
            </div>
          )}
          {user.role === 'supervisor' && (
            <div className="space-y-4">
              <Field id="staffid" label="Staff ID" value={user.staff_id ?? ''} disabled mono />
              <Field id="degrees" label="Degrees" value={user.degrees ?? ''} disabled />
            </div>
          )}
        </div>
      </div>

      <hr className="border-[#E4E7EC] dark:border-[#222229]" />

      {/* Profile links */}
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#9AA0AD] mb-4"
          style={{ fontFamily: 'var(--font-body)' }}>
          Profile Links
        </h3>
        <p className="text-[13px] text-[#9AA0AD] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          Add links to your GitHub, portfolio, or academic profiles.
        </p>

        {links.length > 0 && (
          <div className="space-y-2 mb-4">
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#F2F4F7] dark:bg-[#18181D] border border-[#E4E7EC] dark:border-[#222229]">
                <LinkIcon size={13} className="text-[#0066FF] flex-shrink-0" />
                <span className="flex-1 text-[13px] text-[#0066FF] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                  {link.title} — {link.url}
                </span>
                <button
                  onClick={() => setLinks((prev) => prev.filter((_, li) => li !== i))}
                  className="p-1 rounded-full hover:bg-[#E5E7EB] dark:hover:bg-[#1C1C1C] text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
            placeholder="Title (e.g. GitHub)"
            className="flex-1 rounded-full border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] px-4 py-2.5 text-[13px] text-[#0A0A0F] dark:text-[#F0F0F5] placeholder-[#9CA3AF] outline-none focus:border-[#0066FF] transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <input
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="URL"
            type="url"
            className="flex-1 rounded-full border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] px-4 py-2.5 text-[13px] text-[#0A0A0F] dark:text-[#F0F0F5] placeholder-[#9CA3AF] outline-none focus:border-[#0066FF] transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <button
            onClick={addLink}
            disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
            className="px-4 py-2.5 rounded-full text-[13px] text-white bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            <Plus size={13} />Add
          </button>
        </div>
      </div>

      {/* Save bar */}
      <SaveBar saveState={saveState} onSave={() => void handleSave()} saveError={saveError} />
    </div>
  )
}

// ─── Account tab ──────────────────────────────────────────────────────────────

function AccountTab() {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaveState, setPwSaveState] = useState<SaveState>('idle')
  const [pwError, setPwError] = useState('')

  if (!user) return null

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all fields.')
      setPwSaveState('error')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.')
      setPwSaveState('error')
      return
    }
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.')
      setPwSaveState('error')
      return
    }
    setPwError('')
    setPwSaveState('saving')
    toast.error('Password change is not yet implemented in the backend.')
    setPwSaveState('idle')
  }

  return (
    <div className="space-y-8">

      {/* Email */}
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#9AA0AD] mb-4"
          style={{ fontFamily: 'var(--font-body)' }}>
          Email Address
        </h3>
        <div className="flex items-start justify-between gap-8 py-3">
          <div>
            <p className="text-[14px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5]"
              style={{ fontFamily: 'var(--font-body)' }}>
              {user.email}
            </p>
            <p className="text-[13px] text-[#9AA0AD] mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
              Cannot be changed. Contact your administrator to update your email.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-[#E4E7EC] dark:border-[#222229]" />

      {/* Password */}
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#9AA0AD] mb-4"
          style={{ fontFamily: 'var(--font-body)' }}>
          Change Password
        </h3>
        <div className="space-y-4">
          <Field id="cur-pwd" label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} />
          <Field id="new-pwd" label="New password" type="password" value={newPassword} onChange={setNewPassword} />
          <Field id="conf-pwd" label="Confirm new password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
          <div className="flex flex-col gap-2 pt-2">
            {pwSaveState === 'error' && pwError && (
              <p className="text-[13px] text-[#EF4444] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                <WarningCircle size={14} weight="fill" />{pwError}
              </p>
            )}
            <div>
              <button
                onClick={() => void handleChangePassword()}
                disabled={pwSaveState === 'saving'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] bg-[#0066FF] text-white hover:bg-[#0052CC] disabled:opacity-60 transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                {pwSaveState === 'saving'
                  ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Updating...</>
                  : 'Update password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-[#E4E7EC] dark:border-[#222229]" />

      {/* Account info */}
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#9AA0AD] mb-4"
          style={{ fontFamily: 'var(--font-body)' }}>
          Account Details
        </h3>
        <div className="space-y-0">
          {[
            { label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
            { label: 'Status', value: user.account_status },
            { label: 'Verified', value: user.is_verified ? 'Yes' : 'Pending verification' },
            {
              label: 'Member since',
              value: new Date(user.created_at).toLocaleDateString('en-NG', {
                year: 'numeric', month: 'long', day: 'numeric',
              }),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-[#F2F4F7] dark:border-[#18181D] last:border-0">
              <span className="text-[13px] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
              <span className="text-[13px] text-[#0A0A0F] dark:text-[#F0F0F5]"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#E4E7EC] dark:border-[#222229]" />

      {/* Danger zone */}
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#9AA0AD] mb-4"
          style={{ fontFamily: 'var(--font-body)' }}>
          Danger Zone
        </h3>
        <div className="flex items-start justify-between gap-8 py-3">
          <div>
            <p className="text-[14px] font-medium text-[#0A0A0F] dark:text-[#F0F0F5]"
              style={{ fontFamily: 'var(--font-body)' }}>
              Sign out
            </p>
            <p className="text-[13px] text-[#9AA0AD] mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
              Sign out of your account on this device.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={async () => { await logout(); navigate('/') }}
              className="px-4 py-2 rounded-full text-[13px] border border-[#EF4444] text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Appearance tab ───────────────────────────────────────────────────────────

function AppearanceTab() {
  const { theme, setTheme } = useTheme()

  const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: <Sun size={20} />, description: 'Clean white interface' },
    { value: 'dark', label: 'Dark', icon: <Moon size={20} />, description: 'Easy on the eyes' },
    { value: 'system', label: 'System', icon: <Laptop size={20} />, description: 'Match OS preference' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#9AA0AD] mb-1"
          style={{ fontFamily: 'var(--font-body)' }}>
          Theme
        </h3>
        <p className="text-[13px] text-[#9AA0AD] mb-5" style={{ fontFamily: 'var(--font-body)' }}>
          Choose how Inquisia looks on your device.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => {
            const isActive = option.value !== 'system' && theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => {
                  if (option.value !== 'system') setTheme(option.value as 'light' | 'dark')
                  else toast.info('System theme — coming soon!')
                }}
                className={`relative p-4 rounded-2xl border text-left transition-all duration-150 ${
                  isActive
                    ? 'border-[#0066FF] bg-[rgba(0,102,255,0.03)]'
                    : 'border-[#E4E7EC] dark:border-[#222229] hover:border-[#0066FF]/40 hover:bg-[#F2F4F7] dark:hover:bg-[#18181D]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                  isActive
                    ? 'bg-[rgba(0,102,255,0.1)] text-[#0066FF]'
                    : 'bg-[#F2F4F7] dark:bg-[#18181D] text-[#9CA3AF]'
                }`}>
                  {option.icon}
                </div>
                <p className="text-[14px] text-[#0A0A0F] dark:text-[#F0F0F5]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {option.label}
                </p>
                <p className="text-[12px] text-[#9AA0AD] mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                  {option.description}
                </p>
                {isActive && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#0066FF] flex items-center justify-center">
                    <Check size={11} weight="bold" className="text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { user, isLoading } = useSession()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  useEffect(() => {
    if (!isLoading && !user) navigate('/login?return=/settings')
  }, [user, isLoading, navigate])

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#E4E7EC] border-t-[#0066FF] animate-spin" />
      </div>
    )
  }

  return (
    <DashboardLayout activeSection="settings">
      <div className="max-w-[860px] mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-[#0A0A0F] dark:text-[#F0F0F5] mb-1"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '26px', letterSpacing: '-0.02em' }}
          >
            Settings
          </h1>
          <p className="text-[14px] text-[#9AA0AD]" style={{ fontFamily: 'var(--font-body)' }}>
            Manage your Inquisia account preferences
          </p>
        </div>

        <div className="flex gap-10">

          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0">
            <nav className="flex flex-col gap-0.5">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                      isActive
                        ? 'border-l-2 border-[#0066FF] text-[#0066FF] bg-[rgba(0,102,255,0.06)] pl-[calc(1rem-2px)]'
                        : 'pl-4 text-[#5C6070] dark:text-[#8B8FA8] hover:text-[#0A0A0F] dark:hover:text-[#F0F0F5] hover:bg-[#F2F4F7] dark:hover:bg-[#18181D]'
                    }`}
                    style={{ fontFamily: 'var(--font-body)', fontWeight: isActive ? 500 : 400 }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'account' && <AccountTab />}
                {activeTab === 'appearance' && <AppearanceTab />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
