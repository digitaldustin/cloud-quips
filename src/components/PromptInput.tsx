import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Zap } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Explain quantum physics to a golden retriever",
  "What two words would passengers never want to hear a pilot say?",
  "You would never go on a roller coaster called ___",
  "The secret to a happy life",
  "If a winning coach gets Gatorade dumped on his head, what should get dumped on the losing coach?",
  "Name a candle scent designed specifically for Kim Kardashian",
  "You should never give alcohol to ___",
  "Everyone knows that monkeys hate ___",
  "The biggest downside to living in Hell",
  "Jesus's REAL last words",
  "The worst thing for an evil witch to turn you into",
  "The Skittles flavor that just missed the cut",
  "On your wedding night, it would be horrible to find out that the person you married is ___",
  "A name for a really bad Broadway musical",
  "The first thing you would do after winning the lottery",
  "What's actually causing global warming?",
  "A name for a brand of designer adult diapers",
  "Name a TV drama that's about a vampire doctor",
  "Something squirrels probably do when no one is looking",
  "The crime you would commit if you could get away with it",
  "Come up with a great title for the next awkward teen sex movie",
  "What's the Mona Lisa smiling about?",
  "A terrible name for a cruise ship",
  'What FDR meant to say was "We have nothing to fear, but ___"',
  "Come up with a title for an adult version of any classic video game",
  "The name of a font nobody would ever use",
  "Something you should never put on an open wound",
  "Scientists say erosion, but we all know the Grand Canyon was actually made by ___",
  "The real reason the dinosaurs died",
  "My doctor says I need more ____ in my diet, but legally I can’t.",
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
