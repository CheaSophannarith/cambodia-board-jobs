import { getUserApplications } from "@/app/actions/application/getUserApplications";
import ApplicationsList from "@/components/profile/ApplicationsList";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  
  const result = await getUserApplications();

  if (!result.success) {
    // If user is not authenticated, redirect to login
    if (result.error === "Not authenticated") {
      redirect("/login");
    }
  }

  return <ApplicationsList applications={result.data || []} />;
}