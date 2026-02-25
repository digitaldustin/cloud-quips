import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface VoteResultProps {
  result: {
    winner: { name: string; elo: number; elo_change: number };
    loser: { name: string; elo: number; elo_change: number };
  };
  onPlayAgain: () => void;
}

export function VoteResult({ result, onPlayAgain }: VoteResultProps) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        The People Have Spoken
      </h2>

      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="bg-card border border-primary/40 rounded-lg p-6">
          <span className="text-xs text-primary uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
            Winner
          </span>
          <p className="text-xl text-foreground mt-2" style={{ fontFamily: "var(--font-display)" }}>
            {result.winner.name}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="text-foreground">{result.winner.elo}</span>
            <ArrowUp className="w-3 h-3 text-green-400" />
            <span className="text-green-400">+{result.winner.elo_change}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 opacity-60">
          <span className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
            Defeated
          </span>
          <p className="text-xl text-foreground mt-2" style={{ fontFamily: "var(--font-display)" }}>
            {result.loser.name}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="text-foreground">{result.loser.elo}</span>
            <ArrowDown className="w-3 h-3 text-red-400" />
            <span className="text-red-400">{result.loser.elo_change}</span>
          </div>
        </div>
      </div>

      <Button onClick={onPlayAgain} className="px-8 h-12 font-semibold">
        ⚡ Another Round
      </Button>
    </div>
  );
}
