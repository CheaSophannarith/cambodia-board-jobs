"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getDetailUser } from "@/app/actions/user/getDetailUser";
import { updateProfile } from "@/app/actions/user/updateProfile";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { MapPin, Phone, User, Camera } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    linkedinUrl: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        setIsLoading(true);
        try {
          const profileData = await getDetailUser(user.id);
          if (profileData) {
            setProfile(profileData);
            setFormData({
              fullName: profileData.full_name || "",
              phone: profileData.phone || "",
              location: profileData.location || "",
              linkedinUrl: profileData.linkedin_url || "",
            });
            // Set avatar preview if exists
            if (profileData.avatar_url) {
              // Convert old file paths to full URLs
              let avatarUrl = profileData.avatar_url;
              if (!avatarUrl.startsWith('http')) {
                // Old avatars are in 'avatars' bucket, new ones have full URLs from 'profiles' bucket
                avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profileData.avatar_url}`;
              }
              setAvatarPreview(avatarUrl);
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile");
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchUserProfile();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Only JPEG, PNG, or WebP images are allowed");
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
    setIsSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("linkedinUrl", formData.linkedinUrl);

      // Add avatar if a new file was selected
      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append("avatar", fileInputRef.current.files[0]);
      }

      await updateProfile(formDataToSend);
      toast.success("Profile updated successfully!");

      // Refresh profile data
      const updatedProfile = await getDetailUser(user!.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
        if (updatedProfile.avatar_url) {
          // Convert old file paths to full URLs
          let avatarUrl = updatedProfile.avatar_url;
          if (!avatarUrl.startsWith('http')) {
            // Old avatars are in 'avatars' bucket, new ones have full URLs from 'profiles' bucket
            avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${updatedProfile.avatar_url}`;
          }
          setAvatarPreview(avatarUrl);
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-notice"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-white border border-gray-200 shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Profile Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Update your personal information and contact details
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center pb-6 border-b border-gray-200">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile avatar"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-notice/20 to-notice/40">
                      <User className="w-16 h-16 text-notice" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-notice text-white p-2 rounded-full shadow-lg hover:bg-notice/90 transition-all transform hover:scale-110"
                  title="Change profile picture"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="mt-3 text-sm text-gray-500 text-center">
                Click the camera icon to upload a new photo
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                JPG, PNG or WebP. Max size 5MB.
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <span className="absolute right-3 top-3 text-xs text-gray-500 bg-gray-100 px-2 py-1">
                  Read-only
                </span>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline-block w-4 h-4 mr-1" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="inline-block w-4 h-4 mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-1" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                placeholder="City, Country"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinUrl: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
                placeholder="https://www.linkedin.com/in/yourprofile"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 px-6 py-3 font-semibold text-white transition-colors ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-notice hover:bg-notice/90"
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    fullName: profile?.full_name || "",
                    phone: profile?.phone || "",
                    location: profile?.location || "",
                    linkedinUrl: profile?.linkedin_url || "",
                  });
                  toast.info("Changes discarded");
                }}
                className="px-6 py-3 border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Profile Stats */}
        <div className="mt-6 bg-white border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Profile Completion
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Basic Information</span>
              <span
                className={`text-sm font-semibold ${
                  formData.fullName ? "text-green-600" : "text-gray-400"
                }`}
              >
                {formData.fullName ? "✓ Complete" : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Contact Details</span>
              <span
                className={`text-sm font-semibold ${
                  formData.phone && formData.location
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {formData.phone && formData.location
                  ? "✓ Complete"
                  : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">LinkedIn Profile</span>
              <span
                className={`text-sm font-semibold ${
                  formData.linkedinUrl ? "text-green-600" : "text-gray-400"
                }`}
              >
                {formData.linkedinUrl ? "✓ Complete" : "Optional"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
