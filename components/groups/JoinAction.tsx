"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface JoinActionProps {
  groupId: string;
  userId: string | undefined;
  isMember: boolean;
}

/**
 * JoinAction Component
 * Role: Handles the membership lifecycle (Join/Leave) using optimistic updates and server refreshing.
 */
export const JoinAction = ({ groupId, userId, isMember }: JoinActionProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (isMember) {
        await supabase
          .from("group_members")
          .delete()
          .eq("group_id", groupId)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("group_members")
          .insert({ group_id: groupId, user_id: userId, role: "student" });
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Membership action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMember) {
    return (
      <button
        onClick={handleAction}
        disabled={loading || isPending}
        className="w-full py-5 bg-zinc-950 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {(loading || isPending) && (
          <Loader2 size={14} className="animate-spin" />
        )}
        Join this Circle
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center border border-emerald-100">
        Active Member
      </div>
      <button
        onClick={handleAction}
        disabled={loading || isPending}
        className="w-full py-3 text-[10px] font-bold text-zinc-300 hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
      >
        {(loading || isPending) && (
          <Loader2 size={12} className="animate-spin" />
        )}
        Leave Group
      </button>
    </div>
  );
};
