import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PromptInput } from "@/components/PromptInput";
import { ResponseCards } from "@/components/ResponseCards";
import { VoteResult } from "@/components/VoteResult";
import { Leaderboard } from "@/components/Leaderboard";
import { useToast } from "@/hooks/use-toast";

type GameResponse = {
  label: string;
  model_id: string;
  content: string;
};

type RoundData = {
  round_id: string;
  prompt: string;
  responses: GameResponse[];
};

type VoteResultData = {
  winner: { name: string; elo: number; elo_change: number };
  loser: { name: string; elo: number; elo_change: number };
};

type GameState = "idle" | "loading" | "voting" | "result";

const Index = () => {
  const [state, setState] = useState<GameState>("idle");
  const [round, setRound] = useState<RoundData | null>(null);
  const [result, setResult] = useState<VoteResultData | null>(null);
  const { toast } = useToast();

  const startRound = async (prompt: string) => {
    setState("loading");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/play-round`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start round");
      }
      const data: RoundData = await res.json();
      setRound(data);
      setState("voting");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setState("idle");
    }
  };

  const submitVote = async (winnerId: string) => {
    if (!round) return;
    setState("loading");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ round_id: round.round_id, winner_id: winnerId }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to vote");
      }
      const data: VoteResultData = await res.json();
      setResult(data);
      setState("result");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setState("voting");
    }
  };

  const reset = () => {
    setRound(null);
    setResult(null);
    setState("idle");
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
          <span
            className="text-xs text-muted-foreground hidden md:block"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            v1.0 — elo-ranked
          </span>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {(state === "idle" || state === "loading") && (
          <PromptInput onSubmit={startRound} loading={state === "loading"} />
        )}

        {state === "voting" && round && (
          <ResponseCards
            prompt={round.prompt}
            responses={round.responses}
            onVote={submitVote}
          />
        )}

        {state === "result" && result && (
          <VoteResult result={result} onPlayAgain={reset} />
        )}

        <Leaderboard key={state} />
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
