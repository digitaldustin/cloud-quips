import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt) throw new Error("prompt is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Pick 2 random models
    const { data: models, error: modelsErr } = await supabase
      .from("models")
      .select("*");
    if (modelsErr || !models?.length) throw new Error("Failed to fetch models");

    const shuffled = models.sort(() => Math.random() - 0.5);
    const modelA = shuffled[0];
    const modelB = shuffled[1];

    // Create round
    const { data: round, error: roundErr } = await supabase
      .from("rounds")
      .insert({ prompt, status: "answering", model_a_id: modelA.id, model_b_id: modelB.id })
      .select()
      .single();
    if (roundErr) throw new Error("Failed to create round");

    // Get AI responses in parallel
    const getResponse = async (model: any) => {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `${model.personality}\n\nKeep your response under 150 words. Be entertaining and stay in character.` },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`AI error for ${model.name}:`, res.status, text);
        if (res.status === 429) throw new Error("Rate limited - try again in a moment");
        if (res.status === 402) throw new Error("AI credits depleted");
        throw new Error(`AI gateway error: ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "...I got nothing.";
    };

    const [responseA, responseB] = await Promise.all([
      getResponse(modelA),
      getResponse(modelB),
    ]);

    // Save responses
    await supabase.from("responses").insert([
      { round_id: round.id, model_id: modelA.id, content: responseA },
      { round_id: round.id, model_id: modelB.id, content: responseB },
    ]);

    // Update round status
    await supabase.from("rounds").update({ status: "voting" }).eq("id", round.id);

    return new Response(
      JSON.stringify({
        round_id: round.id,
        prompt,
        responses: [
          { label: "A", model_id: modelA.id, content: responseA },
          { label: "B", model_id: modelB.id, content: responseB },
        ],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("play-round error:", e);
    const status = e.message?.includes("Rate limited") ? 429 : e.message?.includes("credits") ? 402 : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
