# KeySprout

[![CI](https://img.shields.io/github/actions/workflow/status/malakaij/keysprout/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/malakaij/keysprout/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffd23f.svg?style=flat-square)](LICENSE)
[![Status: Alpha](https://img.shields.io/badge/Status-Alpha-ff5e5b.svg?style=flat-square)](ROADMAP.md)
[![Made for K-5](https://img.shields.io/badge/Made_for-K--5-4dd4ac.svg?style=flat-square)](#what-it-does)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-1a1a2e.svg?style=flat-square)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-9b5de5.svg?style=flat-square)](CONTRIBUTING.md)

A free, open-source typing curriculum for K–5 students. Students work through a structured 250-lesson course — home row, top row, bottom row, common words, speed building — while teachers track progress and identify which keys each student struggles with most.

**No subscription. No ads. Host it yourself.**

---

## What it does

- **Structured curriculum** — 250 progressive lessons organized into 5 sections, from basic home-row practice to full-speed prose passages.
- **Live feedback** — WPM, accuracy, and a per-key error heatmap update in real time as students type.
- **Adaptive practice** — After completing a lesson, students can generate a custom exercise that targets their personal weak keys.
- **Typing games** — Word Rain (type falling words before they hit the ground) and Letter Hunt (press the highlighted key as fast as possible) for low-stakes practice.
- **Classroom management** — Teachers create a class, share a join code, and approve students. A private dashboard shows each student's progress, weak keys, and recent attempts.
- **Privacy by design** — Students sign in with Google but are assigned a random animal nickname (e.g. "BraveOtter42") automatically. No real names are stored or displayed by default.

---

## Requirements

You need four things before you start:

| What | Why |
|------|-----|
| A computer or server that can run Node.js 18+ | Runs the application |
| A PostgreSQL database | Stores lessons, student progress, and classroom data |
| A Google Cloud project with OAuth configured | Lets students and teachers sign in |
| Basic comfort with a terminal | Running a few commands during setup |

---

## Self-hosting guide

### Step 1 — Get the code

```bash
git clone https://github.com/YOUR-ORG/keysprout.git
cd keysprout
npm install
```

### Step 2 — Set up your database

KeySprout needs a PostgreSQL database. You can run one locally, use a managed service like [Neon](https://neon.tech) (free tier available), or [Supabase](https://supabase.com) (free tier available).

Once you have a database, copy its connection string — it looks like:
```
postgresql://username:password@hostname:5432/keysprout
```

### Step 3 — Set up Google sign-in

KeySprout uses Google for authentication. You need to create an OAuth application in Google Cloud.

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project.
2. Navigate to **APIs & Services → Credentials**.
3. Click **Create Credentials → OAuth client ID**.
4. Choose **Web application**.
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google` (for local testing)
   - `https://yourdomain.com/api/auth/callback/google` (for your live site)
6. Save — you'll get a **Client ID** and **Client Secret**.

### Step 4 — Configure environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

Open `.env` and set each value:

```env
# Your PostgreSQL connection string from Step 2
DATABASE_URL="postgresql://user:password@hostname:5432/keysprout"

# The full URL where your app will be accessible
# Use http://localhost:3000 during local development
NEXTAUTH_URL="https://yourdomain.com"

# A long random string used to sign session cookies
# Generate one with: openssl rand -base64 32
NEXTAUTH_SECRET="paste-your-random-string-here"

# From Step 3 — Google OAuth credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# A password you create. Share it only with teachers.
# Anyone who knows this code can register as a teacher.
TEACHER_ACCESS_CODE="choose-something-hard-to-guess"

# Admin panel credentials (choose your own username and password)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="choose-a-strong-password"

# --- Optional ---

# Log verbosity: error | warn | info | debug (default: info)
LOG_LEVEL="info"
```

### Step 5 — Initialize the database

This creates all the tables and loads the full 250-lesson curriculum:

```bash
npm run db:push
npm run db:seed
```

`db:push` creates the database tables. `db:seed` fills them with the curriculum — this may take 30–60 seconds.

### Step 6 — Start the app

**For local use / testing:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

**For production:**
```bash
npm run build
npm start
```

---

## First-time setup after launch

### Seeding from the admin panel

If you prefer to seed the curriculum through a web interface rather than the terminal, you can do it from the admin panel:

1. Visit `/admin` on your running app.
2. Log in with the `ADMIN_USERNAME` and `ADMIN_PASSWORD` you set in `.env`.
3. Click **Seed Database**. The full curriculum will be loaded.

You only need to seed once. Re-seeding is safe — it skips content that already exists.

### Registering as a teacher

1. Sign in with Google at `/login`.
2. Visit your profile and enter the `TEACHER_ACCESS_CODE` to upgrade your account to Teacher.
3. Go to the Teacher portal to create a classroom and generate a join code for students.

### Inviting students

Share your site's URL with students. They sign in with their own Google accounts and are assigned a random nickname automatically. To join your class, they enter the join code shown in your classroom settings.

---

## Deploying to Vercel (recommended)

Vercel is the easiest way to host a Next.js app publicly for free (within limits).

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Under **Environment Variables**, add all the values from your `.env` file.
4. Deploy. Vercel will run `npm run build` automatically, which also pushes the database schema.
5. After the first deploy, visit `/admin` and seed the database.

For the database, [Neon](https://neon.tech) has a free PostgreSQL tier and integrates directly with Vercel.

---

## Privacy and student data

KeySprout is designed with student privacy in mind, especially for K–5 use:

- **No real names stored.** Students are assigned a random animal nickname (e.g. "BraveOtter42") derived from their Google account ID. Teachers can request a name change through the admin panel.
- **No email addresses stored.** Only a pseudonymous internal identifier is kept.
- **No profile photos.** Google profile images are not requested or stored.
- **Only academic data is collected:** WPM, accuracy, errors, and lesson completion timestamps.
- **Teachers see only their own students' data.**

You are responsible for complying with applicable laws (e.g., COPPA, FERPA, GDPR) in your jurisdiction. Consult your institution's data protection officer before deploying for minors.

---

## Updating KeySprout

```bash
git pull
npm install
npm run db:push   # applies any schema changes
npm run build
npm start
```

---

## Getting help

If something isn't working, check:

1. That all environment variables in `.env` are filled in correctly.
2. That your database is reachable from the server running the app.
3. That the Google redirect URI exactly matches your `NEXTAUTH_URL` + `/api/auth/callback/google`.

For bugs or feature requests, open an issue on GitHub.

---

## License

MIT — free to use, modify, and self-host.
