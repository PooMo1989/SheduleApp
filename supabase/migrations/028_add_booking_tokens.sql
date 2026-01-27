-- Migration: Add booking_token field for guest booking management
-- Story 3.6 & 3.7: Guest magic link system

-- Add booking_token column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_bookings_token ON bookings(booking_token) WHERE booking_token IS NOT NULL;

-- Create index for token expiry cleanup
CREATE INDEX IF NOT EXISTS idx_bookings_token_expiry ON bookings(token_expires_at) WHERE token_expires_at IS NOT NULL;

-- Function to generate secure booking tokens
CREATE OR REPLACE FUNCTION generate_booking_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    token TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 32-character token
        token := encode(gen_random_bytes(24), 'base64');
        -- Remove special characters to make it URL-safe
        token := replace(replace(replace(token, '/', ''), '+', ''), '=', '');
        
        -- Check if token already exists
        SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_token = token) INTO exists;
        
        -- Exit loop if token is unique
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN token;
END;
$$;

-- Create trigger to auto-generate booking tokens for guest bookings
CREATE OR REPLACE FUNCTION auto_generate_booking_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate token for new bookings without a user ID (guest bookings)
    IF NEW.client_user_id IS NULL AND NEW.booking_token IS NULL THEN
        NEW.booking_token := generate_booking_token();
        NEW.token_expires_at := NOW() + INTERVAL '30 days';
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_booking_token ON bookings;
CREATE TRIGGER trigger_auto_booking_token
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_booking_token();

-- Add comment
COMMENT ON COLUMN bookings.booking_token IS 'Secure token for guest booking management via magic links. Auto-generated for guest bookings (client_user_id IS NULL)';
COMMENT ON COLUMN bookings.token_expires_at IS 'Expiry timestamp for booking_token. Default 30 days from creation.';
