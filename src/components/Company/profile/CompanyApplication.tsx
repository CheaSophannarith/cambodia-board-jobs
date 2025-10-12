"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { create } from "domain";
import { createCompanyProfile } from "@/app/actions/profile/companyProfile/profile";

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

const industries = [
  "Agriculture & Forestry",
  "Fishing & Aquaculture",
  "Mining & Extraction",
  "Oil & Gas",
  "Energy & Utilities",
  "Manufacturing",
  "Construction",
  "Consumer Goods (e.g. Apparel, Electronics, Food & Beverage)",
  "Automotive & Transportation Equipment",
  "Chemicals & Petrochemicals",
  "Pharmaceuticals & Biotechnology",
  "Healthcare Services & Medical Devices",
  "Real Estate & Property Development",
  "Retail & Wholesale Trade",
  "Information Technology & Software",
  "Telecommunications",
  "Media, Entertainment & Publishing",
  "Education & Training",
  "Finance, Banking & Insurance",
  "Professional Services (Legal, Accounting, Consulting)",
  "Hospitality & Travel",
  "Transportation & Logistics",
  "Waste Management & Environmental Services",
  "Recreational & Leisure",
  "Government & Public Sector",
  "Non-profits / NGOs",
];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1001-5000 employees",
  "5001+ employees",
];

// Validation schema for company application
const companyApplicationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  location: z.string().min(1, "Please select a location"),
  role: z.string().min(1, "Role is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+855[0-9]{8,9}|0[0-9]{7,8})$/,
      "Phone must be in format +855XXXXXXXXX or 0XXXXXXXX (9-10 digits total)"
    ),
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
  companyName: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must be less than 200 characters"),
  foundingYear: z
    .string()
    .min(1, "Founding year is required")
    .refine((val) => {
      const year = parseInt(val);
      return year >= 1800 && year <= new Date().getFullYear();
    }, `Founding year must be between 1800 and ${new Date().getFullYear()}`),
  industry: z.string().min(1, "Please select an industry"),
  logo: z
    .custom<File>((val) => val instanceof File, {
      message: "Please upload a company logo",
    })
    .refine((file) => {
      return file.size <= 5 * 1024 * 1024; // 5MB
    }, "Logo must be less than 5MB")
    .refine((file) => {
      return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    }, "Only JPEG, PNG, or WebP images are allowed"),
  companySize: z.string().min(1, "Please select company size"),
  headquarters: z
    .string()
    .min(1, "Headquarters is required")
    .max(200, "Headquarters must be less than 200 characters"),
  companyWebsite: z
    .string()
    .min(1, "Company website is required")
    .url("Please enter a valid URL"),
  linkedinUrl: z
    .string()
    .url("Please enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
});

type FormErrors = Partial<
  Record<keyof z.infer<typeof companyApplicationSchema>, string>
>;

