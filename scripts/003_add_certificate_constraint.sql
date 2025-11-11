-- Add unique constraint to prevent duplicate certificates for the same application
-- This ensures one certificate per internship application

-- First, remove any existing duplicate certificates (keep the oldest one for each application)
DELETE FROM public.certificates
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.certificates
  GROUP BY application_id
);

-- Add unique constraint on application_id
ALTER TABLE public.certificates
ADD CONSTRAINT certificates_application_id_unique UNIQUE (application_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_certificates_application_id ON public.certificates(application_id);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT certificates_application_id_unique ON public.certificates IS 
'Ensures that only one certificate can be generated per internship application';
