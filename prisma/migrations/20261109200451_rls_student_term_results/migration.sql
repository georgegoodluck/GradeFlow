-- Enable RLS
ALTER TABLE "StudentTermResult" ENABLE ROW LEVEL SECURITY;

-- Create policy to isolate by schoolId
CREATE POLICY "tenant_isolation_student_term_results" ON "StudentTermResult" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
);