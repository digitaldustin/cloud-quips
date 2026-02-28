import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Zap, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PACKS = [
  { id: "6pack", count: 6, price: "$2.99", pricePerGen: "$0.50" },
  { id: "12pack", count: 12, price: "$4.99", pricePerGen: "$0.42" },
  { id: "30pack", count: 30, price: "$9.99", pricePerGen: "$0.33", best: true },
];

interface BuyGenerationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BuyGenerationsModal = ({ open, onOpenChange }: BuyGenerationsModalProps) => {
  const { user, generations } = useAuth();
  const { toast } = useToast();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const handleBuy = async (packId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to purchase generations.", variant: "destructive" });
      return;
    }

    setLoadingPack(packId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { pack_id: packId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-display)" }} className="text-2xl">
            Get More Generations
          </DialogTitle>
          <DialogDescription>
            You have <strong className="text-primary">{generations}</strong> generations remaining. Max 50 at a time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handleBuy(pack.id)}
              disabled={!!loadingPack}
              className={`
                w-full flex items-center justify-between p-4 rounded-lg border transition-all
                ${pack.best
                  ? "border-primary bg-primary/5 hover:bg-primary/10"
                  : "border-border hover:border-primary/30 hover:bg-card"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center gap-3">
                <Zap className={`w-5 h-5 ${pack.best ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium" style={{ fontFamily: "var(--font-display)" }}>
                      {pack.count} Generations
                    </span>
                    {pack.best && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold"
                        style={{ fontFamily: "var(--font-mono)" }}>
                        Best value
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                    {pack.pricePerGen}/gen
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {loadingPack === pack.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <span className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    {pack.price}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
