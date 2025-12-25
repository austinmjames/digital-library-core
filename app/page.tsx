import { redirect } from "next/navigation";

/**
 * app/page.tsx
 * Updated: Homepage now automatically redirects to the beginning of the library.
 * Default Path: Genesis 1:1 (JPS 1985)
 */
export default function HomePage() {
  redirect("/library/tanakh/genesis/1/jps-1985");
}
