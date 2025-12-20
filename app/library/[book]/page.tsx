import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

type Verse = {
  id: number;
  chapter: number;
  verse: number;
  content: {
    he: string;
    en: string;
  };
};

export default async function Reader({ params }: { params: Promise<{ book: string }> }) {
  // Await params (Next.js 15 requirement, good practice generally)
  const { book } = await params;
  
  const supabase = await createClient();

  const { data: verses } = await supabase
    .from('text_content')
    .select('*')
    .eq('book_slug', book)
    .order('chapter', { ascending: true })
    .order('verse', { ascending: true })
    .returns<Verse[]>();

  if (!verses || verses.length === 0) {
    return <div className="p-10">Book not found: {book}</div>;
  }

  return (
    <div className="h-screen bg-gray-50 text-black overflow-y-auto">
      {verses.map((verse) => (
        <div key={verse.id} className="flex flex-row-reverse border-b border-gray-200 p-4">
           <div className="w-[60%] text-right font-serif text-2xl leading-relaxed" dir="rtl">
             {verse.content.he}
           </div>
           <div className="w-[40%] text-left font-sans text-lg">
             {verse.content.en}
           </div>
        </div>
      ))}
    </div>
  );
}