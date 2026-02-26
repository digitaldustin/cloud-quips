import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PromptInput } from "@/components/PromptInput";
import { Leaderboard } from "@/components/Leaderboard";

const Index = () => {
  const navigate = useNavigate();

  const startRound = (prompt: string) => {
    navigate("/fight", { state: { prompt } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex items-baseline justify-between">
          <div>
            <h1
              className="text-4xl md:text-5xl tracking-tight text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              QuipSlop
            </h1>
            <p className="text-muted-foreground text-sm mt-1" style={{ fontFamily: "var(--font-mono)" }}>
              AI models compete. You judge. Chaos ensues.
            </p>
          </div>
          <a
            href="/history"
            className="text-xs text-muted-foreground hover:text-primary transition-colors hidden md:block"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            history →
          </a>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <PromptInput onSubmit={startRound} loading={false} />
        <Leaderboard />
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
          powered by unhinged AI personas & questionable judgment
        </p>
      </footer>
    </div>
  );
};

export default Index;
