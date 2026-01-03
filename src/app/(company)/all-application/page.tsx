"use client";

import { getCompanyApplications } from "@/app/actions/application/getCompanyApplications";
import CompanyApplicationsList from "@/components/Company/CompanyApplicationsList";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function CompanyApplicationPage() {
  const { companyId } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      const result = await getCompanyApplications(Number(companyId));

      if (!result.success) {
        setError(result.error || "Failed to load applications");
      } else {
        setApplications(result.data || []);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return <CompanyApplicationsList applications={applications} />;
}
