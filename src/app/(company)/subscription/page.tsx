"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogClose } from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { initiatePayment } from "@/app/actions/payment/initiatePayment";
import { checkPaymentStatus } from "@/app/actions/payment/checkPaymentStatus";
import { QRCodeSVG } from 'qrcode.react';
import { toast } from "sonner";

const subscriptionPlans = [
  {
    type: "weekly",
    title: "Weekly Plan",
    price: 0.01,
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'pending' | 'completed' | 'expired' | 'error'>('loading');

  const handleClose = () => {
    router.back();
  };

  const handlePurchase = async (planType: string, price: number) => {
    const result = await initiatePayment({
        planType: planType as 'weekly' | 'monthly' | 'yearly',
        amount: price,
        currency: 'USD'
    });

    if (result.success) {
        setPaymentId(result.paymentId);
        setPaymentData(result);
        setPaymentStatus('pending');
        setShowPaymentDialog(true);
    } else {
        toast.error(result.message || 'Failed to initiate payment. Please try again.');
    }
  };

  // Check payment status
  const checkStatus = async () => {
    if (!paymentId) return;

    const result = await checkPaymentStatus(paymentId);

    if (!result.success) {
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus(result.status as any);

    // If completed, show success and redirect to dashboard
    if (result.status === 'completed') {
      toast.success('Payment completed successfully! Subscription activated.');
      setTimeout(() => {
        setShowPaymentDialog(false);
        router.push('/dashboard?payment=success');
      }, 2000);
    }
  };

  // Poll status every 3 seconds when payment dialog is open
  useEffect(() => {
    if (!showPaymentDialog || !paymentId) return;

    checkStatus();

    const interval = setInterval(() => {
      checkStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [showPaymentDialog, paymentId]);

  const handleClosePaymentDialog = () => {
    setShowPaymentDialog(false);
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

      {/* Payment QR Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={handleClosePaymentDialog}>
        <DialogContent className="w-[340px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl [&>button]:hidden">
          <VisuallyHidden>
            <DialogTitle>Scan to Pay with KHQR</DialogTitle>
          </VisuallyHidden>

          {paymentStatus === 'loading' && (
            <div className="flex items-center justify-center p-10 bg-white">
              <p className="text-gray-500">Loading payment...</p>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="flex flex-col items-center gap-3 p-10 bg-white">
              <p className="text-red-500 font-semibold text-lg">Payment Not Found</p>
              <Button onClick={handleClosePaymentDialog} size="sm">Close</Button>
            </div>
          )}

          {paymentStatus === 'expired' && (
            <div className="flex flex-col items-center gap-3 p-10 bg-white">
              <p className="text-red-500 font-semibold text-lg">Payment Expired</p>
              <p className="text-sm text-gray-400 text-center">This QR code has expired. Please try again.</p>
              <Button onClick={handleClosePaymentDialog} size="sm" style={{ backgroundColor: '#CC1A2E' }}>Close</Button>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="flex flex-col items-center gap-3 p-10 bg-white">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">✅</div>
              <p className="text-green-600 font-bold text-xl">Payment Completed!</p>
              <p className="text-sm text-gray-400 text-center">Subscription activated. Redirecting...</p>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="flex flex-col bg-white">

              {/* Red header */}
              <div
                className="relative flex items-center justify-center py-5"
                style={{ backgroundColor: '#CC1A2E' }}
              >
                <img src="/KHQR_Logo.png" alt="KHQR" className="h-12 object-contain" />
                {/* Dark corner fold top-right */}
                <div
                  className="absolute top-0 right-0 w-12 h-12"
                  style={{
                    background: 'rgba(0,0,0,0.18)',
                    clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                  }}
                />
                {/* Custom close button */}
                <DialogClose className="absolute top-3 left-3 text-white/70 hover:text-white transition-colors">
                  <X size={20} />
                </DialogClose>
              </div>

              {/* Merchant + Amount */}
              <div className="px-8 pt-6 pb-5">
                <p className="text-sm text-gray-400">CamBoardJobs</p>
                <p className="text-[32px] font-bold text-gray-900 leading-tight mt-0.5">
                  {paymentData?.currency === 'USD' ? '$' : '៛'} {paymentData?.amount}
                </p>
              </div>

              {/* Full-width dashed divider */}
              <div className="w-full border-t border-dashed border-gray-300" />

              {/* QR Code — centered, no box */}
              <div className="flex justify-center py-8 px-8">
                <QRCodeSVG
                  value={paymentData?.qrCodeData || 'LOADING'}
                  size={240}
                  level="H"
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23111'/%3E%3Ctext x='20' y='27' text-anchor='middle' font-size='22' fill='white' font-family='Arial' font-weight='bold'%3E%24%3C/text%3E%3C/svg%3E",
                    height: 38,
                    width: 38,
                    excavate: true,
                  }}
                />
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
