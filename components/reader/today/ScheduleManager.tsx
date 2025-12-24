"use client";

import { useState, useEffect } from "react";
import { Loader2, Download } from "lucide-react";
import { getUserSchedules, importScheduleByCode } from "@/app/actions";
import { UserSchedule } from "@/lib/types/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Import Segmented Components
import { ScheduleHeader } from "./ScheduleHeader";
import { ScheduleCreationForm } from "./ScheduleCreationForm";
import { ScheduleCard } from "./ScheduleCard";
import { ScheduleFooter } from "./ScheduleFooter";

type ViewState = "LIST" | "CREATE" | "IMPORT";

/**
 * ScheduleManager
 * Resolved: Removed unused 'ArrowLeft' and typed 'err' in handleImport.
 */
export default function ScheduleManager() {
  const [schedules, setSchedules] = useState<UserSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewState>("LIST");

  // Import State
  const [importCode, setImportCode] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const data = await getUserSchedules();
      setSchedules(data);
    } catch (err) {
      console.error("Failed to load schedules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleImport = async () => {
    if (!importCode || importCode.length < 4) return;
    setIsImporting(true);
    setImportError(null);
    try {
      await importScheduleByCode(importCode);
      setImportCode("");
      setView("LIST");
      loadSchedules();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid or private code";
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ScheduleHeader
        view={view}
        onToggleCreate={() => setView(view === "CREATE" ? "LIST" : "CREATE")}
        onToggleImport={() => setView(view === "IMPORT" ? "LIST" : "IMPORT")}
      />

      {view === "CREATE" && (
        <ScheduleCreationForm
          onCancel={() => setView("LIST")}
          onCreated={() => {
            setView("LIST");
            loadSchedules();
          }}
        />
      )}

      {view === "IMPORT" && (
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 animate-in zoom-in-95 duration-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">
                Import Path
              </h4>
            </div>

            <Input
              placeholder="Paste Share Code (e.g. 8A2B)"
              value={importCode}
              onChange={(e) => {
                setImportCode(e.target.value.toUpperCase());
                setImportError(null);
              }}
              className="bg-white border-indigo-200 focus:ring-indigo-500/20 uppercase font-mono"
            />

            {importError && (
              <p className="text-[10px] font-bold text-red-500 uppercase">
                {importError}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 h-9 text-[10px] font-bold uppercase text-indigo-900/60"
                onClick={() => setView("LIST")}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase shadow-md shadow-indigo-200"
                onClick={handleImport}
                disabled={isImporting || !importCode}
              >
                {isImporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify & Join"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-pencil/20" />
          </div>
        ) : (
          schedules.map((s) => (
            <ScheduleCard key={s.id} schedule={s} onUpdate={loadSchedules} />
          ))
        )}

        {!isLoading && schedules.length === 0 && view === "LIST" && (
          <div className="py-12 text-center border-2 border-dashed border-pencil/10 rounded-2xl">
            <p className="text-sm text-pencil">
              No active study paths. Create one or import a code to begin.
            </p>
          </div>
        )}
      </div>

      <ScheduleFooter />
    </div>
  );
}
