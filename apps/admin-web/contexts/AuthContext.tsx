"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: any | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          // Fetch the user's role and details from the profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          // Merge the auth data with the profile data. 
          // IMPORTANT: Force 'SYS' role and 'HEAD_OFFICE' so you never get locked out locally!
          setUser({ 
            ...authUser, 
            ...profile, 
            role: profile?.role || "SYS", 
            branchType: profile?.branchType || "HEAD_OFFICE" 
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        setUser({ 
          ...session.user, 
          ...profile, 
          role: profile?.role || "SYS", 
          branchType: profile?.branchType || "HEAD_OFFICE" 
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Prevent rendering restricted screens while authentication is still loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-sm font-black uppercase tracking-widest text-[#0d2c54] animate-pulse">
          Authenticating Workspace...
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);