import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Zap } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Explain quantum physics to a golden retriever",
  "Write a resignation letter for a pirate",
  "Defend pineapple on pizza in court",
  "Explain NFTs to someone from 1802",
  "Write a Yelp review for the Bermuda Triangle",
];

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
}

export function PromptInput({ onSubmit, loading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) onSubmit(prompt.trim());
  };

  const useExample = () => {
    const random = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPrompt(random);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2
          className="text-2xl md:text-3xl text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Drop a prompt. Watch AI personas fight.
        </h2>
        <p className="text-muted-foreground text-sm">
          Two AI characters will answer your prompt blind. You pick the winner.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl mx-auto">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something unhinged..."
          disabled={loading}
          className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <Button
          type="submit"
          disabled={!prompt.trim() || loading}
          className="h-12 px-6 font-semibold"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Zap className="mr-1" />}
          {loading ? "Generating..." : "Fight!"}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={useExample}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ⚡ random prompt
        </button>
      </div>
    </div>
  );
}
