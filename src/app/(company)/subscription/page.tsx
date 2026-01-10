"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const subscriptionPlans = [
  {
    type: "weekly",
    title: "Weekly Plan",
    price: 1.99,
    duration: "per week",
    description: "Perfect for short-term hiring needs. Post unlimited jobs and access all applicants for 7 days.",
    features: [
      "7 days access",
      "Unlimited job postings",
      "Access all applicants",
      "Basic support"
    ]
  },
  {
    type: "monthly",
    title: "Monthly Plan",
    price: 5.99,
    duration: "per month",
    description: "Best value for growing businesses. Get 30 days of unlimited job postings and premium support.",
    features: [
      "30 days access",
      "Unlimited job postings",
      "Access all applicants",
      "Premium support",
      "Priority listing"
    ],
    popular: true
  },
  {
    type: "yearly",
    title: "Yearly Plan",
    price: 49.99,
    duration: "per year",
    description: "Maximum savings for long-term growth. Enjoy 365 days of unlimited access with priority support and exclusive features.",
    features: [
      "365 days access",
      "Unlimited job postings",
      "Access all applicants",
      "Priority support",
      "Featured listings",
      "Analytics dashboard"
    ]
  }
];

export default function SubscriptionPage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handlePurchase = (planType: string, price: number) => {
    console.log(`Purchasing ${planType} plan for $${price}`);
    // Add your purchase logic here
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[1200px] max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
              Choose your plan
            </DialogTitle>
            <DialogDescription className="text-notice text-sm sm:text-base font-medium text-center">
              cambodia board job
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.type}
                className={`relative border-2 border-notice p-6 rounded-lg transition-all hover:shadow-lg flex flex-col h-full ${
                  plan.popular ? "ring-2 ring-notice ring-offset-2" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-notice text-white px-4 py-1 text-xs font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 h-7">
                    {plan.title}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-notice">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 text-sm ml-2">
                      {plan.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed min-h-[60px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6 space-y-3 flex-grow">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-notice/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-notice" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePurchase(plan.type, plan.price)}
                  className="w-full text-white py-6 rounded-none hover:bg-notice/80 transition-all bg-notice mt-auto"
                >
                  Purchase
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>All plans include unlimited job postings and access to all applicants.</p>
            <p className="mt-2">Secure payment processing. Cancel anytime.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
