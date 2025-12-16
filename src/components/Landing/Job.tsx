"use client";

import { useEffect, useState } from "react";
import {
  getJobById,
  getJobsByCompanyId,
} from "@/app/actions/landingpage/getJob";
import Image from "next/image";
import Link from "next/link";
import { Building2, MapPinXInside, Clock7, MoveUpRight } from "lucide-react";
import { Button } from "../ui/button";
import JobCard from "./JobCard";

interface JobProps {
  jobId: string;
}

export default function Job({ jobId }: JobProps) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [jobsByCompany, setJobsByCompany] = useState<any[]>([]);
  const [companyJobsError, setCompanyJobsError] = useState<Error | null>(null);
  const [loadingJobsByCompany, setLoadingJobsByCompany] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function fetchJobsByCompany() {
      if (job?.companies?.id) {
        setLoadingJobsByCompany(true);
        try {
          const jobsData = await getJobsByCompanyId(job.companies.id, jobId);
          setJobsByCompany(jobsData);
        } catch (err) {
          setCompanyJobsError(err as Error);
        } finally {
          setLoadingJobsByCompany(false);
        }
      }
    }
    fetchJobsByCompany();
  }, [job?.companies?.id, jobId]);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      setError(null);
      try {
        const jobData = await getJobById(jobId);
        setJob(jobData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId]);

  const getSalaryText = () => {
    if (!job?.salary_min || !job?.salary_max) {
      return "Negotiable";
    }
    return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
  };

  const getPostedDay = () => {
    if (!job?.created_at) return "Recently";
    const createdAt = new Date(job.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-6 py-6 mt-6">
          <div className="flex gap-8 items-center p-6 animate-pulse">
            {/* Logo skeleton */}
            <div className="w-[180px] h-[180px] bg-gray-200 rounded"></div>

            <div className="flex flex-col gap-4 flex-1">
              {/* Title skeleton */}
              <div className="flex flex-col gap-2">
                <div className="h-6 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>

              {/* Info row skeleton */}
              <div className="flex items-center gap-6">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Links skeleton */}
              <div className="flex gap-8">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-nowrap gap-6">
          <div className="w-3/4 animate-pulse">
            {/* Description skeleton */}
            <div className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>

            {/* Requirements skeleton */}
            <div className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>

            {/* Benefits skeleton */}
            <div className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          </div>

          <div className="w-1/4 animate-pulse">
            {/* Sidebar skeleton */}
            <div className="flex flex-col gap-4 border-notice px-4 py-6 border">
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
            <div className="h-12 bg-gray-200 rounded my-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
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
          <p className="text-red-700 font-semibold text-lg">
            Error loading job
          </p>
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto p-6">
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
          <p className="text-gray-700 font-semibold text-lg">Job not found</p>
          <p className="text-gray-500 text-sm mt-2">
            The job you're looking for doesn't exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="border border-gray-300 overflow-hidden">
          <div className="flex gap-10 items-start p-10">
            <div className="flex-shrink-0">
              <div className="w-[180px] h-[180px] overflow-hidden border border-gray-300">
                <Image
                  src={job.companies.logo_url}
                  alt={job.companies.company_name}
                  width={180}
                  height={180}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 flex-1">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {job.title}
                </h1>
                <h2 className="text-lg text-gray-600 font-medium">
                  {job.companies.company_name}
                </h2>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-sm text-gray-700">
                <span className="font-medium">{job.location}</span>
                <span className="text-gray-400">•</span>
                <span className="font-medium">{getSalaryText()}</span>
                <span className="text-gray-400">•</span>
                <span className="font-medium">0 Applications</span>
                <span className="text-gray-400">•</span>
                <span className="font-medium">{getPostedDay()}</span>
              </div>
              <div className="flex gap-6 pt-4 border-t border-gray-200">
                <Link
                  href="#"
                  className="text-notice text-sm font-semibold hover:text-notice/80 transition-colors"
                >
                  Company Profile
                </Link>
                <Link
                  href="#"
                  className="text-notice text-sm font-semibold hover:text-notice/80 transition-colors"
                >
                  Jobs at {job.companies.company_name}
                  <span className="ml-2 text-gray-500">(0)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-nowrap gap-6">
        <div className="w-3/4">
          <div className="mb-8">
            <h1 className="text-lg font-bold mb-8">Job Description</h1>
            <div className="text-sm text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">
              {job.description ? (
                <div
                  className="break-words overflow-wrap-anywhere whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-lg font-bold mb-8">Job Requirements</h1>
            {job.requirements &&
            Array.isArray(job.requirements) &&
            job.requirements.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                {job.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No requirements listed
              </p>
            )}
          </div>
          <div className="mb-8">
            <h1 className="text-lg font-bold mb-8">Job Benefits</h1>
            {job.benefits &&
            Array.isArray(job.benefits) &&
            job.benefits.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                {job.benefits.map((benefit: string, index: number) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No benefits listed</p>
            )}
          </div>
        </div>
        <div className="w-1/4">
          <div className="flex flex-col gap-4 mx-auto border-notice px-4 py-6 border">
            <div className="flex gap-2 items-center">
              <MoveUpRight size={25} className="text-notice" />
              <div>
                <h1 className="text-sm font-bold">Experience</h1>
                <p className="text-sm text-gray-600">
                  {job.experience_level || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Building2 size={25} className="text-notice" />
              <div>
                <h1 className="text-sm font-bold">Industry</h1>
                <p className="text-sm text-gray-600">
                  {job.job_categories?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <MapPinXInside size={25} className="text-notice" />
              <div>
                <h1 className="text-sm font-bold">Remote</h1>
                <p className="text-sm text-gray-600">
                  {job.remote ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Clock7 size={25} className="text-notice" />
              <div>
                <h1 className="text-sm font-bold">Job Type</h1>
                <p className="text-sm text-gray-600">{job.job_type || "N/A"}</p>
              </div>
            </div>
          </div>
          <Button className="rounded-none my-4 w-full bg-notice py-4 hover:bg-notice/90 font-bold transition-colors">
            Apply Now
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-12 mt-2">
        <h1 className="text-lg font-bold mb-10">
          Latest jobs of{" "}
          <span className="text-notice">{job.companies.company_name}</span>
        </h1>
        <div>
          {loadingJobsByCompany && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-notice"></div>
              <p className="mt-4 text-gray-600 text-lg">Loading jobs...</p>
            </div>
          )}

          {companyJobsError && (
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
              <p className="text-red-700 font-semibold text-lg">
                Error loading jobs
              </p>
              <p className="text-red-600 text-sm mt-2">
                {companyJobsError.message}
              </p>
            </div>
          )}

          {!loadingJobsByCompany &&
            !companyJobsError &&
            jobsByCompany.length === 0 && (
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
                <p className="text-gray-700 font-semibold text-lg">
                  No jobs found
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  This company has no other available positions at the moment
                </p>
              </div>
            )}

          {!loadingJobsByCompany &&
            !companyJobsError &&
            jobsByCompany.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobsByCompany.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <JobCard job={job} />
                  </Link>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
