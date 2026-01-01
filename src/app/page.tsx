"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth";
import { validateDisplayName } from "@/lib/auth/guest";
import { LanguageSwitch } from "@/components/ui/LanguageSwitch";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";

export default function Home() {
  const router = useRouter();
  const t = useTranslations();
  const { loginAsGuest, isAuthenticated, user } = useAuthStore();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to lobby
  if (isAuthenticated() && user) {
    router.push("/lobby");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateDisplayName(displayName);
    if (!validation.valid) {
      setError(validation.error || "Invalid display name");
      return;
    }

    setIsLoading(true);
    try {
      loginAsGuest(displayName.trim());
      router.push("/lobby");
    } catch {
      setError("Failed to create guest session");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      {/* Settings buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitch />
        <ThemeSwitch />
      </div>

      <div className="card w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{t("common.appName")}</h1>
        <p className="text-neutral-400 mb-8">Play with friends or find a match</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              className="input text-center"
              placeholder={t("auth.enterDisplayName")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading || !displayName.trim()}
          >
            {isLoading ? t("common.loading") : t("auth.playAsGuest")}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-800">
          <p className="text-sm text-neutral-500">
            Play instantly as a guest, or sign in for stats &amp; rankings
          </p>
          <button className="btn btn-ghost w-full mt-3" disabled>
            Sign in with Email (coming soon)
          </button>
        </div>
      </div>
    </main>
  );
}
