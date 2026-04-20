import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { session, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Sign in failed");
    } else {
      toast.success("Welcome back");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />
      </div>

      <Card className="glass-card relative w-full max-w-md p-8 md:p-10 rounded-2xl border-0">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-elegant mb-4">
            <Trophy className="h-8 w-8 text-primary-deep" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Basket<span className="text-primary">Beats</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">
            Athlete Admin Console
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@basketbeats.com"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-gradient-court hover:opacity-90 text-primary-foreground font-semibold shadow-elegant"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Invite-only access. Contact your administrator for an account.
        </p>
      </Card>
    </div>
  );
}
