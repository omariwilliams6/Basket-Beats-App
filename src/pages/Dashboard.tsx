import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Player, categoryLabel, getBirthYear } from "@/types/player";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, GraduationCap, UserPlus, ArrowRight, Loader2, ListChecks } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setPlayers((data as Player[]) || []);
      setLoading(false);
    })();
  }, []);

  const total = players.length;
  const senior = players.filter((p) => p.team === true).length;
  const u20 = players.filter((p) => p.team === false).length;
  const recent = players.slice(0, 5);

  const stats = [
    { label: "Total Players", value: total, icon: Users, gradient: "bg-gradient-court" },
    { label: "Senior Team", value: senior, icon: Trophy, gradient: "bg-gradient-gold" },
    { label: "U20 Team", value: u20, icon: GraduationCap, gradient: "bg-gradient-brand" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-6 md:p-10 shadow-elegant">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">
              Welcome back
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground">
              BasketBeats Athlete Console
            </h1>
            <p className="text-primary-foreground/80 mt-2 max-w-xl">
              Manage your roster, track player development, and keep everything in sync with the public website.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-soft">
              <Link to="/players/new"><UserPlus className="h-4 w-4 mr-2" /> Add Player</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold backdrop-blur-sm">
              <Link to="/players"><ListChecks className="h-4 w-4 mr-2" /> Manage Roster</Link>
            </Button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary-glow/30 blur-3xl" />
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="relative overflow-hidden p-6 rounded-2xl border-0 shadow-card bg-card hover:shadow-elegant transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                <p className="text-4xl font-extrabold mt-2 text-foreground">
                  {loading ? <Loader2 className="h-7 w-7 animate-spin text-primary" /> : s.value}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${s.gradient} flex items-center justify-center shadow-soft`}>
                <s.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent additions */}
      <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-xl font-bold">Recent Additions</h2>
            <p className="text-sm text-muted-foreground">Latest players added to the roster</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
            <Link to="/players">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : recent.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No players yet. <Link to="/players/new" className="text-primary font-semibold hover:underline">Add your first player →</Link>
            </div>
          ) : (
            recent.map((p) => (
              <Link key={p.id || p.code} to={`/players/${p.code}`} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/10">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-court flex items-center justify-center text-white font-bold">
                      {p.name?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {p.position || "—"} · {getBirthYear(p.date_of_birth) || "—"}
                  </p>
                </div>
                <Badge variant="secondary" className={p.team ? "bg-accent/20 text-accent-foreground border-accent/30" : "bg-primary/10 text-primary border-primary/20"}>
                  {categoryLabel(p.team)}
                </Badge>
                {p.created_at && (
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
