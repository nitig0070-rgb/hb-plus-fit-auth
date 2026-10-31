# HB Plus Fit — Cross-Platform Enterprise Authentication App

A complete, production-ready, enterprise-grade cross-platform authentication application built with **React Native**, **Expo (SDK 58)**, **React Native Web**, and **Supabase**.

Strictly enforces **company email domain access control** (`@hbplus.fit`) with defense-in-depth: **server-side PostgreSQL triggers**, **Row Level Security (RLS)**, and **client-side route guards**.

---

## 🌟 Features

- **Google OAuth 2.0 Integration**: Native in-app browser authentication on iOS and Android (`expo-web-browser` / `expo-auth-session`) and direct OAuth redirect flow on Web.
- **Strict Domain Restriction (`@hbplus.fit`)**:
  - Exclusively permits corporate `@hbplus.fit` Google Workspace accounts.
  - Hard-blocks personal email providers (`@gmail.com`, `@yahoo.com`, etc.).
  - Displays explicit error: `"Access restricted. Please login using your official domain email."`
  - **Server-Side Enforcement**: PostgreSQL `BEFORE INSERT` trigger aborts any unauthorized signup at the database engine level.
- **Protected Dashboard**:
  - Displays authenticated user's Google display name, verified email, and profile avatar.
  - Verified `@hbplus.fit` employee badge.
  - Session token metadata viewer & security audit modal.
  - One-click cross-platform secure logout.
- **Role-Based Access Control (RBAC)**:
  - **Administrator (`admin`)**: Grants access to the company directory, employee list, and role promotion/demotion tools.
  - **Staff Member (`user`)**: Grants access to company portals, employee tools, and fitness telemetry.
  - Profile data automatically synchronized into `public.profiles` upon OAuth sign-in.
- **Security & Route Protection**:
  - Protected layout guards prevent direct URL deep-linking or unauthorized browser history navigation.
  - Hardware-backed encrypted storage (`expo-secure-store` via iOS Keychain / Android Keystore) on mobile; encrypted storage on Web.
  - PostgreSQL Row Level Security (RLS) ensures users can only query authorized data.
- **Responsive UI/UX**:
  - Tailored dark-mode enterprise theme designed for mobile phones, tablets, and desktop web.
  - High-fidelity Google Login button with Google's official brand palette.
  - Informative security banners, loading states, and error handling.
- **Netlify Ready**: Pre-configured with `netlify.toml` and SPA routing redirects for static web deployment.

---

## 📁 Project Architecture & Folder Structure

```
hb/
├── app/                        # Expo Router file-based screens and routes
│   ├── (auth)/                 # Public authentication routes
│   │   ├── _layout.tsx         # Auth stack navigator with session redirect
│   │   └── login.tsx           # Enterprise login screen with Google OAuth button
│   ├── (app)/                  # Protected application routes (authenticated users only)
│   │   ├── _layout.tsx         # Security layout guard (domain & session validation)
│   │   └── index.tsx           # Employee dashboard, profile, & admin governance panel
│   ├── _layout.tsx             # Root layout with AuthProvider & SafeAreaProvider
│   ├── callback.tsx            # Universal OAuth redirect handler
│   ├── index.tsx               # Root entry redirector
│   └── +not-found.tsx          # 404 error screen
├── components/                 # Modular, reusable UI components
│   ├── AdminPanel.tsx          # Admin directory, analytics, & role management
│   ├── GoogleLoginButton.tsx   # Pixel-accurate branded Google sign-in button
│   ├── LoadingIndicator.tsx    # Cross-platform spinner & status indicator
│   ├── SecurityBanner.tsx      # Domain alerts, warnings, and error banners
│   ├── SessionInfoModal.tsx    # JWT token inspector & storage audit dialog
│   └── UserProfileCard.tsx     # Profile badge, Google picture, & role indicators
├── context/                    # State management
│   └── AuthContext.tsx         # Central authentication context & domain enforcement
├── services/                   # Backend & API communication
│   ├── authService.ts          # Google OAuth flows for Web, iOS, and Android
│   ├── profileService.ts       # Database CRUD for public.profiles & roles
│   └── supabase.ts             # Supabase client with cross-platform secure storage
├── utils/                      # Helper utilities
│   ├── domainValidator.ts      # Domain restriction logic (@hbplus.fit)
│   └── formatters.ts           # Date, initials, and token masking helpers
├── supabase/                   # Database migrations & configuration
│   ├── schema.sql              # PostgreSQL schema, server trigger, & RLS policies
│   └── setup-instructions.md   # Step-by-step Supabase & Google Console guide
├── assets/                     # Images, adaptive icons, and vector assets
├── public/                     # Static assets copied directly to web build
│   └── _redirects              # Netlify SPA redirect rule
├── netlify.toml                # Netlify build & security headers configuration
├── app.json                    # Expo project configuration (schemes, icons, bundle IDs)
├── tsconfig.json               # TypeScript configuration with @/* path aliases
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Project documentation
```

