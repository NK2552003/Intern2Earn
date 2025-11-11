-- Check certificates for a specific student
-- Replace 'STUDENT_ID_HERE' with the actual student ID from Clerk

SELECT 
  c.id,
  c.title,
  c.issued_at,
  c.student_id,
  c.application_id,
  a.internship_id,
  i.title as internship_title,
  i.company_name
FROM certificates c
JOIN applications a ON c.application_id = a.id
JOIN internships i ON a.internship_id = i.id
WHERE c.student_id = 'STUDENT_ID_HERE'
ORDER BY c.issued_at DESC;

-- Check all certificates in the system
SELECT 
  c.id,
  c.title,
  c.issued_at,
  p.full_name as student_name,
  i.title as internship_title
FROM certificates c
JOIN profiles p ON c.student_id = p.id
JOIN applications a ON c.application_id = a.id
JOIN internships i ON a.internship_id = i.id
ORDER BY c.issued_at DESC;

-- Check submissions that are approved but don't have certificates
SELECT 
  s.id as submission_id,
  s.title as submission_title,
  s.status,
  s.application_id,
  a.student_id,
  p.full_name as student_name,
  i.title as internship_title,
  COUNT(c.id) as certificate_count
FROM submissions s
JOIN applications a ON s.application_id = a.id
JOIN profiles p ON a.student_id = p.id
JOIN internships i ON a.internship_id = i.id
LEFT JOIN certificates c ON c.application_id = s.application_id
WHERE s.status = 'approved'
GROUP BY s.id, s.title, s.status, s.application_id, a.student_id, p.full_name, i.title
HAVING COUNT(c.id) = 0;
