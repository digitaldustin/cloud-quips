import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
  wins: number;
  losses: number;
  elo: number;
}

export function Leaderboard() {
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    supabase
      .from("models")
      .select("id, name, description, wins, losses, elo")
      .order("elo", { ascending: false })
      .then(({ data }) => {
        if (data) setModels(data as Model[]);
      });
  }, []);

  if (!models.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <h3 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Leaderboard
        </h3>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div
          className="grid grid-cols-[2rem_1fr_4rem_4rem_4rem] gap-2 px-4 py-2 text-xs text-muted-foreground uppercase tracking-widest border-b border-border"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>#</span>
          <span>Model</span>
          <span className="text-right">W</span>
          <span className="text-right">L</span>
          <span className="text-right">ELO</span>
        </div>
        {models.map((m, i) => (
          <div
            key={m.id}
            className="grid grid-cols-[2rem_1fr_4rem_4rem_4rem] gap-2 px-4 py-3 text-sm border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
          >
            <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
              {i + 1}
            </span>
            <div>
              <span className="text-foreground font-medium">{m.name}</span>
              <span className="text-muted-foreground text-xs ml-2 hidden md:inline">
                {m.description}
              </span>
            </div>
            <span className="text-right text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
              {m.wins}
            </span>
            <span className="text-right text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
              {m.losses}
            </span>
            <span className="text-right text-primary font-bold" style={{ fontFamily: "var(--font-mono)" }}>
              {m.elo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
