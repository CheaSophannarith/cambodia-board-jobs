"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileId: string | null;
  companyId: string | null;
  role: "admin" | "recruiter" | "employee" | "member" | "viewer" | null;
  refreshCompanyData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profileId: null,
  companyId: null,
  role: null,
  refreshCompanyData: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<
    "admin" | "recruiter" | "employee" | "member" | "viewer" | null
  >(null);

  // Create supabase client once using useMemo to avoid recreation on every render
  const supabase = useMemo(() => createClient(), []);

  const fetchCompanyData = useCallback(async (userId: string) => {
    try {
      // Get profile first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        setProfileId(null);
        setCompanyId(null);
        setRole(null);
        return;
      }

      setProfileId(profileData.id);

      // Get company membership separately
      const { data: memberData } = await supabase
        .from("company_members")
        .select("company_id, role")
        .eq("profile_id", profileData.id)
        .eq("is_active", true)
        .maybeSingle();

      if (memberData) {
        setCompanyId(memberData.company_id);
        setRole(
          memberData.role as
            | "admin"
            | "recruiter"
            | "employee"
            | "member"
            | "viewer"
        );
      } else {
        setCompanyId(null);
        setRole(null);
      }
    } catch (error) {
      setProfileId(null);
      setCompanyId(null);
      setRole(null);
    }
  }, [supabase]);

  const refreshCompanyData = useCallback(async () => {
    if (user) {
      await fetchCompanyData(user.id);
    }
  }, [user, fetchCompanyData]);

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      setUser(user);

      if (user) {
        await fetchCompanyData(user.id);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes - optimized to prevent duplicate fetches
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      const currentUser = session?.user ?? null;

      // Only fetch data if the user actually changed or on SIGNED_IN event
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED"
      ) {
        setUser(currentUser);

        if (currentUser && event !== "TOKEN_REFRESHED") {
          await fetchCompanyData(currentUser.id);
        } else if (!currentUser) {
          setProfileId(null);
          setCompanyId(null);
          setRole(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchCompanyData, supabase]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ user, loading, profileId, companyId, role, refreshCompanyData }),
    [user, loading, profileId, companyId, role, refreshCompanyData]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
