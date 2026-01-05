import { getApplicationDetail } from "@/app/actions/application/getApplicationDetail";
import ApplicationDetail from "@/components/Company/ApplicationDetail";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ read?: string }>;
}) {
  const { id } = await params;
  const { read } = await searchParams;

  // Mark notification as read if read=true is passed
  const isRead = read === "true";
  const result = await getApplicationDetail(id, isRead);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen px-4 py-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">
            {result.error || "Application not found"}
          </p>
          <Button variant="outline" asChild className="border-primary">
            <Link href="/all-application">Back to Applications</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4">
      <div className="flex items-center mb-4 gap-4">
        <Button variant="outline" asChild className="border-primary">
          <Link href="/all-application">Back</Link>
        </Button>
        <h1 className="text-xl uppercase font-bold">
          Application for {result.data.job.title}
        </h1>
      </div>
      <ApplicationDetail application={result.data} />
    </div>
  );
}
