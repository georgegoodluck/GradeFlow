-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "ca1" INTEGER NOT NULL DEFAULT 0,
    "ca2" INTEGER NOT NULL DEFAULT 0,
    "ca3" INTEGER NOT NULL DEFAULT 0,
    "exam" INTEGER NOT NULL DEFAULT 0,
    "caAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Score_schoolId_idx" ON "Score"("schoolId");

-- CreateIndex
CREATE INDEX "Score_termId_idx" ON "Score"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_studentId_subjectId_termId_key" ON "Score"("studentId", "subjectId", "termId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
