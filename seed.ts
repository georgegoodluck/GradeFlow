// seed.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import * as schema from "./db/schema";
import { randomBytes } from "node:crypto";
import "dotenv/config"; // Loads .env

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting database seed...");

  // 1. Clean up existing data (Order matters due to FK constraints)
  console.log("🧹 Cleaning up old data...");
  await db.delete(schema.scores);
  await db.delete(schema.teacherSubjects);
  await db.delete(schema.students);
  await db.delete(schema.staff);
  await db.delete(schema.subjects);
  await db.delete(schema.classes);
  await db.delete(schema.terms);
  await db.delete(schema.schools);

  // 2. Create School
  console.log("🏫 Creating school...");
  const [school] = await db
    .insert(schema.schools)
    .values({
      name: "Hans Academy",
      slug: "hans-academy",
      onboardingComplete: true,
      logoUrl: null,
    })
    .returning();

  // 3. Create Terms
  console.log("📅 Creating terms...");
  const [term] = await db
    .insert(schema.terms)
    .values({
      schoolId: school.id,
      name: "First Term",
      session: "2026/2027",
      isActive: true,
    })
    .returning();

  // 4. Create Staff (Owner & Teachers)
  console.log("👨‍🏫 Creating staff...");
  const passwordHash = await hash("Password123", 12);

  await db.insert(schema.staff).values([
    {
      schoolId: school.id,
      email: "owner@hans.local",
      passwordHash,
      name: "Admin Owner",
      role: "owner",
    },
    {
      schoolId: school.id,
      email: "teacher1@hans.local",
      passwordHash,
      name: "Mr. John Doe",
      role: "teacher",
    },
    {
      schoolId: school.id,
      email: "teacher2@hans.local",
      passwordHash,
      name: "Mrs. Jane Smith",
      role: "teacher",
    },
  ]);

  const allStaff = await db.query.staff.findMany();
  const teacher1 = allStaff.find((s) => s.email === "teacher1@hans.local")!;
  const teacher2 = allStaff.find((s) => s.email === "teacher2@hans.local")!;

  // 5. Create Classes
  console.log("🏫 Creating classes...");
  const insertedClasses = await db
    .insert(schema.classes)
    .values([
      { schoolId: school.id, name: "Grade 1" },
      { schoolId: school.id, name: "Grade 2" },
      { schoolId: school.id, name: "Grade 3" },
    ])
    .returning();

  // 6. Create Subjects
  console.log("📚 Creating subjects...");
  const insertedSubjects = await db
    .insert(schema.subjects)
    .values([
      { schoolId: school.id, name: "Mathematics" },
      { schoolId: school.id, name: "English Language" },
      { schoolId: school.id, name: "Basic Science" },
      { schoolId: school.id, name: "Social Studies" },
    ])
    .returning();

  // 7. Assign Teachers
  console.log("🔗 Assigning teachers...");
  await db.insert(schema.teacherSubjects).values([
    {
      schoolId: school.id,
      staffId: teacher1.id,
      subjectId: insertedSubjects[0].id,
      classId: insertedClasses[0].id,
    }, // Math, Grade 1
    {
      schoolId: school.id,
      staffId: teacher1.id,
      subjectId: insertedSubjects[1].id,
      classId: insertedClasses[0].id,
    }, // English, Grade 1
    {
      schoolId: school.id,
      staffId: teacher2.id,
      subjectId: insertedSubjects[2].id,
      classId: insertedClasses[1].id,
    }, // Science, Grade 2
  ]);

  // 8. Create Students
  console.log("🎓 Creating students...");
  const studentData = [
    {
      name: "Alice Johnson",
      admissionNo: "ADM001",
      classId: insertedClasses[0].id,
    },
    {
      name: "Bob Smith",
      admissionNo: "ADM002",
      classId: insertedClasses[0].id,
    },
    {
      name: "Charlie Brown",
      admissionNo: "ADM003",
      classId: insertedClasses[0].id,
    },
    {
      name: "Diana Prince",
      admissionNo: "ADM004",
      classId: insertedClasses[0].id,
    },
  ].map((s) => ({
    ...s,
    schoolId: school.id,
    email: `${s.admissionNo.toLowerCase()}@student.local`,
    passwordHash,
  }));

  const insertedStudents = await db
    .insert(schema.students)
    .values(studentData)
    .returning();

  // 9. Create Scores (Randomized)
  console.log("📝 Generating scores...");
  const scoresToInsert = [];

  for (const student of insertedStudents) {
    for (const subject of insertedSubjects.slice(0, 2)) {
      // Only assign Math & English to Grade 1
      scoresToInsert.push({
        schoolId: school.id,
        studentId: student.id,
        subjectId: subject.id,
        termId: term.id,
        ca1: Math.floor(Math.random() * 31) + 10, // 10 - 40
        ca2: Math.floor(Math.random() * 31) + 10,
        ca3: Math.floor(Math.random() * 31) + 10,
        exam: Math.floor(Math.random() * 41) + 20, // 20 - 60
      });
    }
  }

  await db.insert(schema.scores).values(scoresToInsert);

  console.log("✅ Database seeded successfully!");
  console.log("-----------------------------------------");
  console.log("🏫 School Slug: hans-academy");
  console.log("👑 Owner Login: owner@hans.local | Password123");
  console.log("👨‍🏫 Teacher Login: teacher1@hans.local | Password123");
  console.log("🎓 Student Login: adm001@student.local | Password123");
  console.log("-----------------------------------------");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
