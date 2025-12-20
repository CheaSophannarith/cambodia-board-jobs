import Application from "@/components/Landing/Application";
export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Application jobId={id} />
    </div>
  );
}
