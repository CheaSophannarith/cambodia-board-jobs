"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { editJob } from "@/app/actions/job/editJob";
import { deleteJob } from "@/app/actions/job/deleteJob";

interface JobDetailProps {
  job: any;
}

const jobTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const experienceLevels = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead",
  "Manager",
  "Director",
  "Executive",
];

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "KHR", label: "KHR (៛)" },
];

// Validation schema for job update
const jobFormSchema = z.object({
  title: z
    .string()
    .min(1, "Job title is required")
    .min(5, "Job title must be at least 5 characters")
    .max(200, "Job title must be less than 200 characters"),
  category_id: z.string().min(1, "Please select a category"),
  description: z
    .string()
    .min(1, "Job description is required")
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location must be less than 200 characters"),
  is_remote: z.boolean(),
  job_type: z.string().min(1, "Please select a job type"),
  experience_level: z.string().min(1, "Please select experience level"),
  salary_min: z
    .string()
    .optional()
    .refine(
      (val) => !val || parseInt(val) > 0,
      "Minimum salary must be positive"
    ),
  salary_max: z
    .string()
    .optional()
    .refine(
      (val) => !val || parseInt(val) > 0,
      "Maximum salary must be positive"
    ),
  salary_currency: z.string(),
  application_deadline: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Application deadline must be today or in the future"),
  requirements: z
    .array(z.string().min(1))
    .min(1, "At least one requirement is needed"),
  benefits: z.array(z.string().min(1)).min(1, "At least one benefit is needed"),
  tags: z.array(z.string()).optional(),
});

type FormErrors = Partial<Record<keyof z.infer<typeof jobFormSchema>, string>>;

interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export default function JobDetail({ job }: JobDetailProps) {
  // Form states - Initialize with job data
  const [title, setTitle] = useState(job.title || "");
  const [categoryId, setCategoryId] = useState(
    job.category_id?.toString() || ""
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState(job.description || "");
  const [location, setLocation] = useState(job.location || "");
  const [isRemote, setIsRemote] = useState(job.is_remote || false);
  const [jobType, setJobType] = useState(job.job_type || "");
  const [experienceLevel, setExperienceLevel] = useState(
    job.experience_level || ""
  );
  const [salaryMin, setSalaryMin] = useState(job.salary_min?.toString() || "");
  const [salaryMax, setSalaryMax] = useState(job.salary_max?.toString() || "");
  const [salaryCurrency, setSalaryCurrency] = useState(
    job.salary_currency || "USD"
  );
  const [applicationDeadline, setApplicationDeadline] = useState(
    job.application_deadline
      ? new Date(job.application_deadline).toISOString().split("T")[0]
      : ""
  );

  // Requirements and Benefits - Initialize from job data (handle both array and JSON string)
  const [requirements, setRequirements] = useState<string[]>(() => {
    if (Array.isArray(job.requirements)) {
      return job.requirements.length > 0 ? job.requirements : [""];
    }
    return [""];
  });
  const [benefits, setBenefits] = useState<string[]>(() => {
    if (Array.isArray(job.benefits)) {
      return job.benefits.length > 0 ? job.benefits : [""];
    }
    return [""];
  });

  // Tags - Initialize from job data
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(() => {
    if (Array.isArray(job.tags)) {
      return job.tags;
    }
    return [];
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("job_categories")
          .select("*")
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching categories:", error);
          toast.error("Failed to load categories");
        } else {
          setCategories(data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error loading categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Requirement handlers
  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  // Benefit handlers
  const addBenefit = () => {
    setBenefits([...benefits, ""]);
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const removeBenefit = (index: number) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((_, i) => i !== index));
    }
  };

  // Tag handlers
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Filter out empty requirements and benefits
    const filteredRequirements = requirements.filter((r) => r.trim() !== "");
    const filteredBenefits = benefits.filter((b) => b.trim() !== "");

    // Prepare data for validation
    const data = {
      id: job.id,
      title,
      category_id: categoryId,
      description,
      location,
      is_remote: isRemote,
      job_type: jobType,
      experience_level: experienceLevel,
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_currency: salaryCurrency,
      application_deadline: applicationDeadline,
      requirements: filteredRequirements,
      benefits: filteredBenefits,
      tags: tags.length > 0 ? tags : undefined,
    };

    // Validate with Zod
    const result = jobFormSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      setIsLoading(false);
      return;
    }

    // Additional validation for salary range
    if (salaryMin && salaryMax && parseInt(salaryMin) > parseInt(salaryMax)) {
      setErrors({
        salary_max: "Maximum salary must be greater than minimum salary",
      });
      toast.error("Invalid salary range");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", job.id.toString());
      formData.append("title", title);
      formData.append("category_id", categoryId);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("is_remote", isRemote.toString());
      formData.append("job_type", jobType);
      formData.append("experience_level", experienceLevel);
      if (salaryMin) formData.append("salary_min", salaryMin);
      if (salaryMax) formData.append("salary_max", salaryMax);
      formData.append("salary_currency", salaryCurrency);
      if (applicationDeadline)
        formData.append("application_deadline", applicationDeadline);
      formData.append("requirements", JSON.stringify(filteredRequirements));
      formData.append("benefits", JSON.stringify(filteredBenefits));
      if (tags.length > 0) formData.append("tags", JSON.stringify(tags));

      const response = await editJob(job.id, formData);

      if (response && !response.success) {
        toast.error(response.message || "Failed to update job");
        setIsLoading(false);
      } else if (response && response.success) {
        toast.success("Job updated successfully!");
        setTimeout(() => {
          router.push("/job-list");
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);

    try {
      const formData = new FormData();
      formData.append("id", job.id.toString());

      const result = await deleteJob(formData);

      if (result && !result.success) {
        toast.error(result.message || "Failed to delete job");
        setIsDeleting(false);
      } else {
        // The deleteJob action will redirect to /job-list
        toast.success("Job deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete job. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl w-full px-4 pt-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Job Information */}
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Detail</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Developer"
                  className={`w-full px-4 py-3 border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-notice`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={loadingCategories}
                >
                  <SelectTrigger
                    className={`w-full h-auto px-4 py-3 border ${
                      errors.category_id ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice rounded-none`}
                  >
                    <SelectValue
                      placeholder={
                        loadingCategories
                          ? "Loading categories..."
                          : "Select job category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.category_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Describe the role, responsibilities, and what makes this position great..."
                  className={`w-full px-4 py-3 border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-notice resize-none`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  ) : (
                    <span></span>
                  )}
                  <p className="text-gray-500 text-sm">
                    {description.length}/5000
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Phnom Penh, Cambodia"
                    className={`w-full px-4 py-3 border ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice`}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger
                      className={`w-full h-auto px-4 py-3 border ${
                        errors.job_type ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-notice rounded-none`}
                    >
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.job_type && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.job_type}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_remote"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="w-4 h-4 text-notice border-gray-300 focus:ring-notice"
                />
                <label
                  htmlFor="is_remote"
                  className="text-sm font-semibold text-gray-700"
                >
                  This is a remote position
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                >
                  <SelectTrigger
                    className={`w-full h-auto px-4 py-3 border ${
                      errors.experience_level
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice rounded-none`}
                  >
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.experience_level && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.experience_level}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Salary Information (Optional)
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="e.g. 1000"
                    min="0"
                    className={`w-full px-4 py-3 border ${
                      errors.salary_min ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice`}
                  />
                  {errors.salary_min && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.salary_min}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="e.g. 2000"
                    min="0"
                    className={`w-full px-4 py-3 border ${
                      errors.salary_max ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice`}
                  />
                  {errors.salary_max && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.salary_max}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency
                  </label>
                  <Select
                    value={salaryCurrency}
                    onValueChange={setSalaryCurrency}
                  >
                    <SelectTrigger className="w-full h-auto px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice rounded-none">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Application Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-3 border ${
                    errors.application_deadline
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-notice`}
                />
                {errors.application_deadline && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.application_deadline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Requirements <span className="text-red-500">*</span>
              </h2>
              <Button
                type="button"
                onClick={addRequirement}
                className="bg-notice text-white px-4 py-2 hover:bg-notice/80 rounded-none font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Requirement
              </Button>
            </div>

            <div className="space-y-3">
              {requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      variant="outline"
                      className="px-3 border-gray-300 hover:bg-red-50 hover:border-red-300 rounded-none"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.requirements && (
              <p className="text-red-500 text-sm mt-2">{errors.requirements}</p>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-white p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Benefits <span className="text-red-500">*</span>
              </h2>
              <Button
                type="button"
                onClick={addBenefit}
                className="bg-notice text-white px-4 py-2 hover:bg-notice/80 rounded-none font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Benefit
              </Button>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    placeholder={`Benefit ${index + 1}`}
                    className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                  />
                  {benefits.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      variant="outline"
                      className="px-3 border-gray-300 hover:bg-red-50 hover:border-red-300 rounded-none"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.benefits && (
              <p className="text-red-500 text-sm mt-2">{errors.benefits}</p>
            )}
          </div>

          {/* Tags (Optional) */}
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Tags (Optional)
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tags (e.g. JavaScript, React, Node.js)"
                  className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="bg-notice text-white px-4 py-2 hover:bg-notice/80 rounded-none font-semibold"
                >
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-notice/10 border border-notice px-3 py-1 flex items-center gap-2"
                    >
                      <span className="text-sm text-gray-700">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting || isLoading}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50 px-6 py-3 rounded-none font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isDeleting}
              className="bg-notice text-white px-6 py-3 hover:bg-notice/80 rounded-none font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>&quot;{job.title}&quot;</strong>?
              This action cannot be undone and will permanently remove this job posting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600 rounded-none"
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
