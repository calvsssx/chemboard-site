# ChemBoard Review — private study site

A password-protected website with 510 multiple-choice questions for the PRC Chemist
Licensure Exam (General, Analytical, Inorganic, Organic, Physical Chemistry,
Biochemistry, and Math & Statistics), each with an explanation after you answer.

## How the security works

- The login is checked **on Vercel's edge servers**, not in the browser.
- The username and password live in **environment variables** (`AUTH_USER`,
  `AUTH_PASS`) that you set in Vercel. They are never included in the page code,
  so no one can read them by viewing source.
- Until someone logs in, every page redirects to `/login.html` and the quiz
  (`index.html`, which holds all the questions) is never served.
- A successful login sets an HttpOnly session cookie that lasts 30 days. "Log out"
  (top-right in the quiz) clears it.

This keeps the site private to the one person you share the credentials with. It is
good protection for a personal study tool; it is not meant for highly sensitive data.

## Deploy to Vercel

### Option A — drag and drop (no tools needed)
1. Go to https://vercel.com and sign in.
2. Create a new project and upload this whole folder (or zip), OR push it to a
   GitHub repo and "Import" it. Framework preset: **Other**.
3. Before (or right after) the first deploy, set the environment variables below.
4. Deploy. Your site is at `https://<your-project>.vercel.app`.

### Option B — Vercel CLI
```bash
npm i -g vercel        # once
cd chemboard-site
vercel                 # follow prompts (framework: Other)
vercel env add AUTH_USER     # enter the username, e.g. jen
vercel env add AUTH_PASS     # enter a strong password
vercel --prod          # redeploy so the env vars take effect
```

## Set the username and password (IMPORTANT)

Vercel dashboard → your project → **Settings → Environment Variables**, add:

| Name        | Value                          |
|-------------|--------------------------------|
| `AUTH_USER` | the username (e.g. `jen`)      |
| `AUTH_PASS` | a strong password you choose   |

Add them for the **Production** environment (and Preview if you want), then
**redeploy** so they take effect. If you ever change the password, just edit
`AUTH_PASS` and redeploy — no code changes needed.

> If you skip this step, the site falls back to `jen` / `changeme123`. Always set
> your own before sharing the link.

## Updating the questions
The questions live inside `index.html` (in a `<script type="application/json">`
block near the bottom). Replacing that block updates the quiz. Keeping the data in
the page is what lets the whole thing stay a simple static deploy.

## Files
- `index.html` — the quiz (all questions embedded)
- `login.html` — the sign-in page
- `middleware.js` — edge auth gate (protects every page)
- `api/login.js` — verifies credentials, sets the session cookie
- `api/logout.js` — clears the session
- `.env.example` — the variables to set in Vercel
