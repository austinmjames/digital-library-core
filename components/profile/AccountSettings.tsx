"use client";

import { cn } from "@/lib/utils/utils";
import { AlertCircle, Lock, Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";

/**
 * AccountSettings Component (v3.1 - Cleanup)
 * Filepath: components/profile/AccountSettings.tsx
 * Role: Private administrative form for security and account destruction.
 * Fixes:
 * - Imported missing 'cn' utility.
 * - Removed unused 'supabase' client.
 * - Removed unused 'showPassword' state.
 */

export const AccountSettings = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      {/* 1. Security Core */}
      <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl space-y-12">
        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tighter italic">
            Security Logic
          </h3>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Credential management and encrypted access protocols.
          </p>
        </div>

        <div className="space-y-8">
          {/* Email Block */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 transition-all group-hover:bg-zinc-950 group-hover:text-white">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  Email Reference
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Linked for scholarly notifications
                </p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-zinc-50 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-100 hover:border-zinc-950 transition-all">
              Update
            </button>
          </div>

          {/* Password Block */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 transition-all group-hover:bg-zinc-950 group-hover:text-white">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  Entrance Key
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Last rotated 3 months ago
                </p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-zinc-50 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-100 hover:border-zinc-950 transition-all">
              Reset
            </button>
          </div>

          {/* Phone Block */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 transition-all group-hover:bg-zinc-950 group-hover:text-white">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  Scholar Contact
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Recovery number for 2FA
                </p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-zinc-50 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-100 hover:border-zinc-950 transition-all">
              Link
            </button>
          </div>
        </div>
      </section>

      {/* 2. Privacy Policy */}
      <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl space-y-10">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">
          Information Presence
        </h3>
        <div className="space-y-6">
          {[
            {
              label: "Public XP Progress",
              desc: "Allow other scholars to see your level.",
              active: true,
            },
            {
              label: "Community Activity",
              desc: "Show active Chavruta memberships.",
              active: true,
            },
            {
              label: "Note Attributions",
              desc: "Attach your handle to public insights.",
              active: false,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="max-w-[70%]">
                <p className="text-sm font-bold text-zinc-900">{item.label}</p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {item.desc}
                </p>
              </div>
              <button
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative p-1",
                  item.active ? "bg-blue-500" : "bg-zinc-200"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    item.active ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Danger Zone */}
      <section className="bg-rose-50/50 p-10 rounded-[3rem] border border-rose-100 shadow-sm space-y-8 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h3 className="text-xl font-black text-rose-950 uppercase tracking-tighter italic">
            Right to be Forgotten
          </h3>
          <p className="text-xs text-rose-400 font-medium leading-relaxed max-w-sm italic">
            Deleting your account will permanently purge your annotations,
            contribution records, and identity from the Beit Midrash registers.
          </p>
        </div>

        {!isDeleting ? (
          <button
            onClick={() => setIsDeleting(true)}
            className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-all shadow-xl active:scale-95 z-10 relative"
          >
            <Trash2 size={16} /> Delete Scholarly Records
          </button>
        ) : (
          <div className="flex items-center gap-4 animate-in slide-in-from-right-2 duration-300 relative z-10">
            <button className="px-6 py-4 bg-rose-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black">
              Finalize Destruction
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              className="px-6 py-4 bg-white text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100"
            >
              Cancel
            </button>
          </div>
        )}

        <AlertCircle className="absolute -bottom-10 -right-10 w-48 h-48 text-rose-500/10 -rotate-12 pointer-events-none" />
      </section>
    </div>
  );
};
