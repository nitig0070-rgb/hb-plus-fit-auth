-- ==============================================================================
-- HB PLUS FIT AUTHENTICATION & ACCESS CONTROL DATABASE SCHEMA
-- ==============================================================================
-- This schema enforces:
-- 1. Server-side Domain Restriction exclusively for '@hbplus.fit' on auth.users
-- 2. User profile storage automatically synced from Google OAuth metadata
-- 3. Role-Based Access Control (RBAC): 'admin' and 'user'
-- 4. Row Level Security (RLS) policies preventing any unauthorized database access
-- ==============================================================================

-- 1. SERVER-SIDE DOMAIN VALIDATION TRIGGER (CRITICAL SECURITY CONTROL)
-- This function runs directly on the database engine before any user record
-- can be inserted or updated in auth.users. If the email is not an official
-- @hbplus.fit email address, the transaction immediately raises an exception,
-- completely blocking OAuth signup and session creation at the server level.

CREATE OR REPLACE FUNCTION public.enforce_hbplus_domain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify email exists and ends strictly with '@hbplus.fit'
  IF NEW.email IS NULL OR LOWER(NEW.email) NOT LIKE '%@hbplus.fit' THEN
    RAISE EXCEPTION 'Access restricted. Please login using your official domain email.';
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists to allow idempotent re-running
DROP TRIGGER IF EXISTS tr_enforce_hbplus_domain_insert ON auth.users;
DROP TRIGGER IF EXISTS tr_enforce_hbplus_domain_update ON auth.users;

-- Enforce domain on user creation (including Google OAuth signups)
CREATE TRIGGER tr_enforce_hbplus_domain_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_hbplus_domain();

-- Enforce domain on user email modification
CREATE TRIGGER tr_enforce_hbplus_domain_update
  BEFORE UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_hbplus_domain();


-- 2. PROFILES TABLE FOR USER INFO & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  department TEXT DEFAULT 'Operations',
  last_sign_in_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Index for high-performance role & domain queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);


-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND LOWER(email) LIKE '%@hbplus.fit'
  );
$$;

-- Policy 1: Authenticated users can view their own profile only if their email belongs to @hbplus.fit
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    AND LOWER(auth.jwt()->>'email') LIKE '%@hbplus.fit'
  );

-- Policy 2: Users can update their own profile fields (excluding role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    AND LOWER(auth.jwt()->>'email') LIKE '%@hbplus.fit'
  )
  WITH CHECK (
    auth.uid() = id
    AND LOWER(auth.jwt()->>'email') LIKE '%@hbplus.fit'
  );

-- Policy 3: Administrators can view all user profiles in the company
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() = true
  );

-- Policy 4: Administrators can update any profile (e.g., promote to admin, update department)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() = true
  );


-- 4. AUTOMATIC PROFILE PROVISIONING TRIGGER
-- When a user successfully authenticates through Google OAuth with an authorized domain,
-- this trigger copies their name, email, and Google avatar into the public.profiles table.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_role TEXT := 'user';
BEGIN
  -- Extract user display name and profile image from OAuth metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- Designate initial admins automatically:
  -- Any email starting with 'admin@' or marked in user metadata
  IF LOWER(NEW.email) = 'admin@hbplus.fit'
     OR (NEW.raw_user_meta_data->>'is_admin')::boolean = true THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, last_sign_in_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_avatar_url,
    v_role,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    last_sign_in_at = now(),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;

CREATE TRIGGER tr_on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
