import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndSendWelcomeEmail = async (currentUser: User) => {
      try {
        const createdAt = new Date(currentUser.created_at).getTime();
        const lastSignIn = currentUser.last_sign_in_at 
          ? new Date(currentUser.last_sign_in_at).getTime() 
          : new Date().getTime();
        
        const timeDiffMs = Math.abs(lastSignIn - createdAt);
        console.log('Onboarding Check Log:', {
          email: currentUser.email,
          userCreatedAt: new Date(currentUser.created_at).toISOString(),
          userLastSignInAt: currentUser.last_sign_in_at ? new Date(currentUser.last_sign_in_at).toISOString() : 'N/A',
          timeDifferenceSeconds: timeDiffMs / 1000,
          isNewThreshold24Hours: timeDiffMs < 86400000
        });

        // Increase threshold to 24 hours (86400000 ms) for robust testing
        const isNew = timeDiffMs < 86400000;
        const storageKey = `welcome_email_sent_${currentUser.id}`;

        if (isNew && !localStorage.getItem(storageKey)) {
          localStorage.setItem(storageKey, 'true');
          console.log('New user signup detected! Sending welcome email via Edge Function...');
          const { error } = await supabase.functions.invoke('send-welcome-email', {
            body: {
              record: {
                email: currentUser.email,
                raw_user_meta_data: {
                  full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]
                }
              }
            }
          });
          if (error) throw error;
          console.log('Welcome email edge function triggered successfully.');
        }
      } catch (err) {
        console.error('Failed to trigger welcome email edge function:', err);
      }
    };


    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          checkAndSendWelcomeEmail(currentUser);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Set up event listener for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setLoading(false);
        if (currentUser) {
          checkAndSendWelcomeEmail(currentUser);
        }
      }
    );


    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
