import type { Metadata } from "next";
import Header from "../../components/Landing/Header";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Cambodia Board Jobs",
  description: "Find your dream job in Cambodia with Cambodia Board Jobs.",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Header />
      <main className="md:pt-20">{children}</main>
    </AuthProvider>
  );
}
