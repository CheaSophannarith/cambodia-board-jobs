/**
 * Example: How to use the reusable DataTable component
 *
 * This file demonstrates various ways to use the DataTable component
 * for different data types and use cases.
 */

import DataTable, { Column } from "./DataTable";

// Example 1: Simple User Table
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function UserTable({ users }: { users: User[] }) {
  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      className: "font-semibold",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "role",
      header: "Role",
      className: "capitalize",
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <button className="text-blue-500 hover:underline">
          Edit
        </button>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      emptyMessage="No users found"
    />
  );
}

// Example 2: Application Table with Custom Rendering
interface Application {
  id: string;
  applicant_name: string;
  job_title: string;
  status: "pending" | "approved" | "rejected";
  applied_date: string;
}

export function ApplicationTable({ applications }: { applications: Application[] }) {
  const columns: Column<Application>[] = [
    {
      key: "applicant_name",
      header: "Applicant",
    },
    {
      key: "job_title",
      header: "Job",
    },
    {
      key: "status",
      header: "Status",
      render: (app) => {
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800",
          approved: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
        };

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[app.status]}`}>
            {app.status}
          </span>
        );
      },
    },
    {
      key: "applied_date",
      header: "Applied Date",
      render: (app) => new Date(app.applied_date).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      data={applications}
      columns={columns}
      getRowKey={(app) => app.id}
      caption="Recent Applications"
      emptyMessage="No applications yet"
    />
  );
}

// Example 3: Simple data with direct property access
interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
}

export function CategoryTable({ categories, loading }: {
  categories: Category[];
  loading: boolean;
}) {
  const columns: Column<Category>[] = [
    { key: "name", header: "Category Name" },
    { key: "description", header: "Description" },
    { key: "count", header: "Job Count" },
  ];

  return (
    <DataTable
      data={categories}
      columns={columns}
      getRowKey={(cat) => cat.id}
      loading={loading}
      emptyMessage="No categories available"
    />
  );
}
