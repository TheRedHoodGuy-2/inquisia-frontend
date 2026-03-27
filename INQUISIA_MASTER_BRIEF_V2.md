# INQUISIA — MASTER BRIEF V2
### For Claude Code. Read this entire document before touching any file.
### This supersedes INQUISIA_MASTER_BRIEF.md. If both exist, use this one.

---

## 0. CONTEXT

**Project:** Inquisia — academic project repository for Babcock University, Faculty of Computing and Engineering Sciences.
**Developer:** Xavier. This is real. It will be assessed. Treat every line like it ships.
**Two repos:**
- `inquisia.v2` — Next.js **15** backend (API only, no UI)
- `inquisia.f1` — Vite + React 18 frontend (SPA)

---

## 1. ACCURATE TECH STACK

### Backend (`inquisia.v2`)
- **Next.js 15** App Router, API routes only — no pages, no UI
- **Supabase** — PostgreSQL + pgvector + Storage
- **Google Generative AI SDK** — `gemma-3-27b-it` (text), `gemini-embedding-001` (768-D embeddings)
- **bcryptjs** — password hashing (cost 10)
- **Zod** — all request bodies validated before service logic
- **pdf-parse** — PDF text extraction
- **Custom session auth** — UUID tokens in `sessions` table, `httpOnly` cookie `inquisia_session`

### Frontend (`inquisia.f1`)
- **React 18 + Vite + TypeScript**
- **React Router v7** (lazy-loaded pages)
- **Tailwind CSS v4**
- **Radix UI primitives** + shadcn/ui pattern
- **React Hook Form + Zod** — client-side validation mirrors backend schemas
- **Phosphor React** (primary icon set) + Lucide React (secondary)
- **Sonner** — toast notifications
- **React Markdown + remark-gfm** — renders AI responses
- **Motion / Framer Motion v12** — animations
- **pdf.js (pdfjs-dist)** — client-side PDF viewing and text extraction
- **Recharts** — charts

---

## 2. THE DESIGN SYSTEM — ENFORCE THIS ACROSS EVERY FILE

This is the single visual language. No deviations.

### Brand Colors
```css
--color-brand:       #0066FF;
--color-brand-hover: #0052CC;
--color-brand-dim:   rgba(0, 102, 255, 0.12);
--color-brand-glow:  rgba(0, 102, 255, 0.25);
```

### Neutral Palette
```css
/* Light mode */
--color-bg:              #F8F9FB;
--color-surface:         #FFFFFF;
--color-surface-raised:  #F2F4F7;
--color-border:          #E4E7EC;
--color-border-strong:   #C9CDD6;

/* Dark mode */
--color-bg-dark:             #0C0C0F;
--color-surface-dark:        #111115;
--color-surface-raised-dark: #18181D;
--color-border-dark:         #222229;
--color-border-strong-dark:  #2E2E38;
```

### Text Colors
```css
--color-text-primary:        #0A0A0F;
--color-text-secondary:      #5C6070;
--color-text-muted:          #9AA0AD;
--color-text-primary-dark:   #F0F0F5;
--color-text-secondary-dark: #8B8FA8;
--color-text-muted-dark:     #4A4D5E;
```

### Semantic Colors
```css
--color-success: #00B37E;
--color-warning: #F59E0B;
--color-danger:  #EF4444;
--color-info:    #0066FF;
```

### Typography — CRITICAL: Do NOT use Inter, Roboto, or Arial
```css
--font-display: 'Syne', sans-serif;        /* All headings */
--font-body:    'DM Sans', sans-serif;     /* All body text, UI */
--font-mono:    'JetBrains Mono', monospace; /* Code, mono values */
```

Add to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale
```
h1:      2.25rem  | 700 | Syne    | letter-spacing: -0.02em
h2:      1.75rem  | 700 | Syne    | letter-spacing: -0.02em
h3:      1.25rem  | 600 | Syne
h4:      1.0rem   | 600 | DM Sans
body:    0.9375rem| 400 | DM Sans | line-height: 1.6
small:   0.8125rem| 400 | DM Sans
caption: 0.75rem  | 500 | DM Sans | letter-spacing: 0.01em | UPPERCASE
mono:    0.875rem |     | JetBrains Mono
```

