-- ============================================================================
-- Nepal Cricket Hub — seed data (development / demonstration)
-- Idempotent: safe to run repeatedly.
-- ============================================================================

insert into public.site_settings (key, value) values
  ('site', jsonb_build_object(
    'name', 'Nepal Cricket Hub',
    'domain', 'nepalcrickethub.com',
    'tagline', 'All Nepal Cricket. One Hub.',
    'description', 'Live scores, fixtures, results, news and stats for Nepal cricket, the Nepal Premier League and Nepali players around the world.'
  )),
  ('navigation', jsonb_build_object(
    'home', '/', 'live', '/live', 'matches', '/matches', 'news', '/news',
    'npl', '/npl', 'teams', '/teams', 'players', '/players', 'points-table', '/points-table'
  ))
on conflict (key) do nothing;

-- ============================================================================
-- TEAMS
-- ============================================================================

insert into public.teams (id, name, short_name, slug, country, team_type, is_national, color_primary, color_secondary) values
  ('10000000-0000-0000-0000-000000000001', 'Nepal', 'NEP', 'nepal', 'Nepal', 'International', true, '#dc2e27', '#003893'),
  ('10000000-0000-0000-0000-000000000002', 'Nepal Women', 'NEP-W', 'nepal-women', 'Nepal', 'Womens', true, '#e11d48', '#003893'),
  ('10000000-0000-0000-0000-000000000003', 'Nepal U19', 'NEP-U19', 'nepal-u19', 'Nepal', 'U19', true, '#f59e0b', '#003893'),
  ('10000000-0000-0000-0000-000000000004', 'India', 'IND', 'india', 'India', 'International', true, '#004b93', '#ff9933'),
  ('10000000-0000-0000-0000-000000000005', 'Pakistan', 'PAK', 'pakistan', 'Pakistan', 'International', true, '#01411c', '#01411c'),
  ('10000000-0000-0000-0000-000000000006', 'Sri Lanka', 'SL', 'sri-lanka', 'Sri Lanka', 'International', true, '#00458c', '#ef3340'),
  ('10000000-0000-0000-0000-000000000007', 'Bangladesh', 'BAN', 'bangladesh', 'Bangladesh', 'International', true, '#006a4e', '#f42a41'),
  ('10000000-0000-0000-0000-000000000008', 'Afghanistan', 'AFG', 'afghanistan', 'Afghanistan', 'International', true, '#003366', '#d40000'),
  ('10000000-0000-0000-0000-000000000009', 'United Arab Emirates', 'UAE', 'united-arab-emirates', 'UAE', 'International', true, '#ffffff', '#00732f'),
  ('10000000-0000-0000-0000-000000000010', 'Oman', 'OMA', 'oman', 'Oman', 'International', true, '#ffffff', '#cc0000'),
  ('10000000-0000-0000-0000-000000000011', 'Namibia', 'NAM', 'namibia', 'Namibia', 'International', true, '#00549f', '#e03a3e'),
  ('10000000-0000-0000-0000-000000000012', 'Zimbabwe', 'ZIM', 'zimbabwe', 'Zimbabwe', 'International', true, '#eab308', '#000000'),
  -- NPL teams
  ('10000000-0000-0000-0000-000000000020', 'Janakpur Bolts', 'JKB', 'janakpur-bolts', 'Nepal', 'NPL', false, '#2f6fed', '#fbbf24'),
  ('10000000-0000-0000-0000-000000000021', 'Biratnagar Kings', 'BRK', 'biratnagar-kings', 'Nepal', 'NPL', false, '#f97316', '#1e3a8a'),
  ('10000000-0000-0000-0000-000000000022', 'Karnali Yaks', 'KAR', 'karnali-yaks', 'Nepal', 'NPL', false, '#64748b', '#0f172a'),
  ('10000000-0000-0000-0000-000000000023', 'Pokhara Avengers', 'PKA', 'pokhara-avengers', 'Nepal', 'NPL', false, '#e11d48', '#0f766e'),
  ('10000000-0000-0000-0000-000000000024', 'Chitwan Rhinos', 'CHT', 'chitwan-rhinos', 'Nepal', 'NPL', false, '#7c3aed', '#22c55e'),
  ('10000000-0000-0000-0000-000000000025', 'Lumbini Lions', 'LBL', 'lumbini-lions', 'Nepal', 'NPL', false, '#f59e0b', '#7f1d1d'),
  ('10000000-0000-0000-0000-000000000026', 'Sudurpaschim Royals', 'SDR', 'sudurpaschim-royals', 'Nepal', 'NPL', false, '#0ea5e9', '#facc15'),
  ('10000000-0000-0000-0000-000000000027', 'Kathmandu Gurkhas', 'KTM', 'kathmandu-gurkhas', 'Nepal', 'NPL', false, '#dc2626', '#111827')
