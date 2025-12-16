"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllJobs } from "@/app/actions/landingpage/getAllJobs";
import JobCard from "./JobCard";

interface JobSearchProps {
  searchFilters?: {
    title?: string;
    location?: string;
  };
}

export default function JobSearch({ searchFilters }: JobSearchProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const jobsData = await getAllJobs();
        setJobs(jobsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Filter jobs based on search criteria
  const filteredJobs = useMemo(() => {
    if (!searchFilters || (!searchFilters.title && !searchFilters.location)) {
      return jobs;
    }

    return jobs.filter((job) => {
      const matchesTitle = !searchFilters.title ||
        job.title?.toLowerCase().includes(searchFilters.title.toLowerCase());

      const matchesLocation = !searchFilters.location ||
        job.location?.toLowerCase().includes(searchFilters.location.toLowerCase());

      return matchesTitle && matchesLocation;
    });
  }, [jobs, searchFilters]);

  return (
    <div className="">
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-notice"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading jobs...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-lg">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-700 font-semibold text-lg">Error loading jobs</p>
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        </div>
      )}

      {!loading && !error && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-lg">No jobs found</p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your search criteria
          </p>
        </div>
      )}

      {!loading && !error && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
