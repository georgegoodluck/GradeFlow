-- Enable RLS
ALTER TABLE "Score" ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY "tenant_isolation_policy" ON "Score"
  FOR ALL
  USING ("schoolId" = current_setting('app.current_school_id', true)::text);
