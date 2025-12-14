"use client";

import { Eye } from "lucide-react";
import { Column } from "../../DataTable";

interface LatestJobsProps {
  latestJobsData: any[];
}

interface LatestJobsData {
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

const columns: Column<LatestJobsData>[] = [
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
        href={`/dashboard/job-detail/${job.id}`}
      >
        <Eye className="w-4 h-4" />
        View Details
      </a>
    ),
  },
];

export default function LatestJobs({ latestJobsData }: LatestJobsProps) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Latest Jobs</h2>
        {latestJobsData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No jobs found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className="text-left p-3 text-sm font-semibold text-gray-600"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestJobsData.map((job: LatestJobsData) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`p-3 text-sm ${column.className || ""}`}
                      >
                        {column.render
                          ? column.render(job)
                          : String(
                              job[column.key as keyof LatestJobsData] ?? ""
                            )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
