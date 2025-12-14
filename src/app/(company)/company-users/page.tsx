"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers } from "@/app/actions/user/getAllUsers";
import DataTable, { Column } from "@/components/Company/DataTable";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserForm from "@/components/Company/user/UserForm";

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

  console.log('CompanyUsersPage render - companyId:', companyId, 'authLoading:', authLoading);

  const [users, setUsers] = useState<User[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [nameFilter, setNameFilter] = useState("");
  const [debouncedNameFilter, setDebouncedNameFilter] = useState("");

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNameFilter(nameFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [nameFilter]);

  const fetchUsers = useCallback(
    async (isInitial = false, searchFilter = "") => {
      console.log('fetchUsers called, companyId:', companyId, 'isInitial:', isInitial);

      if (!companyId) {
        console.log('No companyId, exiting');
        setInitialLoading(false);
        return;
      }

      try {
        if (isInitial) {
          setInitialLoading(true);
        } else {
          setFetchingUsers(true);
        }

        console.log('Calling getAllUsers with:', Number(companyId), searchFilter);
        const usersData = await getAllUsers(Number(companyId), searchFilter);
        console.log('getAllUsers returned:', usersData);

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
        setInitialLoading(false);
        setFetchingUsers(false);
      }
    },
    [companyId]
  );

  // Initial load
  useEffect(() => {
    if (!authLoading && companyId) {
      fetchUsers(true, "");
    }
  }, [companyId, authLoading, fetchUsers]);

  // Filter changes (debounced)
  useEffect(() => {
    if (!initialLoading && companyId) {
      fetchUsers(false, debouncedNameFilter);
    }
  }, [debouncedNameFilter, initialLoading, companyId, fetchUsers]);

  if (authLoading || initialLoading) {
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
      <div className="flex justify-between items-center my-4 gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring"
          />
        </div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-notice hover:bg-notice/80 text-white py-4 px-6 rounded-none hover:text-white"
              >
                + User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
              <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b">
                <DialogHeader>
                  <DialogTitle className="text-lg uppercase text-notice">
                    Create User
                  </DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new user.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="px-6 pb-6">
                <UserForm
                  onCancel={() => setIsDialogOpen(false)}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    fetchUsers();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable
        data={users}
        columns={columns}
        getRowKey={(user) => user.id}
        loading={fetchingUsers}
        emptyMessage="No Users found"
      />
    </div>
  );
}
