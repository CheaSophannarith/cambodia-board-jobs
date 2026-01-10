"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobForm from "@/components/Company/job/JobForm";

export default function CreateJobDialog() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-lg uppercase text-notice">Post a New Job</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new job posting.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6">
          <JobForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
