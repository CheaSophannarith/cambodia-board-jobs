"use client";

import { useEffect, useState } from "react";
import { checkPaymentStatus } from "@/app/actions/payment/checkPaymentStatus";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

interface PaymentPageProps {
  params: {
    paymentId: string;
  };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const paymentId = parseInt(params.paymentId);
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "pending" | "completed" | "expired" | "error"
  >("loading");
  const [paymentData, setPaymentData] = useState<any>(null);

  // Check payment status
  const checkStatus = async () => {
    const result = await checkPaymentStatus(paymentId);

    if (!result.success) {
      setStatus("error");
      return;
    }

    setStatus(result.status as any);
    setPaymentData(result);

    // If completed, redirect to dashboard with success status
    if (result.status === "completed") {
      setTimeout(() => {
        router.push("/dashboard?payment=success");
      }, 2000);
    }
  };

  // Poll status every 3 seconds
  useEffect(() => {
    checkStatus();

    const interval = setInterval(() => {
      checkStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading payment...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500">Payment Not Found</h1>
        <Button onClick={() => router.push("/subscription")} className="mt-4">
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500">⏱️ Payment Expired</h1>
        <p className="mt-4 text-gray-600">
          This QR code has expired. Please create a new payment.
        </p>
        <Button
          onClick={() => router.push("/subscription")}
          className="mt-6 bg-notice"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-green-600">
          Payment Completed!
        </h1>
        <p className="mt-4">Redirecting to dashboard...</p>
      </div>
    );
  }

  // Pending - show QR code
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Scan to Pay</h1>
        <p className="text-center text-gray-600 mb-6">
          {paymentData?.planType?.toUpperCase()} Plan - ${paymentData?.amount}{" "}
          {paymentData?.currency}
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-6 p-4 bg-white border-2 border-gray-200">
          <QRCodeSVG value={paymentData?.qrCodeData || "LOADING"} size={256} />
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 mb-6">
          <p>1. Open your banking app (ABA, Wing, ACLEDA, etc.)</p>
          <p>2. Scan the QR code above</p>
          <p>3. Confirm the payment</p>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Transaction: {paymentData?.transactionReference}
        </p>
      </div>
    </div>
  );
}
