-- Add KHQR-specific fields to payments table
-- This enables KHQR payment processing alongside existing payment methods

-- Add KHQR fields
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
    ADD COLUMN IF NOT EXISTS transaction_reference TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS khqr_transaction_id TEXT,
    ADD COLUMN IF NOT EXISTS qr_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS provider_name TEXT;

-- Create index for faster lookup by transaction reference
CREATE INDEX IF NOT EXISTS idx_payments_transaction_reference
    ON payments(transaction_reference);

-- Create index for KHQR transaction ID lookups (for webhooks)
CREATE INDEX IF NOT EXISTS idx_payments_khqr_transaction_id
    ON payments(khqr_transaction_id);

-- Add comment for documentation
COMMENT ON COLUMN payments.qr_code_data IS 'KHQR code string or base64 image data';
COMMENT ON COLUMN payments.transaction_reference IS 'Unique reference ID for this payment transaction';
COMMENT ON COLUMN payments.khqr_transaction_id IS 'Transaction ID from KHQR provider after payment confirmation';
COMMENT ON COLUMN payments.qr_expires_at IS 'Expiration timestamp for dynamic QR codes';
COMMENT ON COLUMN payments.provider_name IS 'KHQR provider name (ABA, Wing, Pi Pay, etc.)';
