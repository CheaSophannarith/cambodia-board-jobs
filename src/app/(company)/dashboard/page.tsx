import type { Metadata } from "next";
import DashboardComponent from "@/components/Company/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Company - Cambodia Board Jobs",
  description: "Company page for Cambodia Board Jobs.",
};

export default function Dashboard() {
  return (
    <div className="my-10 w-[94%] mx-auto min-h-screen">
      <DashboardComponent />
    </div>
  );
}
