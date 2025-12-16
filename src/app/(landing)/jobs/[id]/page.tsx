import Job from "@/components/Landing/Job";

export default function JobPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      <Job jobId={params.id} />
    </div>
  );
}
