import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PromptInput } from "@/components/PromptInput";
import { Leaderboard } from "@/components/Leaderboard";
import { ThemeSelector } from "@/components/ThemeSelector";
import { AuthModal } from "@/components/AuthModal";
import { BuyGenerationsModal } from "@/components/BuyGenerationsModal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LogOut, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const { user, signOut, isAdmin, generations } = useAuth();

  const startRound = (prompt: string) => {
    navigate("/fight", { state: { prompt } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1
              className="text-4xl md:text-5xl tracking-tight text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              QuipSlop
            </h1>
            <p className="text-muted-foreground text-sm mt-1" style={{ fontFamily: "var(--font-mono)" }}>
              AI models compete. You judge. Chaos ensues.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <a
              href="/history"
              className="text-xs text-muted-foreground hover:text-primary transition-colors hidden md:block"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              history →
            </a>
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  className="text-xs text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "var(--font-mono)" }}
                  title="Generations remaining — click to buy more"
                  onClick={() => setBuyOpen(true)}
                >
                  <Zap className="h-3 w-3" />
                  {generations}
                </button>
                {isAdmin && (
                  <a
                    href="/admin"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    style={{ fontFamily: "var(--font-mono)" }}
                    title="Admin panel"
                  >
                    <Shield className="h-4 w-4" />
                  </a>
                )}
                <span className="text-xs text-muted-foreground hidden md:block" style={{ fontFamily: "var(--font-mono)" }}>
                  {user.email?.split("@")[0]}
                </span>
                <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)} className="gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span style={{ fontFamily: "var(--font-mono)" }} className="text-xs">Sign in</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <BuyGenerationsModal open={buyOpen} onOpenChange={setBuyOpen} />

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <PromptInput onSubmit={startRound} loading={false} />
        <Leaderboard />
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
          powered by unhinged AI personas & questionable judgment
        </p>
      </footer>
    </div>
  );
};

export default Index;
