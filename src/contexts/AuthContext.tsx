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
      // Get profile for this user
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        setProfileId(null);
        setCompanyId(null);
        setRole(null);
        return;
      }

      setProfileId(profileData.id);

      // Get company membership through company_members
      const { data: memberData, error: memberError } = await supabase
        .from("company_members")
        .select("company_id, role, is_active")
        .eq("profile_id", profileData.id)
        .eq("is_active", true)
        .single();

      if (memberError || !memberData) {
        console.error("Error fetching company membership:", memberError);
        setCompanyId(null);
        setRole(null);
        return;
      }

      setCompanyId(memberData.company_id);
      setRole(memberData.role as "admin" | "recruiter" | "employee");
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
    // Get initial session
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        await fetchCompanyData(user.id);
      }

      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchCompanyData(currentUser.id);
      } else {
        setProfileId(null);
        setCompanyId(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
