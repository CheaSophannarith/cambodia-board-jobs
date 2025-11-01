"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileId: string | null;
  companyId: string | null;
  role: "admin" | "recruiter" | "employee" | null;
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
  const [role, setRole] = useState<"admin" | "recruiter" | "employee" | null>(
    null
  );
  const supabase = createClient();

  const fetchCompanyData = async (userId: string) => {
    try {
      // Optimized: Use a single JOIN query instead of 2 sequential queries
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          company_members!inner(
            company_id,
            role,
            is_active
          )
        `)
        .eq("user_id", userId)
        .eq("company_members.is_active", true)
        .single();

      if (profileError || !profileData) {
        // User might not have a company membership (e.g., jobseeker)
        // Try to get just the profile without company data
        const { data: simpleProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (simpleProfile) {
          setProfileId(simpleProfile.id);
        } else {
          setProfileId(null);
        }
        setCompanyId(null);
        setRole(null);
        return;
      }

      setProfileId(profileData.id);

      // Type assertion for company_members array
      const memberData = (profileData.company_members as any)?.[0];

      if (memberData) {
        setCompanyId(memberData.company_id);
        setRole(memberData.role as "admin" | "recruiter" | "employee");
      } else {
        setCompanyId(null);
        setRole(null);
      }
    } catch (error) {
      console.error("Error in fetchCompanyData:", error);
      setProfileId(null);
      setCompanyId(null);
      setRole(null);
    }
  };

  const refreshCompanyData = async () => {
    if (user) {
      await fetchCompanyData(user.id);
    }
  };

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
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setUser(currentUser);

        if (currentUser && event !== 'TOKEN_REFRESHED') {
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
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, profileId, companyId, role, refreshCompanyData }}
    >
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
