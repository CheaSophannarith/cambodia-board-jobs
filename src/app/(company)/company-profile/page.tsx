"use client";

import { getCompanyProfile } from "@/app/actions/profile/companyProfile/profile";
import CompanyProfileForm from "@/components/Company/profile/CompanyProfileForm";
import { useEffect, useState } from "react";

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getCompanyProfile();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen px-4 py-4">
      <CompanyProfileForm profile={profile} />
    </div>
  );
}
