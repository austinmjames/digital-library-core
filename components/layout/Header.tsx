import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-pencil/20 bg-paper/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-serif text-xl font-bold tracking-tight text-ink hover:text-gold transition-colors">
          Open Torah Library
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/library" className="text-sm font-medium text-pencil hover:text-ink transition-colors">
            Library
          </Link>
          <button className="text-sm font-medium text-pencil hover:text-ink transition-colors">
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}