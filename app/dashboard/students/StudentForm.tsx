"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { addStudent } from "@/app/actions/students";

export function StudentForm({
  classes,
}: {
  classes: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addStudent(formData);
      if (!result.success) {
        setError(result.error || "An error occurred.");
      } else {
        (document.getElementById("student-form") as HTMLFormElement)?.reset();
      }
    });
  }

  return (
    <form
      id="student-form"
      action={handleSubmit}
      className="grid gap-3 rounded-lg bg-white p-6 shadow-soft"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        name="name"
        placeholder="Student Full Name"
        required
        className="rounded border p-3"
      />
      <select name="classId" required className="rounded border p-3">
        <option value="">Select Class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded bg-gold px-6 py-2 text-charcoal disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4" />{" "}
        {isPending ? "Adding..." : "Add Student"}
      </button>
    </form>
  );
}
