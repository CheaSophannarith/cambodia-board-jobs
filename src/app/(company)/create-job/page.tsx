import { redirect } from "next/navigation";
import { checkJobLimit } from "@/app/actions/job/checkJobLimit";
import CreateJobDialog from "@/components/Company/job/CreateJobDialog";

export default async function CreateJobPage() {
  // Check job limit on the server before rendering
  const result = await checkJobLimit();

  // Handle different redirect scenarios
  if (!result.canCreate) {
    switch (result.reason) {
      case 'not_authenticated':
        redirect('/login');
      case 'no_profile':
      case 'no_company':
      case 'company_not_found':
        redirect('/company-profile');
      case 'limit_reached':
        redirect('/subscription');
      default:
        redirect('/');
    }
  }

  // If all checks pass, render the create job dialog
  return <CreateJobDialog />;
}
