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
import { X, Plus } from "lucide-react";
import { createJob } from "@/app/actions/job/createJob";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const jobTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
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

// Validation schema for job creation
const jobFormSchema = z.object({
  title: z
    .string()
    .min(1, "Job title is required")
    .min(5, "Job title must be at least 5 characters")
    .max(200, "Job title must be less than 200 characters"),
  category_id: z.string().min(1, "Please select a category"),
  description: z.string().optional().nullable(),
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

export default function JobForm() {
  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [applicationDeadline, setApplicationDeadline] = useState("");

  // Requirements and Benefits (stored as JSONB arrays)
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);

  // Tags (optional)
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const router = useRouter();

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);

      try {
        // Check if categories are cached in sessionStorage
        const cachedCategories = sessionStorage.getItem("job_categories");
        const cacheTimestamp = sessionStorage.getItem("job_categories_timestamp");
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes

        // Use cached data if available and not expired
        if (
          cachedCategories &&
          cacheTimestamp &&
          Date.now() - parseInt(cacheTimestamp) < cacheExpiry
        ) {
          try {
            const parsedCategories = JSON.parse(cachedCategories);
            setCategories(parsedCategories);
            setLoadingCategories(false);
            return;
          } catch (parseError) {
            console.error("Error parsing cached categories:", parseError);
            // Clear corrupted cache and continue to fetch
            sessionStorage.removeItem("job_categories");
            sessionStorage.removeItem("job_categories_timestamp");
          }
        }

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
          // Cache the categories in sessionStorage
          sessionStorage.setItem("job_categories", JSON.stringify(data || []));
          sessionStorage.setItem(
            "job_categories_timestamp",
            Date.now().toString()
          );
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

  // Reset form to initial state
  const resetForm = () => {
    setTitle("");
    setCategoryId("");
    setDescription("");
    setLocation("");
    setIsRemote(false);
    setJobType("");
    setExperienceLevel("");
    setSalaryMin("");
    setSalaryMax("");
    setSalaryCurrency("USD");
    setApplicationDeadline("");
    setRequirements([""]);
    setBenefits([""]);
    setTags([]);
    setTagInput("");
    setErrors({});
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

      const response = await createJob(formData);

      if (response && response.success) {
        toast.success("Job created successfully!");
        resetForm(); // Reset form after successful creation
        // Optionally redirect after a short delay to let user see the success message
        setTimeout(() => {
          router.push("/job-list");
        }, 1000);
      } else if (response && !response.success) {
        toast.error(response.message || "Failed to create job");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-4xl px-4 pt-8 pb-4">
          <h1 className="text-4xl font-bold text-center text-notice uppercase">
            Create New Job Posting
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl w-full px-4 pt-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Job Information */}
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Basic Information
            </h2>

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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
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
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="px-3 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
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
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="px-3 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
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
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-notice/10 text-notice border border-notice"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="hover:text-notice/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-notice text-white px-6 py-6 hover:bg-notice/80 text-lg w-full rounded-none font-semibold mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Job..." : "Create Job Posting"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
