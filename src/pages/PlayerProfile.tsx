import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Player, categoryLabel, getAge, getBirthYear } from "@/types/player";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Loader2, Save, User, Ruler, Weight, Calendar, Hash } from "lucide-react";
import { toast } from "sonner";

export default function PlayerProfile() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data, error } = await supabase.from("players").select("*").eq("code", code).maybeSingle();
      if (error || !data) {
        toast.error("Player not found");
        navigate("/players");
        return;
      }
      setPlayer(data as Player);
      setNotes((data as any).notes || "");
      setLoading(false);
    })();
  }, [code, navigate]);

  const saveNotes = async () => {
    if (!player?.id) return;
    setSavingNotes(true);
    const { error } = await supabase.from("players").update({ notes }).eq("id", player.id);
    setSavingNotes(false);
    if (error) toast.error(error.message);
    else toast.success("Notes saved");
  };

  if (loading || !player) {
    return <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const stats = [
    { icon: Ruler, label: "Height", value: player.height_cm ? `${player.height_cm} cm` : "—" },
    { icon: Weight, label: "Weight", value: player.weight_kg ? `${player.weight_kg} kg` : "—" },
    { icon: Calendar, label: "Born", value: getBirthYear(player.date_of_birth) || "—" },
    { icon: User, label: "Age", value: getAge(player.date_of_birth) ?? "—" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/players"><ArrowLeft className="h-4 w-4 mr-1" /> Back to roster</Link>
      </Button>

      {/* Hero card */}
      <Card className="relative overflow-hidden rounded-2xl border-0 shadow-elegant">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-end">
          <div className="h-44 w-44 md:h-56 md:w-56 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-elegant shrink-0 bg-muted">
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white text-7xl font-extrabold opacity-50">
                {player.name?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left text-white">
            <Badge className={`mb-3 border-0 ${player.team ? "bg-accent text-accent-foreground" : "bg-white/20 text-white"}`}>
              {categoryLabel(player.team)} TEAM
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{player.name}</h1>
            <div className="mt-3 flex flex-wrap gap-3 justify-center md:justify-start text-white/90">
              <span className="flex items-center gap-1.5"><Hash className="h-4 w-4" /> {player.code}</span>
              {player.position && <span>· {player.position}</span>}
            </div>
          </div>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-soft">
            <Link to={`/players/${player.code}/edit`}><Edit className="h-4 w-4 mr-2" /> Edit Player</Link>
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 rounded-2xl border-0 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <Card className="p-6 rounded-2xl border-0 shadow-card lg:col-span-1">
          <h2 className="font-bold text-lg mb-4">Player Details</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Code" value={player.code} />
            <Row label="Position" value={player.position || "—"} />
            <Row label="Category" value={categoryLabel(player.team)} />
            <Row label="Date of Birth" value={player.date_of_birth || "—"} />
            <Row label="Height" value={player.height_cm ? `${player.height_cm} cm` : "—"} />
            <Row label="Weight" value={player.weight_kg ? `${player.weight_kg} kg` : "—"} />
          </dl>
        </Card>

        {/* Notes */}
        <Card className="p-6 rounded-2xl border-0 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Coach Notes</h2>
            <Button size="sm" onClick={saveNotes} disabled={savingNotes} className="bg-gradient-court hover:opacity-90">
              {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Save</>}
            </Button>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            placeholder="Track development, observations, goals…"
            className="resize-none"
          />
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
