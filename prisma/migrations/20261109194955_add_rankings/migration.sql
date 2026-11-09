-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "subjectRank" INTEGER;

-- CreateTable
CREATE TABLE "StudentTermResult" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "average" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentTermResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentTermResult_schoolId_termId_idx" ON "StudentTermResult"("schoolId", "termId");

-- CreateIndex
CREATE INDEX "StudentTermResult_termId_idx" ON "StudentTermResult"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTermResult_studentId_termId_key" ON "StudentTermResult"("studentId", "termId");

-- CreateIndex
CREATE INDEX "Score_termId_subjectId_subjectRank_idx" ON "Score"("termId", "subjectId", "subjectRank");

-- AddForeignKey
ALTER TABLE "StudentTermResult" ADD CONSTRAINT "StudentTermResult_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTermResult" ADD CONSTRAINT "StudentTermResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTermResult" ADD CONSTRAINT "StudentTermResult_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
