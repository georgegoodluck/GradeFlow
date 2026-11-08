-- Enable RLS on all tenant-scoped tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;

-- Force RLS so it also applies to the table owner (defense in depth)
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Student" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Class" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Subject" FORCE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation ON "User"
  FOR ALL
  USING ("schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("schoolId" = current_setting('app.current_school_id', true));

CREATE POLICY tenant_isolation ON "Student"
  FOR ALL
  USING ("schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("schoolId" = current_setting('app.current_school_id', true));

CREATE POLICY tenant_isolation ON "Class"
  FOR ALL
  USING ("schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("schoolId" = current_setting('app.current_school_id', true));

CREATE POLICY tenant_isolation ON "Subject"
  FOR ALL
  USING ("schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("schoolId" = current_setting('app.current_school_id', true));
