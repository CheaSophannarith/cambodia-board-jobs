"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { createProfile } from "@/app/actions/profile/profile";

interface SeekerApplicationProps {
  userType: string;
  displayName: string;
}

const locations = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Sihanoukville",
  "Kampong Cham",
  "Kampong Chhnang",
  "Kampong Speu",
  "Kandal",
  "Takeo",
  "Prey Veng",
  "Svay Rieng",
  "Kampot",
  "Pursat",
  "Banteay Meanchey",
  "Oddar Meanchey",
  "Preah Vihear",
  "Ratanakiri",
  "Stung Treng",
  "Koh Kong",
  "Mondulkiri",
  "Kratie",
  "Tbong Khmum",
  "Kep",
  "Pailin",
  "Kompong Thom",
];

const experienceLevels = [
  "Entry Level (0-2 years)",
  "Mid Level (3-5 years)",
  "Senior Level (6-10 years)",
  "Expert Level (10+ years)",
];

// Validation schema matching database fields
const seekerApplicationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  role: z.string().min(1, "Role is required"),
  location: z.string().min(1, "Please select a location"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+855[0-9]{8,9}|0[0-9]{7,8})$/,
      "Phone must be in format +855XXXXXXXXX or 0XXXXXXXX (9-10 digits total)"
    ),
  experience: z.string().min(1, "Please select your experience level"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z
    .custom<File>((val) => val instanceof File, {
      message: "Please upload a profile photo",
    })
    .refine((file) => {
      return file.size <= 5 * 1024 * 1024; // 5MB
    }, "Image must be less than 5MB")
    .refine((file) => {
      return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    }, "Only JPEG, PNG, or WebP images are allowed"),
});

type FormErrors = Partial<
  Record<keyof z.infer<typeof seekerApplicationSchema>, string>
>;

export default function SeekerApplication({
  userType,
  displayName,
}: SeekerApplicationProps) {
  const [name, setName] = useState(displayName);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const role = userType.toLowerCase();

  useEffect(() => {
    console.log("Errors state updated:", errors);
  }, [errors]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file
      const result = seekerApplicationSchema.shape.avatar.safeParse(file);
      if (!result.success) {
        toast.error(result.error.issues[0].message);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Prepare data for validation
    const data = {
      name,
      role,
      location,
      phone,
      experience: experienceLevel,
      bio,
      avatar: fileInputRef.current?.files?.[0],
    };

    // Validate with Zod
    const result = seekerApplicationSchema.safeParse(data);

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

    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("name", name);
      formData.append("role", role);
      formData.append("location", location);
      formData.append("phone", phone);
      formData.append("experience", experienceLevel);
      if (linkedinUrl) formData.append("linkedinUrl", linkedinUrl);
      if (bio) formData.append("bio", bio);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("avatar", fileInputRef.current.files[0]);
      }

      const response = await createProfile(formData);

      if (response && !response.success) {
        toast.error(response.message || "Failed to create profile");
        setIsLoading(false);
      } else if (response && response.success) {
        toast.success("Profile created successfully!");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Profile creation error:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 lg:px-8">
      <div className="mx-auto w-full" style={{ maxWidth: '1400px' }}>
        <h1 className="text-4xl font-bold text-center mt-12 mb-8 text-notice uppercase">
          Profile as {userType}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info with Avatar */}
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left side - Form fields */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger
                      className={`w-full h-auto px-4 py-3 border ${
                        errors.location ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-notice rounded-none`}
                    >
                      <SelectValue placeholder="Select your location" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {locations.map((loc) => (
                        <SelectItem
                          key={loc}
                          value={loc.toLowerCase().replace(/\s+/g, "-")}
                        >
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 012345678"
                    className={`w-full px-4 py-3 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Right side - Avatar */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center">
                <div className="w-40 h-40 relative border-2 border-dashed border-gray-300 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <svg
                        className="w-12 h-12 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <p className="text-xs">No photo</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  name="avatar"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 border border-notice text-notice hover:bg-notice hover:text-white transition-colors text-sm font-semibold"
                >
                  Upload Photo
                </button>
                {errors.avatar && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {errors.avatar}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Professional Info */}
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Professional Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience Level
                </label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                >
                  <SelectTrigger
                    className={`w-full h-auto px-4 py-3 border ${
                      errors.experience ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice rounded-none`}
                  >
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem
                        key={level}
                        value={level.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.experience}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LinkedIn Profile (Optional)
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                />
              </div>
            </div>
          </div>

          {/* Section 3: About You */}
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">About You</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tell us a bit about yourself (Optional)
              </label>
              <textarea
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                placeholder="Share your passion, skills, and what you're looking for in your next opportunity..."
                className={`w-full px-4 py-3 border ${
                  errors.bio ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-notice resize-none`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio ? (
                  <p className="text-red-500 text-sm">{errors.bio}</p>
                ) : (
                  <span></span>
                )}
                <p className="text-gray-500 text-sm">{bio.length}/500</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-notice text-white py-3 text-lg font-semibold hover:bg-notice/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Profile..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