on conflict (id) do nothing;

-- ============================================================================
-- SERIES
-- ============================================================================

insert into public.series (id, name, slug, type, category, start_date, end_date, season, status, points_table_available) values
  ('20000000-0000-0000-0000-000000000001', 'Nepal Premier League 2025', 'nepal-premier-league-2025', 'NPL', 'NPL', '2025-11-15', '2025-12-14', '2025', 'live', true),
  ('20000000-0000-0000-0000-000000000002', 'Nepal Tri-Nation Series 2025', 'nepal-tri-nation-series-2025', 'International', 'Nepal Cricket', '2025-09-01', '2025-09-10', '2025', 'completed', true),
  ('20000000-0000-0000-0000-000000000003', 'Nepal tour of UAE 2025', 'nepal-tour-of-uae-2025', 'International', 'Nepal Cricket', '2025-11-01', '2025-11-05', '2025', 'upcoming', true),
  ('20000000-0000-0000-0000-000000000004', 'ICC Men''s T20 World Cup 2026', 'icc-mens-t20-world-cup-2026', 'International', 'International Cricket', '2026-02-01', '2026-03-08', '2026', 'upcoming', false),
  ('20000000-0000-0000-0000-000000000005', 'Nepal Women''s T20I Series', 'nepal-womens-t20i-series', 'Womens', 'Women''s Cricket', '2025-10-10', '2025-10-14', '2025', 'upcoming', false),
  ('20000000-0000-0000-0000-000000000006', 'ACC U19 Asia Cup', 'acc-u19-asia-cup', 'U19', 'U19 Cricket', '2025-12-01', '2025-12-15', '2025', 'upcoming', false)
on conflict (id) do nothing;

-- ============================================================================
-- PLAYERS — Nepal Men
-- ============================================================================

