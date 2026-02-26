import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Gift, Shield } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [targetEmail, setTargetEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  if (loading) return null;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>
            Access denied
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>Go home</Button>
        </div>
      </div>
    );
  }

  const handleSendGenerations = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(amount);
    if (!qty || qty < 1 || qty > 50) {
      toast({ title: "Invalid amount", description: "Enter between 1 and 50.", variant: "destructive" });
      return;
    }

    setSending(true);

    // Look up user by email — we need to find their profile
    // First get user id from profiles + auth metadata
    const { data: profiles, error: lookupError } = await supabase
      .from("profiles")
      .select("id, display_name, generations");

    if (lookupError) {
      toast({ title: "Error", description: lookupError.message, variant: "destructive" });
      setSending(false);
      return;
    }

    // We need an edge function to look up by email since we can't query auth.users
    // For now, use RPC to add generations by looking up via edge function
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-gift`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ email: targetEmail, amount: qty }),
      }
    );

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      toast({ title: "Error", description: data.error || "Failed to send", variant: "destructive" });
    } else {
      toast({ title: "Generations sent!", description: `${data.new_total} total for ${targetEmail}` });
      setTargetEmail("");
      setAmount("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            back
          </button>
          <h1 className="text-2xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Admin Panel
          </h1>
          <div />
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Gift Generations
            </h2>
          </div>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            Send free generations to any user. Max 50 total per account.
          </p>

          <form onSubmit={handleSendGenerations} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-email">User email</Label>
              <Input
                id="target-email"
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gen-amount">Number of generations</Label>
              <Input
                id="gen-amount"
                type="number"
                min={1}
                max={50}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5"
                required
              />
            </div>
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? "Sending…" : "Send generations"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Admin;
