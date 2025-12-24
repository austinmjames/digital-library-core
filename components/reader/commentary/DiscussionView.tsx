"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Hash,
  Send,
  ChevronLeft,
  MoreVertical,
  Loader2,
  MessageCircle,
  ChevronRight,
  X,
  Plus, // Added missing import
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { DiscussionGroup, DiscussionMessage } from "@/lib/types/library";
import { User } from "@supabase/supabase-js";

interface DiscussionViewProps {
  verseRef: string;
  user: User | null;
}

/**
 * components/reader/commentary/DiscussionView.tsx
 * Real-time verse-level chat groups.
 * Implements Supabase Real-time subscriptions for instantaneous collaboration.
 */
export function DiscussionView({ verseRef, user }: DiscussionViewProps) {
  const [groups, setGroups] = useState<DiscussionGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<DiscussionGroup | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");

  // UI States
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [newName, setNewName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  // Removed unused error state

  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("group_memberships")
      .select("group_id, discussion_groups(*)")
      .eq("user_id", user.id);

    if (data) {
      setGroups(
        data.map((d) => d.discussion_groups as unknown as DiscussionGroup)
      );
    }
    setLoading(false);
  }, [user, supabase]);

  const fetchMessages = useCallback(async () => {
    if (!activeGroup || !verseRef) return;
    const { data } = await supabase
      .from("discussion_messages")
      .select("*")
      .eq("group_id", activeGroup.id)
      .eq("verse_ref", verseRef)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data as DiscussionMessage[]);
      setTimeout(scrollToBottom, 100);
    }
  }, [activeGroup, verseRef, supabase, scrollToBottom]);

  // --- REAL-TIME SUBSCRIPTION ---
  useEffect(() => {
    if (!activeGroup || !verseRef) return;

    // Listen for new messages in this group/verse room
    const channel = supabase
      .channel(`room:${activeGroup.id}:${verseRef.replace(/\s+/g, "-")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "discussion_messages",
          filter: `group_id=eq.${activeGroup.id}`,
        },
        (payload) => {
          const newMsg = payload.new as DiscussionMessage;
          // Filter client-side to ensure verse reference matches
          if (newMsg.verse_ref === verseRef) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeGroup, verseRef, supabase, scrollToBottom]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleCreateGroup = async () => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: group } = await supabase
      .from("discussion_groups")
      .insert({ name: newName, invite_code: code, created_by: user.id })
      .select()
      .single();

    if (group) {
      await supabase
        .from("group_memberships")
        .insert({ group_id: group.id, user_id: user.id });
      setGroups((prev) => [...prev, group as DiscussionGroup]);
      setIsCreating(false);
      setNewName("");
      setActiveGroup(group as DiscussionGroup);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeGroup || !user) return;
    setSending(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { error: sendErr } = await supabase
      .from("discussion_messages")
      .insert({
        group_id: activeGroup.id,
        user_id: user.id,
        user_name: profile?.full_name || user.email?.split("@")[0] || "Member",
        verse_ref: verseRef,
        content: input,
      });

    if (!sendErr) {
      setInput("");
    }
    setSending(false);
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-pencil/30" />
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[10px] font-black text-pencil uppercase tracking-[0.2em]">
            Discussion Groups
          </h4>
        </div>

        <div className="space-y-3">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g)}
              className="w-full p-5 bg-white border border-pencil/10 rounded-[1.8rem] flex items-center justify-between group hover:border-gold/30 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-pencil/5 flex items-center justify-center text-pencil group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                  <Hash className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-ink text-sm">{g.name}</p>
                  <p className="text-[9px] text-pencil/40 uppercase font-black tracking-widest mt-0.5">
                    Share Code: {g.invite_code}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-pencil/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </button>
          ))}

          {!isCreating && !isJoining && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsJoining(true)}
                className="rounded-2xl text-[10px] h-10 font-black uppercase tracking-widest border-pencil/20"
              >
                Join by Code
              </Button>
              <Button
                onClick={() => setIsCreating(true)}
                className="rounded-2xl text-[10px] h-10 font-black bg-ink text-white uppercase tracking-widest"
              >
                <Plus className="w-3 h-3 mr-1.5" /> Create Group
              </Button>
            </div>
          )}
        </div>

        {(isCreating || isJoining) && (
          <div className="p-6 bg-gold/5 rounded-[2.2rem] space-y-4 animate-in zoom-in-95 border border-gold/10 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">
                {isCreating ? "Establish Group" : "Enter Invite Code"}
              </span>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsJoining(false);
                }}
                className="text-pencil p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              autoFocus
              value={isCreating ? newName : inviteCode}
              onChange={(e) =>
                isCreating
                  ? setNewName(e.target.value)
                  : setInviteCode(e.target.value)
              }
              className="w-full bg-white border border-gold/10 rounded-xl px-4 py-3 text-sm font-serif shadow-sm focus:ring-4 focus:ring-gold/5 outline-none"
              placeholder={isCreating ? "Group Name" : "6-digit code"}
            />
            <Button
              onClick={isCreating ? handleCreateGroup : () => {}}
              className="w-full bg-gold text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest"
              disabled={isCreating ? !newName.trim() : !inviteCode.trim()}
            >
              {isCreating ? "Form Group" : "Verify & Join"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-2 duration-300">
      <header className="flex items-center justify-between pb-4 border-b border-pencil/10 mb-6">
        <button
          onClick={() => setActiveGroup(null)}
          className="flex items-center gap-2 text-pencil hover:text-ink transition-colors group active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {activeGroup.name}
          </span>
        </button>
        <button className="p-2 rounded-full hover:bg-pencil/5 text-pencil">
          <MoreVertical className="w-4 h-4" />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-6 px-1"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-20 italic">
            <MessageCircle className="w-12 h-12 mb-3" />
            <p className="text-sm font-serif">Awaiting the first insight...</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-1.5 max-w-[85%] animate-in fade-in slide-in-from-bottom-1 duration-300",
                m.user_id === user?.id ? "ml-auto items-end" : "items-start"
              )}
            >
              <span className="text-[9px] font-black text-pencil/40 uppercase tracking-widest px-1">
                {m.user_name}
              </span>
              <div
                className={cn(
                  "px-4 py-3 rounded-[1.4rem] text-sm leading-relaxed shadow-sm",
                  m.user_id === user?.id
                    ? "bg-gold text-white rounded-tr-none"
                    : "bg-white text-ink rounded-tl-none border border-pencil/10"
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="pt-4 border-t border-pencil/5 mt-4">
        <div className="flex items-end gap-2 bg-white border border-pencil/10 rounded-[1.8rem] p-2 focus-within:border-gold/30 transition-all shadow-sm">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Contribute to the dialogue..."
            className="flex-1 min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 text-sm font-serif p-2.5"
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSendMessage())
            }
          />
          <button
            disabled={!input.trim() || sending}
            onClick={handleSendMessage}
            className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center shrink-0 active:scale-75 transition-all disabled:opacity-20 shadow-lg"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
