import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Reader from './components/reader/reader';
import { Library } from 'lucide-react';

const App: React.FC = () => {
  // State to track which book is selected from the sidebar
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | null>(null);

  const handleBookSelection = (slug: string) => {
    setSelectedBookSlug(slug);
    console.log("Loading Library Entry:", slug);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar - Positioned on the left */}
      <Sidebar onSelectBook={handleBookSelection} />

      {/* Main Content Area - Reader logic lives here */}
      <main className="flex-1 h-full overflow-hidden bg-slate-50">
        {selectedBookSlug ? (
          // When a book is selected, render the Reader component
          <Reader bookSlug={selectedBookSlug} />
        ) : (
          // Empty state when no book is selected
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="text-center max-w-md">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 inline-block mb-6">
                <Library className="w-12 h-12 text-indigo-500 opacity-40" />
              </div>
              <h2 className="text-2xl font-serif text-slate-800 mb-2 italic">
                Welcome to the Digital Library
              </h2>
              <p className="text-slate-500 leading-relaxed">
                Select a book from the sidebar to begin your study. 
                You can switch between Hebrew, English, and Bilingual views once a text is loaded.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;