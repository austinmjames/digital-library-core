import React, { useState, useEffect, useCallback } from 'react';

import { createClient } from '@supabase/supabase-js';

import {

  ChevronLeft,

  ChevronRight,

  Languages,

  Type,

  Settings

} from 'lucide-react';



// 1. Environment & Client Setup

interface ImportMetaEnv {

  VITE_SUPABASE_URL: string;

  VITE_SUPABASE_ANON_KEY: string;

}

interface ImportMeta {

  readonly env: ImportMetaEnv;

}

const supabaseUrl = (import.meta as unknown as ImportMeta).env.VITE_SUPABASE_URL;

const supabaseAnonKey = (import.meta as unknown as ImportMeta).env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);



// 2. Types

interface TextVersion {

  universal_ref: string;

  language_code: string;

  version_title: string;

  content: string;

}



interface VerseRow {

  ref: string;

  verseNum: number;

  he?: string;

  en?: string;

}



interface ReaderProps {

  bookSlug: string;

}



const Reader: React.FC<ReaderProps> = ({ bookSlug }) => {

  // State

  const [chapter, setChapter] = useState(1);

  const [verses, setVerses] = useState<VerseRow[]>([]);

  const [loading, setLoading] = useState(false);

 

  // UI Settings

  const [viewMode, setViewMode] = useState<'bilingual' | 'hebrew' | 'english'>('bilingual');

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  const [showSettings, setShowSettings] = useState(false);



  // Version Control

  const [availableVersions, setAvailableVersions] = useState<{en: string[], he: string[]}>({ en: [], he: [] });

  const [selectedVersions, setSelectedVersions] = useState<{en: string | null, he: string | null}>({ en: null, he: null });



  // 3. Fetch Logic

  const fetchChapter = useCallback(async () => {

    setLoading(true);

    try {

      // Fetch ALL versions for this chapter

      const { data, error } = await supabase

        .from('text_versions')

        .select('universal_ref, language_code, content, version_title')

        .eq('book_slug', bookSlug.toLowerCase())

        .like('universal_ref', `${bookSlug.toLowerCase()}.${chapter}.%`);



      if (error) throw error;



      const rawData = data as TextVersion[];



      // A. Extract Available Versions dynamically

      const enVersions = Array.from(new Set(rawData.filter(i => i.language_code === 'en').map(i => i.version_title)));

      const heVersions = Array.from(new Set(rawData.filter(i => ['he', 'grc', 'ar'].includes(i.language_code)).map(i => i.version_title)));

     

      setAvailableVersions({ en: enVersions, he: heVersions });



      // B. Determine which versions to display (Default to first found if none selected)

      const activeEn = selectedVersions.en && enVersions.includes(selectedVersions.en) ? selectedVersions.en : enVersions[0];

      const activeHe = selectedVersions.he && heVersions.includes(selectedVersions.he) ? selectedVersions.he : heVersions[0];



      // Update state if we fell back to a default

      if (activeEn !== selectedVersions.en || activeHe !== selectedVersions.he) {

        setSelectedVersions({ en: activeEn, he: activeHe });

      }



      // C. Process Verses based on selection

      const grouped = rawData.reduce((acc: Record<string, VerseRow>, item) => {

        // Only process the selected versions

        if (item.language_code === 'en' && item.version_title !== activeEn) return acc;

        if (['he', 'grc', 'ar'].includes(item.language_code) && item.version_title !== activeHe) return acc;



        const verseNum = parseInt(item.universal_ref.split('.').pop() || '0');

        if (!acc[item.universal_ref]) {

          acc[item.universal_ref] = { ref: item.universal_ref, verseNum };

        }

       

        if (item.language_code === 'en') acc[item.universal_ref].en = item.content;

        else acc[item.universal_ref].he = item.content;

       

        return acc;

      }, {});



      const sortedVerses = Object.values(grouped).sort((a, b) => a.verseNum - b.verseNum);

      setVerses(sortedVerses);



    } catch (err) {

      console.error('Error fetching chapter:', err);

    } finally {

      setLoading(false);

    }

  }, [bookSlug, chapter, selectedVersions]); // Re-run if selection changes



  // Reset chapter when book changes

  useEffect(() => {

    setChapter(1);

    setSelectedVersions({ en: null, he: null }); // Reset version selection

  }, [bookSlug]);



  // Initial load

  useEffect(() => {

    fetchChapter();

  }, [chapter, fetchChapter]);



  // Manual refresh when version changes

  useEffect(() => {

    if (verses.length > 0) fetchChapter();

  }, [selectedVersions.en, selectedVersions.he, fetchChapter, verses.length]);





  const fontClasses = { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl' };



  return (

    <div className="flex flex-col h-full bg-slate-50 relative">

      {/* 4. Sticky Header */}

      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm">

       

        {/* Navigation */}

        <div className="flex items-center bg-slate-100 rounded-lg p-1">

          <button

            onClick={() => setChapter(Math.max(1, chapter - 1))}

            disabled={chapter === 1}

            className="p-1.5 hover:bg-white rounded-md transition-all disabled:opacity-30 text-slate-600"

          >

            <ChevronLeft className="w-4 h-4" />

          </button>

          <span className="px-3 font-serif font-bold text-slate-700 min-w-[90px] text-center text-sm">

            Chapter {chapter}

          </span>

          <button

            onClick={() => setChapter(chapter + 1)}

            className="p-1.5 hover:bg-white rounded-md transition-all text-slate-600"

          >

            <ChevronRight className="w-4 h-4" />

          </button>

        </div>



        {/* Toolbar */}

        <div className="flex items-center gap-2">

          {/* View Mode Toggle */}

          <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1">

            {(['hebrew', 'bilingual', 'english'] as const).map((mode) => (

              <button

                key={mode}

                onClick={() => setViewMode(mode)}

                className={`px-3 py-1 text-xs font-bold rounded-md transition-all uppercase ${

                  viewMode === mode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'

                }`}

              >

                {mode === 'bilingual' ? <Languages className="w-3 h-3" /> : mode.slice(0,2)}

              </button>

            ))}

          </div>



          {/* Settings Toggle */}

          <button

            onClick={() => setShowSettings(!showSettings)}

            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}

          >

            <Settings className="w-5 h-5" />

          </button>

        </div>

      </div>



      {/* 5. Settings Panel (Dropdown) */}

      {showSettings && (

        <div className="absolute top-16 right-4 z-30 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in slide-in-from-top-2 fade-in duration-200">

          <div className="space-y-4">

           

            {/* Font Size */}

            <div>

              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Text Size</label>

              <div className="flex bg-slate-50 rounded-lg p-1">

                {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (

                  <button

                    key={size}

                    onClick={() => setFontSize(size)}

                    className={`flex-1 py-1 rounded-md text-xs font-bold transition-all ${

                      fontSize === size ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'

                    }`}

                  >

                    <Type className={`w-4 h-4 mx-auto ${size === 'xl' ? 'scale-125' : size === 'lg' ? 'scale-110' : ''}`} />

                  </button>

                ))}

              </div>

            </div>



            {/* English Version Select */}

            <div>

              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">English Version</label>

              <select

                value={selectedVersions.en || ''}

                onChange={(e) => setSelectedVersions(prev => ({ ...prev, en: e.target.value }))}

                className="w-full text-sm p-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"

              >

                {availableVersions.en.map(v => (

                  <option key={v} value={v}>{v}</option>

                ))}

              </select>

            </div>



            {/* Hebrew Version Select */}

            <div>

              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Source Version</label>

              <select

                value={selectedVersions.he || ''}

                onChange={(e) => setSelectedVersions(prev => ({ ...prev, he: e.target.value }))}

                className="w-full text-sm p-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"

              >

                {availableVersions.he.map(v => (

                  <option key={v} value={v}>{v}</option>

                ))}

              </select>

            </div>



          </div>

        </div>

      )}



      {/* 6. Text Render Area */}

      <div className="flex-1 overflow-y-auto" onClick={() => setShowSettings(false)}>

        <div className="max-w-5xl mx-auto py-12 px-6">

          {loading ? (

            <div className="space-y-8 animate-pulse opacity-50">

              {[1, 2, 3].map(i => (

                <div key={i} className="flex flex-col md:flex-row gap-6">

                  <div className="flex-1 h-20 bg-slate-200 rounded"></div>

                  <div className="flex-1 h-20 bg-slate-200 rounded"></div>

                </div>

              ))}

            </div>

          ) : (

            <div className="space-y-0">

              {verses.map((verse) => (

                <div

                  key={verse.ref}

                  className={`group flex flex-col md:flex-row border-b border-slate-100/50 hover:bg-white transition-colors py-6 gap-6 md:gap-12 px-2 rounded-lg ${fontClasses[fontSize]}`}

                >

                  {/* Hebrew/Source Side */}

                  {(viewMode === 'hebrew' || viewMode === 'bilingual') && (

                    <div

                      className={`flex-1 font-serif leading-[2.2] text-right text-slate-900 ${viewMode === 'hebrew' ? 'max-w-2xl mx-auto' : ''}`}

                      dir="rtl"

                    >

                      <span className="inline-block ml-3 text-indigo-200 font-sans text-xs font-bold align-top mt-1 select-none">

                        {verse.verseNum}

                      </span>

                      <span

                        className="hebrew-text"

                        dangerouslySetInnerHTML={{ __html: verse.he || '' }}

                      />

                      {!verse.he && <span className="text-slate-300 italic text-sm">Text missing</span>}

                    </div>

                  )}



                  {/* English Side */}

                  {(viewMode === 'english' || viewMode === 'bilingual') && (

                    <div className={`flex-1 font-serif leading-relaxed text-slate-700 pt-1 ${viewMode === 'english' ? 'max-w-2xl mx-auto' : ''}`}>

                      {viewMode === 'english' && (

                        <span className="inline-block mr-3 text-indigo-300 font-sans text-xs font-bold align-top mt-1 select-none">

                          {verse.verseNum}

                        </span>

                      )}

                      <span dangerouslySetInnerHTML={{ __html: verse.en || '' }} />

                      {!verse.en && <span className="text-slate-300 italic text-sm">Translation not available</span>}

                    </div>

                  )}

                </div>

              ))}

             

              {!loading && verses.length === 0 && (

                <div className="py-20 text-center text-slate-400 font-serif italic">

                  No text found for {bookSlug} Chapter {chapter}.

                </div>

              )}

            </div>

          )}

        </div>

      </div>



      <style jsx>{`

        @import url('https://fonts.googleapis.com/css2?family=SBL+Hebrew&family=Noto+Serif+Hebrew:wght@400;700&family=Gentium+Plus&display=swap');

        .hebrew-text {

          font-family: 'SBL Hebrew', 'Noto Serif Hebrew', serif;

        }

        /* Greek font support if you add New Testament */

        :lang(grc) {

          font-family: 'Gentium Plus', serif;

        }

      `}</style>

    </div>

  );

};



export default Reader;