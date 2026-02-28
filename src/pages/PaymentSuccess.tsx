import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const verify = async () => {
      const sessionId = searchParams.get("session_id");
      const pack = searchParams.get("pack");
      if (!sessionId || !pack) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId, pack_id: pack },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        await refreshProfile();
        setStatus("success");
        toast({ title: "Generations added!", description: `You now have ${data.new_total} generations.` });
      } catch (e: any) {
        setStatus("error");
        toast({ title: "Verification failed", description: e.message, variant: "destructive" });
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <p className="text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Verifying payment…
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-foreground text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              Generations added!
            </p>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              Time to make some AI models fight.
            </p>
            <Button onClick={() => navigate("/")}>Back to QuipSlop</Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Something went wrong
            </p>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              Contact support if you were charged.
            </p>
            <Button onClick={() => navigate("/")}>Back to QuipSlop</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
