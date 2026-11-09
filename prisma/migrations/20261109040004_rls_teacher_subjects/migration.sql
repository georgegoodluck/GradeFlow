ALTER TABLE "TeacherSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherSubject" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "TeacherSubject"
  FOR ALL
  USING ("schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("schoolId" = current_setting('app.current_school_id', true));
