import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CompanyApplicationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  const userType = user.user_metadata?.user_type as string;
  const displayName = user.user_metadata?.display_name as string;

  // Redirect to profile application if wrong user type
  if (userType !== "company") {
    redirect("/profile-application");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md">
        <h1 className="text-4xl font-bold text-notice mt-12">
          Create your company profile
        </h1>
        <p className="text-sm text-gray-600 mt-2">Welcome, {displayName}!</p>
        <p className="text-sm text-gray-500 mt-1">User Type: {userType}</p>
      </div>
    </div>
  );
}
