import type { Metadata } from "next";
import Header from "../components/Header";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="pt-20">{children}</main>
    </>
  );
}
