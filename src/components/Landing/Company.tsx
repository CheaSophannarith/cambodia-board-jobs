"use client";

import { useEffect, useState } from "react";
import { getCompanyById } from "@/app/actions/landingpage/getCompany";
import { getJobsByCompanyId } from "@/app/actions/landingpage/getJob";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  MapPinXInside,
  Users,
  Briefcase,
  Link as Website,
  Linkedin,
} from "lucide-react";
import JobCard from "./JobCard";

interface CompanyProps {
  comId: string;
}

export default function Company({ comId }: CompanyProps) {
  const [company, setCompany] = useState<any>(null);
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
      if (comId) {
        setLoadingJobsByCompany(true);
        try {
          const jobsData = await getJobsByCompanyId(comId);
          setJobsByCompany(jobsData);
        } catch (err) {
          setCompanyJobsError(err as Error);
        } finally {
          setLoadingJobsByCompany(false);
        }
      }
    }
    fetchJobsByCompany();
  }, [comId]);

  useEffect(() => {
    async function fetchCompany() {
      setLoading(true);
      setError(null);
      try {
        const companyData = await getCompanyById(comId);
        setCompany(companyData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [comId]);

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
              </div>

              {/* Links skeleton */}
              <div className="flex gap-8">
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
            </div>
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
            Error loading company
          </p>
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!company) {
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
          <p className="text-gray-700 font-semibold text-lg">
            Company not found
          </p>
          <p className="text-gray-500 text-sm mt-2">
            The company you're looking for doesn't exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="border border-gray-300 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start p-4 sm:p-6 md:p-10">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[180px] md:h-[180px] overflow-hidden border border-gray-300">
                <Image
                  src={company.logo_url || "/placeholder-company.png"}
                  alt={company.company_name}
                  width={180}
                  height={180}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 flex-1 w-full">
              <div className="flex flex-col gap-2 text-center md:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {company.company_name}
                </h1>
                <h2 className="text-base sm:text-lg text-gray-600 font-medium">
                  {company.industry || "Industry not specified"}
                </h2>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm text-gray-700">
                <span className="font-medium">
                  {company.headquarters || "Headquarters not specified"}
                </span>
                <span className="text-gray-400">•</span>
                <span className="font-medium">
                  Total Jobs: {company.total_jobs || 0}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-t border-gray-200 pt-4">
                <Link
                  href={`#jobs`}
                  className="text-notice text-sm font-semibold hover:text-notice/80 transition-colors"
                >
                  View All Jobs
                  <span className="ml-2 text-gray-500">
                    ({company.total_jobs || 0})
                  </span>
                </Link>
                {company.company_website && (
                  <a
                    href={company.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-notice hover:text-notice/80 transition-colors text-sm font-semibold"
                  >
                    <Website className="text-notice" size={18} />
                    <span>Website</span>
                  </a>
                )}
                {company.linkedin_url && (
                  <a
                    href={company.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-notice hover:text-notice/80 transition-colors text-sm font-semibold"
                  >
                    <Linkedin className="text-notice" size={18} />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar for mobile/tablet - shown first */}
        <div className="lg:hidden w-full">
          <div className="flex flex-col gap-4 mx-auto border-notice px-4 py-6 border">
            <div className="flex gap-2 items-center">
              <Building2 size={25} className="text-notice flex-shrink-0" />
              <div>
                <h1 className="text-sm font-bold">Industry</h1>
                <p className="text-sm text-gray-600">
                  {company.industry || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <MapPinXInside size={25} className="text-notice flex-shrink-0" />
              <div>
                <h1 className="text-sm font-bold">Headquarter</h1>
                <p className="text-sm text-gray-600">
                  {company.headquarters || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Users size={25} className="text-notice flex-shrink-0" />
              <div>
                <h1 className="text-sm font-bold">Company Size</h1>
                <p className="text-sm text-gray-600">
                  {company.company_size || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Briefcase size={25} className="text-notice flex-shrink-0" />
              <div>
                <h1 className="text-sm font-bold">Total Jobs</h1>
                <p className="text-sm text-gray-600">
                  {company.total_jobs || 0} positions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <div className="mb-8">
            <h1 className="text-base sm:text-lg font-bold mb-4 sm:mb-8">
              About Company
            </h1>
            <div className="text-sm text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">
              {company.description ? (
                <div
                  className="break-words overflow-wrap-anywhere whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: company.description }}
                />
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}
            </div>
          </div>
          {company.website && (
            <div className="mb-8">
              <h1 className="text-base sm:text-lg font-bold mb-4">Website</h1>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-notice hover:text-notice/80 transition-colors text-sm break-all"
              >
                {company.website}
              </a>
            </div>
          )}
        </div>

        {/* Sidebar for desktop */}
        <div className="hidden lg:block w-1/4">
          <div className="flex flex-col gap-4 mx-auto border-notice px-4 py-6 border">
            <div className="flex gap-2 items-center">
              <Building2 size={25} className="text-notice" />
              <div>
                <h1 className="text-sm font-bold">Industry</h1>
                <p className="text-sm text-gray-600">
                  {company.industry || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <MapPinXInside size={25} className="text-notice" />
              <div>
                <h1 className="text-sm font-bold">Headquarter</h1>
                <p className="text-sm text-gray-600">
                  {company.headquarters || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Users size={25} className="text-notice" />
              <div>
                <h1 className="text-sm font-bold">Company Size</h1>
                <p className="text-sm text-gray-600">
                  {company.company_size || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Briefcase size={25} className="text-notice" />
              <div>
                <h1 className="text-sm font-bold">Total Jobs</h1>
                <p className="text-sm text-gray-600">
                  {company.total_jobs || 0} positions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="jobs" className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 mt-8">
        <h1 className="text-base sm:text-lg font-bold mb-6 sm:mb-10">
          Jobs at <span className="text-notice">{company.company_name}</span>
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
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50">
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
                  This company has no available positions at the moment
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
