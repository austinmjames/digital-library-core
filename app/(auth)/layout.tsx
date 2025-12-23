import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="p-6 md:p-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-pencil hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 pb-20">
        <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
