"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createClass } from "@/app/actions/admin";

export function ClassForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createClass(formData);
      if (!result.success) {
        setError(result.error || "An error occurred.");
      } else {
        // Reset the form on success
        (document.getElementById("class-form") as HTMLFormElement)?.reset();
      }
    });
  }

  return (
    <form
      id="class-form"
      action={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <div className="flex-1">
        <input
          name="name"
          placeholder="Class name (e.g. JSS1)"
          required
          className="w-full rounded border p-3"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded bg-gold px-6 py-2 text-charcoal sm:w-auto disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> {isPending ? "Adding..." : "Add Class"}
      </button>
    </form>
  );
}
