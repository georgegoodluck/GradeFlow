import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { updateSchoolLogo, removeSchoolLogo } from "@/app/actions/school";
import { SubmitButton } from "@/components/submit-button";
import Image from "next/image";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">School Settings</h2>
      <Suspense
        fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}
      >
        <SettingsForm />
      </Suspense>
    </div>
  );
}

async function SettingsForm() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, session.user.schoolId))
    .limit(1);

  return (
    <div className="rounded-lg bg-white p-6 shadow-soft space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">School Logo</h3>
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-lg border flex items-center justify-center bg-gray-50 overflow-hidden relative group">
            {school?.logoUrl ? (
              <>
                <img
                  src={school.logoUrl}
                  alt="School Logo"
                  className="h-full w-full object-contain"
                />
                <form
                  action={removeSchoolLogo}
                  className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"
                >
                  <button
                    type="submit"
                    className="text-white text-xs font-medium hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </>
            ) : (
              <span className="text-gray-400 text-xs">No Logo</span>
            )}
          </div>
          <form action={updateSchoolLogo} className="space-y-3">
            <input
              type="file"
              name="logo"
              accept="image/*"
              required
              className="text-sm"
            />
            <SubmitButton>Upload Logo</SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
