import CompanyApplication from "@/components/Company/profile/CompanyApplication";
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
      <div>
        <CompanyApplication userType={userType} displayName={displayName} />
      </div>
  );
}
