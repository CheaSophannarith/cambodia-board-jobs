"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllJobs } from "@/app/actions/job/getAllJobs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function JobTable() {
  const { companyId, loading: authLoading } = useAuth();
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

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-red-500">
          You are not associated with any company. Please create a company
          profile first.
        </p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">
          No jobs found. Create your first job posting!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Posted Date</TableHead>
            <TableHead>Application Deadline</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.is_remote ? "Remote" : job.location}</TableCell>
              <TableCell className="capitalize">{job.job_type}</TableCell>
              <TableCell className="capitalize">
                {job.experience_level}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    job.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {job.status}
                </span>
              </TableCell>
              <TableCell>
                {new Date(job.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {job.application_deadline
                  ? new Date(job.application_deadline).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <button className="text-white bg-blue-500 rounded-xl px-4 py-1 mr-[-4] hover:underline">
                  Detail
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
