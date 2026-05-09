"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonProps {
  auditId: string;
}

/**
 * Copies the shareable audit URL to clipboard.
 * The /share/[id] route is implemented in Commit 8.
 */
export function ShareButton({ auditId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/share/${auditId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      aria-label="Copy shareable link to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share results
        </>
      )}
      <Copy className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
    </button>
  );
}
