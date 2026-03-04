# 🎓 NGO Scholarship Management System

A production-ready full-stack scholarship application and management platform built with Next.js 14, Supabase, and Resend.

---

## 📁 Project Structure

```
/
├── app/
│   ├── page.tsx                    # Public landing page
│   ├── apply/page.tsx              # Multi-step application form
│   ├── status/page.tsx             # Applicant status tracker
│   ├── approval-result/page.tsx    # Post-approve/reject landing
│   ├── admin/
│   │   ├── page.tsx                # Protected admin dashboard
│   │   └── login/page.tsx          # Admin auth page
│   └── api/
│       ├── apply/route.ts          # POST: Submit application
│       ├── approve/route.ts        # GET: Email approve link handler
│       ├── reject/route.ts         # GET: Email reject link handler
│       ├── status/route.ts         # GET: Public status check
│       └── admin/
│           ├── applications/route.ts  # GET/PUT: Admin list & update
│           └── export-csv/route.ts    # GET: CSV export
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Server-side Supabase clients
│   │   └── client.ts               # Browser Supabase client (singleton)
│   ├── validations.ts              # Zod schemas (server + client shared)
│   ├── tokens.ts                   # Cryptographic token generation
│   ├── email.ts                    # Resend integration + HTML templates
│   ├── scoring.ts                  # Scholarship priority scoring algorithm
│   ├── audit.ts                    # Audit logging utility
│   └── rate-limit.ts               # In-memory rate limiter
│
├── types/
│   └── database.ts                 # TypeScript types mirroring DB schema
│
├── middleware.ts                   # Edge middleware: auth protection + session refresh
├── supabase-schema.sql             # Complete PostgreSQL schema + RLS policies
└── .env.example                    # Environment variable reference
```

---

## 🚀 Deployment Guide

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Choose your organization, enter project name (e.g. `ngo-scholarship`)
4. Set a strong database password (save it!) and choose your region
5. Wait ~2 minutes for the project to initialize

### Step 2: Set Up the Database

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **"Run"** — you should see "Success. No rows returned"
5. Verify tables exist: go to **Table Editor** → you should see `applications` and `audit_logs`

### Step 3: Set Up Storage Bucket

1. In Supabase, go to **Storage** (left sidebar)
2. Click **"New bucket"**
3. Set name: `scholarship-documents`
4. Toggle **"Public bucket"** to **OFF** (keep private!)
5. Click **"Save"**
6. Go to **Storage Policies** tab
7. Add a policy: `service_role` can do everything (INSERT, SELECT, DELETE)
   - This ensures only your server can access documents

### Step 4: Configure Authentication

1. In Supabase, go to **Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter the admin email and a strong password
4. Confirm the user

For production, also configure under **Auth → Settings**:
- Set **Site URL** to your Vercel domain
- Disable email confirmations if using pre-created admin users

### Step 5: Get Environment Variables

From Supabase dashboard → **Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL         → "Project URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY    → "Project API keys" → anon/public
SUPABASE_SERVICE_ROLE_KEY        → "Project API keys" → service_role (keep secret!)
```

### Step 6: Set Up Resend

1. Go to [resend.com](https://resend.com) and create an account
2. Go to **API Keys** → **Create API Key**
3. Copy the key → this is your `RESEND_API_KEY`
4. Go to **Domains** → **Add Domain**
5. Enter your domain (e.g., `your-ngo.org`) and follow DNS verification
6. Update `FROM_EMAIL` in `lib/email.ts` to `scholarship@your-ngo.org`

> **Development tip**: Resend lets you send to any email without domain verification. Only production requires a verified domain.

### Step 7: Create .env.local File

In your project root, create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciO...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciO...
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=admin@your-ngo.org
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Step 8: Test Locally

```bash
npm install
npm run dev
```

Visit:
- `http://localhost:3000` — Landing page
- `http://localhost:3000/apply` — Application form
- `http://localhost:3000/admin/login` — Admin login
- `http://localhost:3000/admin` — Dashboard (after login)

### Step 9: Deploy to Vercel

1. Push your code to GitHub (make sure `.env.local` is in `.gitignore`!)
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. **Framework Preset**: Next.js (auto-detected)
5. Under **Environment Variables**, add all variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL after first deploy)
6. Click **Deploy**

### Step 10: Post-Deployment

1. Copy your Vercel URL (e.g., `https://ngo-scholarship.vercel.app`)
2. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars → Redeploy
3. Update Supabase **Auth → Settings → Site URL** to your Vercel URL
4. Test the full flow:
   - Submit a test application at `/apply`
   - Check admin email for notification with approve/reject buttons
   - Click approve link → verify redirect to `/approval-result?status=approved`
   - Login to `/admin` and verify application shows as approved
   - Check applicant email for confirmation

---

## 🔐 Security Architecture

### Defense Layers

| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Supabase uses parameterized queries; Zod validates + sanitizes all input |
| XSS | Input sanitized (HTML stripped); React auto-escapes output |
| IDOR | Applications can only be updated via matching token; admin routes require session |
| Token forgery | Tokens are 256-bit CSPRNG entropy; stored as SHA-256 hash |
| Timing attacks | Constant-time comparison for token validation |
| Brute force | Rate limiting: 3 submissions/hour/IP; 5 login attempts/15min/IP |
| Expired tokens | 48-hour expiry enforced server-side |
| Double approval | Status check before update: only `pending` apps can be acted on |
| Credential exposure | Service role key only in server routes; never in browser bundle |
| File uploads | Type + size validation; stored in private Supabase bucket; served via signed URLs |

### Why SHA-256 for Tokens?

Approval tokens are 32 random bytes (256 bits of entropy) from a CSPRNG. At this entropy level, SHA-256 storage is secure — brute force is computationally infeasible. bcrypt is appropriate for *passwords* (low entropy, human-memorable), not for random tokens.

---

## 📊 Scoring Algorithm

Applications are automatically scored 0–100 to help admins prioritize:

| Component | Max Points | Logic |
|-----------|-----------|-------|
| Income need | 50 | Lower income = more points |
| Amount ratio | 30 | `amount_requested / income` — higher ratio = more need |
| Completeness | 20 | Address provided (+5), reason length (+up to 15) |

Score tiers: **High (70+)**, **Medium (40-69)**, **Low (<40)**

This is *advisory only* — all decisions require human review.

---

## 🔄 Production Rate Limiting Upgrade

The current in-memory rate limiter resets on server restarts and doesn't work across Vercel serverless instances. For production:

1. Install: `npm install @upstash/ratelimit @upstash/redis`
2. Create an Upstash Redis database at [upstash.com](https://upstash.com)
3. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to env vars
4. Replace `lib/rate-limit.ts` with Upstash implementation

---

## 🧪 Testing Checklist

- [ ] Application submission with valid data
- [ ] Application submission with invalid data (validation errors shown)
- [ ] File upload (PDF, then JPG, then oversized file)
- [ ] Duplicate email rejection
- [ ] Admin email received with approve/reject buttons
- [ ] Approve link works (redirects to result page, updates DB, sends email)
- [ ] Reject link works
- [ ] Expired token (manually set `token_expiry` to past date)
- [ ] Invalid token
- [ ] Double-click on approve (idempotency)
- [ ] Admin dashboard login
- [ ] Admin filter by status
- [ ] Admin search by name
- [ ] Admin manual approve/reject
- [ ] CSV export
- [ ] Status tracker with valid/invalid application ID
- [ ] Rate limiting (submit > 3 times from same IP)
