import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Library, 
  Scroll, 
  Search,
  BookMarked
} from 'lucide-react';

// Define the interface for our book metadata
interface BookMetadata {
  slug: string;
  title: string;
  hebrew_title: string | null;
  category: string;
  section: string;
  description: string | null;
}

interface GroupedLibrary {
  [section: string]: {
    [category: string]: BookMetadata[];
  };
}

// Define a specific interface for Vite's import.meta.env
interface ImportMetaEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Access environment variables using a specific type cast instead of 'any'
const supabaseUrl = (import.meta as unknown as ImportMeta).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as unknown as ImportMeta).env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SidebarProps {
  onSelectBook: (slug: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectBook }) => {
  const [sections, setSections] = useState<GroupedLibrary>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchLibraryStructure();
  }, []);

  const fetchLibraryStructure = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('library_metadata')
        .select('*')
        .order('section', { ascending: true })
        .order('category', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;

      const grouped = (data as BookMetadata[]).reduce((acc: GroupedLibrary, book) => {
        if (!acc[book.section]) acc[book.section] = {};
        if (!acc[book.section][book.category]) acc[book.section][book.category] = [];
        acc[book.section][book.category].push(book);
        return acc;
      }, {});

      setSections(grouped);
      
      const firstSection = Object.keys(grouped)[0];
      if (firstSection) {
        setExpandedSections({ [firstSection]: true });
      }
    } catch (err) {
      console.error('Error loading library structure:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  if (loading) {
    return (
      <div className="w-80 h-full border-r bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full border-r bg-white flex flex-col shadow-sm">
      <div className="p-4 border-b bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Library className="w-5 h-5 text-indigo-600" />
          Digital Library
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search books..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.entries(sections).map(([sectionName, categories]) => (
          <div key={sectionName} className="space-y-1">
            <button
              onClick={() => toggleSection(sectionName)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              {expandedSections[sectionName] ? (
                <ChevronDown className="w-4 h-4 text-indigo-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <span className="uppercase tracking-wider text-xs">{sectionName}</span>
            </button>

            {expandedSections[sectionName] && (
              <div className="ml-2 pl-2 border-l border-slate-100 space-y-1">
                {Object.entries(categories).map(([categoryName, books]) => (
                  <div key={categoryName} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(categoryName)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-md transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {expandedCategories[categoryName] ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        {categoryName}
                      </span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                        {books.length}
                      </span>
                    </button>

                    {expandedCategories[categoryName] && (
                      <div className="ml-4 space-y-0.5">
                        {books
                          .filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((book) => (
                            <button
                              key={book.slug}
                              onClick={() => onSelectBook(book.slug)}
                              className="w-full text-left px-4 py-1.5 text-sm text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-all group flex items-center justify-between"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{book.title}</span>
                                {book.hebrew_title && (
                                  <span className="text-[11px] text-slate-400 font-serif" dir="rtl">
                                    {book.hebrew_title}
                                  </span>
                                )}
                              </div>
                              <BookOpen className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-slate-50 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Scroll className="w-3 h-3" />
          Sefaria API
        </span>
        <span className="flex items-center gap-1">
          <BookMarked className="w-3 h-3" />
          {Object.values(sections).reduce((acc, cats) => 
            acc + Object.values(cats).flat().length, 0
          )} Books
        </span>
      </div>
    </div>
  );
};

export default Sidebar;