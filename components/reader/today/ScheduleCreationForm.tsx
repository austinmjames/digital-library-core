"use client";

import { useState } from "react";
import { Calendar, ListOrdered, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSchedule } from "@/app/actions";

interface ScheduleCreationFormProps {
  onCancel: () => void;
  onCreated: () => void;
}

/**
 * ScheduleCreationForm
 * Logic and UI for initializing a new study plan.
 */
export function ScheduleCreationForm({
  onCancel,
  onCreated,
}: ScheduleCreationFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"sequence" | "calendar">("sequence");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createSchedule(title, type);
      onCreated();
    } catch (err) {
      console.error("Failed to create schedule:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gold/5 border border-gold/20 animate-in zoom-in-95 duration-200">
      <div className="space-y-4">
        <Input
          placeholder="e.g., 30 Days of Proverbs"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white border-gold/10 focus:ring-gold/20"
        />

        <div className="flex gap-2">
          {(["sequence", "calendar"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setType(mode)}
              className={cn(
                "flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 transition-all",
                type === mode
                  ? "bg-gold text-white border-gold shadow-md"
                  : "bg-white border-pencil/10 text-pencil hover:bg-pencil/5"
              )}
            >
              {mode === "sequence" ? (
                <ListOrdered className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {mode}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 h-9 text-[10px] font-bold uppercase"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-9 bg-gold hover:bg-gold/90 text-white text-[10px] font-bold uppercase"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create Path"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
