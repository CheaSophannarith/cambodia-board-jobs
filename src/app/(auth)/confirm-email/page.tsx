export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f2f2] px-4">
      <div className="max-w-md w-full bg-white p-8 shadow-lg">
        <div className="text-center space-y-6">
          {/* Email Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-notice/10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-notice"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Check your email
            </h1>
            <p className="text-gray-600">
              We've sent a confirmation link to your email address.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded text-left space-y-2">
            <p className="text-sm text-gray-700">
              <strong>Next steps:</strong>
            </p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Click the confirmation link we sent you</li>
              <li>You'll be redirected to complete your profile</li>
            </ol>
          </div>

          {/* Additional Info */}
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button className="text-notice font-semibold hover:underline">
                resend confirmation email
              </button>
            </p>

            <div className="pt-4 border-t">
              <a
                href="/login"
                className="text-notice font-semibold hover:underline text-sm"
              >
                ← Back to login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
