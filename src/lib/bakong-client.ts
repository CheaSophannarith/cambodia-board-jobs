const { BakongKHQR, IndividualInfo, khqrData } = require("bakong-khqr");

const BAKONG_API_URL = process.env.BAKONG_API_URL!;
const BAKONG_JWT_TOKEN = process.env.BAKONG_JWT_TOKEN!;
const BAKONG_ACCOUNT_ID = process.env.BAKONG_ACCOUNT_ID!;
const MERCHANT_NAME = process.env.BAKONG_MERCHANT_NAME!;
const MERCHANT_CITY = process.env.BAKONG_MERCHANT_CITY!;

export async function generateKHQR(params: {
  amount: number;
  currency: "USD" | "KHR";
  transactionReference: string;
}) {
  try {
    const optionalData = {
      currency: params.currency === "USD" ? khqrData.currency.usd : khqrData.currency.khr,
      amount: params.amount,
      billNumber: params.transactionReference,
      storeLabel: MERCHANT_NAME,
      terminalLabel: "Online Subscription",
      expirationTimestamp: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    // Create individual info (for individual account)
    const individualInfo = new IndividualInfo(
      BAKONG_ACCOUNT_ID, // chea_sophannarith@bkrt
      MERCHANT_NAME,     // CamBoardJobs
      MERCHANT_CITY,     // Phnom Penh
      optionalData       // currency & amount already included here
    );

    // Generate KHQR
    const khqr = new BakongKHQR();
    const result = khqr.generateIndividual(individualInfo);

    // Check if generation was successful
    if (result.status.code !== 0) {
      console.error("KHQR generation error:", result.status);
      return {
        success: false,
        qrCodeData: "",
        md5: "",
        transactionId: params.transactionReference,
        expiresAt: new Date(),
      };
    }

    return {
      success: true,
      qrCodeData: result.data.qr,
      md5: result.data.md5,
      transactionId: params.transactionReference,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
  } catch (error) {
    console.error("KHQR generation failed:", error);
    return {
      success: false,
      qrCodeData: "",
      md5: "",
      transactionId: params.transactionReference,
      expiresAt: new Date(),
    };
  }
}

export async function checkBakongPaymentStatus(md5: string) {
  try {
    console.log("[Bakong] Checking MD5:", md5);

    const response = await fetch(`${BAKONG_API_URL}/v1/check_transaction_by_md5`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BAKONG_JWT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ md5 }),
    });

    const data = await response.json().catch(() => null);
    console.log("[Bakong] HTTP status:", response.status, "| Body:", JSON.stringify(data));

    // responseCode === 0 means transaction found and paid
    const isPaid = data != null && data.responseCode === 0;
    console.log("[Bakong] isPaid:", isPaid);
    return { isPaid };
  } catch (error) {
    console.error("[Bakong] fetch failed:", error);
    return { isPaid: false };
  }
}

/**
 * Generate unique transaction reference
 */
export function generateTransactionReference(companyId: number): string {
  const timestamp = Date.now().toString().slice(-8); // last 8 digits, keeps it short
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 chars
  return `T${companyId}-${timestamp}-${random}`; // e.g. T5-43499123-AB12 = max ~19 chars
}

/**
 * Calculate subscription end date based on plan type
 */
export function calculateEndDate(planType: 'weekly' | 'monthly' | 'yearly'): Date {
  const endDate = new Date();

  switch (planType) {
    case 'weekly':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }

  return endDate;
}