insert into public.players (id, name, slug, full_name, country, role, batting_style, bowling_style, team_id, is_nepal, bio) values
  ('30000000-0000-0000-0000-000000000001', 'Rohit Paudel', 'rohit-paudel', 'Rohit Kumar Paudel', 'Nepal', 'Batter', 'Right-hand bat', 'Right-arm off-break', '10000000-0000-0000-0000-000000000001', true, 'Nepal ODI captain and one of the most consistent batters in Nepali cricket.'),
  ('30000000-0000-0000-0000-000000000002', 'Sandeep Lamichhane', 'sandeep-lamichhane', 'Sandeep Lamichhane', 'Nepal', 'Bowler', 'Right-hand bat', 'Right-arm leg-break', '10000000-0000-0000-0000-000000000001', true, 'Leg-spinner who has played in franchise leagues around the world.'),
  ('30000000-0000-0000-0000-000000000003', 'Kushal Bhurtel', 'kushal-bhurtel', 'Kushal Bhurtel', 'Nepal', 'All-rounder', 'Right-hand bat', 'Right-arm medium', '10000000-0000-0000-0000-000000000001', true, 'Aggressive opening batter and handy medium pacer.'),
  ('30000000-0000-0000-0000-000000000004', 'Karan KC', 'karan-kc', 'Karan KC', 'Nepal', 'Bowler', 'Right-hand bat', 'Right-arm fast-medium', '10000000-0000-0000-0000-000000000001', true, 'Pace spearhead of the Nepal attack.'),
  ('30000000-0000-0000-0000-000000000005', 'Sompal Kami', 'sompal-kami', 'Sompal Kami', 'Nepal', 'All-rounder', 'Right-hand bat', 'Right-arm medium-fast', '10000000-0000-0000-0000-000000000001', true, 'Experienced seamer and reliable lower-order hitter.'),
  ('30000000-0000-0000-0000-000000000006', 'Aasif Sheikh', 'aasif-sheikh', 'Aasif Sheikh', 'Nepal', 'Wicketkeeper-Batter', 'Right-hand bat', 'Right-arm medium', '10000000-0000-0000-0000-000000000001', true, 'Wicketkeeper-batter known for counter-attacking knocks.'),
  ('30000000-0000-0000-0000-000000000007', 'Dipendra Singh Airee', 'dipendra-singh-airee', 'Dipendra Singh Airee', 'Nepal', 'All-rounder', 'Right-hand bat', 'Right-arm off-break', '10000000-0000-0000-0000-000000000001', true, 'Explosive finisher; holds the record for fastest T20I fifty.'),
  ('30000000-0000-0000-0000-000000000008', 'Kushal Malla', 'kushal-malla', 'Kushal Malla', 'Nepal', 'All-rounder', 'Left-hand bat', 'Slow left-arm orthodox', '10000000-0000-0000-0000-000000000001', true, 'Young left-hander who smashed the fastest ODI fifty.'),
  ('30000000-0000-0000-0000-000000000009', 'Aarif Sheikh', 'aarif-sheikh', 'Aarif Sheikh', 'Nepal', 'All-rounder', 'Right-hand bat', 'Right-arm medium', '10000000-0000-0000-0000-000000000001', true, 'Dependable middle-order batter and part-time seamer.'),
  ('30000000-0000-0000-0000-000000000010', 'Gulsan Jha', 'gulsan-jha', 'Gulsan Jha', 'Nepal', 'All-rounder', 'Left-hand bat', 'Right-arm medium-fast', '10000000-0000-0000-0000-000000000001', true, 'Tall left-handed all-rounder who bowls genuine pace.'),
  ('30000000-0000-0000-0000-000000000011', 'Abinash Bohara', 'abinash-bohara', 'Abinash Bohara', 'Nepal', 'Bowler', 'Right-hand bat', 'Right-arm leg-break', '10000000-0000-0000-0000-000000000001', true, 'Leg-spinner with a big leg-break and googly.'),
  ('30000000-0000-0000-0000-000000000012', 'Pratis GC', 'pratis-gc', 'Pratis GC', 'Nepal', 'Bowler', 'Right-hand bat', 'Right-arm fast', '10000000-0000-0000-0000-000000000001', true, 'Young fast bowler clocking serious speeds.'),
  ('30000000-0000-0000-0000-000000000013', 'Lalit Rajbanshi', 'lalit-rajbanshi', 'Lalit Rajbanshi', 'Nepal', 'Bowler', 'Left-hand bat', 'Slow left-arm orthodox', '10000000-0000-0000-0000-000000000001', true, 'Canonical left-arm spinner in Nepal colours.'),
  ('30000000-0000-0000-0000-000000000014', 'Bibek Yadav', 'bibek-yadav', 'Bibek Yadav', 'Nepal', 'All-rounder', 'Right-hand bat', 'Right-arm medium-fast', '10000000-0000-0000-0000-000000000001', true, 'Hard-hitting all-rounder and death-over option.'),
  ('30000000-0000-0000-0000-000000000015', 'Dev Khanal', 'dev-khanal', 'Dev Khanal', 'Nepal', 'Batter', 'Right-hand bat', 'Right-arm off-break', '10000000-0000-0000-0000-000000000001', true, 'Promising top-order batter.')
