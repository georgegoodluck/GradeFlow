ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Staff" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Staff" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
)
WITH
    CHECK (
        "schoolId" = current_setting ('app.current_school_id', true)
    );

ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Student" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Student" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
)
WITH
    CHECK (
        "schoolId" = current_setting ('app.current_school_id', true)
    );

ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Class" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Class" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
)
WITH
    CHECK (
        "schoolId" = current_setting ('app.current_school_id', true)
    );

ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Subject" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Subject" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
)
WITH
    CHECK (
        "schoolId" = current_setting ('app.current_school_id', true)
    );

ALTER TABLE "TeacherSubject" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "TeacherSubject" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "TeacherSubject" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
)
WITH
    CHECK (
        "schoolId" = current_setting ('app.current_school_id', true)
    );

ALTER TABLE "Term" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Term" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Term" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
)
WITH
    CHECK (
        "schoolId" = current_setting ('app.current_school_id', true)
    );

ALTER TABLE "Score" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Score" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Score" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
)
WITH
    CHECK (
        "schoolId" = current_setting ('app.current_school_id', true)
    );  