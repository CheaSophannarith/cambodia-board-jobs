"use client";

import { ApplicationWithJob } from "@/app/actions/application/getUserApplications";
import DataTable, { Column } from "@/components/Company/DataTable";
import { FileText, ExternalLink, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

interface ApplicationsListProps {
  applications: ApplicationWithJob[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  reviewing: "bg-blue-100 text-blue-800",
};

export default function ApplicationsList({
  applications,
}: ApplicationsListProps) {
  const supabase = createClient();
  const [resumeUrls, setResumeUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate signed URLs for all resumes (valid for 1 hour)
    const loadResumeUrls = async () => {
      const urls: Record<string, string> = {};

      for (const app of applications) {
        if (app.resume_url) {
          const { data, error } = await supabase.storage
            .from('resumes')
            .createSignedUrl(app.resume_url, 3600); // 1 hour expiry

          if (data?.signedUrl && !error) {
            urls[app.id] = data.signedUrl;
          }
        }
      }

      setResumeUrls(urls);
    };

    loadResumeUrls();
  }, [applications, supabase]);

  // Desktop table columns
  const columns: Column<ApplicationWithJob>[] = [
    {
      key: "job_title",
      header: "Job Title",
      render: (app) => (
        <div className="font-medium text-gray-900">{app.job.title}</div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (app) => (
        <div className="text-gray-700">{app.job.company.company_name}</div>
      ),
    },
    {
      key: "applied_date",
      header: "Applied Date",
      render: (app) => (
        <div className="text-gray-600">
          {new Date(app.applied_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (app) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusColors[app.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
        </span>
      ),
    },
    {
      key: "resume",
      header: "Resume",
      render: (app) => (
        <div className="flex gap-2">
          {resumeUrls[app.id] ? (
            <a
              href={resumeUrls[app.id]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-notice hover:text-notice/80 text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              View
            </a>
          ) : app.resume_url ? (
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Loading...
            </span>
          ) : (
            <span className="text-gray-400 text-sm">No resume</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (app) => (
        <Link
          href={`/jobs/${app.job_id}`}
          className="flex items-center gap-1 text-notice hover:text-notice/80 text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          View Job
        </Link>
      ),
    },
  ];

  // Mobile card component
  const MobileApplicationCard = ({ app }: { app: ApplicationWithJob }) => (
    <div className="bg-white border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-base line-clamp-2 flex-1 pr-2">
          {app.job.title}
        </h3>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            statusColors[app.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
        </span>
      </div>

      <div className="flex items-center text-sm text-gray-600 mb-2">
        <Building2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
        <span className="line-clamp-1">{app.job.company.company_name}</span>
      </div>

      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
        <span>
          {new Date(app.applied_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {resumeUrls[app.id] && (
          <a
            href={resumeUrls[app.id]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-notice text-notice text-sm font-medium hover:bg-notice hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            View Resume
          </a>
        )}
        <Link
          href={`/jobs/${app.job_id}`}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-notice text-white text-sm font-medium hover:bg-notice/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Job Details
        </Link>
      </div>
    </div>
  );

  if (applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                My Applications
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                Track your job applications
              </p>
            </div>
            <div className="p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                  No applications yet
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                  You haven't applied to any jobs.
                </p>
                <Link
                  href="/"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-notice text-white text-sm sm:text-base font-semibold hover:bg-notice/90 transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              My Applications
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
              {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
            </p>
          </div>

          {/* Mobile view - Cards */}
          <div className="block md:hidden p-3">
            {applications.map((app) => (
              <MobileApplicationCard key={app.id} app={app} />
            ))}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden md:block p-4 sm:p-6 lg:p-8">
            <DataTable
              columns={columns}
              data={applications}
              getRowKey={(app) => app.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
