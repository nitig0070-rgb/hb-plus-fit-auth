import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { LoadingIndicator } from '../components/LoadingIndicator';
import {
  isAuthorizedDomain,
  DOMAIN_RESTRICTION_ERROR_MESSAGE,
} from '../utils/domainValidator';

export default function CallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function handleAuthCallback() {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const hash = window.location.hash;
          const search = window.location.search;

          // Check for error parameters returned from Supabase Auth / Google
          const searchParams = new URLSearchParams(search);
          const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);

          const error = searchParams.get('error') || hashParams.get('error');
          const errorDescription =
            searchParams.get('error_description') || hashParams.get('error_description');

          if (error || errorDescription) {
            const desc = errorDescription || error || '';
            const isDomainRejection =
              desc.toLowerCase().includes('restricted') ||
              desc.toLowerCase().includes('official domain') ||
              desc.toLowerCase().includes('saving new user') ||
              desc.toLowerCase().includes('database error');

            const msg = isDomainRejection ? DOMAIN_RESTRICTION_ERROR_MESSAGE : desc;

            if (active) {
              router.replace({
                pathname: '/(auth)/login',
                params: { error: msg },
              });
            }
            return;
          }

          // Check if tokens exist in URL hash
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error: setSessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setSessionErr) {
              if (active) {
                router.replace({
                  pathname: '/(auth)/login',
                  params: { error: setSessionErr.message },
                });
              }
              return;
            }

            const email = data.user?.email;
            if (!isAuthorizedDomain(email)) {
              await supabase.auth.signOut();
              if (active) {
                router.replace({
                  pathname: '/(auth)/login',
                  params: { error: DOMAIN_RESTRICTION_ERROR_MESSAGE },
                });
              }
              return;
            }

            if (active) {
              router.replace('/(app)');
            }
            return;
          }

          // Check for authorization code in search params
          const code = searchParams.get('code');
          if (code) {
            const { data, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (codeErr) {
              if (active) {
                router.replace({
                  pathname: '/(auth)/login',
                  params: { error: codeErr.message },
                });
              }
              return;
            }

            const email = data.user?.email;
            if (!isAuthorizedDomain(email)) {
              await supabase.auth.signOut();
              if (active) {
                router.replace({
                  pathname: '/(auth)/login',
                  params: { error: DOMAIN_RESTRICTION_ERROR_MESSAGE },
                });
              }
              return;
            }

            if (active) {
              router.replace('/(app)');
            }
            return;
          }
        }

        // Fallback: check if session is already established
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session && session.user) {
          if (!isAuthorizedDomain(session.user.email)) {
            await supabase.auth.signOut();
            if (active) {
              router.replace({
                pathname: '/(auth)/login',
                params: { error: DOMAIN_RESTRICTION_ERROR_MESSAGE },
              });
            }
          } else {
            if (active) {
              router.replace('/(app)');
            }
          }
        } else {
          if (active) {
            router.replace('/(auth)/login');
          }
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        if (active) {
          router.replace({
            pathname: '/(auth)/login',
            params: { error: err?.message || 'Authentication callback failed' },
          });
        }
      }
    }

    handleAuthCallback();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <LoadingIndicator message="Processing authentication tokens..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
