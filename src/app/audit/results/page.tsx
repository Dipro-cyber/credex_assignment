// Audit results page — implemented in Commit 5
// The audit engine (Commit 4) runs here and produces the results.
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResultsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <p className="text-muted-foreground text-sm">
        Audit results coming in Commit 5.
      </p>
      <Link
        href="/audit"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to form
      </Link>
    </main>
  );
}