### Spacing System (base unit: 4px)
```
xs: 4px | sm: 8px | md: 12px | lg: 16px | xl: 24px | 2xl: 32px | 3xl: 48px
```

### Border Radius
```css
--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-xl:   24px;
--radius-full: 9999px;
```

### Component Patterns

**Cards:**
- `background: var(--color-surface)` | `border: 1px solid var(--color-border)` | `border-radius: var(--radius-lg)` | `padding: 24px`
- NO box-shadow — borders define the card
- Hover: `background: var(--color-surface-raised)` transition (150ms ease)

**Buttons:**
```
Primary:   bg-[#0066FF] text-white hover:bg-[#0052CC] rounded-xl px-4 py-2.5 font-medium text-[14px]
Secondary: bg-transparent border border-[--color-border] hover:bg-[--color-surface-raised] rounded-xl px-4 py-2.5
Ghost:     bg-transparent text-[--color-text-secondary] hover:bg-[--color-surface-raised] hover:text-[--color-text-primary]
Danger:    bg-[#EF4444] text-white hover:bg-[#DC2626]
All:       transition-all duration-150 | font-[--font-body]
```

**Inputs:**
```
bg-[--color-surface] border border-[--color-border] rounded-lg px-3.5 py-2.5 text-[14px]
focus: border-[#0066FF] ring-2 ring-[--color-brand-dim] outline-none
placeholder: text-[--color-text-muted]
font: var(--font-body)
```

**Status Badges (ALL use pill shape — rounded-full):**
```
pending:            bg-amber-50    text-amber-800   dark:bg-amber-950/40   dark:text-amber-300
approved/published: bg-emerald-50  text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300
changes_requested:  bg-red-50      text-red-800     dark:bg-red-950/40     dark:text-red-300
under_review:       bg-blue-50     text-blue-800    dark:bg-blue-950/40    dark:text-blue-300
rejected:           bg-gray-100    text-gray-700    dark:bg-gray-900       dark:text-gray-400
All: text-[12px] font-[500] px-2.5 py-1 rounded-full font-[--font-body] tracking-[0.01em]
```

### Layout Rules
- Max content width: `1200px` centered `mx-auto`
- Dashboard sidebar: `240px` desktop, `64px` icon-only collapsed
- Page padding: `px-6 py-8` (md+), `px-4 py-6` (mobile)
- Section gap: `gap-6`
- Shadows: **only** for floating elements (modals, dropdowns, popovers, toasts)
  - Float shadow: `0 8px 32px rgba(0,0,0,0.12)` light | `0 8px 32px rgba(0,0,0,0.4)` dark

---

## 3. EXISTING CODEBASE — ACCURATE MAP

### Backend routes that EXIST (do not recreate):
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/verify-otp
POST /api/auth/resend-otp
GET  /api/auth/session

