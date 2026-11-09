-- Enable RLS on all tenant tables
ALTER TABLE "School" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Term" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Score" ENABLE ROW LEVEL SECURITY;

-- Create policies that filter by app.current_school_id
-- School table: only the school matching the current setting
CREATE POLICY school_isolation ON "School"
  USING (id = current_setting('app.current_school_id', true)::text);

-- All other tables filter by schoolId
CREATE POLICY staff_isolation ON "Staff"
  USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY student_isolation ON "Student"
  USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY class_isolation ON "Class"
  USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY subject_isolation ON "Subject"
  USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY teacher_subject_isolation ON "TeacherSubject"
  USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY term_isolation ON "Term"
  USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY score_isolation ON "Score"
  USING (schoolId = current_setting('app.current_school_id', true)::text);

-- Allow inserts/updates/deletes only for the current tenant
-- (Postgres RLS USING applies to SELECT/UPDATE/DELETE; WITH CHECK applies to INSERT/UPDATE)
CREATE POLICY school_insert ON "School"
  FOR INSERT WITH CHECK (id = current_setting('app.current_school_id', true)::text);

CREATE POLICY staff_insert ON "Staff"
  FOR INSERT WITH CHECK (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY student_insert ON "Student"
  FOR INSERT WITH CHECK (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY class_insert ON "Class"
  FOR INSERT WITH CHECK (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY subject_insert ON "Subject"
  FOR INSERT WITH CHECK (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY teacher_subject_insert ON "TeacherSubject"
  FOR INSERT WITH CHECK (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY term_insert ON "Term"
  FOR INSERT WITH CHECK (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY score_insert ON "Score"
  FOR INSERT WITH CHECK (schoolId = current_setting('app.current_school_id', true)::text);

-- Update policies (same check as insert)
CREATE POLICY staff_update ON "Staff"
  FOR UPDATE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY student_update ON "Student"
  FOR UPDATE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY class_update ON "Class"
  FOR UPDATE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY subject_update ON "Subject"
  FOR UPDATE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY teacher_subject_update ON "TeacherSubject"
  FOR UPDATE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY term_update ON "Term"
  FOR UPDATE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY score_update ON "Score"
  FOR UPDATE USING (schoolId = current_setting('app.current_school_id', true)::text);

-- Delete policies
CREATE POLICY staff_delete ON "Staff"
  FOR DELETE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY student_delete ON "Student"
  FOR DELETE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY class_delete ON "Class"
  FOR DELETE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY subject_delete ON "Subject"
  FOR DELETE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY teacher_subject_delete ON "TeacherSubject"
  FOR DELETE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY term_delete ON "Term"
  FOR DELETE USING (schoolId = current_setting('app.current_school_id', true)::text);

CREATE POLICY score_delete ON "Score"
  FOR DELETE USING (schoolId = current_setting('app.current_school_id', true)::text);