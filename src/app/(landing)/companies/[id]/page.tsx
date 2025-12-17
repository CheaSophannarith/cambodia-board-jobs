import Company from "@/components/Landing/Company";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen">
      <Company comId={id} />
    </div>
  );
}
