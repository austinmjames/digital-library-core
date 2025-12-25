"use client";

import { NavCollection } from "@/lib/books";
import { NavState } from "@/components/reader/navigation/types";
import { LibraryMy } from "@/components/reader/navigation/LibraryMy";

interface LibraryMarketplaceProps {
  data: NavCollection[];
  navState: NavState;
  setNavState: (state: NavState) => void;
  currentBook: string;
  onClose: () => void;
}

export function LibraryMarketplace(props: LibraryMarketplaceProps) {
  // Reusing the same UI logic as My Library for now
  return <LibraryMy {...props} />;
}
