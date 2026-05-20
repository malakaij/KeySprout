# Codebase Guide

This document is for people who want to audit the code before using it, or who want to contribute. It explains the architecture, where everything lives, how data flows through the system, and what each piece is responsible for.

---

## Table of contents

1. [Technology stack](#technology-stack)
2. [Repository layout](#repository-layout)
3. [Data model](#data-model)
4. [Authentication and roles](#authentication-and-roles)
5. [API routes](#api-routes)
6. [Page structure](#page-structure)
7. [Component library](#component-library)
8. [Core library modules](#core-library-modules)
9. [Design system](#design-system)
10. [Privacy notes for auditors](#privacy-notes-for-auditors)
11. [Contributing](#contributing)

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Authentication | NextAuth v4 (Google OAuth + database sessions) |
| Styling | Tailwind CSS with a custom design token layer |
| Charts | Recharts |
| Icons | Lucide React |
| Validation | Zod (API route bodies) |
| Date utilities | date-fns |

All server-side work happens in Next.js API routes and React Server Components. There is no separate backend process.

---

## Repository layout

```
keysprout/
├── app/                        # Next.js App Router pages and API routes
│   ├── (auth)/login/           # Google sign-in page
│   ├── (student)/              # Student-facing pages (layout enforces auth)
│   │   ├── dashboard/          # Home screen with stats and quest map
│   │   ├── lessons/            # Lesson browser and individual lesson runner
│   │   ├── progress/           # WPM/accuracy charts and weak-key heatmap
│   │   └── games/              # Word Rain and Letter Hunt
│   ├── teacher/                # Teacher portal (separate layout)
│   │   ├── page.tsx            # Teacher dashboard
│   │   ├── classes/            # Classroom management
│   │   ├── students/[id]/      # Per-student progress view
│   │   ├── curriculum/         # Curriculum browser
│   │   └── insights/           # Aggregated class analytics
│   ├── admin/                  # Admin panel (cookie-auth, not Google)
│   ├── api/                    # All API route handlers
│   └── page.tsx                # Public landing page
├── components/                 # Shared React components
│   ├── dashboard/              # Student dashboard cards and charts
│   ├── games/                  # Game components (WordRain, LetterHunt)
│   ├── layout/                 # Navbar, sidebars
│   ├── teacher/                # Teacher-specific table and card components
│   ├── typing/                 # TypingArea, VirtualKeyboard, StatsBar
│   └── ui/                     # Generic UI pieces (Pip mascot, KeyboardHint)
├── lib/                        # Server-side utilities (never imported by client)
│   ├── auth.ts                 # NextAuth configuration
│   ├── admin-auth.ts           # Admin HMAC cookie authentication
│   ├── db.ts                   # Prisma client singleton
│   ├── typing-engine.ts        # WPM/accuracy math and text generation
│   ├── name-generator.ts       # Pseudonymous nickname system
│   ├── section-colors.ts       # Shared palette helper for section colors
│   ├── seed-db.ts              # Full curriculum seed data (250 lessons)
│   └── utils.ts                # cn(), formatDate(), formatDuration()
├── prisma/
│   └── schema.prisma           # Database schema (single source of truth)
├── types/
│   └── index.ts                # Shared TypeScript interfaces
├── .env.example                # Required environment variables with comments
└── tailwind.config.ts          # Design tokens (colors, fonts, shadows, animations)
```

---

## Data model

The full schema lives in `prisma/schema.prisma`. Here is a plain-language summary.

### Users and roles

Every person who signs in has a `User` record. The `role` field is an enum: `STUDENT` (default), `TEACHER`, or `ADMIN`. Role is set server-side — students self-upgrade to Teacher by entering a secret `TEACHER_ACCESS_CODE`; admin access is separate (see [Admin panel](#admin-panel)).

### Curriculum hierarchy

```
Course
  └── Section (ordered)
        └── Lesson (ordered)
```

- A `Course` groups related content. There is one public course seeded by default.
- A `Section` is a thematic unit (e.g., "Home Row", "Speed Building").
- A `Lesson` is a single typing exercise. It has a `type` of `SCRIPTED` (fixed text) or `DYNAMIC` (generated on demand from the student's weak keys). Lessons store optional `minWpm` and `minAccuracy` thresholds — a student must meet both to "pass" a lesson.

### Student progress

`LessonAttempt` records every time a student completes a lesson, storing WPM, accuracy, error count, and a timestamp. There is no update — every attempt is appended. Pass/fail status is computed at read time by checking whether any attempt meets `minWpm` and `minAccuracy`.

`GameScore` records scores from the two typing games.

### Classrooms

A teacher creates a `Classroom` (with a short unique `code`). Students join by code; their `ClassMember` record starts as `PENDING` and becomes `APPROVED` once the teacher approves them. This is a lightweight safeguard — unapproved students can still use the app, they just don't appear in the teacher's dashboard.

### Entity-relationship summary

```
User ──< LessonAttempt >── Lesson >── Section >── Course
User ──< GameScore
User ──< ClassMember >── Classroom
User ──< Classroom (as teacher)
```

---

## Authentication and roles

### Google OAuth (students and teachers)

`lib/auth.ts` configures NextAuth with the Google provider. Only the `openid` scope is requested — no email, no profile photo, no contacts. The session callback attaches `user.id` and `user.role` to every server-side session object.

**Privacy detail:** Google returns a stable numeric `sub` (subject identifier). KeySprout stores a pseudonymous email in the format `{sub}@keysprout.invalid` and generates a random animal nickname with `lib/name-generator.ts`. Real names and email addresses are never stored.

### Teacher access

After signing in, a user can submit the `TEACHER_ACCESS_CODE` (set in `.env`) via the profile page. The server validates it and sets `role = TEACHER` on their `User` record. There is no expiry — once a teacher, always a teacher unless manually changed in the database.

### Admin panel

The admin panel at `/admin` uses a completely separate authentication mechanism from NextAuth. It is a simple username/password form (`ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`) that sets an HMAC-SHA256 signed cookie (`lib/admin-auth.ts`) valid for 4 hours. The HMAC key is `NEXTAUTH_SECRET`, so the same secret secures both systems.

Admin capability: view database stats and trigger a curriculum seed. The admin panel does not manage individual users.

---

## API routes

All routes are under `app/api/`. Every route handler validates its input with Zod before touching the database.

### Authentication

| Route | Method | What it does |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler — handles Google OAuth callback, session reads, sign-out |

### User

| Route | Method | What it does |
|-------|--------|-------------|
| `/api/user/profile` | PATCH | Upgrades role to TEACHER if the request body contains a valid `TEACHER_ACCESS_CODE` |
| `/api/user/join-class` | POST | Enrolls the current user in a classroom by `code`; creates a PENDING `ClassMember` |
| `/api/user/reroll-name` | POST | Generates a new random nickname (rate-limited to 3 per day per user) |

### Lessons

| Route | Method | What it does |
|-------|--------|-------------|
| `/api/lessons` | GET | Returns all lessons with the current student's best WPM and pass status |
| `/api/lessons/[id]` | GET | Returns a single lesson |
| `/api/lessons/[id]/complete` | POST | Appends a `LessonAttempt` record (WPM, accuracy, duration, errors) |
| `/api/lessons/dynamic` | POST | Calls `generateDynamicText()` with the student's weak keys and returns a custom passage |

### Games

| Route | Method | What it does |
|-------|--------|-------------|
| `/api/games/score` | POST | Appends a `GameScore` record for Word Rain or Letter Hunt |

### Teacher (requires TEACHER role)

| Route | Method | What it does |
|-------|--------|-------------|
| `/api/teacher/classes` | GET | Lists the teacher's classrooms |
| `/api/teacher/classes` | POST | Creates a new classroom with a random `nanoid` join code |
| `/api/teacher/classes/[id]` | GET/PATCH/DELETE | Reads, updates, or deletes a specific classroom |
| `/api/teacher/classes/[id]/members/[memberId]` | PATCH | Approves or removes a student from a class |
| `/api/teacher/students/[id]/progress` | GET | Returns a student's full lesson history and weak-key analysis |
| `/api/teacher/students/[id]/name` | PATCH | Lets a teacher rename a student (sets `nameChangeRequested = true`) |

### Admin (requires admin cookie)

| Route | Method | What it does |
|-------|--------|-------------|
| `/api/admin/login` | POST | Validates credentials, sets a signed cookie |
| `/api/admin/logout` | POST | Clears the admin cookie |
| `/api/admin/seed` | POST | Runs `seedDatabase()` from `lib/seed-db.ts`; idempotent |

---

## Page structure

### Student area — `app/(student)/`

The layout at `app/(student)/layout.tsx` checks for a valid session server-side and renders `StudentSidebar`. All pages in this group are server components that fetch data from the database directly (no client-side data fetching for initial renders).

Pages that need interactivity follow a split pattern:
- `page.tsx` — Server component, fetches data, passes it as props to a `*Client.tsx` file.
- `*Client.tsx` — Client component (`'use client'`), handles user interactions.

### Teacher area — `app/teacher/`

Same pattern. The layout checks that `session.user.role === 'TEACHER'` and shows the `TeacherSidebar`. All pages are server-first.

### Admin — `app/admin/`

`page.tsx` calls `isAdminAuthenticated()` (reads the cookie) and either renders `AdminLogin` or `AdminDashboard`. Both are client components because they handle form submissions.

---

## Component library

### Typing components (`components/typing/`)

**`TypingArea`** is the core interactive component. It accepts a `text` string and three callbacks:
- `onComplete(result)` — fired when the student types the last character; `result` contains WPM, accuracy, duration, errors, and a per-character error map.
- `onProgress(wpm, accuracy)` — fired every 500ms during typing for live stats.
- `onCurrentChar(char)` — fired on every keystroke, telling the parent which character is next (used to drive `KeyboardHint`).

Internally, `TypingArea` tracks typed characters in a `string[]` state array and compares each against the source text. Errors are counted cumulatively; backspace removes the last character but the error count is not decremented (errors represent total mistaken keystrokes, not current wrong characters).

**`VirtualKeyboard`** renders a full QWERTY layout. It accepts `highlightKey` (the key to pulse with a yellow ring), `pressedKey` (briefly highlighted on press), `fingerColors` (boolean, enables colour-coded finger zones), and `errorKeys` (a `Record<string, number>` of error rates that tints keys red by intensity).

**`StatsBar`** is a stateless display of WPM, accuracy, time elapsed, and error count.

### Game components (`components/games/`)

Both games are fully self-contained — they hold their own game state and call `onComplete(score)` when the game ends. The parent page is responsible for persisting the score to `/api/games/score`.

**`WordRain`** uses `Date.now()` timestamps to position words vertically (elapsed / duration × 400px). A `setInterval` every 500ms sweeps for expired words and deducts lives. Difficulty scales with `level`, which increments every 5 points.

**`LetterHunt`** samples the next target key using inverse-frequency weighting so all 26 letters get roughly equal practice over a session.

### UI components (`components/ui/`)

**`Pip`** is an SVG mascot (a grape-colored blob with ears). It has `size` (`sm` / `md` / `lg`) and `variant` (`default` / `wave` / `celebrate`) props. It appears on the login page, student dashboard, and lesson completion screen.

**`KeyboardHint`** renders a simplified keyboard highlighting the next character to type. Left-hand keys are tinted mint, right-hand keys are tinted coral. The target key pulses with the `animate-pulse-ring` animation.

---

## Core library modules

### `lib/typing-engine.ts`

Three pure functions + one data structure:

- `calculateWpm(chars, seconds)` — Standard net WPM formula: `(chars / 5) / (seconds / 60)`.
- `calculateAccuracy(correct, total)` — `correct / total`, clamped to [0, 1].
- `analyzeWeakKeys(targetText, typedText)` — Iterates both strings character-by-character, builds a per-character error rate map. Space and newline are excluded.
- `generateDynamicText(weakKeys, targetLength)` — Constructs a practice passage by drawing 60% of words from the `WORD_BANK` entries for the student's weakest keys and 40% from random letters. Words are shuffled and joined with spaces.

`WORD_BANK` is a record of `{ a: [...words], b: [...words], ... }` with ~20 words per letter, kept inline in the file.

### `lib/name-generator.ts`

Generates pseudonymous display names from a pool of 50 adjectives × 100 animals = 5,000 combinations. `generateDisplayName(googleSub)` produces a deterministic name by hashing the Google `sub`; `generateRandomDisplayName()` picks randomly for the name-reroll feature.

### `lib/admin-auth.ts`

Creates and verifies HMAC-SHA256 tokens stored in an HTTP-only cookie (`admin_token`). Tokens encode a timestamp; `verifyAdminToken` rejects tokens older than 4 hours. The signing key is `NEXTAUTH_SECRET`.

### `lib/seed-db.ts`

A large data file that defines the full curriculum. `seedDatabase()` is idempotent — it checks whether a course with the same title already exists before inserting. The five sections and their lesson progressions are:

| Section | Lessons | Keys introduced | WPM range |
|---------|---------|-----------------|-----------|
| Home Row | 50 | a s d f j k l ; g h | 10–25 |
| Top Row | 50 | q w e r t y u i o p | 15–30 |
| Bottom Row | 50 | z x c v b n m , . / | 15–30 |
| Common Words | 50 | Full keyboard | 20–35 |
| Speed Building | 50 | Full keyboard | 30–45 |

---

## Design system

All design tokens are defined in `tailwind.config.ts`. The application does not use an external component library.

### Color palette

| Token | Hex | Role |
|-------|-----|------|
| `paper` | `#fff6e3` | Page background |
| `paper-dark` | `#f0e8d0` | Secondary surfaces |
| `ink` | `#1a1a2e` | Text and borders |
| `mint` | `#4dd4ac` | Success, WPM, primary actions |
| `sky` | `#4ea8de` | Accuracy, secondary actions |
| `sunny` | `#ffd23f` | Highlights, keyboard hints |
| `coral` | `#ff5e5b` | Errors, warnings, active game state |
| `grape` | `#9b5de5` | Mascot color, accent |
| `berry` | `#ff7eb6` | Soft accent |

Section colors cycle through mint → sky → sunny → grape → coral → berry. The helper `sectionColor(index)` in `lib/section-colors.ts` returns the full set of Tailwind classes for a given index.

### CSS utility classes

Defined in `app/globals.css`:

- `.kq-card` — White-ish card with a 3px ink border and a 4px flat drop shadow (`shadow-ink`). The standard container for all UI panels.
- `.kq-btn` — Pill-shaped button with a press animation (shifts 2px down and loses shadow on `:active`). Apply a background color class to tint it.
- `.kq-chip` — Small inline tag/badge, rounded-full, with a 2px border.

### Typography

- `font-display` — Fredoka One. Used for numbers, headings, scores, and any value the student should notice immediately.
- `font-body` — Nunito. Used for descriptive text, labels, and anything conversational.
- `font-mono` — JetBrains Mono. Used in typing exercises and keyboard labels.

### Animations

| Class | Effect |
|-------|--------|
| `animate-blink` | Cursor underline blink (1s step-end loop) |
| `animate-pulse-ring` | Expanding glow ring on the target key |
| `animate-fall` | CSS `translateY` for Word Rain words |
| `animate-fade-in` | 0.3s opacity fade |
| `animate-slide-up` | 0.3s upward entry |

---

## Privacy notes for auditors

These are the key privacy properties of the system, with pointers to the relevant code:

**What data is collected**

| Data | Stored | Where |
|------|--------|-------|
| Google account sub (opaque ID) | Yes, indirectly | `Account.providerAccountId` |
| Real name | No | — |
| Email address | Pseudonymous only | `User.email` stores `{sub}@keysprout.invalid` |
| Profile photo | No | `lib/auth.ts` sets `image: null` |
| Lesson WPM, accuracy, errors | Yes | `LessonAttempt` |
| Game scores | Yes | `GameScore` |
| Typing text content | No | Only aggregate stats are stored |

**What teachers can see**

Teachers see only students who have joined their classroom (`ClassMember` with `status = APPROVED`). They see WPM, accuracy, weak keys, and lesson completion status — not the actual keystrokes typed.

**What data is shared externally**

Nothing. The application makes no external API calls except to Google during sign-in. All data stays in your PostgreSQL database.

**Session security**

- NextAuth sessions are stored in the database (`Session` table) and identified by a signed cookie. The signing key is `NEXTAUTH_SECRET`.
- Admin sessions are separate HMAC-signed cookies, also using `NEXTAUTH_SECRET`, expiring after 4 hours.
- No JWTs are used; revocation is immediate (delete the `Session` row).

---

## Contributing

### Running locally

```bash
cp .env.example .env   # fill in your values
npm install
npm run db:push         # creates tables
npm run db:seed         # loads curriculum
npm run dev             # starts at localhost:3000
```

### Code conventions

**File organization**
- Server-only code goes in `lib/`. Nothing in `lib/` should import from `components/` or use browser APIs.
- Pages that need both server data and client interactivity are split: a `page.tsx` server component passes props to a `*Client.tsx` client component in the same directory.
- New API routes go in `app/api/` and must validate their request body with Zod before any database access.

**Comments**
- Comments explain *why*, not *what*. Well-named functions and variables should be self-explanatory.
- Use JSDoc for exported functions in `lib/`:
  ```ts
  /**
   * Calculates net WPM using the standard 5-characters-per-word definition.
   * @param chars - Number of correctly typed characters
   * @param seconds - Elapsed time in seconds (must be > 0)
   */
  export function calculateWpm(chars: number, seconds: number): number
  ```
- React component props interfaces should be named `[ComponentName]Props` and sit directly above the component function.
- Inline comments are appropriate for non-obvious algorithmic choices (e.g., the inverse-frequency weighting in `LetterHunt`).

**TypeScript**
- Prefer explicit return types on exported functions.
- Use `interface` for object shapes, `type` for unions and aliases.
- Avoid `any`. Use `unknown` and narrow with guards if the type is genuinely unknown.

**Styling**
- Use design tokens (`ink`, `mint`, `paper`, etc.) — never raw Tailwind color scales (`slate-700`, `emerald-400`, etc.).
- Use `.kq-card`, `.kq-btn`, `.kq-chip` for the three standard UI patterns.
- The `cn()` utility (in `lib/utils.ts`) merges Tailwind classes safely; use it wherever classes are conditionally combined.

### Opening a pull request

1. Fork the repo and create a branch from `main`.
2. Make your changes. Run `npm run lint` and `npx tsc --noEmit` before pushing.
3. Describe *what* changed and *why* in the PR body.
4. If your change touches the database schema (`prisma/schema.prisma`), include a note on the migration path.
