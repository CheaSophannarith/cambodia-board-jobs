"use client";

import { CompanyApplicationWithDetails } from "@/app/actions/application/getCompanyApplications";
import DataTable, { Column } from "@/components/Company/DataTable";
import { FileText, Eye, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface CompanyApplicationsListProps {
  applications: CompanyApplicationWithDetails[];
}

export default function CompanyApplicationsList({
  applications,
}: CompanyApplicationsListProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [resumeUrls, setResumeUrls] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    // Generate signed URLs for all resumes in parallel (valid for 1 hour)
    const loadResumeUrls = async () => {
      // Fetch all URLs simultaneously for better performance
      const urlPromises = applications.map(async (app) => {
        if (!app.resume_url) return null;

        const { data, error } = await supabase.storage
          .from("resumes")
          .createSignedUrl(app.resume_url, 3600);

        if (data?.signedUrl && !error) {
          return { id: app.id, url: data.signedUrl };
        }

        // Fallback to public URL if signed URL fails
        const { data: publicUrlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(app.resume_url);

        if (publicUrlData?.publicUrl) {
          return { id: app.id, url: publicUrlData.publicUrl };
        }

        console.error("Error loading resume for app", app.id, error);
        return null;
      });

      // Wait for all promises to complete
      const results = await Promise.all(urlPromises);

      // Build URLs object from results
      const urls: Record<string, string> = {};
      results.forEach((result) => {
        if (result) {
          urls[result.id] = result.url;
        }
      });

      setResumeUrls(urls);
    };

    loadResumeUrls();
  }, [applications]);

  const columns: Column<CompanyApplicationWithDetails>[] = [
    {
      key: "applicant_name",
      header: "APPLICANT NAME",
      className: "font-medium",
      render: (app) => app.job_seeker.full_name,
    },
    {
      key: "job_title",
      header: "JOB TITLE",
      render: (app) => app.job.title,
    },
    {
      key: "applied_date",
      header: "APPLIED DATE",
      render: (app) =>
        new Date(app.applied_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "status",
      header: "STATUS",
      render: (app) => {
        const statusLower = app.status.toLowerCase();
        let bgColor = "bg-gray-100";
        let textColor = "text-gray-800";

        if (statusLower === "pending") {
          bgColor = "bg-yellow-100";
          textColor = "text-yellow-800";
        } else if (statusLower === "accepted") {
          bgColor = "bg-green-100";
          textColor = "text-green-800";
        } else if (statusLower === "rejected") {
          bgColor = "bg-red-100";
          textColor = "text-red-800";
        } else if (statusLower === "reviewing") {
          bgColor = "bg-blue-100";
          textColor = "text-blue-800";
        }

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs ${bgColor} ${textColor} capitalize`}
          >
            {app.status}
          </span>
        );
      },
    },
    {
      key: "resume",
      header: "RESUME",
      render: (app) => {
        if (!mounted) {
          return app.resume_url ? (
            <span className="text-gray-400 text-sm">Loading...</span>
          ) : (
            <span className="text-gray-400 text-sm">No resume</span>
          );
        }

        const signedUrl = resumeUrls[app.id];
        return app.resume_url ? (
          signedUrl ? (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              View
            </a>
          ) : (
            <span className="text-gray-400 text-sm">Loading...</span>
          )
        ) : (
          <span className="text-gray-400 text-sm">No resume</span>
        );
      },
    },
    {
      key: "actions",
      header: "ACTIONS",
      render: (app) => (
        <a
          href={`/all-application/${app.id}`}
          className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View Details
        </a>
      ),
    },
  ];

  // Filter applications based on search
  const filteredApplications = applications.filter(
    (app) =>
      app.job_seeker.full_name
        .toLowerCase()
        .includes(searchFilter.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 py-4">
      <h1 className="text-xl uppercase font-bold">All Applications</h1>
      <br />
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring"
        />
      </div>
      <DataTable
        data={filteredApplications}
        columns={columns}
        getRowKey={(app) => app.id}
        emptyMessage="No applications found."
      />
    </div>
  );
}
