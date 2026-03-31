-- Cleanup job for expired payments
-- Run this periodically (daily/weekly) to remove old abandoned payments

-- Option 1: Delete expired payments older than 30 days
DELETE FROM payments
WHERE payment_status = 'expired'
  AND qr_expires_at < NOW() - INTERVAL '30 days';

-- Option 2: Delete pending payments that expired more than 7 days ago
DELETE FROM payments
WHERE payment_status = 'pending'
  AND qr_expires_at < NOW() - INTERVAL '7 days';

-- Option 3: Move to archive table instead of deleting (better for analytics)
-- CREATE TABLE payments_archive AS TABLE payments WITH NO DATA;
--
-- INSERT INTO payments_archive
-- SELECT * FROM payments
-- WHERE payment_status IN ('expired', 'failed')
--   AND qr_expires_at < NOW() - INTERVAL '90 days';
--
-- DELETE FROM payments
-- WHERE payment_status IN ('expired', 'failed')
--   AND qr_expires_at < NOW() - INTERVAL '90 days';
