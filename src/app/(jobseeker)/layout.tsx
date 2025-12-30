"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { JobSeekerSidebar } from "@/components/Jobseeker/JobSeekerSidebar";
import { JobSeekerHeader } from "@/components/Jobseeker/JobSeekerHeader";
import { AuthProvider } from "@/contexts/AuthContext";

export default function JobSeekerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <JobSeekerSidebar />
        <main className="w-full">
          <JobSeekerHeader />
          {children}
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
