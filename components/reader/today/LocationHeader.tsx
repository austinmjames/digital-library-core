"use client";

import { Navigation, Edit, Save } from "lucide-react";

interface LocationHeaderProps {
  isEditing: boolean;
  locationName: string;
  zipInput: string;
  onZipChange: (val: string) => void;
  onSave: () => void;
  onEditToggle: (val: boolean) => void;
}

export function LocationHeader({
  isEditing,
  locationName,
  zipInput,
  onZipChange,
  onSave,
  onEditToggle,
}: LocationHeaderProps) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2 overflow-hidden">
        <Navigation className="w-3 h-3 text-gold shrink-0" />
        {isEditing ? (
          <input
            autoFocus
            placeholder="Zip Code"
            className="bg-pencil/5 border-none outline-none text-[10px] font-bold uppercase tracking-widest p-1 rounded w-20"
            value={zipInput}
            onChange={(e) => onZipChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave()}
          />
        ) : (
          <span className="text-[9px] font-bold text-pencil uppercase tracking-widest truncate">
            {locationName}
          </span>
        )}
      </div>
      <button
        onClick={() => (isEditing ? onSave() : onEditToggle(true))}
        className="p-1.5 rounded-full hover:bg-gold/10 text-gold transition-colors"
      >
        {isEditing ? (
          <Save className="w-3 h-3" />
        ) : (
          <Edit className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