export default function CompanyApplication({
  userType,
  displayName,
}: {
  userType: string;
  displayName: string;
}) {
  // Basic Information
  const [name, setName] = useState(displayName || "");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company Information
  const [companyName, setCompanyName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [foundingYear, setFoundingYear] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const role = userType;

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file
      const result = companyApplicationSchema.shape.avatar.safeParse(file);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file
      const result = companyApplicationSchema.shape.logo.safeParse(file);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredIndustries = industries.filter((ind) =>
    ind.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Prepare data for validation
    const data = {
      name,
      location,
      role,
      phone,
      avatar: fileInputRef.current?.files?.[0],
      companyName,
      foundingYear,
      industry,
      logo: logoInputRef.current?.files?.[0],
      companySize,
      headquarters,
      companyWebsite,
      linkedinUrl,
      description,
    };

    // Validate with Zod
    const result = companyApplicationSchema.safeParse(data);

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
      // TODO: Create FormData and call server action
      const formData = new FormData();
      formData.append("name", name);
      formData.append("role", role);
      formData.append("location", location);
      formData.append("phone", phone);
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }
      formData.append("companyName", companyName);
      formData.append("foundingYear", foundingYear);
      formData.append("industry", industry);
      if (data.logo) {
        formData.append("logo", data.logo);
      }
      formData.append("companySize", companySize);
      formData.append("headquarters", headquarters);
      formData.append("companyWebsite", companyWebsite);
      formData.append("linkedinUrl", linkedinUrl);
      formData.append("description", description);

      const response = await createCompanyProfile(formData);

      if (response && !response.success) {
        toast.error(response.message || "Failed to create profile");
        setIsLoading(false);
      } else if (response && response.success) {
        toast.success("Company and Admin user created successfully!");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <div className="">
        <div className="mx-auto max-w-4xl px-4 pt-8 pb-4">
          <h1 className="text-4xl font-bold text-center text-notice uppercase">
            Profile as {userType} user
          </h1>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="mx-auto max-w-4xl w-full px-4 pt-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
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

          {/* Company Information Section */}
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Company Information
            </h2>

            {/* Company Name, Founding Year, Industry with Logo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left side - Company Name, Founding Year, Industry */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      errors.companyName ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice`}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Founding Year
                  </label>
                  <input
                    type="number"
                    name="foundingYear"
                    value={foundingYear}
                    onChange={(e) => setFoundingYear(e.target.value)}
                    placeholder="Ex: 2020"
                    min="1800"
                    max={new Date().getFullYear()}
                    className={`w-full px-4 py-3 border ${
                      errors.foundingYear ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice`}
                  />
                  {errors.foundingYear && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.foundingYear}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry
                  </label>
                  <Select
                    value={industry}
                    onValueChange={(value) => {
                      setIndustry(value);
                      setIndustrySearch("");
                    }}
                  >
                    <SelectTrigger
                      className={`w-full h-auto px-4 py-3 border ${
                        errors.industry ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-notice rounded-none`}
                    >
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="sticky top-0 bg-white p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search industry..."
                          value={industrySearch}
                          onChange={(e) => setIndustrySearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="overflow-y-auto">
                        {filteredIndustries.length > 0 ? (
                          filteredIndustries.map((ind) => (
                            <SelectItem
                              key={ind}
                              value={ind.toLowerCase().replace(/\s+/g, "-")}
                            >
                              {ind}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">
                            No industry found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.industry}
                    </p>
                  )}
                </div>
              </div>

              {/* Right side - Logo */}
              <div className="lg:col-span-1 flex flex-col items-center justify-start mt-7">
                <div className="w-40 h-40 relative border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-contain p-2"
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <p className="text-xs">No logo</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={logoInputRef}
                  name="logo"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="mt-4 px-4 py-2 border border-notice text-notice hover:bg-notice hover:text-white transition-colors text-sm font-semibold"
                >
                  Upload Logo
                </button>
                {errors.logo && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {errors.logo}
                  </p>
                )}
              </div>
            </div>

            {/* Full width fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Size
                </label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger
                    className={`w-full h-auto px-4 py-3 border ${
                      errors.companySize ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-notice rounded-none`}
                  >
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem
                        key={size}
                        value={size.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companySize && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companySize}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Headquarters
                </label>
                <input
                  type="text"
                  name="headquarters"
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.headquarters ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-notice`}
                />
                {errors.headquarters && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.headquarters}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-4 py-3 border ${
                    errors.companyWebsite ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-notice`}
                />
                {errors.companyWebsite && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companyWebsite}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className={`w-full px-4 py-3 border ${
                    errors.linkedinUrl ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-notice`}
                />
                {errors.linkedinUrl && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.linkedinUrl}
                  </p>
                )}
              </div>

              {/* Description at the bottom */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your company, mission, and culture..."
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
                    {description.length}/1000
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-notice text-white px-6 py-6 hover:bg-notice/80 text-lg w-full rounded-none font-semibold mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Profile..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
