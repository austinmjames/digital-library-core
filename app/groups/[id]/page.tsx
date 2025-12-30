import { Calendar, MessageSquare, Shield, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * Group Detail Page
 * Filepath: app/groups/[id]/page.tsx
 * Role: Main view for a specific study group.
 * Context: PRD Section 4.1 (Groups Architecture).
 */

interface Group {
  id: string;
  name: string;
  description: string;
  is_verified: boolean;
  max_members: number;
  member_count?: number;
}

interface PageProps {
  params: {
    id: string;
  };
}

// Mock fetcher - Replace with Supabase client call in production
async function getGroup(id: string): Promise<Group | null> {
  // In a real implementation:
  // const { data } = await supabase.from('groups').select('*').eq('id', id).single();
  // return data;

  if (!id) return null;

  return {
    id,
    name: "Daf Yomi Morning Circle",
    description:
      "A dedicated group for early morning study of the daily page. We focus on clear explanations and practical applications of the Gemara&apos;s logic.",
    is_verified: true,
    max_members: 100,
    member_count: 42,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const group = await getGroup(params.id);
  return {
    title: group ? `${group.name} | DrashX` : "Group Not Found",
  };
}

export default async function GroupPage({ params }: PageProps) {
  const group = await getGroup(params.id);

  if (!group) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header Section */}
      <header className="border-b border-zinc-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              {group.name}
            </h1>
            {group.is_verified && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-md border border-blue-100">
                <Shield size={12} />
                Verified
              </span>
            )}
          </div>

          <p className="text-lg text-zinc-600 max-w-2xl leading-relaxed">
            {group.description}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content: Activity & Discussion */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="text-zinc-400" size={20} />
                Recent Insights
              </h2>
              <div className="space-y-6 text-zinc-400 italic">
                No discussions yet. Start the conversation by selecting a verse
                in the Reader.
              </div>
            </section>
          </div>

          {/* Sidebar: Group Stats & Actions */}
          <div className="space-y-6">
            <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                Group Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Users size={18} />
                    <span className="text-sm">Members</span>
                  </div>
                  <span className="font-mono text-sm">
                    {group.member_count}/{group.max_members}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Calendar size={18} />
                    <span className="text-sm">Active Plan</span>
                  </div>
                  <span className="text-sm font-medium text-orange-400">
                    Daf Yomi
                  </span>
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-white text-zinc-950 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
                Join this Chavruta
              </button>
            </div>

            <div className="p-6 border border-zinc-200 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">
                Teacher Guidelines
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Remember that Torah study thrives on respect. Always cite your
                sources using the standard dot-notation
                ([Book].[Section].[Segment]).
              </p>
              <Link
                href="/library"
                className="block text-xs font-bold text-blue-600 hover:underline"
              >
                Browse reference standards &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
