import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured, probeSupabaseStatus } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCitizen: boolean;
  loading: boolean;
  tablesReady: boolean;
  supabaseConfigured: boolean;
  registerCitizen: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; needsEmailVerification?: boolean; error?: string }>;
  loginCitizen: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserPhone: (phone: string, verified: boolean) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tablesReady, setTablesReady] = useState<boolean>(false);

  // Safely fetch verified profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId: string, email: string, userMetadata?: any): Promise<UserProfile> => {
    if (!supabase) {
      return {
        id: userId,
        email,
        fullName: userMetadata?.full_name || email.split('@')[0],
        phone: userMetadata?.phone,
        phoneVerified: false,
        role: 'citizen',
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        return {
          id: data.id,
          email,
          fullName: data.full_name || userMetadata?.full_name || email.split('@')[0],
          phone: data.phone || userMetadata?.phone,
          phoneVerified: Boolean(data.phone_verified),
          role: (data.role as UserRole) || 'citizen',
          createdAt: data.created_at || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Profile fetch warning (table may be pending migration):', e);
    }

    // Fallback if profiles table is pending creation
    return {
      id: userId,
      email,
      fullName: userMetadata?.full_name || email.split('@')[0],
      phone: userMetadata?.phone,
      phoneVerified: false,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Error refreshing profile:', err);
    }
  }, [fetchProfile]);

  // Initial session and database probe
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!supabase) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // Probe database tables status
        const status = await probeSupabaseStatus();
        if (isMounted) {
          setTablesReady(status.tablesReady);
        }

        // Check active Supabase Auth session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && isMounted) {
          const profile = await fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
          setUser(profile);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (err) {
        console.warn('Supabase session initialization error:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    if (!supabase) return;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Citizen Registration via Supabase Auth
  const registerCitizen = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ success: boolean; needsEmailVerification?: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone ? phone.trim() : '',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id, email, { full_name: fullName, phone });
        setUser(profile);
        return { success: true };
      }

      // If Supabase has email confirmation enabled
      if (data.user && !data.session) {
        return {
          success: true,
          needsEmailVerification: true,
        };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  // Citizen Login via Supabase Auth
  const loginCitizen = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase connection is unconfigured.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id, data.user.email || email, data.user.user_metadata);
        setUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Failed to authenticate user.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Admin Login via Supabase Auth (Strictly verifies role in profiles table)
  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase connection is unconfigured.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id, data.user.email || email, data.user.user_metadata);

        // Strict authorization check: Must be 'admin' in profiles table
        if (profile.role !== 'admin') {
          // Immediately sign out to prevent unauthorized session
          await supabase.auth.signOut();
          setUser(null);
          return {
            success: false,
            error: 'Access denied: This account does not possess verified municipal administrator privileges. An administrator must assign the admin role to your account.',
          };
        }

        setUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Authentication failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Admin login failed' };
    }
  };

  // Sign out
  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
    setUser(null);
  };

  // Update phone
  const updateUserPhone = async (phone: string, verified: boolean) => {
    if (!user) return;
    const updated = {
      ...user,
      phone,
      phoneVerified: verified,
    };
    setUser(updated);

    if (supabase && user.id) {
      try {
        await supabase
          .from('profiles')
          .update({ phone, phone_verified: verified })
          .eq('id', user.id);
      } catch (e) {
        console.warn('Update phone warning:', e);
      }
    }
  };

  // Password Recovery via Supabase Auth
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/#citizen_login`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user);
  const isAdmin = role === 'admin';
  const isCitizen = role === 'citizen';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isCitizen,
        loading,
        tablesReady,
        supabaseConfigured: isSupabaseConfigured,
        registerCitizen,
        loginCitizen,
        loginAdmin,
        logout,
        updateUserPhone,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
