import { eq } from "drizzle-orm";
import { UploadCloud, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { updateSchoolLogo, removeSchoolLogo, updateSchoolDetails } from "@/app/actions/school";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.schoolId) return <div className="p-8 text-center text-red-500">Unauthorized</div>;
  const [school] = await db.select().from(schools).where(eq(schools.id, session.user.schoolId)).limit(1);
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="font-playfair text-3xl">School Settings</h2>
      <div className="rounded-lg bg-white p-6 shadow-soft space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">School Details</h3>
          <form action={updateSchoolDetails} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="headOfSchoolTitle" className="block text-sm font-medium text-gray-700 mb-1">Head of School Title</label>
                <input id="headOfSchoolTitle" name="headOfSchoolTitle" defaultValue={school?.headOfSchoolTitle || ""} required className="w-full rounded border p-3 focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label htmlFor="headOfSchoolName" className="block text-sm font-medium text-gray-700 mb-1">Head of School Full Name</label>
                <input id="headOfSchoolName" name="headOfSchoolName" defaultValue={school?.headOfSchoolName || ""} required className="w-full rounded border p-3 focus:border-gold focus:outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="motto" className="block text-sm font-medium text-gray-700 mb-1">School Motto</label>
              <input id="motto" name="motto" defaultValue={school?.motto || ""} required className="w-full rounded border p-3 focus:border-gold focus:outline-none" />
            </div>
            <button type="submit" className="cursor-pointer rounded-md bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 transition">Save Details</button>
          </form>
        </div>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-medium mb-4">School Logo</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="h-32 w-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group">
              {school?.logoUrl ? (
                <>
                  <img src={school.logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                  <form action={removeSchoolLogo} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                    <button type="submit" className="cursor-pointer flex items-center gap-1 text-white text-xs font-medium hover:underline"><Trash2 className="h-3 w-3" /> Remove</button>
                  </form>
                </>
              ) : (
                <div className="text-gray-400 flex flex-col items-center"><UploadCloud className="h-8 w-8 mb-1" /><span className="text-xs">No Logo</span></div>
              )}
            </div>
            <form action={updateSchoolLogo} className="flex-1 space-y-4">
              <input type="file" name="logo" accept="image/*" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-charcoal hover:file:bg-[#d4b573] cursor-pointer" />
              <button type="submit" className="cursor-pointer w-full sm:w-auto rounded-md bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 transition">Upload Logo</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
