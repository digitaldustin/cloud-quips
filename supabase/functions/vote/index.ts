import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function updateElo(winnerElo: number, loserElo: number, k = 32) {
  const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  return {
    newWinner: Math.round(winnerElo + k * (1 - expected)),
    newLoser: Math.round(loserElo + k * (0 - (1 - expected))),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { round_id, winner_id } = await req.json();
    if (!round_id || !winner_id) throw new Error("round_id and winner_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get round
    const { data: round } = await supabase
      .from("rounds")
      .select("*")
      .eq("id", round_id)
      .single();
    if (!round) throw new Error("Round not found");
    if (round.status === "complete") throw new Error("Round already completed");

    const loserId = winner_id === round.model_a_id ? round.model_b_id : round.model_a_id;

    // Get both models
    const { data: models } = await supabase
      .from("models")
      .select("*")
      .in("id", [winner_id, loserId]);
    if (!models || models.length < 2) throw new Error("Models not found");

    const winner = models.find((m: any) => m.id === winner_id)!;
    const loser = models.find((m: any) => m.id === loserId)!;

    const { newWinner, newLoser } = updateElo(winner.elo, loser.elo);

    // Update everything
    await Promise.all([
      supabase.from("rounds").update({ winner_id, status: "complete" }).eq("id", round_id),
      supabase.from("models").update({ wins: winner.wins + 1, elo: newWinner }).eq("id", winner_id),
      supabase.from("models").update({ losses: loser.losses + 1, elo: newLoser }).eq("id", loserId),
    ]);

    return new Response(
      JSON.stringify({
        winner: { name: winner.name, elo: newWinner, elo_change: newWinner - winner.elo },
        loser: { name: loser.name, elo: newLoser, elo_change: newLoser - loser.elo },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("vote error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
