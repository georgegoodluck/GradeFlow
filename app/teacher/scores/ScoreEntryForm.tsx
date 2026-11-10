"use client";

import { useState, useTransition, useEffect } from "react";
import { computeScore } from "@/lib/grading";
import { submitScores } from "@/app/actions/scores";

interface Student {
  id: string;
  name: string;
  admissionNo: string;
}

interface Score {
  ca1: number;
  ca2: number;
  ca3: number;
  exam: number;
}

interface Props {
  classId: string;
  subjectId: string;
  termId: string;
  students: Student[];
  existingScores: Map<string, Score>;
}

// Centralize the limits so UI and server stay in sync
const MAX_SCORES: Record<keyof Score, number> = {
  ca1: 40,
  ca2: 40,
  ca3: 40,
  exam: 60,
};

export function ScoreEntryForm({
  classId,
  subjectId,
  termId,
  students,
  existingScores,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const draftKey = `draft_${classId}_${subjectId}_${termId}`;

  const [scores, setScores] = useState<Record<string, Score>>(() => {
    const initial: Record<string, Score> = {};

    let draft: Record<string, Score> | null = null;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          draft = JSON.parse(saved);
        } catch {
          // Ignore malformed draft
        }
      }
    }

    for (const student of students) {
      if (draft && draft[student.id]) {
        initial[student.id] = draft[student.id];
      } else {
        initial[student.id] = existingScores.get(student.id) || {
          ca1: 0,
          ca2: 0,
          ca3: 0,
          exam: 0,
        };
      }
    }
    return initial;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(draftKey, JSON.stringify(scores));
    }
  }, [scores, draftKey]);

  function handleChange(studentId: string, field: keyof Score, value: string) {
    // Handle empty input gracefully (don't force a 0 into the field)
    if (value === "") {
      setScores((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], [field]: 0 },
      }));
      return;
    }

    // Reject non-numeric input early
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;

    // Clamp to [0, max] based on field
    const max = MAX_SCORES[field];
    const clamped = Math.min(Math.max(parsed, 0), max);

    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: clamped },
    }));
  }

  function handleSubmit(formData: FormData) {
    setMessage(null);

    for (const [studentId, score] of Object.entries(scores)) {
      formData.set(`ca1_${studentId}`, score.ca1.toString());
      formData.set(`ca2_${studentId}`, score.ca2.toString());
      formData.set(`ca3_${studentId}`, score.ca3.toString());
      formData.set(`exam_${studentId}`, score.exam.toString());
    }

    formData.set("classId", classId);
    formData.set("subjectId", subjectId);
    formData.set("termId", termId);

    startTransition(async () => {
      const result = await submitScores(formData);
      if (result.success) {
        setMessage("Scores saved successfully!");
        localStorage.removeItem(draftKey);
      } else {
        setMessage(result.error || "An error occurred.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`rounded p-4 ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex justify-end text-xs text-gray-500">
        Drafts are saved automatically to your browser.
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Student</th>
              <th className="p-4 font-medium text-gray-500">CA1 (40)</th>
              <th className="p-4 font-medium text-gray-500">CA2 (40)</th>
              <th className="p-4 font-medium text-gray-500">CA3 (40)</th>
              <th className="p-4 font-medium text-gray-500">Exam (60)</th>
              <th className="p-4 font-medium text-gray-500">Total</th>
              <th className="p-4 font-medium text-gray-500">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((student) => {
              const score = scores[student.id];
              const computed = computeScore(score);
              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-gray-500">
                      {student.admissionNo}
                    </p>
                  </td>
                  {(["ca1", "ca2", "ca3", "exam"] as const).map((field) => (
                    <td key={field} className="p-4">
                      <input
                        type="number"
                        min="0"
                        max={MAX_SCORES[field]}
                        step="0.01"
                        value={score[field] === 0 ? "" : score[field]}
                        onChange={(e) =>
                          handleChange(student.id, field, e.target.value)
                        }
                        className="w-20 rounded border p-2 text-center focus:border-gold focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="p-4 font-semibold">{computed.total}</td>
                  <td className="p-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        computed.grade === "A"
                          ? "bg-green-100 text-green-700"
                          : computed.grade === "F"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {computed.grade}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-gold px-8 py-3 font-medium text-charcoal hover:bg-[#d4b573] disabled:opacity-50 transition"
        >
          {isPending ? "Saving..." : "Save Scores"}
        </button>
      </div>
    </form>
  );
}
