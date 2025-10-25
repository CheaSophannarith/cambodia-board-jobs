import JobTable from "@/components/Company/job/JobTable";

export default function JobListPage() {
  return (
    <div className="min-h-screen px-4 py-4">
      <h1 className="text-xl uppercase font-bold">All Jobs</h1>
      <JobTable />
    </div>
  );
}
