ALTER TABLE "Term" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Term" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Term" FOR ALL USING (
    "schoolId" = current_setting ('app.current_school_id', true)
)
WITH
    CHECK (
        "schoolId" = current_setting ('app.current_school_id', true)
    );