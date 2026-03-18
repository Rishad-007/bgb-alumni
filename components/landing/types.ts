export type AlumniRow = {
  id: number | string;
  name: string | null;
  session: string | null;
  created_at: string | null;
  photo_url: string | null;
};

export type LandingStats = {
  totalAlumni: number;
  activeMembers: number;
  recentRegistrations: number;
};
