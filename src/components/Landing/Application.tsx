"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getJobById } from "@/app/actions/landingpage/getJob";
import { getDetailUser } from "@/app/actions/user/getDetailUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Linkedin } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { toast } from "sonner";
import { createApplication } from "@/app/actions/application/createApplication";

const jobApplicationSchema = z.object({
  coverLetter: z
    .string()
    .min(10, "Cover letter must be at least 10 characters long"),
});

export default function Application({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    coverLetter?: string;
    resumeFile?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  console.log("Authenticated user:", user);

  useEffect(() => {
    async function fetchJob() {
      const jobData = await getJobById(jobId);
      setJob(jobData);
    }
    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate resume file
      if (!resumeFile) {
        setErrors({ resumeFile: "Please upload your resume" });
        toast.error("Please upload your resume");
        setIsLoading(false);
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(resumeFile.type)) {
        setErrors({ resumeFile: "Please upload a PDF or Word document" });
        toast.error("Please upload a PDF or Word document");
        setIsLoading(false);
        return;
      }

      // Validate file size (5MB max)
      if (resumeFile.size > 5 * 1024 * 1024) {
        setErrors({ resumeFile: "File size must be less than 5MB" });
        toast.error("File size must be less than 5MB");
        setIsLoading(false);
        return;
      }

      const validatedData = jobApplicationSchema.parse({
        coverLetter,
      });

      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("userId", user!.id);
      formData.append("coverLetter", validatedData.coverLetter);
      formData.append("resumeFile", resumeFile);

      const result = await createApplication(formData);

      if (result.success) {
        toast.success(result.message);

        // Redirect to success page
        const jobTitle = encodeURIComponent(job?.title || "this position");
        router.push(`/jobs/${jobId}/application/success?jobTitle=${jobTitle}`);
      } else {
        // Handle different error cases
        if (result.alreadyApplied) {
          toast.warning(result.message, {
            duration: 5000,
            action: {
              label: "View Applications",
              onClick: () => router.push("/profile/applications"),
            },
          });
        } else {
          toast.error(result.message);
        }
        setIsLoading(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { coverLetter?: string; resumeFile?: string } = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0] === "coverLetter") {
            fieldErrors.coverLetter = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors in the form");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        try {
          console.log("Fetching profile for user:", user.id);
          const profileData = await getDetailUser(user.id);
          console.log("Fetched user profile:", profileData);

          if (!profileData) {
            console.error("No profile data returned");
            toast.error(
              "Failed to load profile. Please complete your profile first."
            );
            return;
          }

          setProfile(profileData);
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile data");
        }
      } else {
        console.log("No user authenticated");
      }
    }
    fetchUserProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 lg:space-y-8"
        >
          {/* Basic Information Section */}
          <div className="bg-white p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Logo on the left */}
              {job?.companies?.logo_url && (
                <div className="flex-shrink-0">
                  <Image
                    src={job.companies.logo_url}
                    alt={job.companies.name || "Company logo"}
                    width={100}
                    height={100}
                    className="rounded-lg object-cover w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
                  />
                </div>
              )}

              {/* Text on the right */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                  Job Application for{" "}
                  <span className="text-notice">
                    {job ? job.title : "Loading..."}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Please complete the form below to apply for a job.
                </p>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4">
                <p className="font-light text-gray-600 text-xs sm:text-sm">
                  <span className="text-blue-600 font-semibold">Note:</span>{" "}
                  Some fields are pre-filled from your profile and cannot be
                  changed here
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile?.full_name || ""}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={profile?.location || ""}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="text"
                  value={profile?.email || ""}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profile?.phone || ""}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              {/* LinkedIn */}
              <div className="pb-4 border-b border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                {profile?.linkedin_url ? (
                  <Link
                    href={profile.linkedin_url}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-notice hover:underline text-sm break-all"
                  >
                    <Linkedin className="flex-shrink-0" size={18} />
                    <span className="break-all">{profile?.linkedin_url}</span>
                  </Link>
                ) : (
                  <span className="text-gray-500 text-xs sm:text-sm italic">
                    No LinkedIn profile provided
                  </span>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Cover Letter <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${
                    errors.coverLetter ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-notice`}
                  rows={6}
                  placeholder="Write your cover letter here... (minimum 10 characters)"
                />
                {errors.coverLetter && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.coverLetter}
                  </p>
                )}
              </div>
              {/* Resume Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Resume <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setResumeFile(file);
                        setErrors((prev) => ({
                          ...prev,
                          resumeFile: undefined,
                        }));
                      }
                    }}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${
                      errors.resumeFile ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-3 sm:file:px-4 file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-notice file:text-white hover:file:bg-notice/90 file:cursor-pointer`}
                  />
                  {resumeFile && (
                    <button
                      type="button"
                      onClick={() => {
                        const fileURL = URL.createObjectURL(resumeFile);
                        window.open(fileURL, "_blank");
                      }}
                      className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-notice text-notice font-semibold hover:bg-notice hover:text-white transition-colors whitespace-nowrap"
                    >
                      View File
                    </button>
                  )}
                </div>
                {resumeFile && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    Selected:{" "}
                    <span className="font-medium">{resumeFile.name}</span> (
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {errors.resumeFile && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.resumeFile}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Accepted formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
              {/* Submit Button */}
              <div className="pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white transition-colors ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-notice hover:bg-notice/90 active:bg-notice/80"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    "Apply Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