on conflict (id) do nothing;

-- ============================================================================
-- PLAYERS — Nepal Women
-- ============================================================================

insert into public.players (id, name, slug, full_name, country, role, batting_style, bowling_style, team_id, is_nepal, is_nepal_women) values
  ('30000000-0000-0000-0000-000000000020', 'Indu Barma', 'indu-barma', 'Indu Barma', 'Nepal', 'All-rounder', 'Left-hand bat', 'Slow left-arm orthodox', '10000000-0000-0000-0000-000000000002', true, true),
  ('30000000-0000-0000-0000-000000000021', 'Rubina Chhetry', 'rubina-chhetry', 'Rubina Chhetry', 'Nepal', 'All-rounder', 'Right-hand bat', 'Right-arm medium', '10000000-0000-0000-0000-000000000002', true, true),
  ('30000000-0000-0000-0000-000000000022', 'Sita Rana Magar', 'sita-rana-magar', 'Sita Rana Magar', 'Nepal', 'Batter', 'Right-hand bat', 'Right-arm medium', '10000000-0000-0000-0000-000000000002', true, true),
  ('30000000-0000-0000-0000-000000000023', 'Kabita Joshi', 'kabita-joshi', 'Kabita Joshi', 'Nepal', 'Bowler', 'Right-hand bat', 'Right-arm medium', '10000000-0000-0000-0000-000000000002', true, true),
  ('30000000-0000-0000-0000-000000000024', 'Puja Mahato', 'puja-mahato', 'Puja Mahato', 'Nepal', 'All-rounder', 'Right-hand bat', 'Right-arm off-break', '10000000-0000-0000-0000-000000000002', true, true),
  ('30000000-0000-0000-0000-000000000025', 'Suman Khatiwada', 'suman-khatiwada', 'Suman Khatiwada', 'Nepal', 'Batter', 'Right-hand bat', 'Right-arm medium', '10000000-0000-0000-0000-000000000002', true, true)
on conflict (id) do nothing;

-- ============================================================================
-- PLAYERS — Nepal U19
-- ============================================================================

insert into public.players (id, name, slug, full_name, country, role, batting_style, bowling_style, team_id, is_nepal, is_u19) values
  ('30000000-0000-0000-0000-000000000030', 'Lokesh Bam', 'lokesh-bam', 'Lokesh Bam', 'Nepal', 'Batter', 'Right-hand bat', 'Right-arm medium', '10000000-0000-0000-0000-000000000003', true, true),
  ('30000000-0000-0000-0000-000000000031', 'Aman Dhami', 'aman-dhami', 'Aman Dhami', 'Nepal', 'Bowler', 'Right-hand bat', 'Right-arm medium-fast', '10000000-0000-0000-0000-000000000003', true, true),
  ('30000000-0000-0000-0000-000000000032', 'Utkarsh Raj', 'utkarsh-raj', 'Utkarsh Raj', 'Nepal', 'All-rounder', 'Right-hand bat', 'Right-arm off-break', '10000000-0000-0000-0000-000000000003', true, true)
on conflict (id) do nothing;

-- ============================================================================
-- PLAYER STATISTICS (T20I / ODI samples)
-- ============================================================================

