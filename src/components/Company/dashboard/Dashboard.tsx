"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Briefcase, User } from "lucide-react";
import {
  getStatistics,
  getJobTypesDistribution,
  getPostedJobsLastSixMonths,
  getJobExperienceLevelsDistribution,
  getIsRemoteJobDistribution,
  getJobStatusDistribution
} from "@/app/actions/dashboard/dashboard";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import JobTypes from "@/components/Company/dashboard/Charts/JobTypes";
import PostedJobLastSixMonths from "@/components/Company/dashboard/Charts/PostedJobLastSixMonths";
import StatusJob from "@/components/Company/dashboard/Charts/StatusJob";
import IsRemote from "@/components/Company/dashboard/Charts/IsRemote";
import ExperienceLevel from "./Charts/ExperienceLevel";

interface Statistics {
  totalJobs: number;
  totalActiveJobs: number;
  totalUsers: number;
  totalActiveUsers: number;
}

type JobTypeData = {
  label: string;
  count: number;
};

export default function Dashboard() {
  const { companyName, companyId, loading: authLoading } = useAuth();
  const [statistics, setStatistics] = useState<Statistics>({
    totalJobs: 0,
    totalActiveJobs: 0,
    totalUsers: 0,
    totalActiveUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);

  const [jobTypeData, setJobTypeData] = useState<JobTypeData[]>([]);
  const [jobTypeLoading, setJobTypeLoading] = useState(true);
  const [jobTypeError, setJobTypeError] = useState<string | null>(null);

  const [postedJobData, setPostedJobData] = useState<any[]>([]);
  const [postedJobLoading, setPostedJobLoading] = useState(true);
  const [postedJobError, setPostedJobError] = useState<string | null>(null);

  const [jobLevelData, setJobLevelData] = useState<any[]>([]);
  const [jobLevelLoading, setJobLevelLoading] = useState(true);
  const [jobLevelError, setJobLevelError] = useState<string | null>(null);

  const [isRemoteData, setIsRemoteData] = useState<any[]>([]);
  const [isRemoteLoading, setIsRemoteLoading] = useState(true);
  const [isRemoteError, setIsRemoteError] = useState<string | null>(null);

  const [jobStatusData, setJobStatusData] = useState<any[]>([]);
  const [jobStatusLoading, setJobStatusLoading] = useState(true);
  const [jobStatusError, setJobStatusError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatistics() {
      if (authLoading) {
        return;
      }

      if (!companyId) {
        setStatisticsError("Company ID is not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStatistics(companyId);
        setStatistics(data);
        setStatisticsError(null);
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        setStatisticsError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStatistics();
  }, [companyId, authLoading]);

  useEffect(() => {
    async function fetchJobTypeDistribution() {
      if (authLoading) {
        return;
      }

      if (!companyId) {
        setJobTypeError("Company ID is not available");
        setJobTypeLoading(false);
        return;
      }
      try {
        setJobTypeLoading(true);
        const data = await getJobTypesDistribution(companyId);
        setJobTypeData(data);
        setJobTypeError(null);
      } catch (err) {
        console.error("Failed to fetch job type distribution:", err);
        setJobTypeError("Failed to load job type distribution");
      } finally {
        setJobTypeLoading(false);
      }
    }
    fetchJobTypeDistribution();
  }, [companyId, authLoading]);

  useEffect(() => {
    async function fetchPostedJobsLastSixMonth() {
      if (authLoading) {
        return;
      }

      if (!companyId) {
        setPostedJobError("Company ID is not available");
        setPostedJobLoading(false);
        return;
      }
      try {
        setPostedJobLoading(true);
        const data = await getPostedJobsLastSixMonths(companyId);
        setPostedJobData(data);
        setPostedJobError(null);
      } catch (err) {
        console.error("Failed to fetch posted jobs in last six months:", err);
        setPostedJobError("Failed to load posted jobs data");
      } finally {
        setPostedJobLoading(false);
      }
    }
    fetchPostedJobsLastSixMonth();
  }, [companyId, authLoading]);

  useEffect(() => {
    async function fetchExperienceJobLevelDistribution() {
      if (authLoading) {
        return;
      }

      if (!companyId) {
        setJobLevelError("Company ID is not available");
        setJobLevelLoading(false);
        return;
      }
      try {
        setJobLevelLoading(true);
        const data = await getJobExperienceLevelsDistribution(companyId);
        setJobLevelData(data);
        setJobLevelError(null);
      } catch (err) {
        console.error(
          "Failed to fetch experience job level distribution:",
          err
        );
        setJobLevelError("Failed to load experience job level distribution");
      } finally {
        setJobLevelLoading(false);
      }
    }
    fetchExperienceJobLevelDistribution();
  }, [companyId, authLoading]);

  useEffect(() => {
    async function fetchIsRemoteDistribution() {
      if (authLoading) {
        return;
      }
      if (!companyId) {
        setIsRemoteError("Company ID is not available");
        setIsRemoteLoading(false);
        return;
      }
      try {
        setIsRemoteLoading(true);
        const data = await getIsRemoteJobDistribution(companyId);
        setIsRemoteData(data);
        setIsRemoteError(null);
      } catch (err) {
        console.error("Failed to fetch is remote distribution:", err);
        setIsRemoteError("Failed to load is remote distribution");
      } finally {
        setIsRemoteLoading(false);
      }
    }
    fetchIsRemoteDistribution();
  }, [companyId, authLoading]);

  useEffect(() => {
    async function fetchJobStatusDistribution() {
      if (authLoading) {
        return;
      }
      if (!companyId) {
        setJobStatusError("Company ID is not available");
        setJobStatusLoading(false);
        return;
      }
      try {
        setJobStatusLoading(true);
        const data = await getJobStatusDistribution(companyId);
        setJobStatusData(data);
        setJobStatusError(null);
      }
      catch (err) {
        console.error("Failed to fetch job status distribution:", err);
        setJobStatusError("Failed to load job status distribution");
      }
      finally {
        setJobStatusLoading(false);
      }
    }
    fetchJobStatusDistribution();
  }, [companyId, authLoading]);

  return (
    <div>
      <div className="text-3xl font-bold">Dashboard Overview</div>
      <div className="mt-2 text-gray-500">
        Welcome back, <span className="text-notice">{companyName} !</span>
      </div>
      {statisticsError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {statisticsError}
        </div>
      )}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="w-full">
          <div className="flex justify-between p-4 md:p-6">
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm md:text-base">Total Jobs</p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {loading ? "..." : statistics.totalJobs}
              </p>
            </div>
            <div>
              <Briefcase size={25} className="text-notice ml-auto" />
            </div>
          </div>
        </Card>
        <Card className="w-full">
          <div className="flex justify-between p-4 md:p-6">
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm md:text-base">Active Jobs</p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {loading ? "..." : statistics.totalActiveJobs}
              </p>
            </div>
            <div>
              <Briefcase size={25} className="text-notice ml-auto" />
            </div>
          </div>
        </Card>
        <Card className="w-full">
          <div className="flex justify-between p-4 md:p-6">
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm md:text-base">Total Users</p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {loading ? "..." : statistics.totalUsers}
              </p>
            </div>
            <div>
              <User size={25} className="text-notice ml-auto" />
            </div>
          </div>
        </Card>
        <Card className="w-full">
          <div className="flex justify-between p-4 md:p-6">
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm md:text-base">Active Users</p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {loading ? "..." : statistics.totalActiveUsers}
              </p>
            </div>
            <div>
              <User size={25} className="text-notice ml-auto" />
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-16">
        <h1 className="text-2xl text-gray-600">Quick Action</h1>
        <div className="flex gap-2 mt-4">
          <Link href="/company-users">
            <Button
              variant="outline"
              className="px-8 py-6 border-gray-500 text-gray-600 text-lg 
               hover:bg-notice hover:text-white hover:border-white"
            >
              Manage Users
            </Button>
          </Link>
          <Link href="/job-list">
            <Button
              variant="outline"
              className="px-8 py-6 border-gray-500 text-gray-600 text-lg 
               hover:bg-notice hover:text-white hover:border-white"
            >
              All Jobs
            </Button>
          </Link>
          <Link href="/all-application">
            <Button
              variant="outline"
              className="px-8 py-6 border-gray-500 text-gray-600 text-lg 
               hover:bg-notice hover:text-white hover:border-white"
            >
              All Applications
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-16 bg-white rounded-lg">
        {jobTypeError ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {jobTypeError}
          </div>
        ) : jobTypeLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading job types...
          </div>
        ) : (
          <JobTypes jobTypeData={jobTypeData} />
        )}
      </div>
      <div className="mt-16 bg-white rounded-lg">
        {postedJobError ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {postedJobError}
          </div>
        ) : postedJobLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading posted jobs last six months types...
          </div>
        ) : (
          <PostedJobLastSixMonths PostedJobsLastSixMonthsData={postedJobData} />
        )}
      </div>
      <div className="mt-16 bg-white rounded-lg">
        {jobLevelError ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {jobLevelError}
          </div>
        ) : jobLevelLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading job experience level...
          </div>
        ) : (
          <ExperienceLevel ExperienceLevelData={jobLevelData} />
        )}
      </div>
      <div className="mt-16 bg-white rounded-lg">
        {isRemoteError ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {isRemoteError}
          </div>
        ) : isRemoteLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading total of remote and onsite jobs...
          </div>
        ) : (
          <IsRemote isRemoteData={isRemoteData} />
        )}
      </div>
      <div className="mt-16 bg-white rounded-lg">
        {jobStatusError ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {jobStatusError}
          </div>
        ) : jobStatusLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading total of jobs status...
          </div>
        ) : (
          <StatusJob StatusJobData={jobStatusData} />
        )}
      </div>
    </div>
  );
}
