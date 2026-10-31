import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  isAuthorizedDomain,
  DOMAIN_RESTRICTION_ERROR_MESSAGE,
  ALLOWED_DOMAIN,
} from '../utils/domainValidator';

// Complete any pending auth session in web browser if applicable
WebBrowser.maybeCompleteAuthSession();

export interface AuthResult {
  success: boolean;
  error?: string | null;
  cancelled?: boolean;
}

/**
 * Parses query and hash fragment parameters from a callback URL
 */
function extractParamsFromUrl(url: string): { [key: string]: string } {
  const params: { [key: string]: string } = {};

  try {
    // Check both query and fragment
    const hashIndex = url.indexOf('#');
    const queryIndex = url.indexOf('?');

    let queryString = '';
    let hashString = '';

    if (queryIndex !== -1) {
      const endOfQuery = hashIndex > queryIndex ? hashIndex : url.length;
      queryString = url.substring(queryIndex + 1, endOfQuery);
    }

    if (hashIndex !== -1) {
      hashString = url.substring(hashIndex + 1);
    }

    const parsePart = (str: string) => {
      if (!str) return;
      const pairs = str.split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (k) {
          params[decodeURIComponent(k)] = decodeURIComponent(v || '');
        }
      }
    };

    parsePart(queryString);
    parsePart(hashString);
  } catch (e) {
    console.error('Failed to parse redirect URL params:', e);
  }

  return params;
}

/**
 * Initiates Google OAuth 2.0 flow using Supabase.
 * Supports iOS, Android, and Web platforms with strict domain validation.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          'Supabase project is not connected yet. Please update EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file with your actual Supabase project credentials.',
      };
    }

    const queryParams: Record<string, string> = {
      prompt: 'select_account',
    };
    // Only attach Google Workspace hosted domain hint if it is a corporate domain
    if (
      ALLOWED_DOMAIN &&
      !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(ALLOWED_DOMAIN)
    ) {
      queryParams.hd = ALLOWED_DOMAIN;
    }

    if (Platform.OS === 'web') {
      // WEB FLOW:
      // Direct OAuth redirect to Google, returning to the current origin
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${redirectOrigin}/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } else {
      // MOBILE FLOW (iOS & Android):
      // Generate redirect URI matching native scheme 'hb://callback'
      const redirectUrl = makeRedirectUri({
        scheme: 'hb',
        path: 'callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.url) {
        return { success: false, error: 'Could not generate OAuth authorization URL.' };
      }

      // Open secure in-app browser session
      const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
        showInRecents: true,
      });

      if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
        return { success: false, cancelled: true };
      }

      if (authResult.type !== 'success' || !authResult.url) {
        return { success: false, error: 'Authentication was interrupted or failed.' };
      }

      // Extract parameters from callback URL
      const params = extractParamsFromUrl(authResult.url);

      // Check if server-side trigger threw an error during signup
      if (params.error || params.error_description) {
        const errorDesc = params.error_description || params.error || '';
        const isDomainRejection =
          errorDesc.toLowerCase().includes('restricted') ||
          errorDesc.toLowerCase().includes('official domain') ||
          errorDesc.toLowerCase().includes('saving new user') ||
          errorDesc.toLowerCase().includes('database error');

        if (isDomainRejection) {
          return { success: false, error: DOMAIN_RESTRICTION_ERROR_MESSAGE };
        }
        return { success: false, error: errorDesc };
      }

      // Handle OAuth Implicit / Fragment flow (access_token & refresh_token)
      if (params.access_token && params.refresh_token) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (sessionError) {
          return { success: false, error: sessionError.message };
        }

        const userEmail = sessionData?.user?.email;
        // Verify domain immediately on client side
        if (!isAuthorizedDomain(userEmail)) {
          await supabase.auth.signOut();
          return { success: false, error: DOMAIN_RESTRICTION_ERROR_MESSAGE };
        }

        return { success: true };
      }

      // Handle OAuth PKCE flow (auth code)
      if (params.code) {
        const { data: codeData, error: codeError } =
          await supabase.auth.exchangeCodeForSession(params.code);

        if (codeError) {
          return { success: false, error: codeError.message };
        }

        const userEmail = codeData?.user?.email;
        if (!isAuthorizedDomain(userEmail)) {
          await supabase.auth.signOut();
          return { success: false, error: DOMAIN_RESTRICTION_ERROR_MESSAGE };
        }

        return { success: true };
      }

      return { success: false, error: 'No authentication tokens found in redirect URL.' };
    }
  } catch (err: any) {
    console.error('Sign-in error:', err);
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred during Google sign-in.',
    };
  }
}

/**
 * Signs the user out across all platforms and cleans up session tokens.
 */
export async function signOut(): Promise<{ error?: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err?.message || 'Failed to sign out.' };
  }
}
