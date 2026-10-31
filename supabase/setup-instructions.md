# Supabase & Google Cloud Console Setup Guide

This guide provides end-to-end instructions for configuring **Google OAuth 2.0**, **Supabase Authentication**, **Server-Side PostgreSQL Domain Restrictions**, and **Role-Based Access Control (RBAC)** for the HB Plus Fit application.

---

## 1. Google Cloud Console Setup (OAuth 2.0)

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `HB Plus Fit Auth`) or select your existing project.
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - **User Type**: Select **Internal** if your Google Workspace organization has `@hbplus.fit`. If testing outside Workspace or prior to verification, select **External** and add test users.
   - **App Name**: `HB Plus Fit`
   - **User Support Email**: Select your official email.
   - **Developer Contact Information**: Provide your email.
   - **Scopes**: Add `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
   - Save and continue.
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - **Application Type**: Select **Web application**.
   - **Name**: `HB Plus Fit Web & Mobile Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:8081` (Local development)
     - `https://<YOUR-PROJECT-REF>.supabase.co`
     - `https://your-custom-subdomain.netlify.app` (Your Netlify production URL)
   - **Authorized redirect URIs**:
     - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback` (**Required for Supabase Auth**)
     - `http://localhost:8081/callback`
     - `https://your-custom-subdomain.netlify.app/callback`
   - Click **Create**.
5. Copy your **Client ID** and **Client Secret**.

---

## 2. Supabase Project Configuration

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project or select your project.
3. Go to **Project Settings** > **API**:
   - Copy **Project URL** (e.g., `https://xyzcompany.supabase.co`).
   - Copy **Project API Key (`anon` / `public`)**.
4. Go to **Authentication** > **Providers** > **Google**:
   - Enable the Google provider toggle.
   - Paste the **Client ID** and **Client Secret** obtained from Google Cloud Console.
   - Ensure the displayed callback URL matches what you entered in Google Cloud Console (`https://<PROJECT-REF>.supabase.co/auth/v1/callback`).
   - Click **Save**.
5. Go to **Authentication** > **URL Configuration**:
   - **Site URL**: `https://your-custom-subdomain.netlify.app` (or `http://localhost:8081` during local development)
   - **Redirect URLs**: Add:
     - `http://localhost:8081/**`
     - `hb://**` (for Native Android/iOS Deep Links)
     - `https://your-custom-subdomain.netlify.app/**`

---

## 3. Database Schema & Server-Side Security Trigger

Run the script in `supabase/schema.sql` inside the Supabase **SQL Editor**:

1. In Supabase Dashboard, click **SQL Editor** in the left sidebar.
2. Click **+ New Query**.
3. Copy and paste the entire contents of [`supabase/schema.sql`](./schema.sql).
4. Click **Run**.

### What This Does:
1. **Server-Side Enforcement**: Creates a PostgreSQL `BEFORE INSERT` trigger on `auth.users` named `tr_enforce_hbplus_domain_insert`. Any signup attempt from emails not ending in `@hbplus.fit` is aborted with the error:
   ```
   Access restricted. Please login using your official domain email.
   ```
2. **Profile Storage**: Creates `public.profiles` storing `full_name`, `email`, `avatar_url`, and `role`.
3. **Role-Based Access Control**: Assigns `'admin'` or `'user'`. Designated emails (like `admin@hbplus.fit`) are automatically assigned `'admin'`.
4. **Row Level Security (RLS)**: Enforces policies so unauthorized domains cannot read or query database rows.

---

## 4. Local Environment Configuration

In your project root, create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
```

---

## 5. Testing Domain Restriction

### Test Case A: Authorized User (`user@hbplus.fit`)
1. Click **Sign in with Google**.
2. Select or sign into an `@hbplus.fit` account.
3. The server trigger verifies the domain, provisions the profile, and navigates to the protected Dashboard displaying the user's name, email, Google avatar, and role.

### Test Case B: Unauthorized User (`user@gmail.com` or `user@yahoo.com`)
1. Click **Sign in with Google**.
2. Select a personal Gmail or Yahoo account.
3. **Server-Side Trigger Blocks**: Supabase Auth triggers `enforce_hbplus_domain()`, throwing an exception.
4. **Client-Side Guard Confirms**: Session is immediately terminated with `supabase.auth.signOut()`.
5. The login screen displays:
   ```
   Access restricted. Please login using your official domain email.
   ```
6. Direct URL access to `/(app)` is redirected back to `/(auth)/login`.
