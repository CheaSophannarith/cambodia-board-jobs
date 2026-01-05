"use client";

import { type ApplicationDetail as ApplicationDetailType } from "@/app/actions/application/getApplicationDetail";
import updateStatus from "@/app/actions/application/getApplicationDetail";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  FileText,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicationDetailProps {
  application: ApplicationDetailType;
}

export default function ApplicationDetail({
  application,
}: ApplicationDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(application.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load avatar URL
    if (application.job_seeker.avatar_url) {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(application.job_seeker.avatar_url);

      if (data?.publicUrl) {
        setAvatarUrl(data.publicUrl);
      }
    }

    // Load resume URL
    const loadResumeUrl = async () => {
      if (application.resume_url) {
        const { data } = supabase.storage
          .from("resumes")
          .getPublicUrl(application.resume_url);

        if (data?.publicUrl) {
          setResumeUrl(data.publicUrl);
        }
      }
    };

    loadResumeUrl();
  }, [application, supabase]);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const result = await updateStatus(application.id, status);

      if (!result.success) {
        throw new Error(result.error || "Failed to update status");
      }

      toast.success("Application status updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const formatSalary = () => {
    const { salary_min, salary_max, currency } = application.job;
    if (!salary_min && !salary_max) return "Not specified";

    const curr = currency || "USD";
    if (salary_min && salary_max) {
      return `${curr} ${salary_min.toLocaleString()} - ${salary_max.toLocaleString()}`;
    }
    return salary_min
      ? `${curr} ${salary_min.toLocaleString()}+`
      : `Up to ${curr} ${salary_max?.toLocaleString()}`;
  };

  return (
    <div className="bg-white border border-gray-200 p-6">
      {/* Job Seeker Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Applicant Information
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={application.job_seeker.full_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {application.job_seeker.full_name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.job_seeker.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{application.job_seeker.email}</span>
                </div>
              )}

              {application.job_seeker.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{application.job_seeker.phone}</span>
                </div>
              )}

              {application.job_seeker.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{application.job_seeker.location}</span>
                </div>
              )}

              {application.job_seeker.linkedin_url && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <a
                    href={application.job_seeker.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Job Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Job Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Position
            </label>
            <p className="text-lg text-gray-900">{application.job.title}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Job Type
              </label>
              <p className="text-gray-900 capitalize">
                {application.job.job_type.replace("_", " ")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Location
              </label>
              <p className="text-gray-900">{application.job.location}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Salary Range
              </label>
              <p className="text-gray-900">{formatSalary()}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Experience Level
              </label>
              <p className="text-gray-900">
                {application.job.experience_level}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <div className="text-gray-700 whitespace-pre-wrap break-all overflow-hidden bg-gray-50 p-4 border border-gray-200">
              {application.job.description}
            </div>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Application Details */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Application Details
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Applied Date
            </label>
            <p className="text-gray-900" suppressHydrationWarning>
              {new Date(application.applied_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center gap-4">
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(
                    value as "pending" | "accepted" | "rejected" | "reviewing"
                  )
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {status !== application.status && (
                <Button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="bg-notice hover:bg-notice/90 text-white rounded-none"
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Letter
            </label>
            <div className="bg-gray-50 p-4 border border-gray-200 whitespace-pre-wrap break-all overflow-hidden text-gray-700">
              {application.cover_letter || "No cover letter provided"}
            </div>
          </div>

          {application.resume_url && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Resume
              </label>
              {resumeUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-notice text-white hover:bg-notice/80 hover:text-white bg-notice rounded-none"
                >
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    View Resume
                  </a>
                </Button>
              ) : (
                <p className="text-gray-500 text-sm">Loading resume...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
