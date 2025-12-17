import Job from "@/components/Landing/Job";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen">
      <Job jobId={id} />
    </div>
  );
}
