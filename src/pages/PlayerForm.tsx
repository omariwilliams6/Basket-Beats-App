import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase, PHOTO_BUCKET } from "@/lib/supabase";
import { Player } from "@/types/player";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  code: z.string().trim().min(1, "Code required").max(50),
  name: z.string().trim().min(1, "Name required").max(120),
  position: z.string().trim().max(50).optional(),
  team: z.boolean(),
  date_of_birth: z.string().optional(),
  height_cm: z.string().optional(),
  weight_kg: z.string().optional(),
  photo_url: z.string().trim().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PlayerForm() {
  const { code } = useParams<{ code: string }>();
  const isEdit = Boolean(code);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "", name: "", position: "", team: false,
      date_of_birth: "", height_cm: "", weight_kg: "",
      photo_url: "", notes: "",
    },
  });

  const photoUrl = form.watch("photo_url");

  useEffect(() => {
    if (!isEdit || !code) return;
    (async () => {
      const { data, error } = await supabase
        .from("players").select("*").eq("code", code).maybeSingle();
      if (error || !data) {
        toast.error("Player not found");
        navigate("/players");
        return;
      }
      const p = data as Player;
      setPlayerId(p.id || null);
      form.reset({
        code: p.code, name: p.name, position: p.position || "", team: !!p.team,
        date_of_birth: p.date_of_birth || "",
        height_cm: p.height_cm != null ? String(p.height_cm) : "",
        weight_kg: p.weight_kg != null ? String(p.weight_kg) : "",
        photo_url: p.photo_url || "",
        notes: p.notes || "",
      });
      setLoading(false);
    })();
  }, [code, isEdit, navigate, form]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${form.getValues("code") || crypto.randomUUID()}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(fileName);
      form.setValue("photo_url", data.publicUrl, { shouldDirty: true });
      toast.success("Photo uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed. Make sure the 'player-photos' storage bucket exists and is public.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const payload: any = {
      code: values.code,
      name: values.name,
      position: values.position || null,
      team: values.team,
      date_of_birth: values.date_of_birth || null,
      height_cm: values.height_cm === "" ? null : Number(values.height_cm),
      weight_kg: values.weight_kg === "" ? null : Number(values.weight_kg),
      photo_url: values.photo_url || null,
      notes: values.notes || null,
    };

    const { error } = isEdit && playerId
      ? await supabase.from("players").update(payload).eq("id", playerId)
      : await supabase.from("players").insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isEdit ? "Player updated" : "Player added");
      navigate(`/players/${values.code}`);
    }
  };

  const handleDelete = async () => {
    if (!playerId || !confirm("Delete this player permanently?")) return;
    setDeleting(true);
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    setDeleting(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Player deleted");
      navigate("/players");
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to={isEdit ? `/players/${code}` : "/players"}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <h1 className="text-3xl font-extrabold">{isEdit ? "Edit Player" : "Add New Player"}</h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? "Update roster details" : "Add a new athlete to the BasketBeats roster"}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo */}
        <Card className="p-6 rounded-2xl border-0 shadow-card">
          <h2 className="font-bold text-lg mb-4">Player Photo</h2>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="h-40 w-40 rounded-2xl overflow-hidden bg-muted ring-4 ring-primary/10 shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-court flex items-center justify-center text-white">
                  <Upload className="h-10 w-10 opacity-60" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3 w-full">
              <Label htmlFor="upload">Upload from device</Label>
              <Input
                id="upload" type="file" accept="image/*" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              />
              <div className="text-xs text-muted-foreground">Or paste an image URL:</div>
              <Input placeholder="https://…" {...form.register("photo_url")} />
              {uploading && <p className="text-sm text-primary flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</p>}
            </div>
          </div>
        </Card>

        {/* Basic info */}
        <Card className="p-6 rounded-2xl border-0 shadow-card">
          <h2 className="font-bold text-lg mb-4">Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Code *" error={form.formState.errors.code?.message}>
              <Input {...form.register("code")} placeholder="e.g. NS09" />
            </Field>
            <Field label="Full Name *" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="e.g. Nikoloz Sokhadze" />
            </Field>
            <Field label="Position">
              <Input {...form.register("position")} placeholder="Guard / Forward / Center" />
            </Field>
            <Field label="Date of Birth">
              <Input type="date" {...form.register("date_of_birth")} />
            </Field>
            <Field label="Height (cm)">
              <Input type="number" {...form.register("height_cm")} placeholder="191" />
            </Field>
            <Field label="Weight (kg)">
              <Input type="number" {...form.register("weight_kg")} placeholder="80" />
            </Field>
          </div>

          <div className="flex items-center justify-between mt-6 p-4 bg-muted/50 rounded-xl">
            <div>
              <Label className="text-base font-semibold">Senior Team</Label>
              <p className="text-sm text-muted-foreground">Toggle off for U20</p>
            </div>
            <Switch
              checked={form.watch("team")}
              onCheckedChange={(v) => form.setValue("team", v, { shouldDirty: true })}
            />
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6 rounded-2xl border-0 shadow-card">
          <h2 className="font-bold text-lg mb-4">Notes</h2>
          <Textarea rows={5} {...form.register("notes")} placeholder="Coach notes, observations, development goals…" />
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 sticky bottom-4 bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-elegant border">
          {isEdit ? (
            <Button type="button" variant="outline" onClick={handleDelete} disabled={deleting} className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-1" /> Delete</>}
            </Button>
          ) : <span />}
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-gradient-court hover:opacity-90 shadow-soft">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> {isEdit ? "Save Changes" : "Add Player"}</>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
