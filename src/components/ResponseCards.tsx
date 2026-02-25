import { Button } from "@/components/ui/button";

interface ResponseCardsProps {
  prompt: string;
  responses: { label: string; model_id: string; content: string }[];
  onVote: (winnerId: string) => void;
}

export function ResponseCards({ prompt, responses, onVote }: ResponseCardsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
          The Prompt
        </p>
        <p className="text-xl text-foreground italic" style={{ fontFamily: "var(--font-display)" }}>
          "{prompt}"
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Pick the response that slaps harder. Identities revealed after voting.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {responses.map((r) => (
          <div
            key={r.label}
            className="group relative bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-bold text-primary uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Response {r.label}
              </span>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                ???
              </span>
            </div>
            <p className="text-foreground leading-relaxed mb-6 whitespace-pre-wrap text-sm">
              {r.content}
            </p>
            <Button
              onClick={() => onVote(r.model_id)}
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              🏆 This one wins
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
