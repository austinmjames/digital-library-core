import { MessageSquare } from "lucide-react";

interface DiscussionFeedProps {
  groupId: string;
}

/**
 * DiscussionFeed Component
 * Role: Renders the social insights shared within the group context.
 * Future: Will fetch real-time updates from public.user_notes using the groupId.
 */
export const DiscussionFeed = ({ groupId }: DiscussionFeedProps) => {
  return (
    <section className="space-y-6" data-group-id={groupId}>
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <MessageSquare size={14} /> Group Insights
        </h2>
        <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase">
          Sort by Newest
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-zinc-100 p-12 text-center space-y-4 shadow-sm">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-zinc-50/50">
          <MessageSquare className="text-zinc-200" size={32} />
        </div>
        <div className="max-w-xs mx-auto space-y-2">
          <h4 className="text-lg font-bold text-zinc-900">
            Be the first to spark logic
          </h4>
          <p className="text-sm text-zinc-400 leading-relaxed italic font-serif">
            Insights shared in the Reader under the &ldquo;Group&rdquo; context
            for this chavruta will appear here.
          </p>
        </div>
      </div>
    </section>
  );
};