insert into public.player_statistics (player_id, format, matches, innings, runs, high_score, average, strike_rate, hundreds, fifties, wickets, economy, best_bowling_wickets, best_bowling_runs) values
  ('30000000-0000-0000-0000-000000000001', 'ODI', 55, 52, 1580, 126, 33.5, 78.2, 1, 10, 0, 0, 0, 0),
  ('30000000-0000-0000-0000-000000000001', 'T20', 45, 42, 1120, 94, 29.3, 124.5, 0, 7, 0, 0, 0, 0),
  ('30000000-0000-0000-0000-000000000002', 'ODI', 50, 30, 240, 32, 9.2, 88.1, 0, 0, 112, 3.6, 6, 11),
  ('30000000-0000-0000-0000-000000000002', 'T20', 48, 20, 180, 30, 8.4, 102.3, 0, 0, 96, 6.3, 5, 9),
  ('30000000-0000-0000-0000-000000000003', 'ODI', 50, 48, 1450, 115, 31.2, 82.4, 2, 9, 18, 5.4, 2, 21),
  ('30000000-0000-0000-0000-000000000003', 'T20', 48, 46, 1180, 104, 27.8, 121.6, 1, 6, 24, 7.8, 3, 16),
  ('30000000-0000-0000-0000-000000000004', 'ODI', 45, 22, 200, 28, 8.6, 74.5, 0, 0, 85, 5.2, 5, 20),
  ('30000000-0000-0000-0000-000000000004', 'T20', 42, 18, 150, 26, 7.9, 108.9, 0, 0, 62, 8.1, 4, 18),
  ('30000000-0000-0000-0000-000000000005', 'ODI', 48, 30, 480, 45, 17.4, 82.1, 0, 2, 62, 4.8, 4, 22),
  ('30000000-0000-0000-0000-000000000005', 'T20', 40, 22, 320, 38, 16.2, 132.8, 0, 1, 38, 8.4, 3, 19),
  ('30000000-0000-0000-0000-000000000006', 'ODI', 52, 46, 1320, 110, 30.6, 88.4, 1, 8, 0, 0, 0, 0),
  ('30000000-0000-0000-0000-000000000006', 'T20', 44, 40, 980, 82, 26.1, 138.7, 0, 5, 0, 0, 0, 0),
  ('30000000-0000-0000-0000-000000000007', 'ODI', 45, 38, 900, 74, 27.2, 96.7, 0, 5, 30, 4.9, 3, 12),
  ('30000000-0000-0000-0000-000000000007', 'T20', 46, 38, 940, 86, 29.5, 151.2, 0, 5, 20, 7.1, 2, 15),
  ('30000000-0000-0000-0000-000000000008', 'ODI', 30, 28, 820, 96, 32.8, 102.4, 0, 6, 12, 4.2, 1, 14),
  ('30000000-0000-0000-0000-000000000008', 'T20', 32, 28, 780, 88, 30.1, 148.9, 0, 5, 8, 7.6, 1, 18)
on conflict (player_id, format) do nothing;

-- ============================================================================
-- NPL TEAMS -> series link via points table seed (live NPL)
-- ============================================================================

insert into public.points_table (series_id, team_id, matches, wins, losses, no_result, ties, points, net_run_rate, position) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 8, 6, 2, 0, 0, 12, 0.862, 1),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 8, 5, 3, 0, 0, 10, 0.540, 2),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000027', 8, 5, 3, 0, 0, 10, 0.312, 3),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', 8, 4, 4, 0, 0, 8, -0.045, 4),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', 8, 4, 4, 0, 0, 8, -0.210, 5),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 8, 3, 5, 0, 0, 6, -0.388, 6),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000026', 8, 3, 5, 0, 0, 6, -0.455, 7),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000025', 8, 2, 6, 0, 0, 4, -0.740, 8)
on conflict (series_id, team_id) do nothing;

-- ============================================================================
-- SAMPLE MATCHES
-- ============================================================================

