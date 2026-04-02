// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../supabase'; // Import your existing function
import { AppRole } from '../types';

// Create a singleton instance for the entire app
const supabase = createClient(); 

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        // Fetch Role from 'profiles' table based on your Diagram
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile) setUserRole(profile.role as AppRole);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for logins/logouts
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(profile?.role || null);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading, supabase }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);