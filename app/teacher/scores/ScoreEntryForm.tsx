"use client";

import { useState, useTransition, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
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
  remark: string; // <-- Added remark
}

interface Props {
  classId: string;
  subjectId: string;
  termId: string;
  students: Student[];
  existingScores: Map<string, Score>;
}

const MAX_SCORES: Record<keyof Omit<Score, "remark">, number> = {
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
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  const draftKey = `draft_${classId}_${subjectId}_${termId}`;

  const [scores, setScores] = useState<Record<string, Score>>(() => {
    const initial: Record<string, Score> = {};
    let draft: Record<string, Score> | null = null;

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          draft = JSON.parse(saved);
        } catch {}
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
          remark: "",
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

  function handleChange(
    studentId: string,
    field: keyof Omit<Score, "remark">,
    value: string,
  ) {
    if (value === "") {
      setScores((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], [field]: 0 },
      }));
      return;
    }
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;
    const max = MAX_SCORES[field];
    const clamped = Math.min(Math.max(parsed, 0), max);
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: clamped },
    }));
  }

  function handleRemarkChange(studentId: string, value: string) {
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remark: value },
    }));
  }

  function handleSubmit(formData: FormData) {
    setMessage(null);

    for (const [studentId, score] of Object.entries(scores)) {
      formData.set(`ca1_${studentId}`, score.ca1.toString());
      formData.set(`ca2_${studentId}`, score.ca2.toString());
      formData.set(`ca3_${studentId}`, score.ca3.toString());
      formData.set(`exam_${studentId}`, score.exam.toString());
      formData.set(`remark_${studentId}`, score.remark);
    }

    formData.set("classId", classId);
    formData.set("subjectId", subjectId);
    formData.set("termId", termId);

    startTransition(async () => {
      const result = await submitScores(formData);
      if (result.success) {
        setMessage({ text: "Scores saved successfully!", ok: true });
        localStorage.removeItem(draftKey);
      } else {
        setMessage({ text: result.error || "An error occurred.", ok: false });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 pb-24 md:pb-0">
      {message && (
        <div
          className={`rounded p-4 text-sm font-medium ${
            message.ok
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end text-xs text-gray-500">
        Drafts are saved automatically to your browser.
      </div>

      {/* MOBILE VIEW */}
      <div className="space-y-4 md:hidden">
        {students.map((student) => {
          const score = scores[student.id];
          const computed = computeScore(score);
          return (
            <div
              key={student.id}
              className="rounded-lg border border-gray-100 bg-white p-4 shadow-soft"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium text-charcoal">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.admissionNo}</p>
                </div>
                <div className="text-right">
                  <p className="font-playfair text-2xl font-semibold text-charcoal leading-none">
                    {computed.total}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold ${computed.grade === "A" ? "bg-green-100 text-green-700" : computed.grade === "F" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {computed.grade}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(["ca1", "ca2", "ca3", "exam"] as const).map((field) => (
                  <div key={field}>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-500">
                      {field.replace("ca", "CA ")} (Max {MAX_SCORES[field]})
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max={MAX_SCORES[field]}
                      step="0.01"
                      value={score[field] === 0 ? "" : score[field]}
                      onChange={(e) =>
                        handleChange(student.id, field, e.target.value)
                      }
                      className="w-full rounded border border-gray-300 p-2.5 text-center text-lg focus:border-gold focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Teacher&apos;s Remark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Excellent performance"
                  value={score.remark}
                  onChange={(e) =>
                    handleRemarkChange(student.id, e.target.value)
                  }
                  className="w-full rounded border border-gray-300 p-2.5 text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden overflow-x-auto rounded-lg bg-white shadow-soft md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 font-medium text-gray-500">Student</th>
              <th className="p-4 font-medium text-gray-500">CA1</th>
              <th className="p-4 font-medium text-gray-500">CA2</th>
              <th className="p-4 font-medium text-gray-500">CA3</th>
              <th className="p-4 font-medium text-gray-500">Exam</th>
              <th className="p-4 font-medium text-gray-500">Total</th>
              <th className="p-4 font-medium text-gray-500">Grade</th>
              <th className="p-4 font-medium text-gray-500 w-1/4">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => {
              const score = scores[student.id];
              const computed = computeScore(score);
              return (
                <tr key={student.id} className="hover:bg-gray-50/70">
                  <td className="p-4">
                    <p className="font-medium text-charcoal">{student.name}</p>
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
                        className="w-20 rounded border border-gray-300 p-2 text-center focus:border-gold focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="p-4 font-semibold text-charcoal">
                    {computed.total}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${computed.grade === "A" ? "bg-green-100 text-green-700" : computed.grade === "F" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {computed.grade}
                    </span>
                  </td>
                  <td className="p-4">
                    <input
                      type="text"
                      placeholder="Enter remark"
                      value={score.remark}
                      onChange={(e) =>
                        handleRemarkChange(student.id, e.target.value)
                      }
                      className="w-full rounded border border-gray-300 p-2 text-sm focus:border-gold focus:outline-none"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 p-4 backdrop-blur shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:static md:border-none md:bg-transparent md:p-0 md:shadow-none md:flex md:justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded bg-gold px-8 py-3.5 font-medium text-charcoal transition hover:bg-[#d4b573] disabled:opacity-50 md:w-auto md:py-3"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Scores
            </>
          )}
        </button>
      </div>
    </form>
  );
}
