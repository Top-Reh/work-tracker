# Work Tracker — Hours & Salary

A personal work-hours and salary tracker. Log the hours you worked on a calendar, and it automatically calculates your gross salary, tax deduction, and net salary using your hourly rate and tax rate — no manual math required.

## Features

- Email/password, Google, Facebook, and phone (SMS code) sign-in
- Monthly calendar with per-day work stamps (hours + net salary shown inline)
- Add / edit / delete work records with live gross → tax → net calculation as you type
- Two ways to log a day: type hours/minutes directly, or enter a start and end time and let the app calculate the duration (overnight shifts supported)
- Per-month rate override: change the hourly rate/tax rate for just one month from a bar at the top of the calendar, with a confirmation step before it recalculates that month's existing records. Other months are never affected, and new months start back at your Settings default.
- Each record stores the hourly rate and tax rate that were active when it was created, so a plain rate change never silently rewrites historical pay
- Monthly dashboard totals (hours, gross, tax, net) that update instantly on add/edit/delete
- Month-to-month and year-to-year navigation, with a "Today" shortcut
- Yearly statistics page with a per-month breakdown and year totals
- Settings page for profile and default hourly rate/tax rate
- Input validation (hours 0–24, minutes 0–59, hourly rate ≥ 0, tax rate 0–100%) with friendly error messages
- Loading skeletons, empty states, and friendly (non-Firebase-internal) error messages throughout
- Timezone-safe date handling — a work day is stored and read as a local calendar date and never shifts due to UTC conversion
- Firestore security rules that strictly isolate each user's data by their auth UID
- Fixed-viewport layout: the outer app never scrolls — only the calendar/content area does, so the sidebar (desktop) and bottom nav (mobile) always stay in place
- Responsive: bottom navigation + stacked layout on mobile, sidebar + centered layout on desktop, with smaller type sizes on narrow screens

## Tech Stack

- React 19 + JavaScript (JSX)
- Vite 8
- Tailwind CSS v4
- Firebase Authentication (email/password)
- Firebase Firestore
- React Router 7
- lucide-react (icons)

## Project Structure

```
src/
├── components/        # Reusable UI: Calendar, WorkRecordModal, Header, Sidebar, etc.
│   └── ui/             # Low-level primitives: Button, Input, Card, Skeleton
├── pages/              # Route-level screens: Login, Register, Dashboard, Statistics, Settings
├── services/           # Firebase access: auth.js, workRecords.js, userProfile.js, firebase.js
├── hooks/               # useAuth, useMonthRecords, useYearRecords
├── utils/               # salaryCalculations.js, dateUtils.js, currencyUtils.js
├── context/             # AuthContext, ToastContext
├── App.jsx              # Routes
└── main.jsx             # Entry point
```

## 1. Installation

```bash
npm install
```

## 2. Firebase Setup

1. Go to the [Firebase console](https://console.firebase.google.com) and create a new project (or use an existing one).
2. In **Project settings → General → Your apps**, click the web icon (`</>`) to register a web app. Firebase will show you a `firebaseConfig` object — you'll need these values in step 4.
3. In **Build → Authentication → Sign-in method**, enable the sign-in methods you want to offer:
   - **Email/Password** — required, this is the base method.
   - **Google** — enable it and pick a support email; no extra setup needed.
   - **Facebook** — enable it, then paste in an App ID and App Secret from a [Facebook Developer app](https://developers.facebook.com/apps) you create separately. Facebook will also ask you to whitelist the OAuth redirect URI Firebase shows you on this screen.
   - **Phone** — enable it. Phone sign-in uses an invisible reCAPTCHA that the app already renders (`<div id="recaptcha-container">` in `SocialSignIn.jsx`), so no extra code changes are needed. Note Firebase's free tier only allows a limited number of SMS messages per day.
   - If you skip any of these, its button will simply show a "Something went wrong" toast when clicked instead of breaking the rest of the app.
4. In **Build → Firestore Database**, click **Create database** and start in production mode (the security rules below will handle access control).

## 3. Environment Variables

Copy the example file and fill in the values from step 2 above:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

`.env` is gitignored — never commit real Firebase keys.

## 4. Firestore Security Rules

Copy the contents of `firestore.rules` (included in this project) into **Firestore Database → Rules** in the Firebase console, then click **Publish**.

These rules ensure:
- A user can only read/write their own `users/{uid}` document and `users/{uid}/workRecords/{recordId}` subcollection.
- Work record writes are validated server-side (hours 0–24, minutes 0–59, hourly rate ≥ 0, tax rate 0–100).
- Everything else is denied by default.

If you use the Firebase CLI, `firebase.json` and `firestore.indexes.json` are also included so you can deploy rules with:

```bash
firebase deploy --only firestore:rules
```

## 5. Data Model

```
users/{uid}
  name, email, phone?, hourlyRate, taxRate, createdAt, updatedAt

users/{uid}/workRecords/{date}   # document id is the "YYYY-MM-DD" date itself
  date, hours, minutes, totalHours,
  hourlyRate, grossSalary,
  taxRate, taxAmount, netSalary,
  note, startTime?, endTime?, createdAt, updatedAt

users/{uid}/monthSettings/{YYYY-MM}   # optional per-month rate override
  hourlyRate, taxRate, updatedAt
```

`startTime`/`endTime` are only set when the record was created using the "Start & end time" entry mode; they're `null` for records entered as plain hours/minutes.

A `monthSettings` document only exists for months where the user has explicitly changed the rate via the rate bar at the top of the calendar. When present, it overrides the user's global default for that month only — both for new records and (after confirmation) for records already logged that month.

Using the date string as the document id guarantees one record per day per user and makes edits idempotent (saving the same date again just updates that record).

## 6. Run Locally

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`), register an account, set your hourly rate and tax rate, and start logging hours.

## 7. Build for Production

```bash
npm run build
```

Output is written to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## 8. Deploy

Any static host works since this is a client-side Vite app. Two common options:

**Firebase Hosting** (pairs naturally with the Firebase backend already in use):
```bash
npm run build
firebase deploy --only hosting
```

**Vercel / Netlify**: connect the repo, set the build command to `npm run build` and the output directory to `dist`, and add the same `VITE_FIREBASE_*` environment variables in the host's dashboard.

## Notes on Correctness

- **Timezones**: dates are read/written as local "YYYY-MM-DD" strings (see `src/utils/dateUtils.js`), never via `Date.toISOString()`, so a record made late at night in KST won't silently roll over to the next/previous day.
- **Historical accuracy**: `hourlyRate` and `taxRate` are captured into every work record at save time. Changing your default rate in Settings only affects new records.
- **Single source of truth for math**: all gross/tax/net calculations live in `src/utils/salaryCalculations.js` and are reused by the modal, the dashboard summary, and the statistics page — nothing is duplicated.

## Extending Later

The architecture leaves room for (not implemented yet, deliberately kept out of scope):
- Overtime rates, multiple jobs/rates, break time, shift start/end times
- Monthly salary goals, CSV/Excel export, PDF reports, charts
- Korean/English language toggle (labels are already centralized rather than hardcoded inline)
- Notifications, PWA installability
