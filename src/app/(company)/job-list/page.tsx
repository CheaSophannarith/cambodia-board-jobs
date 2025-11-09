"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllJobs } from "@/app/actions/job/getAllJobs";
import DataTable, { Column } from "@/components/Company/DataTable";

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  status: string;
  created_at: string;
  application_deadline: string | null;
  is_remote: boolean;
  experience_level: string;
}

export default function JobListPage() {
  const {
    companyId,
    loading: authLoading,
    profileId,
    role,
    refreshCompanyData,
  } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const jobsData = await getAllJobs(companyId);
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchJobs();
    }
  }, [companyId, authLoading]);

  const columns: Column<Job>[] = [
    {
      key: "title",
      header: "Title",
      className: "font-medium",
    },
    {
      key: "location",
      header: "Location",
      render: (job) => (job.is_remote ? "Remote" : job.location),
    },
    {
      key: "job_type",
      header: "Type",
      className: "capitalize",
    },
    {
      key: "experience_level",
      header: "Experience",
      className: "capitalize",
    },
    {
      key: "status",
      header: "Status",
      render: (job) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            job.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {job.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Posted Date",
      render: (job) => new Date(job.created_at).toLocaleDateString(),
    },
    {
      key: "application_deadline",
      header: "Application Deadline",
      render: (job) =>
        job.application_deadline
          ? new Date(job.application_deadline).toLocaleDateString()
          : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (job) => (
        <a
          className="text-white bg-blue-500 rounded-xl px-4 py-1 mr-[-4] hover:underline inline-block"
          href={`/job-list/job-detail/${job.id}`}
        >
          Detail
        </a>
      ),
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex flex-col justify-center items-center py-8 gap-4">
        <p className="text-red-500">
          You are not associated with any company. Please create a company
          profile first.
        </p>
        <button
          onClick={() => refreshCompanyData()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Company Data
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4">
      <h1 className="text-xl uppercase font-bold">All Jobs</h1>
      <DataTable
        data={jobs}
        columns={columns}
        getRowKey={(job) => job.id}
        loading={loading}
        emptyMessage="No jobs found. Create your first job posting!"
      />
    </div>
  );
}
