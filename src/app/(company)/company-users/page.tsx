"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers } from "@/app/actions/user/getAllUsers";
import DataTable, { Column } from "@/components/Company/DataTable";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function CompanyUsersPage() {
  const {
    companyId,
    loading: authLoading,
    profileId,
    role,
    refreshCompanyData,
  } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const usersData = await getAllUsers(Number(companyId));

        // Check if the response is an error object
        if ("success" in usersData && !usersData.success) {
          setError(usersData.message || "Failed to fetch users");
          setUsers([]);
        } else {
          setUsers(usersData as User[]);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("An unexpected error occurred");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [companyId, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "Full Name",
      className: "font-medium",
    },
    {
      key: "email",
      header: "Email",
      className: "font-medium",
    },
    {
      key: "role",
      header: "Role               ",
      className: "capitalize",
    },
    {
      key: "isActive",
      header: "Status",
      render: (userData) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            userData.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {userData.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (userData) => (
        <a
          className="text-white bg-blue-500 rounded-xl px-4 py-1 mr-[-4] hover:underline inline-block"
          href={`/company-users/user-detail/${userData.id}`}
        >
          Detail
        </a>
      ),
    },
  ];

  if (!companyId) {
    return (
      <div className="flex flex-col justify-center items-center py-8 gap-4">
        <p className="text-red-500">
          You are not associated with any company. Please create a company
          profile first.
        </p>
        <div className="text-sm text-gray-600">
          <p>Debug Info:</p>
          <p>Profile ID: {profileId || "Not found"}</p>
          <p>Company ID: {companyId || "Not found"}</p>
          <p>Role: {role || "Not found"}</p>
        </div>
        <button
          onClick={() => refreshCompanyData()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Company Data
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4">
      <h1 className="text-xl uppercase font-bold">Users</h1>
      <DataTable
        data={users}
        columns={columns}
        getRowKey={(user) => user.id}
        loading={loading}
        emptyMessage="No Users found. Create your first user"
      />
    </div>
  );
}