GET  /api/projects/public          (browse, search, filter, paginate)
GET  /api/projects                 (user's own projects)
POST /api/projects                 (submit new project)
GET/PUT/DELETE /api/projects/[id]
GET  /api/projects/[id]/public
PATCH /api/projects/[id]/status
GET  /api/projects/[id]/versions
POST /api/projects/[id]/revision
POST /api/projects/[id]/resubmit
GET  /api/projects/[id]/download
GET  /api/projects/[id]/related
POST /api/projects/[id]/change-request
GET  /api/projects/[id]/ai/summary
GET  /api/projects/[id]/ai/analysis
POST /api/projects/[id]/ai/chat
GET  /api/projects/[id]/ai/compare-versions

POST /api/ai/assistant
POST /api/ai/elara
POST /api/ai/extract
POST /api/ai/validate
POST /api/ai/suggest-categories

GET  /api/notifications
POST /api/notifications/read       (mark all read)
PATCH /api/notifications/[id]/read (mark one read)
DELETE /api/notifications          (delete all)

GET/POST   /api/bookmarks
DELETE     /api/bookmarks/[id]
GET        /api/departments
GET        /api/supervisors
GET        /api/ai-categories
GET        /api/public/stats
GET/PUT    /api/users/[id]
POST/DELETE /api/users/[id]/avatar
GET        /api/users/lookup

GET    /api/supervisor/projects
GET    /api/supervisor/change-requests
PATCH  /api/projects/[id]/change-request/[crid]/resolve (or similar)
PATCH  /api/projects/[id]/change-request/[crid]/withdraw

All /api/admin/* routes (users, projects, departments, ai-categories, export)
```

### DB tables that EXIST (do not recreate):
```sql
users, sessions, projects, project_authors, project_versions,
project_embeddings, comments, change_requests, notifications,
bookmarks, departments, ai_categories, ai_usage_stats
```

**`notifications` table:** `id, user_id, type, message, is_read, created_at`
Note: no `reference_id` or `link` column — the `type` field is used to infer navigation target on the frontend.

**`ai_usage_stats` table:** `id, user_id, feature_type, usage_count, window_start`

### Frontend API modules that EXIST in `src/lib/api.ts`:
```
authApi, publicApi, projectsApi, supervisorApi, adminApi,
aiApi, commentsApi, usersApi, bookmarksApi, notificationsApi
```

### Frontend pages that EXIST:
```
HomePage, LoginPage, RegisterPage, BrowsePage, ProjectDetailPage,
ProfilePage, UploadPage, DashboardPage, ElaraPage, SettingsPage,
BookmarksPage, DangerZonePage, NotFoundPage,
AdminPage, AdminUsersPage, AdminProjectsPage, AdminSupervisorsPage,
AdminDepartmentsPage, AdminCategoriesPage, AdminFlaggedCommentsPage
```

---

## 4. WHAT MUST BE BUILT — PHASED PLAN

Execute phases in order. Do not start the next phase until the current one is verified.

---

### PHASE 1 — Design System Foundation
**Goal:** Consistent visual language across ALL existing files before adding anything new.

#### Step 1: CSS Variables + Typography
In `src/styles/` (or wherever global CSS lives), define all CSS variables from Section 2. Add font imports to `index.html`.

#### Step 2: Component Library Audit
Update EVERY file in `src/app/components/ui/` to use the new design system. Check every Radix primitive wrapper. Remove all hardcoded colors that don't match the palette.

#### Step 3: Layout Components
- `Navbar.tsx` — redesign: cleaner, more intentional. Brand mark left. Nav links center. User controls right. Notification bell → navigates to `/notifications`. Mobile: hamburger into slide-over drawer.
- `DashboardLayout.tsx` — sidebar redesign: `240px` with icon+label items, collapsible to `64px` icon-only. Role-filtered items. Active state: `bg-[--color-brand-dim]` with `text-[--color-brand]` and a `3px` left accent bar.
- `Footer.tsx` — minimal, 2-column max. Brand left, links right.
- `MobileBottomDock.tsx` — 5 items max, active tab gets brand color accent.

#### Step 4: Shared Components
- `StatusBadge.tsx` — use badge system from Section 2
- `SkeletonPrimitives.tsx` — match new surface colors
- `EmptyState.tsx` — illustrated (use a simple SVG inline), headline + subtext + optional CTA button
- `GlobalStatusBanner.tsx` — clean banner with left-border accent by severity

#### Step 5: Page-level Audit
Go through EVERY existing page and fix:
1. Font — Syne for headings, DM Sans everywhere else
2. Colors — only palette colors, no random tailwind grays
3. Spacing — consistent with the spacing system
4. Dark mode — every element must have a dark variant
5. Empty states — designed, not just "no items found" text
6. Loading states — skeleton loaders (not spinners) for list/grid content

**Design audit checklist (run for every component/page):**
- [ ] Uses correct fonts?
- [ ] Uses only palette colors?
- [ ] Has dark mode variants?
- [ ] Has empty state?
- [ ] Has loading state?
- [ ] Works at 375px width?
- [ ] Consistent with adjacent components?

---

### PHASE 2 — New Pages

#### 2A. Password Recovery Flow

**Backend — new routes to create:**

`POST /api/auth/forgot-password`
```ts
// Body: { email: string }
// 1. Look up user by email (don't reveal if not found — always return success)
// 2. Generate reset token: crypto.randomUUID()
// 3. Store in users table: reset_token, reset_token_expires_at (now + 1 hour)
// 4. Send email via email.service.ts with reset link: ${APP_URL}/reset-password?token=TOKEN
// Returns: { success: true, message: "If an account exists, a reset link has been sent." }
```

`POST /api/auth/reset-password`
```ts
// Body: { token: string, password: string }
// 1. Find user by reset_token where reset_token_expires_at > now
// 2. If not found: { success: false, error: "Reset link is invalid or has expired." }
// 3. Hash new password with bcrypt
// 4. Update password_hash, clear reset_token + reset_token_expires_at
// 5. Delete all existing sessions for this user (force re-login)
// Returns: { success: true }
```

**Migration:**
```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)
  WHERE reset_token IS NOT NULL;
```

**Frontend — new files:**
- `src/app/pages/ForgotPasswordPage.tsx`
  - Email input, submit button
  - On success: show confirmation state (don't navigate away)
  - "Back to login" link
  - Call: `authApi.forgotPassword(email)` (add this to api.ts)

- `src/app/pages/ResetPasswordPage.tsx`
  - Reads `?token=` from URL
  - Two inputs: new password + confirm password
  - Client validation: min 8 chars, match check
  - On success: navigate to `/login` with toast "Password updated successfully"
  - On token error: clear form, show error with "Request a new link" CTA
  - Call: `authApi.resetPassword(token, password)` (add this to api.ts)

**Add to routes.tsx:**
```tsx
{ path: 'forgot-password', element: <Lazy><GuestOnlyRoute><ForgotPasswordPage /></GuestOnlyRoute></Lazy> }
{ path: 'reset-password', element: <Lazy><GuestOnlyRoute><ResetPasswordPage /></GuestOnlyRoute></Lazy> }
```

**Add "Forgot password?" link to LoginPage** (below password field).

**Add to api.ts under `authApi`:**
```ts
forgotPassword: (email: string) =>
  apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
resetPassword: (token: string, password: string) =>
  apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
```

---

#### 2B. Notifications Page

**Existing infrastructure:** `notificationsApi` exists. Backend routes exist. `notifications` table exists with `id, user_id, type, message, is_read, created_at`.

**What's missing:** A dedicated full page. The Navbar currently only has mark-as-read and delete-all in a dropdown — no navigation on click.

**Backend — extend notification routes:**

The existing `DELETE /api/notifications` deletes ALL. Add:
`DELETE /api/notifications/[id]` — delete single notification

The `notifications` table has `type` and `message`. Notification types to handle:
```
project_status_change | revision_requested | comment_posted |
change_request_submitted | change_request_resolved | new_submission | system
```

**Frontend — `src/app/pages/NotificationsPage.tsx`:**

Requirements:
1. **Filter tabs:** All | Unread | read (show counts)
2. **Mark all as read** — single button top right
3. **Clear all** — second button (with confirmation)
4. **Grouped by date:** Today / Yesterday / This Week / Earlier
5. **Per notification card:**
   - Type icon (use Phosphor icons mapped to `type` field)
   - Title (derive from `type`) + message body
   - Relative timestamp ("2 hours ago", "Yesterday")
   - Unread dot (blue `#0066FF`, 8px, left side of card)
   - Click: mark as read + navigate to relevant page (based on `type`)
   - Hover action: individual delete button appears
6. **Empty state** per tab — illustrated, role-appropriate copy
7. **Skeleton loading** on initial load

**Navigation logic by `type`:**
```ts
const getNotificationLink = (type: string, message: string): string => {
  if (type === 'project_status_change' || type === 'revision_requested') return '/dashboard'
  if (type === 'comment_posted') return '/dashboard'  // ideally /projects/:id but we don't have projectId in current schema
  if (type === 'change_request_submitted' || type === 'change_request_resolved') return '/dashboard'
  if (type === 'new_submission') return '/dashboard'
  return '/dashboard'
}
```

**Add to `notificationsApi` in api.ts:**
```ts
deleteOne: (id: string) => apiFetch(`/api/notifications/${id}`, { method: 'DELETE' }),
```

**Update Navbar:** Notification bell icon should navigate to `/notifications` on click (not open dropdown). Show unread count badge (red dot, max "9+").

**Add to routes.tsx:**
```tsx
{ path: 'notifications', element: <Lazy><ProtectedRoute><NotificationsPage /></ProtectedRoute></Lazy> }
```

---

#### 2C. Help Page

**`src/app/pages/HelpPage.tsx`** — Public (no auth required)

Structure:
- Hero section: "How can we help?" + search input (client-side filter over FAQ items)
- Sticky sidebar TOC (desktop) — anchor links with scroll-spy (active section highlighted)
- Accordion sections (Radix Accordion):
  1. **Getting Started** — What is Inquisia, account types, email verification, what each role can do
  2. **Project Submission** — How to upload, file requirements (PDF only, max size), required metadata, co-author addition
  3. **Review Process** — What happens after submission, statuses explained, revision workflow, resubmission
  4. **Elara AI** — What Elara is, what she can do per role, how to use the floating assistant, rate limits (30/hr), what she won't do
  5. **Account Management** — Editing profile, changing avatar, password reset, account deletion
  6. **For Supervisors** — Review queue, how to request changes, approving submissions, using Elara for review
  7. **For Administrators** — User management, department CRUD, category CRUD, flagged comments
- Footer contact card: "Still need help? Reach the team" (static, no functional email — placeholder)

Search: client-side, filters accordion items by their Q&A text content. No backend call needed.

---

#### 2D. Submission Rules Page

**`src/app/pages/SubmissionRulesPage.tsx`** — Public

Design: policy document aesthetic — clean, generous line-height, readable.

Sections:
1. **Eligibility** — registered students only, one active submission per academic year
2. **File Requirements** — PDF only, max 50MB, legible text (not scanned images)
3. **Metadata Requirements** — title (10-200 chars), abstract (100-1000 chars), year, department, supervisor
4. **Co-Author Policy** — how to add, matric number lookup, they must be registered
5. **Plagiarism Policy** — what triggers flagging (>30% similarity), what happens, how to resolve
6. **Revision Policy** — max revisions per submission, resubmission process
7. **Intellectual Property** — students own their work; Inquisia stores for academic display only
8. **Version History** — every submission creates a version; versions are permanent record

Sidebar: sticky table of contents with scroll-spy.
Bottom: "I understand the submission rules" button → navigates to `/upload` (authenticated) or `/register` (guest).

---

#### 2E. Elara Settings Page

**`src/app/pages/ElaraSettingsPage.tsx`** — Authenticated only

**Backend — new routes:**

`GET /api/ai/settings`
```ts
// requireAuth()
// SELECT * FROM elara_user_settings WHERE user_id = userId
// If no row: return defaults
// Returns: { preferred_model, response_style, show_model_indicator, show_usage_stats }
```

`PATCH /api/ai/settings`
```ts
// Body: partial { preferred_model?, response_style?, show_model_indicator?, show_usage_stats? }
// UPSERT into elara_user_settings
```

`GET /api/ai/usage`
```ts
// requireAuth()
// SELECT feature_type, usage_count, window_start FROM ai_usage_stats
// WHERE user_id = userId AND window_start > NOW() - INTERVAL '1 hour'
// Returns: { elara: count, assistant: count, project_chat: count, reset_at: ISO string }
```

**Migration:**
```sql
CREATE TABLE IF NOT EXISTS elara_user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_model TEXT NOT NULL DEFAULT 'gemma-3-27b-it',
  response_style TEXT NOT NULL DEFAULT 'balanced'
    CHECK (response_style IN ('concise', 'balanced', 'verbose')),
  show_model_indicator BOOLEAN NOT NULL DEFAULT TRUE,
  show_usage_stats BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Frontend sections:**

**1. AI Model** — 4 model cards, radio-select:
```
gemini-2.0-flash
  Label: "Quick & Conversational"
  Best for: Fast Q&A, navigation help, quick summaries
  Speed: 9/10 | Depth: 5/10

gemma-3-27b-it  [DEFAULT]
  Label: "Academic Standard"
  Best for: Academic writing, project feedback, structured analysis
  Speed: 7/10 | Depth: 7/10

gemini-1.5-pro
  Label: "Deep Research"
  Best for: Long document analysis, complex academic queries, detailed comparisons
  Speed: 4/10 | Depth: 10/10

gemini-2.0-flash-thinking-exp-01-21
  Label: "Critical Thinker"
  Best for: Reasoning through arguments, methodology critique, evaluating research
  Speed: 3/10 | Depth: 10/10
```
Display speed/depth as simple bar indicators (filled dots or segments).

**2. Response Style** — 3 options (segmented control or radio):
- Concise — "Short, direct. No fluff."
- Balanced — "Clear answers with appropriate context." (default)
- Verbose — "Full explanations, examples, and reasoning."

**3. Display Preferences** — Two toggles:
- Show model indicator on messages
- Show usage stats counter

**4. Usage Stats** (read-only panel):
- "X / 30 messages used this hour"
- Progress bar (brand color fill)
- Per-feature breakdown: Elara Chat | Page Assistant | Project Chat
- "Resets in X minutes" countdown (computed from `window_start + 1hr`)

**Save:** Auto-save on change (debounced 800ms). Show a subtle "Saved" checkmark confirmation.

**Add to api.ts:**
```ts
export const elaraSettingsApi = {
  get: () => apiFetch<ElaraSettings>('/api/ai/settings'),
  update: (data: Partial<ElaraSettings>) =>
    apiFetch('/api/ai/settings', { method: 'PATCH', body: JSON.stringify(data) }),
}
export const elaraUsageApi = {
  get: () => apiFetch<ElaraUsage>('/api/ai/usage'),
}
```

**Add to types.ts:**
```ts
export interface ElaraSettings {
  preferred_model: 'gemini-2.0-flash' | 'gemma-3-27b-it' | 'gemini-1.5-pro' | 'gemini-2.0-flash-thinking-exp-01-21'
  response_style: 'concise' | 'balanced' | 'verbose'
  show_model_indicator: boolean
  show_usage_stats: boolean
}
export interface ElaraUsage {
  elara: number
  assistant: number
  project_chat: number
  reset_at: string
}
```

**Add to routes.tsx:**
```tsx
{ path: 'elara/settings', element: <Lazy><ProtectedRoute><ElaraSettingsPage /></ProtectedRoute></Lazy> }
```

---

#### 2F. Chat History (Elara Conversation Persistence)

> ⚠️ IMPORTANT: Current spec (`elara.md`) says "Conversations are session-only — not stored in the database." This phase intentionally ADDS persistence as a new feature. Do not interpret the spec doc as a constraint here — it describes the current state, not the target state.

**Backend — new routes:**

```
GET    /api/ai/conversations
POST   /api/ai/conversations
DELETE /api/ai/conversations/[id]
PATCH  /api/ai/conversations/[id]        (rename: body { title })
GET    /api/ai/conversations/[id]/messages
```

`GET /api/ai/conversations`:
```ts
// requireAuth()
// SELECT id, title, updated_at, (SELECT content FROM elara_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as preview
// FROM elara_conversations WHERE user_id = userId
// ORDER BY updated_at DESC LIMIT 50
```

`POST /api/ai/conversations`:
```ts
// requireAuth()
// INSERT INTO elara_conversations (user_id, title) VALUES (userId, 'New Chat')
// Returns: { id, title, created_at }
```

Auto-save messages: Extend `/api/ai/elara` route — if request body includes `conversationId`, after getting reply:
```ts
// INSERT user message + assistant reply into elara_messages
// UPDATE elara_conversations SET updated_at = NOW(), title = (auto-title if still 'New Chat')
// Auto-title: first 60 chars of first user message, truncated at word boundary
```

**Migration:**
```sql
CREATE TABLE IF NOT EXISTS elara_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elara_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES elara_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_elara_conversations_user ON elara_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_elara_messages_conv ON elara_messages(conversation_id, created_at ASC);
```

**Frontend — update `ElaraPage.tsx`:**

Add left sidebar (collapsible on mobile, `<= 768px`):
- Header: "Conversations" label + "New Chat" button (Plus icon)
- List: conversation items showing title + relative date + message preview (1 line, truncated)
- Active conversation: highlighted with `bg-[--color-brand-dim]` border-left accent
- Each item hover: shows rename (PencilSimple) + delete (Trash) icon actions
- Rename: inline edit (click pencil → input replaces text → Enter to save, Esc to cancel)
- Delete: ConfirmDialog before `conversationsApi.delete(id)`

Chat area update:
- On load: if `conversationId` in state, fetch and display message history
- On new message: if no active conversation, create one (POST /api/ai/conversations), then send message with `conversationId` in body
- Model indicator badge on AI messages if `show_model_indicator` setting is true
- Response style sent to backend based on user's settings (read from `elaraSettingsApi` on page load)

**Add to api.ts:**
```ts
export const conversationsApi = {
  list: () => apiFetch<ElaraConversation[]>('/api/ai/conversations'),
  create: () => apiFetch<ElaraConversation>('/api/ai/conversations', { method: 'POST' }),
  delete: (id: string) => apiFetch(`/api/ai/conversations/${id}`, { method: 'DELETE' }),
  rename: (id: string, title: string) =>
    apiFetch(`/api/ai/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  messages: (id: string) => apiFetch<ElaraMessage[]>(`/api/ai/conversations/${id}/messages`),
}
```

**Add to types.ts:**
```ts
export interface ElaraConversation {
  id: string
  title: string
  preview?: string
  updated_at: string
  created_at: string
}
export interface ElaraMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  model_used?: string
  created_at: string
}
```

---

### PHASE 3 — Elara Rework

Read `elara.md` fully. It defines what Elara IS. This phase upgrades the implementation to match the spec and adds new user-configurable behavior.

#### Backend changes to `ai.service.ts`:

**1. Model routing**
Every method that calls `generateContent` must accept an optional `model` param. Default to `gemma-3-27b-it`.

```ts
const MODEL_MAP: Record<string, string> = {
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemma-3-27b-it': 'gemma-3-27b-it',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-2.0-flash-thinking-exp-01-21': 'gemini-2.0-flash-thinking-exp-01-21',
}

function getModel(preferredModel?: string) {
  const key = preferredModel && MODEL_MAP[preferredModel] ? preferredModel : 'gemma-3-27b-it'
  return genAI!.getGenerativeModel({ model: MODEL_MAP[key] })
}
```

**2. Response style injection**
In `elaraChat()` and `globalAssistant()`, prepend to system prompt based on `responseStyle`:
```ts
const styleDirective = {
  concise: 'Be concise. Respond in 1-3 sentences unless the question genuinely requires more.',
  balanced: 'Provide clear, complete answers with appropriate context.',
  verbose: 'Provide thorough explanations with examples, reasoning, and academic depth.',
}[responseStyle ?? 'balanced']
```

**3. Pass user settings into routes**
In `/api/ai/elara/route.ts`:
```ts
// After requireAuth():
const settings = await getUserElaraSettings(user.id)  // new helper, SELECT from elara_user_settings with fallback defaults
// Pass settings.preferred_model and settings.response_style to AIService.elaraChat()
// Include modelUsed in the response: { success: true, reply, modelUsed: settings.preferred_model }
```

**4. Model indicator in response**
`/api/ai/elara` and `/api/ai/assistant` should return `modelUsed` in the response body:
```ts
return NextResponse.json({ success: true, reply, modelUsed: modelKey })
```

#### Frontend changes to `ElaraPage.tsx`:
- Load user settings from `elaraSettingsApi.get()` on mount
- Send `responseStyle` and `preferredModel` in request body to `/api/ai/elara`
- Display model indicator badge on AI messages if `show_model_indicator` is true
- Display usage stats mini-bar at top if `show_usage_stats` is true
- Link to `/elara/settings` from a gear icon in the page header
- Suggestion chips: role-aware, computed from `user.role`

#### Frontend changes to `FloatingAssistantWrapper.tsx`:
- Load user settings on mount (or on first open — lazy)
- Send `preferredModel` and `responseStyle` to `/api/ai/assistant`
- Add typewriter effect on latest AI message (already partially exists — standardize)
- Add suggestion chips when no messages (role + page aware)
- Add scope copy hint below header (what Elara can do on this page)
- On project pages: pass `projectId` in `pageContext` to enable RAG

---

### PHASE 4 — Backend Polish

**Goal:** Every API route behaves consistently and gracefully.

**Standard error response — enforce this EVERYWHERE:**
```ts
// NEVER expose raw Supabase/DB errors to the client
// ALWAYS catch at route level
// Log full error server-side, send sanitized message to client

catch (error: any) {
  console.error('[ROUTE_NAME] Error:', error)  // full error to server logs
  
  const status = error.message === 'Unauthorized' ? 401
               : error.message === 'Forbidden' ? 403
               : error.status === 429 ? 429
               : 500
               
  const message = error.message === 'Unauthorized' ? 'Unauthorized'
                : error.message === 'Forbidden' ? 'Access denied'
                : status === 429 ? error.message  // rate limit messages are user-facing by design
                : 'Something went wrong. Please try again.'
                
  return NextResponse.json({ success: false, error: message }, { status })
}
```

**Specific issues to fix:**
1. Role verification — admin routes: verify `user.role === 'admin'` (not just auth)
2. Supervisor routes: verify `user.role === 'supervisor'`
3. Zod validation errors: format field-level errors into readable strings before returning to client
4. Rate limit 429: include `{ success: false, error: "...", retryAfter: seconds }` in response
5. `requireAuth` must return `{ success: false, error: 'Unauthorized' }` with status 401 — not throw, to avoid unhandled exceptions reaching the top-level catch

---

## 5. WHAT CLAUDE CODE MUST NEVER DO

1. **Break the custom session auth** — no Supabase Auth, no NextAuth, no JWTs. Sessions live in the `sessions` table.
2. **Remove the pgvector RAG system** — `project_embeddings`, `search_project_context()` SQL function, and embedding generation are core.
3. **Replace Google Generative AI with anything else** — the `GEMINI_API_KEY` is the only AI key. All 4 models in the model map use the same key.
4. **Copy Israel's backend code** — his backend is a completely different stack (PostgreSQL + MinIO + Docker). Incompatible.
5. **Use localStorage** — session state comes from the backend cookie. Theme is the only thing that can use localStorage (already does).
6. **Add new npm packages without necessity** — if something can be done with what's already installed, do it that way.
7. **Skip migrations** — any DB change requires a SQL migration file in `supabase/migrations/`.
8. **Run migrations automatically** — write the SQL, but note that Xavier runs them manually in Supabase.
9. **Hardcode API URLs** — always use `VITE_API_URL` (frontend) or environment variables (backend).
10. **Duplicate existing functionality** — always check what already exists before building something new.

---

## 6. ENVIRONMENT VARIABLES

**Backend (`.env`):**
```
GEMINI_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY               ← used by email.service.ts for OTP and other emails
SESSION_SECRET
NEXT_PUBLIC_APP_URL
```

**Frontend (`.env`):**
```
VITE_API_URL    ← points to backend (Next.js server)
```

---

## 7. CRITICAL FILE MAP

```
Backend:
src/services/ai.service.ts              ← 713 lines — extend carefully, don't rewrite
src/services/user-context.service.ts    ← 274 lines — buildRoleContext() is unconditional
src/services/email.service.ts           ← use this for password reset emails
src/services/notification.service.ts    ← use this to create notifications
src/lib/session.ts                      ← requireAuth(), requireAdmin()
src/lib/supabase-admin.ts               ← Supabase admin client
src/middleware.ts                       ← route protection

Frontend:
src/app/routes.tsx                      ← all routes — add new pages here
src/context/SessionContext.tsx          ← global auth state
src/context/ThemeContext.tsx            ← dark/light theme
src/lib/api.ts                          ← ALL API calls — centralized, keep it this way
src/lib/types.ts                        ← all TypeScript interfaces
src/app/components/layout/Navbar.tsx
src/app/components/layout/DashboardLayout.tsx
src/app/components/FloatingAssistantWrapper.tsx   ← on EVERY authenticated page
src/app/pages/ElaraPage.tsx                       ← full Elara chat page
src/app/pages/DashboardPage.tsx                   ← 1160 lines — touch carefully
```

---

## 8. DESIGN PRINCIPLES — APPLY TO EVERY NEW COMPONENT

Before writing a component, define:
1. **What does the user need from this?** — function first
2. **What's the empty state?** — must be designed and implemented
3. **What's the error state?** — inline messaging, not just toast
4. **What's the loading state?** — skeletons for content, not spinners
5. **Does it work on mobile?** — 375px minimum

**The one rule above all:** Every visual decision has a reason. If you can't explain why something looks the way it does, simplify it until you can.

---

*End of Master Brief V2. Version 2.0 — Xavier's Inquisia Sprint.*
*Use this document. Ignore V1 if both are present.*
