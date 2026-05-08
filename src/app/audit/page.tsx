// Spend input form — implemented in Commit 3
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuditPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <p className="text-muted-foreground text-sm">
        Spend input form coming in Commit 3.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to home
      </Link>
    </main>
  );
}
