import { useState, useEffect, createContext, useContext } from 'react';
import { fetchApi } from '@/lib/api';
import { socket } from '@/lib/socket';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const data = await fetchApi('/auth/me', { method: 'GET' });
        if (mounted && data?.user) {
          setUser(data.user);
          setUserProfile(data.user); // Using backend response directly as profile
          // Create a mock session object for compatibility if some frontend component explicitly requires it
          setSession({ user: data.user });
          socket.connect();
        }
      } catch (error) {
        // HTTP 401 unauthenticated is expected if no cookie
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signUp = async (email, password, userData = {}) => {
    try {
      const data = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          fullName: userData.full_name || '',
          // Explicitly omit role here; backend ignores it for public registration anyway
        })
      });

      setUser(data.user);
      setUserProfile(data.user);
      setSession({ user: data.user });
      socket.connect();

      toast({
        title: "Success!",
        description: "Registration successful. Welcome!",
      });

      return { data, error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        })
      });

      setUser(data.user);
      setUserProfile(data.user);
      setSession({ user: data.user });
      socket.connect();

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      return { data, error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signInWithGoogle = async (credential) => {
    try {
      const data = await fetchApi('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      });

      setUser(data.user);
      setUserProfile(data.user);
      setSession({ user: data.user });
      socket.connect();

      toast({
        title: "Welcome!",
        description: "Signed in with Google successfully.",
      });

      return { data, error: null };
    } catch (error) {
      toast({
        title: "Google Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      socket.disconnect();
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates) => {
    try {
      const data = await fetchApi('/resident/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      const updatedUser = data.user || data;

      // Update the local state with the returned profile data
      setUserProfile(updatedUser);
      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });

      return { data: updatedUser, error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

