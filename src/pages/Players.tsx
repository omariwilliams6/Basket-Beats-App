import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Player, categoryLabel, getBirthYear } from "@/types/player";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Loader2, Users } from "lucide-react";

type Filter = "all" | "senior" | "u20";

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("players").select("*").order("name");
      setPlayers((data as Player[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (filter === "senior" && p.team !== true) return false;
      if (filter === "u20" && p.team !== false) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.position?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [players, query, filter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Players
          </h1>
          <p className="text-muted-foreground mt-1">Manage your full roster</p>
        </div>
        <Button asChild className="bg-gradient-court hover:opacity-90 shadow-soft">
          <Link to="/players/new"><UserPlus className="h-4 w-4 mr-2" /> Add Player</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 rounded-2xl border-0 shadow-card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, code or position…"
              className="pl-10 h-11 border-0 bg-muted/50 focus-visible:ring-primary"
            />
          </div>
          <div className="inline-flex bg-muted/50 rounded-full p-1 self-start">
            {([
              { k: "all", label: "All" },
              { k: "senior", label: "Senior" },
              { k: "u20", label: "U20" },
            ] as { k: Filter; label: string }[]).map((opt) => (
              <button
                key={opt.k}
                onClick={() => setFilter(opt.k)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === opt.k
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed">
          <p className="text-muted-foreground">No players match your filters.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Link key={p.id || p.code} to={`/players/${p.code}`}>
              <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card">
                <div className="relative h-48 overflow-hidden bg-gradient-brand">
                  {p.photo_url ? (
                    <img
                      src={p.photo_url}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white text-5xl font-extrabold opacity-50">
                      {p.name?.[0]}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className={p.team ? "bg-accent text-accent-foreground border-0 shadow-soft" : "bg-primary text-primary-foreground border-0 shadow-soft"}>
                      {categoryLabel(p.team)}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{p.position || "—"}</p>
                  <h3 className="font-bold text-lg mt-1 truncate">{p.name}</h3>
                  <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                    <span>{p.height_cm ? `${p.height_cm}cm` : "—"}</span>
                    <span>{p.weight_kg ? `${p.weight_kg}kg` : "—"}</span>
                    <span>{getBirthYear(p.date_of_birth) || "—"}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
