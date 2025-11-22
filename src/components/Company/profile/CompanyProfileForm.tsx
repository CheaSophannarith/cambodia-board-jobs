import { useState, useEffect, useRef } from "react";
import z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import updateCompanyProfile, {
  getCompanyLogoUrl,
} from "@/app/actions/profile/companyProfile/profile";
import { toast } from "sonner";

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

export default function CompanyProfileForm({ profile }: { profile: any }) {
  // Helper function to convert stored industry value back to display value
  const normalizeIndustry = (storedValue: string) => {
    if (!storedValue) return "";

    // Find matching industry by comparing normalized values
    const match = industries.find(
      (ind) =>
        ind.toLowerCase().replace(/[^a-z0-9]/g, "-") ===
          storedValue.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
        ind === storedValue
    );

    return match || storedValue;
  };

  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [companyWebsite, setCompanyWebsite] = useState(
    profile?.company_website || ""
  );
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || "");
  const [description, setDescription] = useState(profile?.description || "");
  const [industry, setIndustry] = useState(
    normalizeIndustry(profile?.industry || "")
  );
  const [foundingYear, setFoundingYear] = useState(
    profile?.founding_year || ""
  );
  const [headquarters, setHeadquarters] = useState(profile?.headquarters || "");
  const [companySize, setCompanySize] = useState(profile?.company_size || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [logoPreview, setLogoPreview] = useState(profile?.logo_url || "");
  const [industrySearch, setIndustrySearch] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Filter industries based on search
  const filteredIndustries = industries.filter((ind) =>
    ind.toLowerCase().includes(industrySearch.toLowerCase())
  );

  // Ref for logo input
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch logo from Supabase storage using server action
  useEffect(() => {
    const fetchLogoFromSupabase = async () => {
      if (profile?.logo_url) {
        const publicUrl = await getCompanyLogoUrl(profile.logo_url);
        if (publicUrl) {
          setLogoPreview(publicUrl);
        }
      }
    };

    fetchLogoFromSupabase();
  }, [profile?.logo_url]);

  // Update state when profile data loads
  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || "");
      setCompanyWebsite(profile.company_website || "");
      setLogoUrl(profile.logo_url || "");
      setDescription(profile.description || "");
      setIndustry(normalizeIndustry(profile.industry || ""));
      setFoundingYear(profile.founding_year || "");
      setHeadquarters(profile.headquarters || "");
      setCompanySize(profile.company_size || "");
      setLinkedinUrl(profile.linkedin_url || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors({});

    const formData = {
      companyName,
      companyWebsite,
      logo: logoInputRef.current?.files?.[0] || null,
      description,
      industry,
      foundingYear,
      headquarters,
      companySize,
      linkedinUrl,
    };

    const result = await updateCompanyProfile(formData);

    if (result.success) {
      // Optionally show success message or redirect
      toast.success("Company profile updated successfully!");

      // Refresh the page to show updated data
      window.location.reload();
    } else {
      // Set validation errors
      toast.error(
        result.message ||
          "Failed to update company profile. Please check the form for errors."
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl w-full px-4 pt-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Information */}
          <div className="bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Company Profile
              </h2>
            </div>
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
                            <SelectItem key={ind} value={ind}>
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
              <div className="lg:col-span-1 flex flex-col items-center justify-start mt-8">
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

              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-notice text-white px-6 py-6 hover:bg-notice/80 text-lg w-full rounded-none font-semibold mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Profile updating..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
