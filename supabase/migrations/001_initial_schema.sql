-- =============================================
-- Match Manager — Database Schema
-- Multi-team architecture with RLS
-- =============================================

-- =============================================
-- TEAMS
-- =============================================
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  monthly_fee INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PLAYERS
-- =============================================
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  position TEXT CHECK (position IN ('Goalkeeper', 'Defender', 'Midfielder', 'Forward')),
  jersey_number INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MATCHES
-- =============================================
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  opponent TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ATTENDANCE
-- =============================================
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('confirmed', 'declined', 'pending')),
  responded_at TIMESTAMPTZ,
  UNIQUE(match_id, player_id)
);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  paid BOOLEAN DEFAULT false,
  amount INTEGER,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, month)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_matches_team ON matches(team_id);
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_attendance_match ON attendance(match_id);
CREATE INDEX idx_attendance_player ON attendance(player_id);
CREATE INDEX idx_payments_player ON payments(player_id);
CREATE INDEX idx_payments_month ON payments(month);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view own team"
  ON teams FOR SELECT
  USING (admin_id = auth.uid());

CREATE POLICY "Admin can update own team"
  ON teams FOR UPDATE
  USING (admin_id = auth.uid());

CREATE POLICY "Authenticated users can create teams"
  ON teams FOR INSERT
  WITH CHECK (admin_id = auth.uid());

-- Players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage team players"
  ON players FOR ALL
  USING (
    team_id IN (SELECT id FROM teams WHERE admin_id = auth.uid())
  );

CREATE POLICY "Player can view own profile"
  ON players FOR SELECT
  USING (user_id = auth.uid());

-- Matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage team matches"
  ON matches FOR ALL
  USING (
    team_id IN (SELECT id FROM teams WHERE admin_id = auth.uid())
  );

CREATE POLICY "Player can view team matches"
  ON matches FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM players WHERE user_id = auth.uid())
  );

-- Attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage attendance"
  ON attendance FOR ALL
  USING (
    match_id IN (
      SELECT m.id FROM matches m
      JOIN teams t ON m.team_id = t.id
      WHERE t.admin_id = auth.uid()
    )
  );

CREATE POLICY "Player can view own attendance"
  ON attendance FOR SELECT
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Player can update own attendance"
  ON attendance FOR UPDATE
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Player can insert own attendance"
  ON attendance FOR INSERT
  WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage payments"
  ON payments FOR ALL
  USING (
    player_id IN (
      SELECT p.id FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE t.admin_id = auth.uid()
    )
  );

CREATE POLICY "Player can view own payments"
  ON payments FOR SELECT
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- =============================================
-- REALTIME (enable for live updates)
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
