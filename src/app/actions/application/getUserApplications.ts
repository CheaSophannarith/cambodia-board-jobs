"use server";

import { createClient } from "@/utils/supabase/server";

interface SupabaseApplication {
  id: string;
  job_id: string;
  cover_letter: string;
  resume_url: string;
  status: string;
  applied_at: string;
  jobs: {
    title: string;
    companies: {
      company_name: string;
    };
  } | null;
}

export interface ApplicationWithJob {
  id: string;
  job_id: string;
  cover_letter: string;
  resume_url: string;
  status: string;
  applied_at: string;
  job: {
    title: string;
    company: {
      company_name: string;
    };
  };
}

export async function getUserApplications() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    // Calculate date for 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // First, get the user's profile ID since applications reference profiles.id
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profileData) {
      console.error("[getUserApplications] Profile error:", profileError);
      return {
        success: false,
        error: "Profile not found",
        data: [],
      };
    }

    // Fetch applications with job and company details
    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(
        `
        id,
        job_id,
        cover_letter,
        resume_url,
        status,
        applied_at,
        jobs (
          title,
          companies (
            company_name
          )
        )
      `
      )
      .eq("job_seeker_id", profileData.id)
      .gte("applied_at", oneMonthAgo.toISOString())
      .order("applied_at", { ascending: false });

    if (applicationsError) {
      console.error("[getUserApplications] Error details:", {
        message: applicationsError.message,
        details: applicationsError.details,
        hint: applicationsError.hint,
        code: applicationsError.code,
      });
      throw new Error("Failed to fetch applications");
    }

    // Transform the data to match ApplicationWithJob interface
    const transformedApplications: ApplicationWithJob[] = (applications as unknown as SupabaseApplication[]).map((app) => ({
      id: app.id,
      job_id: app.job_id,
      cover_letter: app.cover_letter,
      resume_url: app.resume_url,
      status: app.status,
      applied_at: app.applied_at,
      job: {
        title: app.jobs?.title || "Unknown Job",
        company: {
          company_name: app.jobs?.companies?.company_name || "Unknown Company",
        },
      },
    }));

    return {
      success: true,
      data: transformedApplications,
    };
  } catch (error: any) {
    console.error("[getUserApplications] Unexpected error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      data: [],
    };
  }
}
