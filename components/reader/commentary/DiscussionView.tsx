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
  Users,
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
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("group_memberships")
      .select("group_id, discussion_groups(*)")
      .eq("user_id", user.id);

    if (data) {
      // Correct mapping of joined data to the DiscussionGroup type
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

    if (data) setMessages(data as DiscussionMessage[]);
  }, [activeGroup, verseRef, supabase]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleCreateGroup = async () => {
    if (!user) return;
    if (groups.length >= 3) {
      setError("Maximum 3 groups allowed.");
      return;
    }

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
      setError(null);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !inviteCode.trim()) return;
    if (groups.length >= 3) {
      setError("Maximum 3 groups allowed.");
      return;
    }

    const { data: group } = await supabase
      .from("discussion_groups")
      .select("*")
      .eq("invite_code", inviteCode.trim().toUpperCase())
      .single();

    if (!group) {
      setError("Invalid invite code.");
      return;
    }

    const { error: joinErr } = await supabase
      .from("group_memberships")
      .insert({ group_id: group.id, user_id: user.id });

    if (joinErr) {
      setError("Already a member or failed to join.");
    } else {
      setGroups((prev) => [...prev, group as DiscussionGroup]);
      setIsJoining(false);
      setInviteCode("");
      setError(null);
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

    const { data: msg } = await supabase
      .from("discussion_messages")
      .insert({
        group_id: activeGroup.id,
        user_id: user.id,
        user_name: profile?.full_name || user.email?.split("@")[0] || "Member",
        verse_ref: verseRef,
        content: input,
      })
      .select()
      .single();

    if (msg) {
      setMessages((prev) => [...prev, msg as DiscussionMessage]);
      setInput("");
      setTimeout(() => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
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
          <h4 className="text-[10px] font-bold text-pencil uppercase tracking-widest">
            My Discussions
          </h4>
          <span className="text-[9px] font-bold text-pencil/40">
            {groups.length}/3 Limits
          </span>
        </div>

        <div className="space-y-3">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g)}
              className="w-full p-4 bg-white border border-pencil/10 rounded-2xl flex items-center justify-between group hover:border-gold/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-pencil/5 flex items-center justify-center text-pencil">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-ink text-sm">{g.name}</p>
                  <p className="text-[10px] text-pencil uppercase font-bold tracking-tighter">
                    Code: {g.invite_code}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-pencil/20 group-hover:text-gold transition-colors" />
            </button>
          ))}

          {!isCreating && !isJoining && groups.length < 3 && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsJoining(true)}
                className="rounded-xl text-[11px] h-9 font-bold uppercase tracking-wider"
              >
                Join Group
              </Button>
              <Button
                onClick={() => setIsCreating(true)}
                className="rounded-xl text-[11px] h-9 font-bold bg-gold hover:bg-gold/90 border-none text-white uppercase tracking-wider"
              >
                Create Group
              </Button>
            </div>
          )}
        </div>

        {(isCreating || isJoining) && (
          <div className="p-4 bg-pencil/5 rounded-2xl space-y-4 animate-in slide-in-from-top-2 border border-pencil/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-pencil uppercase tracking-widest">
                {isCreating ? "Start New Conversation" : "Join by Code"}
              </span>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsJoining(false);
                  setError(null);
                }}
                className="text-pencil"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                autoFocus
                value={isCreating ? newName : inviteCode}
                onChange={(e) =>
                  isCreating
                    ? setNewName(e.target.value)
                    : setInviteCode(e.target.value)
                }
                placeholder={
                  isCreating
                    ? "Give your group a name..."
                    : "Enter 6-digit code..."
                }
                className="w-full bg-white border border-pencil/10 rounded-lg px-3 py-2 text-sm outline-none shadow-sm focus:border-gold/30"
              />
              {error && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {error}
                </p>
              )}
              <Button
                onClick={isCreating ? handleCreateGroup : handleJoinGroup}
                className="w-full bg-ink text-white"
                disabled={isCreating ? !newName.trim() : !inviteCode.trim()}
              >
                {isCreating ? "Create Group" : "Join"}
              </Button>
            </div>
          </div>
        )}

        {groups.length === 0 && !isCreating && !isJoining && (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
            <Users className="w-12 h-12 mb-3" />
            <p className="text-sm font-medium">
              Join a group to discuss verses with others.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-2 duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-pencil/10 mb-4">
        <button
          onClick={() => setActiveGroup(null)}
          className="flex items-center gap-1.5 text-pencil hover:text-ink transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {activeGroup.name}
          </span>
        </button>
        <button className="p-1.5 rounded-full hover:bg-pencil/5 text-pencil">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-20">
            <MessageCircle className="w-10 h-10 mb-2" />
            <p className="text-sm font-medium">No messages yet.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-1 max-w-[85%]",
                m.user_id === user?.id ? "ml-auto items-end" : "items-start"
              )}
            >
              <span className="text-[9px] font-bold text-ink/40 uppercase px-1">
                {m.user_name}
              </span>
              <div
                className={cn(
                  "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  m.user_id === user?.id
                    ? "bg-gold text-white rounded-tr-none shadow-sm"
                    : "bg-pencil/5 text-ink rounded-tl-none border border-pencil/5"
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-pencil/10">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write message..."
            className="min-h-[40px] max-h-[100px] rounded-2xl py-2 px-3 text-sm bg-pencil/5 border-none resize-none focus:bg-white transition-colors"
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSendMessage())
            }
          />
          <button
            disabled={!input.trim() || sending}
            onClick={handleSendMessage}
            className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center shrink-0 active:scale-95 transition-all disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
