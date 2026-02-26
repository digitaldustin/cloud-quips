import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VoteResult } from "@/components/VoteResult";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

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

type FightState = "generating" | "voting" | "submitting" | "result";

const Fight = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const prompt = (location.state as { prompt?: string })?.prompt || "";

  const [fightState, setFightState] = useState<FightState>("generating");
  const [round, setRound] = useState<RoundData | null>(null);
  const [result, setResult] = useState<VoteResultData | null>(null);

  // Typewriter animation state
  const [displayedTexts, setDisplayedTexts] = useState<string[]>(["", ""]);
  const [typingDone, setTypingDone] = useState(false);

  // Redirect if no prompt was provided
  useEffect(() => {
    if (!prompt) {
      navigate("/", { replace: true });
    }
  }, [prompt, navigate]);

  // Start the round on mount
  useEffect(() => {
    if (!prompt) return;
    let cancelled = false;

    const startRound = async () => {
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
        if (!cancelled) {
          setRound(data);
        }
      } catch (e: any) {
        if (!cancelled) {
          toast({
            title: "Error",
            description: e.message,
            variant: "destructive",
          });
          navigate("/", { replace: true });
        }
      }
    };

    startRound();
    return () => {
      cancelled = true;
    };
  }, [prompt]);

  // Typewriter effect once round data arrives
  useEffect(() => {
    if (!round) return;

    const fullTexts = round.responses.map((r) => r.content);
    const current = ["", ""];
    const indices = [0, 0];
    const maxLen = Math.max(...fullTexts.map((t) => t.length));
    let frame = 0;

    const CHARS_PER_TICK = 2;
    const TICK_MS = 18;

    const interval = setInterval(() => {
      let allDone = true;

      for (let i = 0; i < fullTexts.length; i++) {
        if (indices[i] < fullTexts[i].length) {
          indices[i] = Math.min(
            indices[i] + CHARS_PER_TICK,
            fullTexts[i].length
          );
          current[i] = fullTexts[i].slice(0, indices[i]);
          allDone = false;
        }
      }

      setDisplayedTexts([...current]);
      frame++;

      if (allDone) {
        clearInterval(interval);
        setTypingDone(true);
        setFightState("voting");
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [round]);

  const submitVote = async (winnerId: string) => {
    if (!round) return;
    setFightState("submitting");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            round_id: round.round_id,
            winner_id: winnerId,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to vote");
      }
      const data: VoteResultData = await res.json();
      setResult(data);
      setFightState("result");
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
      setFightState("voting");
    }
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            back
          </button>
          <h1
            className="text-2xl md:text-3xl tracking-tight text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            QuipSlop
          </h1>
          <ThemeSelector />
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Prompt display */}
        <div className="text-center space-y-2">
          <p
            className="text-xs text-muted-foreground uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            The Prompt
          </p>
          <p
            className="text-xl md:text-2xl text-foreground italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            "{prompt}"
          </p>
          {fightState === "generating" && !round && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Summoning AI personas...
              </span>
            </div>
          )}
        </div>

        {/* Response cards side by side */}
        {fightState !== "result" && (
          <div className="grid md:grid-cols-2 gap-4">
            {(round ? round.responses : [{ label: "A" }, { label: "B" }]).map((r, i) => (
              <div
                key={r.label}
                className={`
                  relative bg-card border rounded-lg p-6 transition-all duration-300
                  ${fightState === "voting" ? "border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5" : "border-border/50"}
                  ${!round ? "min-h-[200px]" : ""}
                `}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-bold text-primary uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Response {r.label}
                  </span>
                  <span
                    className="text-xs text-muted-foreground"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    ???
                  </span>
                </div>

                {/* Content area */}
                {!round ? (
                  // Skeleton loading
                  <div className="space-y-3 animate-pulse">
                    <div className="h-3 bg-border/50 rounded w-full" />
                    <div className="h-3 bg-border/50 rounded w-5/6" />
                    <div className="h-3 bg-border/50 rounded w-4/6" />
                    <div className="h-3 bg-border/50 rounded w-full" />
                    <div className="h-3 bg-border/50 rounded w-3/6" />
                  </div>
                ) : (
                  <>
                    <p className="text-foreground leading-relaxed mb-6 whitespace-pre-wrap text-sm min-h-[120px]">
                      {displayedTexts[i]}
                      {!typingDone && (
                        <span className="inline-block w-[2px] h-4 bg-primary ml-[1px] animate-pulse" />
                      )}
                    </p>

                    {/* Vote button — only show once typing is done */}
                    {typingDone && fightState === "voting" && 'model_id' in r && (
                      <Button
                        onClick={() => submitVote((r as GameResponse).model_id)}
                        variant="outline"
                        className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        🏆 This one wins
                      </Button>
                    )}

                    {fightState === "submitting" && (
                      <Button disabled className="w-full" variant="outline">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Vote result */}
        {fightState === "result" && result && (
          <VoteResult result={result} onPlayAgain={goHome} />
        )}
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p
          className="text-xs text-muted-foreground"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          powered by unhinged AI personas & questionable judgment
        </p>
      </footer>
    </div>
  );
};

export default Fight;
