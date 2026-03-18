# School Alumni

Production-ready Next.js app for school alumni registration, listing, and admin management, powered by Supabase.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Database + Storage)

## Features

- Public alumni registration form
- Alumni list page
- Landing page metrics powered by API route
- Admin dashboard with cookie-based access and delete actions
- Supabase Storage photo upload and signed URLs

## Project Structure

- app: App Router pages and API routes
- components: reusable UI components
- lib: auth and Supabase clients
- public: static assets

## Environment Variables

Create a local env file from the template:

1. Copy .env.local.example to .env.local
2. Fill in real values

Required variables:

- NEXT_PUBLIC_SUPABASE_URL
  - Example: https://YOUR_PROJECT_REF.supabase.co
  - Used by browser and server.

- NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Public anon key for client-side Supabase requests.

- SUPABASE_SERVICE_ROLE_KEY
  - Server-only secret used by admin/API routes.
  - Never expose this key to client code.

- ADMIN_DASHBOARD_PASSWORD
  - Password used for admin login route.

Important:

- Do not commit .env, .env.local, or any secret file.
- Only NEXT_PUBLIC_ variables are safe to expose in browser bundles.
- SUPABASE_SERVICE_ROLE_KEY must never be prefixed with NEXT_PUBLIC_.

## Local Development

1. Install dependencies:

	npm install

2. Configure .env.local as described above.

3. Run dev server:

	npm run dev

4. Open http://localhost:3000

## Build Validation

Before deploy, run:

- npm run lint
- npm run build

If build passes locally, Vercel deployment should be straightforward.

## Vercel Deployment (Supabase Compatible)

### Option A: Vercel Dashboard

1. Push code to GitHub.
2. In Vercel, import your GitHub repository.
3. Framework preset: Next.js (auto-detected).
4. Add all environment variables in Vercel Project Settings > Environment Variables:
	- NEXT_PUBLIC_SUPABASE_URL
	- NEXT_PUBLIC_SUPABASE_ANON_KEY
	- SUPABASE_SERVICE_ROLE_KEY
	- ADMIN_DASHBOARD_PASSWORD
5. Add values for Production (and Preview if you use preview branches).
6. Deploy.

### Option B: Vercel CLI

1. Install CLI:

	npm i -g vercel

2. Login:

	vercel login

3. Link project (inside repo):

	vercel

4. Add env vars:

	vercel env add NEXT_PUBLIC_SUPABASE_URL production
	vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
	vercel env add SUPABASE_SERVICE_ROLE_KEY production
	vercel env add ADMIN_DASHBOARD_PASSWORD production

5. Deploy production:

	vercel --prod

## Supabase Setup Checklist

1. Create an alumni table with columns used by app routes/components (for example: id, name, session, created_at, photo_url).
2. Create storage bucket named alumni-photos.
3. Ensure policies allow intended client operations (upload/read as needed).
4. Keep admin-sensitive operations on server routes using service role key.

## Security Fix for Exposed .env

If .env was committed before, do all of this now:

1. Remove tracked .env from git (already done in this workspace).
2. Rotate exposed secrets in Supabase:
	- Regenerate service role key
	- Regenerate anon key if needed
3. Update local .env.local with new values.
4. Update Vercel environment variables with new values.
5. Redeploy.
6. (Recommended) Remove old secrets from git history using a history rewrite tool if they were pushed publicly.

## Scripts

- npm run dev: start development server
- npm run build: create production build
- npm run start: run production server
- npm run lint: run ESLint

## Deployment Readiness Checklist

- Secrets are not committed
- .env is untracked
- .gitignore contains env patterns
- Vercel env vars are set for Production
- Supabase keys are rotated if previously exposed
- npm run build succeeds

## References

- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