insert into public.matches (id, external_id, series_id, home_team_id, away_team_id, name, slug, match_type, venue, city, start_time, status, match_state, result, toss_winner, toss_decision, is_live, home_score, away_score) values
  ('40000000-0000-0000-0000-000000000001', 'LIVE-1001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000021', 'Janakpur Bolts vs Biratnagar Kings', 'janakpur-bolts-vs-biratnagar-kings', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', now() - interval '2 hours', 'live', 'Biratnagar need 32 runs off 18 balls', null, 'Janakpur Bolts', 'bat', true, '164/7 (17.2)', null),
  ('40000000-0000-0000-0000-000000000002', 'LIVE-1002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000023', 'Kathmandu Gurkhas vs Pokhara Avengers', 'kathmandu-gurkhas-vs-pokhara-avengers', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', now() + interval '3 hours', 'upcoming', 'Match starts at 6:30 PM NPT', null, null, null, false, null, null),
  ('40000000-0000-0000-0000-000000000003', 'RES-1001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000022', 'Chitwan Rhinos vs Karnali Yaks', 'chitwan-rhinos-vs-karnali-yaks', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', now() - interval '1 day', 'completed', null, 'Chitwan Rhinos won by 6 wickets', 'Karnali Yaks', 'bat', false, '142/6 (18.4)', '138/8 (20)'),
  ('40000000-0000-0000-0000-000000000004', 'RES-1002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Nepal vs UAE', 'nepal-vs-uae', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', now() - interval '3 days', 'completed', null, 'Nepal won by 32 runs', 'UAE', 'bowl', false, '248/9 (50)', '216 (44.3)'),
  ('40000000-0000-0000-0000-000000000005', 'RES-1003', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'UAE vs Nepal', 'uae-vs-nepal', 'ODI', 'Sharjah Cricket Stadium', 'Sharjah', now() - interval '5 days', 'completed', null, 'UAE won by 4 wickets', 'Nepal', 'bat', false, '232 (48.2)', '233/6 (46.1)'),
  ('40000000-0000-0000-0000-000000000006', 'UP-1001', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'UAE vs Nepal', 'uae-vs-nepal-nov-2025', 'ODI', 'Sharjah Cricket Stadium', 'Sharjah', '2025-11-01 14:00+05:45', 'upcoming', null, null, null, null, false, null, null),
  ('40000000-0000-0000-0000-000000000007', 'UP-1002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000025', 'Karnali Yaks vs Lumbini Lions', 'karnali-yaks-vs-lumbini-lions', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2025-11-25 13:15+05:45', 'upcoming', null, null, null, null, false, null, null),
  ('40000000-0000-0000-0000-000000000008', 'UP-1003', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', 'Nepal Women vs Zimbabwe Women', 'nepal-women-vs-zimbabwe-women', 'T20', 'Kirtipur Cricket Ground', 'Kirtipur', '2025-10-10 10:00+05:45', 'upcoming', null, null, null, null, false, null, null)
on conflict (id) do nothing;

-- ============================================================================
-- SAMPLE NEWS
-- ============================================================================

insert into public.news (id, title, slug, summary, category, tags, source_name, source_url, original_guid, is_breaking, is_featured, published_at) values
  ('50000000-0000-0000-0000-000000000001', 'Janakpur Bolts edge Biratnagar Kings in NPL thriller', 'janakpur-bolts-edge-biratnagar-kings-in-npl-thriller', 'A last-over finish at Kirtipur kept the NPL title race alive as Janakpur Bolts held their nerve to seal a dramatic win.', 'NPL', array['NPL','Janakpur Bolts','Biratnagar Kings'], 'Nepal Cricket Hub', 'https://nepalcrickethub.com/news/janakpur-bolts-edge-biratnagar-kings-in-npl-thriller', 'seed-001', true, true, now() - interval '2 hours'),
  ('50000000-0000-0000-0000-000000000002', 'Rohit Paudel climbs Nepal run-charts with record-breaking series', 'rohit-paudel-climbs-nepal-run-charts-with-record-breaking-series', 'The Nepal captain produced a Player of the Series display, underlining his status as the team''s batting bedrock.', 'Nepal Cricket', array['Nepal','Rohit Paudel'], 'Nepal Cricket Hub', 'https://nepalcrickethub.com/news/rohit-paudel-climbs-nepal-run-charts-with-record-breaking-series', 'seed-002', false, true, now() - interval '5 hours'),
  ('50000000-0000-0000-0000-000000000003', 'Sandeep Lamichhane returns to T20 franchise circuit', 'sandeep-lamichhane-returns-to-t20-franchise-circuit', 'Nepal''s most decorated wrist-spinner has rejoined the franchise circuit, adding another chapter to a storied career.', 'Player News', array['Players','Sandeep Lamichhane'], 'Nepal Cricket Hub', 'https://nepalcrickethub.com/news/sandeep-lamichhane-returns-to-t20-franchise-circuit', 'seed-003', false, false, now() - interval '1 day'),
  ('50000000-0000-0000-0000-000000000004', 'Nepal U19 set sights on ACC U19 Asia Cup', 'nepal-u19-set-sights-on-acc-u19-asia-cup', 'A young squad has been named as Nepal prepare for their U19 Asia Cup campaign later this year.', 'U19 Cricket', array['U19','Nepal U19'], 'Nepal Cricket Hub', 'https://nepalcrickethub.com/news/nepal-u19-set-sights-on-acc-u19-asia-cup', 'seed-004', false, false, now() - interval '2 days'),
  ('50000000-0000-0000-0000-000000000005', 'Nepal Women gear up for T20I series against Zimbabwe', 'nepal-women-gear-up-for-t20i-series-against-zimbabwe', 'The national women''s side will host Zimbabwe in a three-match T20I series in Kirtipur next month.', 'Women''s Cricket', array['Nepal Women','Women''s Cricket'], 'Nepal Cricket Hub', 'https://nepalcrickethub.com/news/nepal-women-gear-up-for-t20i-series-against-zimbabwe', 'seed-005', false, false, now() - interval '3 days')
on conflict (id) do nothing;

-- ============================================================================
-- SAMPLE VIDEOS
-- ============================================================================

insert into public.videos (id, title, slug, description, video_url, thumbnail, source, category, is_featured) values
  ('60000000-0000-0000-0000-000000000001', 'NPL 2025 Highlights: Janakpur Bolts vs Biratnagar Kings', 'npl-2025-highlights-janakpur-bolts-vs-biratnagar-kings', 'Match highlights from Kirtipur.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'YouTube', 'Highlights', true),
  ('60000000-0000-0000-0000-000000000002', 'Rohit Paudel: 50 off 34 balls', 'rohit-paudel-50-off-34-balls', 'A captain''s knock under lights.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'YouTube', 'Highlights', false),
  ('60000000-0000-0000-0000-000000000003', 'Sandeep Lamichhane: 5-wicket haul', 'sandeep-lamichhane-5-wicket-haul', 'Wrist-spin masterclass.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'YouTube', 'Highlights', false)
on conflict (id) do nothing;

-- ============================================================================
-- SAMPLE ADVERTISEMENTS (placeholder slots)
-- ============================================================================

insert into public.advertisements (id, name, slot, format, type, image_url, link_url, enabled) values
  ('70000000-0000-0000-0000-000000000001', 'Home top banner', 'home_top', 'leaderboard', 'image', 'https://placehold.co/728x90/0f172a/ffffff?text=Advertise+with+Nepal+Cricket+Hub', 'https://nepalcrickethub.com/advertise', true),
  ('70000000-0000-0000-0000-000000000002', 'Sidebar skyscraper', 'sidebar', 'skyscraper', 'image', 'https://placehold.co/300x600/0f172a/ffffff?text=Advertise+Here', 'https://nepalcrickethub.com/advertise', true)
on conflict (id) do nothing;

-- ============================================================================
-- NEWS SOURCES (legal RSS / API feeds — administrator adds more)
-- ============================================================================

insert into public.news_sources (id, name, url, type, category, enabled) values
  ('80000000-0000-0000-0000-000000000001', 'Nepal Cricket Hub (internal)', 'internal://nepalcrickethub', 'rss', 'Nepal Cricket', true)
on conflict (id) do nothing;

-- ============================================================================
-- SYNC STATUS
-- ============================================================================

insert into public.sync_status (job, status, last_success_at, last_message) values
  ('cricket_sync', 'idle', now(), 'Seeded with sample data. Awaiting first scheduled run.'),
  ('news_sync', 'idle', now(), 'Seeded with sample data. Awaiting first scheduled run.')
on conflict (job) do nothing;
