import Image from "next/image";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location?: string;
    categories?: string;
    salary_min?: number | null;
    salary_max?: number | null;
    created_at?: string;
    companies?: {
      id: string;
      company_name: string;
      logo_url?: string;
    };
  };
}

export default function JobCard({ job }: JobCardProps) {
  const getSalaryText = () => {
    if (!job.salary_min || !job.salary_max) {
      return "Negotiable";
    }
    return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
  };

  const getPostedDay = () => {
    if (!job.created_at) return "Recently";
    const createdAt = new Date(job.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <div className=" bg-white p-6 cursor-pointer hover:shadow-lg transition-all">
      {/* Header: Logo and Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          {job.companies?.logo_url ? (
            <div className="w-12 h-12 relative">
              <Image
                src={job.companies.logo_url}
                alt={job.companies.company_name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">LOGO</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600">{job.companies?.company_name}</p>
        </div>
      </div>

      {/* Tags/Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {job.categories && (
          <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700">
            {job.categories}
          </span>
        )}
        {job.location && (
          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700">
            {job.location}
          </span>
        )}
      </div>

      {/* Footer: Salary and Posted Date */}
      <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
        <span className="font-bold text-gray-900">{getSalaryText()}</span>
        <span className="text-gray-500">{getPostedDay()}</span>
      </div>
    </div>
  );
}
