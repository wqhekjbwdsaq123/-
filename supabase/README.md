# Supabase Local Setup

This project uses Supabase for database and authentication.

## Prerequisites
- Docker (required for local Supabase)
- Supabase CLI installed (`npm install -g supabase` or via brew)

## Running Migrations and Seeds

1. **Start Supabase Locally**
   If you have the Supabase CLI installed and Docker running, initialize and start the local Supabase stack:
   ```bash
   npx supabase init
   npx supabase start
   ```

2. **Apply Migrations and Seeds to Remote Project**
   If you want to apply migrations to your remote project (specified in your `.env.local`), you can link your project and push migrations:

   ```bash
   # Login to Supabase CLI
   npx supabase login

   # Link your project (you can find your project ID in your Supabase dashboard URL)
   npx supabase link --project-ref upbmzieyaoaydqohngfm

   # Push database schema (migrations)
   npx supabase db push

   # Push seed data (might require resetting or using direct SQL execution if `db push` doesn't run seed on remote)
   npx supabase db reset --linked
   ```
   *Note*: If you just want to run the sql directly on your remote db, go to the SQL Editor in your Supabase Dashboard and paste the contents of `supabase/migrations/20240224_create_posts.sql` and then `supabase/seed.sql`.

## Note
Direct execution was skipped per user request. You must manually execute these via CLI or the Supabase dashboard.
