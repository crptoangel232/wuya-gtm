-- Add server-side validation constraints to signals table
ALTER TABLE signals 
  ADD CONSTRAINT quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT harvest_deadline_valid CHECK (harvest_deadline_days >= 1 AND harvest_deadline_days <= 30),
  ADD CONSTRAINT notes_length_limit CHECK (notes IS NULL OR length(notes) <= 1000);

-- Add validation constraints to buyer_leads table
ALTER TABLE buyer_leads
  ADD CONSTRAINT name_length_limit CHECK (length(name) <= 200),
  ADD CONSTRAINT email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT phone_length_limit CHECK (phone IS NULL OR length(phone) <= 30),
  ADD CONSTRAINT company_length_limit CHECK (company IS NULL OR length(company) <= 200),
  ADD CONSTRAINT role_length_limit CHECK (role IS NULL OR length(role) <= 100);

-- Add validation constraints to opportunities table
ALTER TABLE opportunities
  ADD CONSTRAINT score_range CHECK (score >= 0 AND score <= 100),
  ADD CONSTRAINT status_valid CHECK (status IN ('New', 'Contacted', 'In Progress', 'Won', 'Lost')),
  ADD CONSTRAINT urgency_valid CHECK (urgency_label IN ('Low', 'Medium', 'High'));