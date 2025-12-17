"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import Image from "next/image";
import { set, z } from "zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { createUser } from "@/app/actions/user/createUser";

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

// Validation schema for user form
const userFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  location: z.string().min(1, "Please select a location"),
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
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

type FormErrors = Partial<Record<keyof z.infer<typeof userFormSchema>, string>>;

interface UserFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function UserForm({ onCancel, onSuccess }: UserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [show, setShow] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file
      const result = userFormSchema.shape.avatar.safeParse(file);
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
      email,
      password,
      location,
      phone,
      avatar: fileInputRef.current?.files?.[0],
    };

    // Validate with Zod
    const result = userFormSchema.safeParse(data);

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
      formData.append("email", email);
      formData.append("location", location);
      formData.append("phone", phone);
      formData.append("password", data.password);
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }

      const response = await createUser(formData);

      if (response && !response.success) {
        toast.error(response.message || "Failed to create user");
        setIsLoading(false);
        return;
      }

      if (response && response.success) {
        toast.success(response.message || "User created successfully!");
        setIsLoading(false);

        // Call onSuccess callback to close dialog and refresh
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left side - Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              placeholder="John Snow"
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
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className={`w-full px-4 py-3 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-notice`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
                className={`w-full px-4 py-3 pr-12 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-notice`}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors?.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
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
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
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
        <div className="flex flex-col items-center justify-center">
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

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={onCancel}
          className="px-8 py-3 rounded-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-notice hover:bg-notice/80 text-white px-8 py-3 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}
