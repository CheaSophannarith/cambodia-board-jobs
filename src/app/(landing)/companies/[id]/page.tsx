import Company from "@/components/Landing/Company";

export default function CompanyPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      <Company comId={params.id} />
    </div>
  );
}
