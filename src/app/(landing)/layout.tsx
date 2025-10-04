import type { Metadata } from "next";
import Header from "../../components/Landing/Header";
import { AuthProvider } from "@/contexts/AuthContext";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Header />
      <main className="pt-20">{children}</main>
    </AuthProvider>
  );
}
