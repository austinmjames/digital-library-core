"use client";

import { useState } from "react";
import { X, Plus, Check, ChevronDown, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CollectionMetadata } from "@/lib/types/library";

interface NoteEditorProps {
  collections: CollectionMetadata[];
  selectedCollection: string;
  onSelectCollection: (name: string) => void;
  onSave: (content: string, collection: string) => Promise<void>;
  isSaving: boolean;
}

export function NoteEditor({
  collections,
  selectedCollection,
  onSelectCollection,
  onSave,
  isSaving,
}: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBookName, setNewBookName] = useState("");

  const currentPermission = collections.find(
    (c) => c.name === selectedCollection
  )?.permission;
  const isViewOnly = currentPermission === "viewer";

  const handleSave = async () => {
    if (!content.trim()) return;
    await onSave(content, selectedCollection);
    setContent("");
    setIsEditing(false);
  };

  const handleCreateBook = () => {
    if (!newBookName.trim()) return;
    onSelectCollection(newBookName);
    setNewBookName("");
    setIsAddingBook(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full p-4 flex items-center gap-3 text-pencil hover:text-ink bg-white rounded-xl border border-pencil/10 shadow-sm hover:bg-pencil/[0.02] transition-colors mb-4"
      >
        <div className="w-8 h-8 rounded-full bg-pencil/5 flex items-center justify-center text-pencil">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium">Add a personal note...</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-pencil/10 shadow-md overflow-hidden mb-6 p-4 space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-pencil uppercase tracking-wider">
          New Note
        </span>
        <button
          onClick={() => setIsEditing(false)}
          className="text-pencil hover:text-ink p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <Textarea
        autoFocus
        placeholder="Write your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] text-base"
      />

      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-pencil font-medium">in</span>
          {isAddingBook ? (
            <div className="flex items-center gap-1 bg-pencil/5 rounded-lg px-2 py-1">
              <input
                autoFocus
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="Book name..."
                className="bg-transparent border-none outline-none font-bold text-ink w-24"
                onKeyDown={(e) => e.key === "Enter" && handleCreateBook()}
              />
              <button onClick={handleCreateBook} className="text-gold p-0.5">
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="font-bold text-ink hover:text-gold flex items-center gap-1 transition-colors">
                  {selectedCollection}{" "}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {collections.map((c) => (
                  <DropdownMenuItem
                    key={c.name}
                    onClick={() => onSelectCollection(c.name)}
                  >
                    <div className="flex flex-col">
                      <span className="flex items-center justify-between">
                        {c.name}{" "}
                        {c.name === selectedCollection && (
                          <Check className="w-3 h-3 text-gold" />
                        )}
                      </span>
                      {c.permission === "viewer" && (
                        <span className="text-[9px] text-pencil/50 uppercase font-bold">
                          View Only
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-pencil/5 my-1" />
                <DropdownMenuItem
                  onClick={() => setIsAddingBook(true)}
                  className="text-gold"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" /> New Book
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={!content.trim() || isSaving || isViewOnly}
          className={cn(
            "w-full transition-all",
            isViewOnly
              ? "bg-pencil/10 text-pencil"
              : "bg-gold hover:bg-gold/90 text-white"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-2" />
              {isViewOnly ? "View Only" : "Save Note"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