---

## 🔒 Multi-Layered Domain Restriction Architecture

```
[ User Initiates Sign-In ]
            │
            ▼
[ Google OAuth 2.0 Consent Screen ]
            │ (User selects account)
            ▼
┌────────────────────────────────────────────────────────┐
│              LAYER 1: Server-Side Postgres             │
│                                                        │
│  Trigger: 'tr_enforce_hbplus_domain_insert'            │
│  Checks: NEW.email LIKE '%@hbplus.fit'                 │
│                                                        │
│  [ Unauthorized Domain (@gmail.com, etc.) ]            │
│        └──> RAISE EXCEPTION 'Access restricted...'     │
│             Transaction rolls back; User creation denied
└────────────────────────────────────────────────────────┘
            │ (If Authorized: @hbplus.fit)
            ▼
┌────────────────────────────────────────────────────────┐
│           LAYER 2: Database Row Level Security         │
│                                                        │
│  RLS Policy on public.profiles:                        │
│  auth.jwt()->>'email' LIKE '%@hbplus.fit'              │
│  Unauthorized tokens cannot read or write database rows│
└────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│            LAYER 3: Client-Side Route Guards           │
│                                                        │
│  AuthContext verifies email domain:                    │
│  - If unauthorized: immediate 'supabase.auth.signOut()'│
│  - Displays: "Access restricted. Please login using    │
│              your official domain email."              │
│  - Protected layout blocks direct URL access to /(app) │
└────────────────────────────────────────────────────────┘
            │
            ▼
[ Access Granted to Protected Dashboard ]
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18 or later
- **npm** or **bun**
- A [Supabase](https://supabase.com) account
- A [Google Cloud Console](https://console.cloud.google.com) project

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/hbplus-fit.git
cd hbplus-fit
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
```

### 4. Database Setup
1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and go to **SQL Editor**.
2. Open [`supabase/schema.sql`](./supabase/schema.sql), copy its contents, and click **Run**.
3. Follow the full steps in [`supabase/setup-instructions.md`](./supabase/setup-instructions.md) to enable Google OAuth in the Supabase Authentication dashboard.

### 5. Running the Application

- **Web**:
  ```bash
  npm run web
  ```
  Opens at `http://localhost:8081`.

- **Android**:
  ```bash
  npm run android
  ```

- **iOS**:
  ```bash
  npm run ios
  ```

### 6. Linting & Type Checking
```bash
npm run lint         # Runs ESLint (Zero errors/warnings)
npm run typecheck    # Runs TypeScript compiler check (Zero errors)
```

---

## 🌐 Web Deployment to Netlify

This project is pre-configured for automated continuous deployment to Netlify.

### Option A: Deploy via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Build the production static web bundle:
   ```bash
   npm run build:web
   ```
3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Option B: Deploy via Netlify Git Integration
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Netlify Dashboard, click **Add new site** > **Import an existing project**.
3. Select your repository.
4. The repository includes `netlify.toml`, which automatically configures:
   - **Build command**: `npm run build:web`
   - **Publish directory**: `dist`
   - **Redirects**: `/* -> /index.html 200` (SPA routing)
5. Under **Site configuration** > **Environment variables**, add:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit`
6. Click **Deploy site**.
7. Copy your Netlify URL (e.g., `https://hbplus-fit.netlify.app`) and add it to:
   - **Google Cloud Console**: Authorized JavaScript origins and redirect URIs (`https://hbplus-fit.netlify.app/callback`).
   - **Supabase Authentication**: URL Configuration (Site URL & Redirect URLs).

---

## 🧪 Testing Authorized & Unauthorized Scenarios

| Scenario | Tested Account | Expected Behavior |
| :--- | :--- | :--- |
| **Authorized Corporate User** | `user@hbplus.fit` | User is authenticated. Profile is created in `public.profiles`. Directed to protected Dashboard with user name, email, Google avatar, and `Verified @hbplus.fit` badge. |
| **Corporate Administrator** | `admin@hbplus.fit` | User is granted `admin` role. Gains access to the Admin Control Panel, user directory, and ability to promote/demote members. |
| **Personal Gmail Account** | `user@gmail.com` | Blocked server-side by PostgreSQL trigger. Client shows: `"Access restricted. Please login using your official domain email."` No session is created. |
| **Other Email Domains** | `user@yahoo.com` | Blocked immediately. No access to protected routes or database resources. |
| **Direct URL Access** | Navigating to `/(app)` | Unauthenticated user is immediately redirected to `/(auth)/login`. |

---

## 📄 License
MIT License. © HB Plus Fit Inc.
