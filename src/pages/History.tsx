import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type RoundHistory = {
  id: string;
  prompt: string;
  created_at: string;
  status: string;
  model_a: { name: string } | null;
  model_b: { name: string } | null;
  winner: { name: string } | null;
};

const History = () => {
  const [rounds, setRounds] = useState<RoundHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRounds = async () => {
      const { data, error } = await supabase
        .from("rounds")
        .select(
          "id, prompt, created_at, status, model_a:models!rounds_model_a_id_fkey(name), model_b:models!rounds_model_b_id_fkey(name), winner:models!rounds_winner_id_fkey(name)"
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setRounds(
          data.map((r: any) => ({
            id: r.id,
            prompt: r.prompt,
            created_at: r.created_at,
            status: r.status,
            model_a: r.model_a,
            model_b: r.model_b,
            winner: r.winner,
          }))
        );
      }
      setLoading(false);
    };
    fetchRounds();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="text-3xl md:text-4xl tracking-tight text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Round History
            </h1>
            <p
              className="text-muted-foreground text-sm mt-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              past battles & their verdicts
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : rounds.length === 0 ? (
          <p
            className="text-center text-muted-foreground py-12"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            No rounds played yet. Go start some chaos!
          </p>
        ) : (
          rounds.map((round) => (
            <Card key={round.id} className="bg-card border-border">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className="text-foreground font-medium leading-snug flex-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      "{round.prompt}"
                    </p>
                    <Badge
                      variant={round.status === "complete" ? "default" : "secondary"}
                      className="shrink-0 text-xs"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {round.status}
                    </Badge>
                  </div>

                  <div
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Swords className="h-3.5 w-3.5" />
                      {round.model_a?.name ?? "?"} vs {round.model_b?.name ?? "?"}
                    </span>

                    {round.winner && (
                      <span className="flex items-center gap-1.5 text-primary">
                        <Trophy className="h-3.5 w-3.5" />
                        {round.winner.name}
                      </span>
                    )}

                    <span className="text-xs opacity-60">
                      {new Date(round.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default History;
