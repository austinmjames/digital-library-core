import { NavCollection, NavCategory, NavBook } from "@/lib/books";

export type NavLevel = "CATEGORY" | "SUBCATEGORY" | "BOOK" | "CHAPTER";

export interface NavState {
  level: NavLevel;
  selectedCategory?: NavCollection;
  selectedSubCategory?: NavCategory;
  selectedBook?: NavBook;
}
