// Database types for Supabase
// In production, generate these with: npx supabase gen types typescript

export type Team = {
  id: string;
  name: string;
  admin_id: string;
  currency: string;
  monthly_fee: number;
  created_at: string;
};

export type Player = {
  id: string;
  team_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
  jersey_number: number | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
};

export type Match = {
  id: string;
  team_id: string;
  opponent: string;
  date: string;
  time: string;
  location: string | null;
  status: "upcoming" | "completed" | "cancelled";
  created_at: string;
};

export type Attendance = {
  id: string;
  match_id: string;
  player_id: string;
  status: "confirmed" | "declined" | "pending";
  responded_at: string | null;
};

export type Payment = {
  id: string;
  player_id: string;
  month: string;
  paid: boolean;
  amount: number | null;
  paid_date: string | null;
  created_at: string;
};

// Extended types with relations
export type PlayerWithPayments = Player & {
  payments: Payment[];
};

export type MatchWithAttendance = Match & {
  attendance: (Attendance & { player: Player })[];
};
