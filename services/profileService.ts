import { supabase } from './supabase';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  department: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches the current authenticated user's profile from Supabase Database.
 */
export async function getProfile(userId: string): Promise<{
  profile: UserProfile | null;
  error?: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile from database:', error.message);
      return { profile: null, error: error.message };
    }

    return { profile: data as UserProfile | null };
  } catch (err: any) {
    return { profile: null, error: err?.message || 'Failed to fetch user profile' };
  }
}

/**
 * Ensures a profile row exists in the profiles table for the given authenticated user.
 */
export async function ensureProfileExists(user: {
  id: string;
  email: string;
  user_metadata?: { [key: string]: any };
}): Promise<UserProfile | null> {
  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) {
      return existing as UserProfile;
    }

    const meta = user.user_metadata || {};
    const fullName = meta.full_name || meta.name || user.email.split('@')[0];
    const avatarUrl = meta.avatar_url || meta.picture || '';
    const isSpecialAdmin =
      user.email.toLowerCase() === 'admin@hbplus.fit' || meta.is_admin === true;

    const newProfile = {
      id: user.id,
      email: user.email,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: (isSpecialAdmin ? 'admin' : 'user') as UserRole,
      department: 'Corporate Headquarters',
      last_sign_in_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Could not upsert profile:', error.message);
      return null;
    }

    return created as UserProfile;
  } catch (err) {
    console.error('ensureProfileExists error:', err);
    return null;
  }
}

/**
 * Fetches all user profiles in the company. Only permitted for users with role='admin' via RLS.
 */
export async function getAllProfiles(): Promise<{
  profiles: UserProfile[];
  error?: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { profiles: [], error: error.message };
    }

    return { profiles: (data as UserProfile[]) || [] };
  } catch (err: any) {
    return { profiles: [], error: err?.message || 'Failed to fetch profiles.' };
  }
}

/**
 * Updates a user's role (Admin action).
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update role.' };
  }
}
