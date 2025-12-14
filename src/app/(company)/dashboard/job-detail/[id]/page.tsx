import JobDetail from "@/components/Company/job/JobDetail";
import { getDetailJob } from "@/app/actions/job/getDetailJob";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = Number(id);
  const detailJob = await getDetailJob(jobId);

  if (!detailJob) {
    return <div>Job not found.</div>;
  }

  return (
    <div className="min-h-screen px-4 py-4">
      <div className="flex items-center mb-4 gap-4">
        <Button variant="outline" asChild className="border-primary">
          <Link href="/dashboard">Back</Link>
        </Button>
        <h1 className="text-xl uppercase font-bold">
          Job Detail Of {detailJob.title}
        </h1>
      </div>
      <JobDetail job={detailJob} />
    </div>
  );
}
