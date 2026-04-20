export interface Player {
  id?: string;
  code: string;
  name: string;
  position: string | null;
  team: boolean; // true = Senior, false = U20
  date_of_birth: string | null; // ISO date
  height_cm: number | null;
  weight_kg: number | null;
  photo_url: string | null;

  // Future-ready optional fields
  nationality?: string | null;
  jersey_number?: number | null;
  wingspan?: number | null;
  standing_reach?: number | null;
  vertical_jump?: number | null;
  injury_history?: string | null;
  notes?: string | null;
  tournaments?: string | null;
  assessments?: string | null;

  created_at?: string;
  updated_at?: string;
}

export const categoryLabel = (team: boolean) => (team ? "Senior" : "U20");

export const getBirthYear = (dob: string | null | undefined) =>
  dob ? new Date(dob).getFullYear() : null;

export const getAge = (dob: string | null | undefined) => {
  if (!dob) return null;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};
