"use client";
import { useState, useTransition } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { addStaffMember } from "@/app/actions/admin";

export function AddStaffForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await addStaffMember(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Staff added successfully!" });
        (document.getElementById("staff-form") as HTMLFormElement)?.reset();
      } else {
        setMessage({ type: "error", text: result.error || "An error occurred." });
      }
    });
  }

  return (
    <div className="space-y-4 rounded-lg bg-white p-6 shadow-soft">
      {message && (
        <div className={`rounded p-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}
      <form id="staff-form" action={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input name="name" placeholder="Full name" required className="rounded border p-3" />
        <input name="email" type="email" placeholder="Email address" required className="rounded border p-3" />
        <select name="role" className="rounded border p-3 cursor-pointer">
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={isPending} className="flex cursor-pointer items-center justify-center gap-2 rounded bg-gold px-6 py-3 font-medium text-charcoal hover:bg-[#d4b573] disabled:opacity-50 sm:col-span-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {isPending ? "Adding..." : "Add Staff Member"}
        </button>
      </form>
    </div>
  );
}
