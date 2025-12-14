"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllJobs } from "@/app/actions/job/getAllJobs";
import DataTable, { Column } from "@/components/Company/DataTable";
import { Eye, Search } from "lucide-react";

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

// Helper function to format relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "1 day ago";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInWeeks === 1) {
    return "1 week ago";
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  } else if (diffInMonths === 1) {
    return "1 month ago";
  } else {
    return `${diffInMonths} months ago`;
  }
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

  const [jobTitleFilter, setJobTitleFilter] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const jobsData = await getAllJobs(companyId, jobTitleFilter);
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
  }, [companyId, jobTitleFilter, authLoading]);

  const columns: Column<Job>[] = [
    {
      key: "title",
      header: "JOB TITLE",
      className: "font-medium",
    },
    {
      key: "location",
      header: "LOCATION",
      render: (job) => (job.is_remote ? "Remote" : job.location),
    },
    {
      key: "job_type",
      header: "TYPE",
      className: "capitalize text-gray-600",
    },
    {
      key: "experience_level",
      header: "EXPERIENCE",
      className: "capitalize",
    },
    {
      key: "status",
      header: "STATUS",
      render: (job) => {
        const statusLower = job.status.toLowerCase();
        let bgColor = "bg-gray-100";
        let textColor = "text-gray-800";

        if (statusLower === "active") {
          bgColor = "bg-green-100";
          textColor = "text-green-800";
        } else if (statusLower === "closed") {
          bgColor = "bg-red-100";
          textColor = "text-red-800";
        } else if (statusLower === "inactive") {
          bgColor = "bg-gray-100";
          textColor = "text-gray-800";
        }

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs ${bgColor} ${textColor} capitalize`}
          >
            {job.status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "POSTED DATE",
      render: (job) => getRelativeTime(job.created_at),
    },
    {
      key: "application_deadline",
      header: "APPLICATION DEADLINE",
      render: (job) =>
        job.application_deadline
          ? getRelativeTime(job.application_deadline)
          : "N/A",
    },
    {
      key: "actions",
      header: "ACTIONS",
      render: (job) => (
        <a
          className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
          href={`/job-list/job-detail/${job.id}`}
        >
          <Eye className="w-4 h-4" />
          View Details
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
      <br />
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={jobTitleFilter}
          onChange={(e) => setJobTitleFilter(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring"
        />
      </div>
      <DataTable
        data={jobs}
        columns={columns}
        getRowKey={(job) => job.id}
        loading={loading}
        emptyMessage="No jobs found."
      />
    </div>
  );
}
