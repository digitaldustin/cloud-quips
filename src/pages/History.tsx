import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Swords, ChevronDown } from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type ResponseDetail = {
  model_name: string;
  content: string;
};

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, ResponseDetail[]>>({});
  const [loadingResponses, setLoadingResponses] = useState<string | null>(null);

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

  const toggleExpand = async (roundId: string) => {
    if (expandedId === roundId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(roundId);
    if (responses[roundId]) return;

    setLoadingResponses(roundId);
    const { data } = await supabase
      .from("responses")
      .select("content, model_id, model:models!responses_model_id_fkey(name)")
      .eq("round_id", roundId);

    if (data) {
      setResponses((prev) => ({
        ...prev,
        [roundId]: data.map((r: any) => ({
          model_name: r.model?.name ?? "Unknown",
          content: r.content,
        })),
      }));
    }
    setLoadingResponses(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          <ThemeSelector />
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
            <Card
              key={round.id}
              className="bg-card border-border cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => toggleExpand(round.id)}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className="text-foreground font-medium leading-snug flex-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      "{round.prompt}"
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={round.status === "complete" ? "default" : "secondary"}
                        className="text-xs"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {round.status}
                      </Badge>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === round.id ? "rotate-180" : ""}`}
                      />
                    </div>
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

                  {expandedId === round.id && (
                    <div className="mt-3 pt-3 border-t border-border">
                      {loadingResponses === round.id ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-32 w-full" />
                        </div>
                      ) : responses[round.id]?.length ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          {responses[round.id].map((resp, i) => (
                            <div
                              key={i}
                              className="relative bg-card border border-border rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span
                                  className="text-xs font-bold text-primary uppercase tracking-widest"
                                  style={{ fontFamily: "var(--font-mono)" }}
                                >
                                  {resp.model_name}
                                </span>
                                {round.winner?.name === resp.model_name && (
                                  <span className="text-xs" title="Winner">🏆</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {resp.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                          No responses recorded.
                        </p>
                      )}
                    </div>
                  )}
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
