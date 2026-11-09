-- Re-apply RLS policies for Student table to ensure new column is covered
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "tenant_isolation_student" ON "Student";

-- Create the policy
CREATE POLICY "tenant_isolation_student" ON "Student" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
);