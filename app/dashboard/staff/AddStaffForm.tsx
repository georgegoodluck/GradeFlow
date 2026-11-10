"use client";

import { useState, useTransition } from "react";
import { addStaffMember } from "@/app/actions/admin";

export function AddStaffForm() {
  const [isPending, startTransition] = useTransition();
  const [generatedPass, setGeneratedPass] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setGeneratedPass(null);

    startTransition(async () => {
      const result = await addStaffMember(formData);
      if (result.success && result.generatedPassword) {
        setGeneratedPass(result.generatedPassword);
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-4 rounded-lg bg-white p-6 shadow-soft">
      {generatedPass && (
        <div className="rounded border border-green-500 bg-green-50 p-4 text-green-800">
          <p className="font-medium">Staff added successfully!</p>
          <p className="text-sm">
            Copy this password and give it to the staff member:
          </p>
          <code className="mt-2 block rounded bg-white p-2 text-lg font-mono border">
            {generatedPass}
          </code>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form action={handleSubmit} className="grid gap-3">
        <input
          name="name"
          placeholder="Full name"
          required
          className="rounded border p-3"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border p-3"
        />
        <select name="role" className="rounded border p-3">
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-gold px-6 py-2 text-charcoal font-medium disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add Staff"}
        </button>
      </form>
    </div>
  );
}
