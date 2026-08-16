import { db } from '../db';
import { logger } from '../utils/logger';
import { nowIso } from '../utils/helpers';

/**
 * Bootstrap MongoDB with development/demo data.
 * Idempotent — safe to run repeatedly. Run with: npm run seed
 */

const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

async function upsertGet(
  coll: string,
  filter: Record<string, unknown>,
  doc: Record<string, unknown>,
): Promise<string> {
  await db.collection(coll).updateOne(
    filter,
    { $setOnInsert: { ...doc, createdAt: nowIso(), updatedAt: nowIso() } },
    { upsert: true },
  );
  const found = await db.collection(coll).findOne(filter);
  return String(found?._id ?? '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SeedTeam = { externalId: string; name: string; shortName: string; slug: string; country: string; teamType: string; isNational: boolean };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SeedPlayer = { externalId: string; name: string; slug: string; fullName: string; country: string; role: string; battingStyle: string; bowlingStyle: string; teamId: string; bio?: string };

const TEAMS: SeedTeam[] = [
  { externalId: '10000000-0000-0000-0000-000000000001', name: 'Nepal', shortName: 'NEP', slug: 'nepal', country: 'Nepal', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000002', name: 'Nepal Women', shortName: 'NEP-W', slug: 'nepal-women', country: 'Nepal', teamType: 'Womens', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000003', name: 'Nepal U19', shortName: 'NEP-U19', slug: 'nepal-u19', country: 'Nepal', teamType: 'U19', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000004', name: 'India', shortName: 'IND', slug: 'india', country: 'India', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000005', name: 'Pakistan', shortName: 'PAK', slug: 'pakistan', country: 'Pakistan', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000006', name: 'Sri Lanka', shortName: 'SL', slug: 'sri-lanka', country: 'Sri Lanka', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000007', name: 'Bangladesh', shortName: 'BAN', slug: 'bangladesh', country: 'Bangladesh', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000008', name: 'Afghanistan', shortName: 'AFG', slug: 'afghanistan', country: 'Afghanistan', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000009', name: 'United Arab Emirates', shortName: 'UAE', slug: 'united-arab-emirates', country: 'UAE', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000010', name: 'Oman', shortName: 'OMA', slug: 'oman', country: 'Oman', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000011', name: 'Namibia', shortName: 'NAM', slug: 'namibia', country: 'Namibia', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000012', name: 'Zimbabwe', shortName: 'ZIM', slug: 'zimbabwe', country: 'Zimbabwe', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000020', name: 'Janakpur Bolts', shortName: 'JKB', slug: 'janakpur-bolts', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: '10000000-0000-0000-0000-000000000021', name: 'Biratnagar Kings', shortName: 'BRK', slug: 'biratnagar-kings', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: '10000000-0000-0000-0000-000000000022', name: 'Karnali Yaks', shortName: 'KAR', slug: 'karnali-yaks', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: '10000000-0000-0000-0000-000000000023', name: 'Pokhara Avengers', shortName: 'PKA', slug: 'pokhara-avengers', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: '10000000-0000-0000-0000-000000000024', name: 'Chitwan Rhinos', shortName: 'CHT', slug: 'chitwan-rhinos', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: '10000000-0000-0000-0000-000000000025', name: 'Lumbini Lions', shortName: 'LBL', slug: 'lumbini-lions', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: '10000000-0000-0000-0000-000000000026', name: 'Sudurpaschim Royals', shortName: 'SDR', slug: 'sudurpaschim-royals', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: '10000000-0000-0000-0000-000000000027', name: 'Kathmandu Gurkhas', shortName: 'KTM', slug: 'kathmandu-gurkhas', country: 'Nepal', teamType: 'NPL', isNational: false },
];

const NEPAL = TEAMS[0].externalId;
const NEPAL_W = TEAMS[1].externalId;
const NEPAL_U19 = TEAMS[2].externalId;
const UAE = TEAMS[8].externalId;
const ZIM = TEAMS[11].externalId;
const JKB = TEAMS[12].externalId;
const BRK = TEAMS[13].externalId;
const KAR = TEAMS[14].externalId;
const PKA = TEAMS[15].externalId;
const CHT = TEAMS[16].externalId;
const LBL = TEAMS[17].externalId;
const SDR = TEAMS[18].externalId;
const KTM = TEAMS[19].externalId;

const PLAYERS: SeedPlayer[] = [
  { externalId: '30000000-0000-0000-0000-000000000001', name: 'Rohit Paudel', slug: 'rohit-paudel', fullName: 'Rohit Kumar Paudel', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'Nepal ODI captain and one of the most consistent batters in Nepali cricket.' },
  { externalId: '30000000-0000-0000-0000-000000000002', name: 'Sandeep Lamichhane', slug: 'sandeep-lamichhane', fullName: 'Sandeep Lamichhane', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm leg-break', teamId: NEPAL, bio: 'Leg-spinner who has played in franchise leagues around the world.' },
  { externalId: '30000000-0000-0000-0000-000000000003', name: 'Kushal Bhurtel', slug: 'kushal-bhurtel', fullName: 'Kushal Bhurtel', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'Aggressive opening batter and handy medium pacer.' },
  { externalId: '30000000-0000-0000-0000-000000000004', name: 'Karan KC', slug: 'karan-kc', fullName: 'Karan KC', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast-medium', teamId: NEPAL, bio: 'Pace spearhead of the Nepal attack.' },
  { externalId: '30000000-0000-0000-0000-000000000005', name: 'Sompal Kami', slug: 'sompal-kami', fullName: 'Sompal Kami', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL, bio: 'Experienced seamer and reliable lower-order hitter.' },
  { externalId: '30000000-0000-0000-0000-000000000006', name: 'Aasif Sheikh', slug: 'aasif-sheikh', fullName: 'Aasif Sheikh', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'Wicketkeeper-batter known for counter-attacking knocks.' },
  { externalId: '30000000-0000-0000-0000-000000000007', name: 'Dipendra Singh Airee', slug: 'dipendra-singh-airee', fullName: 'Dipendra Singh Airee', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'Explosive finisher; holds the record for fastest T20I fifty.' },
  { externalId: '30000000-0000-0000-0000-000000000008', name: 'Kushal Malla', slug: 'kushal-malla', fullName: 'Kushal Malla', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL, bio: 'Young left-hander who smashed the fastest ODI fifty.' },
  { externalId: '30000000-0000-0000-0000-000000000009', name: 'Aarif Sheikh', slug: 'aarif-sheikh', fullName: 'Aarif Sheikh', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'Dependable middle-order batter and part-time seamer.' },
  { externalId: '30000000-0000-0000-0000-000000000010', name: 'Gulsan Jha', slug: 'gulsan-jha', fullName: 'Gulsan Jha', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL, bio: 'Tall left-handed all-rounder who bowls genuine pace.' },
  { externalId: '30000000-0000-0000-0000-000000000011', name: 'Abinash Bohara', slug: 'abinash-bohara', fullName: 'Abinash Bohara', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm leg-break', teamId: NEPAL, bio: 'Leg-spinner with a big leg-break and googly.' },
  { externalId: '30000000-0000-0000-0000-000000000012', name: 'Pratis GC', slug: 'pratis-gc', fullName: 'Pratis GC', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast', teamId: NEPAL, bio: 'Young fast bowler clocking serious speeds.' },
  { externalId: '30000000-0000-0000-0000-000000000013', name: 'Lalit Rajbanshi', slug: 'lalit-rajbanshi', fullName: 'Lalit Rajbanshi', country: 'Nepal', role: 'Bowler', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL, bio: 'Canonical left-arm spinner in Nepal colours.' },
  { externalId: '30000000-0000-0000-0000-000000000014', name: 'Bibek Yadav', slug: 'bibek-yadav', fullName: 'Bibek Yadav', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL, bio: 'Hard-hitting all-rounder and death-over option.' },
  { externalId: '30000000-0000-0000-0000-000000000015', name: 'Dev Khanal', slug: 'dev-khanal', fullName: 'Dev Khanal', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'Promising top-order batter.' },
  { externalId: '30000000-0000-0000-0000-000000000020', name: 'Indu Barma', slug: 'indu-barma', fullName: 'Indu Barma', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL_W },
  { externalId: '30000000-0000-0000-0000-000000000021', name: 'Rubina Chhetry', slug: 'rubina-chhetry', fullName: 'Rubina Chhetry', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W },
  { externalId: '30000000-0000-0000-0000-000000000022', name: 'Sita Rana Magar', slug: 'sita-rana-magar', fullName: 'Sita Rana Magar', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W },
  { externalId: '30000000-0000-0000-0000-000000000023', name: 'Kabita Joshi', slug: 'kabita-joshi', fullName: 'Kabita Joshi', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W },
  { externalId: '30000000-0000-0000-0000-000000000024', name: 'Puja Mahato', slug: 'puja-mahato', fullName: 'Puja Mahato', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL_W },
  { externalId: '30000000-0000-0000-0000-000000000025', name: 'Suman Khatiwada', slug: 'suman-khatiwada', fullName: 'Suman Khatiwada', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W },
  { externalId: '30000000-0000-0000-0000-000000000030', name: 'Lokesh Bam', slug: 'lokesh-bam', fullName: 'Lokesh Bam', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U19 },
  { externalId: '30000000-0000-0000-0000-000000000031', name: 'Aman Dhami', slug: 'aman-dhami', fullName: 'Aman Dhami', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL_U19 },
  { externalId: '30000000-0000-0000-0000-000000000032', name: 'Utkarsh Raj', slug: 'utkarsh-raj', fullName: 'Utkarsh Raj', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL_U19 },
];

// [playerSlug, format, matches, innings, runs, highScore, average, strikeRate, hundreds, fifties, wickets, economy, bbW, bbR]
const STATS: Array<[string, string, number, number, number, number, number, number, number, number, number, number, number, number]> = [
  ['rohit-paudel', 'ODI', 55, 52, 1580, 126, 33.5, 78.2, 1, 10, 0, 0, 0, 0],
  ['rohit-paudel', 'T20', 45, 42, 1120, 94, 29.3, 124.5, 0, 7, 0, 0, 0, 0],
  ['sandeep-lamichhane', 'ODI', 50, 30, 240, 32, 9.2, 88.1, 0, 0, 112, 3.6, 6, 11],
  ['sandeep-lamichhane', 'T20', 48, 20, 180, 30, 8.4, 102.3, 0, 0, 96, 6.3, 5, 9],
  ['kushal-bhurtel', 'ODI', 50, 48, 1450, 115, 31.2, 82.4, 2, 9, 18, 5.4, 2, 21],
  ['kushal-bhurtel', 'T20', 48, 46, 1180, 104, 27.8, 121.6, 1, 6, 24, 7.8, 3, 16],
  ['karan-kc', 'ODI', 45, 22, 200, 28, 8.6, 74.5, 0, 0, 85, 5.2, 5, 20],
  ['karan-kc', 'T20', 42, 18, 150, 26, 7.9, 108.9, 0, 0, 62, 8.1, 4, 18],
  ['sompal-kami', 'ODI', 48, 30, 480, 45, 17.4, 82.1, 0, 2, 62, 4.8, 4, 22],
  ['sompal-kami', 'T20', 40, 22, 320, 38, 16.2, 132.8, 0, 1, 38, 8.4, 3, 19],
  ['aasif-sheikh', 'ODI', 52, 46, 1320, 110, 30.6, 88.4, 1, 8, 0, 0, 0, 0],
  ['aasif-sheikh', 'T20', 44, 40, 980, 82, 26.1, 138.7, 0, 5, 0, 0, 0, 0],
  ['dipendra-singh-airee', 'ODI', 45, 38, 900, 74, 27.2, 96.7, 0, 5, 30, 4.9, 3, 12],
  ['dipendra-singh-airee', 'T20', 46, 38, 940, 86, 29.5, 151.2, 0, 5, 20, 7.1, 2, 15],
  ['kushal-malla', 'ODI', 30, 28, 820, 96, 32.8, 102.4, 0, 6, 12, 4.2, 1, 14],
  ['kushal-malla', 'T20', 32, 28, 780, 88, 30.1, 148.9, 0, 5, 8, 7.6, 1, 18],
];

const SERIES = [
  { externalId: '20000000-0000-0000-0000-000000000001', name: 'Nepal Premier League 2025', slug: 'nepal-premier-league-2025', type: 'NPL', category: 'NPL', startDate: '2025-11-15', endDate: '2025-12-14', season: '2025', status: 'live', pointsTableAvailable: true },
  { externalId: '20000000-0000-0000-0000-000000000002', name: 'Nepal Tri-Nation Series 2025', slug: 'nepal-tri-nation-series-2025', type: 'International', category: 'Nepal Cricket', startDate: '2025-09-01', endDate: '2025-09-10', season: '2025', status: 'completed', pointsTableAvailable: true },
  { externalId: '20000000-0000-0000-0000-000000000003', name: 'Nepal tour of UAE 2025', slug: 'nepal-tour-of-uae-2025', type: 'International', category: 'Nepal Cricket', startDate: '2025-11-01', endDate: '2025-11-05', season: '2025', status: 'upcoming', pointsTableAvailable: true },
  { externalId: '20000000-0000-0000-0000-000000000004', name: "ICC Men's T20 World Cup 2026", slug: 'icc-mens-t20-world-cup-2026', type: 'International', category: 'International Cricket', startDate: '2026-02-01', endDate: '2026-03-08', season: '2026', status: 'upcoming', pointsTableAvailable: false },
  { externalId: '20000000-0000-0000-0000-000000000005', name: "Nepal Women's T20I Series", slug: 'nepal-womens-t20i-series', type: 'Womens', category: "Women's Cricket", startDate: '2025-10-10', endDate: '2025-10-14', season: '2025', status: 'upcoming', pointsTableAvailable: false },
  { externalId: '20000000-0000-0000-0000-000000000006', name: 'ACC U19 Asia Cup', slug: 'acc-u19-asia-cup', type: 'U19', category: 'U19 Cricket', startDate: '2025-12-01', endDate: '2025-12-15', season: '2025', status: 'upcoming', pointsTableAvailable: false },
];

const NPL_SERIES = SERIES[0].externalId;
const TRI_SERIES = SERIES[1].externalId;
const UAE_TOUR = SERIES[2].externalId;
const W_SERIES = SERIES[4].externalId;

// [seriesId, teamExternalId, matches, wins, losses, noResult, ties, points, nrr, position]
const POINTS: Array<[string, string, number, number, number, number, number, number, number, number]> = [
  [NPL_SERIES, JKB, 8, 6, 2, 0, 0, 12, 0.862, 1],
  [NPL_SERIES, BRK, 8, 5, 3, 0, 0, 10, 0.54, 2],
  [NPL_SERIES, KTM, 8, 5, 3, 0, 0, 10, 0.312, 3],
  [NPL_SERIES, PKA, 8, 4, 4, 0, 0, 8, -0.045, 4],
  [NPL_SERIES, CHT, 8, 4, 4, 0, 0, 8, -0.21, 5],
  [NPL_SERIES, KAR, 8, 3, 5, 0, 0, 6, -0.388, 6],
  [NPL_SERIES, SDR, 8, 3, 5, 0, 0, 6, -0.455, 7],
  [NPL_SERIES, LBL, 8, 2, 6, 0, 0, 4, -0.74, 8],
];

// [externalId, seriesId, home, away, name, slug, type, venue, city, startOffsetMs | iso, status, matchState, result, tossWinner, tossDecision, isLive, homeScore, awayScore]
type SeedMatch = [string, string | null, string, string, string, string, string, string, string, string | number, string, string | null, string | null, string | null, string | null, boolean, string | null, string | null];
const MATCHES: SeedMatch[] = [
  ['LIVE-1001', NPL_SERIES, JKB, BRK, 'Janakpur Bolts vs Biratnagar Kings', 'janakpur-bolts-vs-biratnagar-kings', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', -2 * 3600 * 1000, 'live', 'Biratnagar need 32 runs off 18 balls', null, 'Janakpur Bolts', 'bat', true, '164/7 (17.2)', null],
  ['LIVE-1002', NPL_SERIES, KTM, PKA, 'Kathmandu Gurkhas vs Pokhara Avengers', 'kathmandu-gurkhas-vs-pokhara-avengers', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', 3 * 3600 * 1000, 'upcoming', 'Match starts at 6:30 PM NPT', null, null, null, false, null, null],
  ['RES-1001', NPL_SERIES, CHT, KAR, 'Chitwan Rhinos vs Karnali Yaks', 'chitwan-rhinos-vs-karnali-yaks', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', -24 * 3600 * 1000, 'completed', null, 'Chitwan Rhinos won by 6 wickets', 'Karnali Yaks', 'bat', false, '142/6 (18.4)', '138/8 (20)'],
  ['RES-1002', TRI_SERIES, NEPAL, UAE, 'Nepal vs UAE', 'nepal-vs-uae', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', -3 * 24 * 3600 * 1000, 'completed', null, 'Nepal won by 32 runs', 'UAE', 'bowl', false, '248/9 (50)', '216 (44.3)'],
  ['RES-1003', TRI_SERIES, UAE, NEPAL, 'UAE vs Nepal', 'uae-vs-nepal', 'ODI', 'Sharjah Cricket Stadium', 'Sharjah', -5 * 24 * 3600 * 1000, 'completed', null, 'UAE won by 4 wickets', 'Nepal', 'bat', false, '232 (48.2)', '233/6 (46.1)'],
  ['UP-1001', UAE_TOUR, UAE, NEPAL, 'UAE vs Nepal', 'uae-vs-nepal-nov-2025', 'ODI', 'Sharjah Cricket Stadium', 'Sharjah', '2025-11-01T08:15:00.000Z', 'upcoming', null, null, null, null, false, null, null],
  ['UP-1002', NPL_SERIES, KAR, LBL, 'Karnali Yaks vs Lumbini Lions', 'karnali-yaks-vs-lumbini-lions', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2025-11-25T07:30:00.000Z', 'upcoming', null, null, null, null, false, null, null],
  ['UP-1003', W_SERIES, NEPAL_W, ZIM, 'Nepal Women vs Zimbabwe Women', 'nepal-women-vs-zimbabwe-women', 'T20', 'Kirtipur Cricket Ground', 'Kirtipur', '2025-10-10T04:15:00.000Z', 'upcoming', null, null, null, null, false, null, null],
];

const NEWS = [
  { title: 'Janakpur Bolts edge Biratnagar Kings in NPL thriller', slug: 'janakpur-bolts-edge-biratnagar-kings-in-npl-thriller', summary: 'A last-over finish at Kirtipur kept the NPL title race alive as Janakpur Bolts held their nerve to seal a dramatic win.', category: 'NPL', tags: ['NPL', 'Janakpur Bolts', 'Biratnagar Kings'], sourceName: 'CricketHub', sourceUrl: 'https://crickethub.com/news/janakpur-bolts-edge-biratnagar-kings-in-npl-thriller', guid: 'seed-001', breaking: true, featured: true, offset: -2 * 3600 * 1000 },
  { title: 'Rohit Paudel climbs Nepal run-charts with record-breaking series', slug: 'rohit-paudel-climbs-nepal-run-charts-with-record-breaking-series', summary: "The Nepal captain produced a Player of the Series display, underlining his status as the team's batting bedrock.", category: 'Nepal Cricket', tags: ['Nepal', 'Rohit Paudel'], sourceName: 'CricketHub', sourceUrl: 'https://crickethub.com/news/rohit-paudel-climbs-nepal-run-charts-with-record-breaking-series', guid: 'seed-002', breaking: false, featured: true, offset: -5 * 3600 * 1000 },
  { title: 'Sandeep Lamichhane returns to T20 franchise circuit', slug: 'sandeep-lamichhane-returns-to-t20-franchise-circuit', summary: "Nepal's most decorated wrist-spinner has rejoined the franchise circuit, adding another chapter to a storied career.", category: 'Player News', tags: ['Players', 'Sandeep Lamichhane'], sourceName: 'CricketHub', sourceUrl: 'https://crickethub.com/news/sandeep-lamichhane-returns-to-t20-franchise-circuit', guid: 'seed-003', breaking: false, featured: false, offset: -24 * 3600 * 1000 },
  { title: 'Nepal U19 set sights on ACC U19 Asia Cup', slug: 'nepal-u19-set-sights-on-acc-u19-asia-cup', summary: 'A young squad has been named as Nepal prepare for their U19 Asia Cup campaign later this year.', category: 'U19 Cricket', tags: ['U19', 'Nepal U19'], sourceName: 'CricketHub', sourceUrl: 'https://crickethub.com/news/nepal-u19-set-sights-on-acc-u19-asia-cup', guid: 'seed-004', breaking: false, featured: false, offset: -2 * 24 * 3600 * 1000 },
  { title: 'Nepal Women gear up for T20I series against Zimbabwe', slug: 'nepal-women-gear-up-for-t20i-series-against-zimbabwe', summary: "The national women's side will host Zimbabwe in a three-match T20I series in Kirtipur next month.", category: "Women's Cricket", tags: ['Nepal Women', "Women's Cricket"], sourceName: 'CricketHub', sourceUrl: 'https://crickethub.com/news/nepal-women-gear-up-for-t20i-series-against-zimbabwe', guid: 'seed-005', breaking: false, featured: false, offset: -3 * 24 * 3600 * 1000 },
];

const VIDEOS = [
  { title: 'NPL 2025 Highlights: Janakpur Bolts vs Biratnagar Kings', slug: 'npl-2025-highlights-janakpur-bolts-vs-biratnagar-kings', description: 'Match highlights from Kirtipur.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', source: 'YouTube', category: 'Highlights', featured: true },
  { title: 'Rohit Paudel: 50 off 34 balls', slug: 'rohit-paudel-50-off-34-balls', description: "A captain's knock under lights.", videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', source: 'YouTube', category: 'Highlights', featured: false },
  { title: 'Sandeep Lamichhane: 5-wicket haul', slug: 'sandeep-lamichhane-5-wicket-haul', description: 'Wrist-spin masterclass.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', source: 'YouTube', category: 'Highlights', featured: false },
];

const ADS = [
  { name: 'Home top banner', slot: 'home_top', format: 'leaderboard', type: 'image', imageUrl: 'https://placehold.co/728x90/0f172a/ffffff?text=Advertise+with+CricketHub', linkUrl: 'https://crickethub.com/advertise' },
  { name: 'Sidebar skyscraper', slot: 'sidebar', format: 'skyscraper', type: 'image', imageUrl: 'https://placehold.co/300x600/0f172a/ffffff?text=Advertise+Here', linkUrl: 'https://crickethub.com/advertise' },
];

async function seed() {
  if (!db.isConfigured) {
    console.error('MongoDB is not configured. Set MONGO_URL in .env');
    process.exit(1);
  }
  await db.connect();

  // Site settings
  await db.collection('site_settings').updateOne(
    { key: 'site' },
    {
      $set: {
        value: {
          name: 'CricketHub',
          domain: 'crickethub.com',
          tagline: 'All Nepal Cricket. One Hub.',
          description: 'Live scores, fixtures, results, news and stats for Nepal cricket, the Nepal Premier League and Nepali players around the world.',
        },
        updatedAt: nowIso(),
      },
    },
    { upsert: true },
  );
  await db.collection('site_settings').updateOne(
    { key: 'navigation' },
    {
      $set: {
        value: {
          home: '/', live: '/live', matches: '/matches', news: '/news',
          npl: '/npl', teams: '/teams', players: '/players', 'points-table': '/points-table',
        },
        updatedAt: nowIso(),
      },
    },
    { upsert: true },
  );

  // Teams
  const teamByExternal = new Map<string, SeedTeam>();
  for (const t of TEAMS) {
    await upsertGet('teams', { externalId: t.externalId }, { ...t });
    teamByExternal.set(t.externalId, t);
  }

  // Series
  for (const s of SERIES) {
    await upsertGet('series', { externalId: s.externalId }, { ...s });
  }

  // Players + stats
  const playerIdBySlug = new Map<string, string>();
  for (const p of PLAYERS) {
    const id = await upsertGet('players', { externalId: p.externalId }, { ...p, isNepal: true });
    playerIdBySlug.set(p.slug, id);
  }
  for (const [slug, format, matches, innings, runs, highScore, average, strikeRate, hundreds, fifties, wickets, economy, bbW, bbR] of STATS) {
    const playerId = playerIdBySlug.get(slug);
    if (!playerId) continue;
    const player = PLAYERS.find((p) => p.slug === slug);
    await db.collection('player_statistics').updateOne(
      { playerId, format },
      {
        $setOnInsert: {
          playerSlug: slug,
          playerName: player?.name ?? slug,
          playerCountry: player?.country ?? 'Nepal',
          playerRole: player?.role ?? 'Batter',
          matches, innings, runs, highScore, average, strikeRate,
          hundreds, fifties, wickets, economy, bestBowlingWickets: bbW, bestBowlingRuns: bbR,
          createdAt: nowIso(),
        },
      },
      { upsert: true },
    );
  }

  // Points tables (denormalised team info)
  for (const [seriesId, teamId, matches, wins, losses, noResult, ties, points, nrr, position] of POINTS) {
    const team = teamByExternal.get(teamId);
    await db.collection('points_table').updateOne(
      { seriesId, teamId },
      {
        $setOnInsert: {
          teamName: team?.name ?? '', shortName: team?.shortName ?? '', slug: team?.slug ?? '',
          logoUrl: null, matches, wins, losses, noResult, ties, points, netRunRate: nrr, position,
          createdAt: nowIso(),
        },
      },
      { upsert: true },
    );
  }

  // Matches (denormalised team names)
  for (const [externalId, seriesId, homeId, awayId, name, slug, matchType, venue, city, start, status, matchState, result, tossWinner, tossDecision, isLive, homeScore, awayScore] of MATCHES) {
    const home = teamByExternal.get(homeId);
    const away = teamByExternal.get(awayId);
    const startTime = typeof start === 'number' ? iso(start) : start;
    await db.collection('matches').updateOne(
      { externalId },
      {
        $setOnInsert: {
          seriesId, homeTeamId: homeId, awayTeamId: awayId, name, slug, matchType, venue, city,
          startTime, status, matchState: matchState ?? null, result: result ?? null,
          tossWinner: tossWinner ?? null, tossDecision: tossDecision ?? null,
          currentInnings: 0, isLive, isWomen: status === 'upcoming' && home?.teamType === 'Womens', isU19: false,
          homeTeam: home?.name ?? 'Home', homeTeamShort: home?.shortName ?? '', homeTeamSlug: home?.slug ?? '',
          awayTeam: away?.name ?? 'Away', awayTeamShort: away?.shortName ?? '', awayTeamSlug: away?.slug ?? '',
          homeScore: homeScore ?? null, awayScore: awayScore ?? null,
          innings: [], commentary: [],
          createdAt: nowIso(),
        },
      },
      { upsert: true },
    );
  }

  // News
  for (const n of NEWS) {
    await db.collection('news').updateOne(
      { originalGuid: n.guid },
      {
        $setOnInsert: {
          title: n.title, slug: n.slug, summary: n.summary, category: n.category,
          tags: n.tags, imageUrl: null, sourceName: n.sourceName, sourceUrl: n.sourceUrl,
          originalGuid: n.guid, isBreaking: n.breaking, isFeatured: n.featured,
          publishedAt: iso(n.offset), status: 'published', createdAt: nowIso(),
        },
      },
      { upsert: true },
    );
  }

  // Videos
  for (const v of VIDEOS) {
    await db.collection('videos').updateOne(
      { slug: v.slug },
      {
        $setOnInsert: {
          title: v.title, slug: v.slug, description: v.description, videoUrl: v.videoUrl,
          thumbnail: v.thumbnail, source: v.source, category: v.category,
          isFeatured: v.featured, publishedAt: nowIso(), createdAt: nowIso(),
        },
      },
      { upsert: true },
    );
  }

  // Advertisements
  for (const ad of ADS) {
    await db.collection('advertisements').updateOne(
      { name: ad.name },
      {
        $setOnInsert: {
          ...ad, startDate: null, endDate: null, enabled: true, createdAt: nowIso(),
        },
      },
      { upsert: true },
    );
  }

  // News sources
  await db.collection('news_sources').updateOne(
    { url: 'internal://crickethub' },
    {
      $setOnInsert: {
        name: 'CricketHub (internal)', url: 'internal://crickethub',
        type: 'rss', category: 'Nepal Cricket', enabled: true, createdAt: nowIso(),
      },
    },
    { upsert: true },
  );

  // Sync status
  await db.collection('sync_status').updateOne(
    { job: 'cricket_sync' },
    { $set: { status: 'idle', lastSuccessAt: nowIso(), lastMessage: 'Seeded with sample data. Awaiting first scheduled run.', updatedAt: nowIso() } },
    { upsert: true },
  );
  await db.collection('sync_status').updateOne(
    { job: 'news_sync' },
    { $set: { status: 'idle', lastSuccessAt: nowIso(), lastMessage: 'Seeded with sample data. Awaiting first scheduled run.', updatedAt: nowIso() } },
    { upsert: true },
  );

  // Admin user (optional)
  const email = process.env.ADMIN_EMAIL;
  if (email) {
    await db.collection('users').updateOne(
      { email },
      { $set: { role: 'admin', isActive: true, updatedAt: nowIso() } },
      { upsert: true },
    );
    logger.info('seed', `Admin ensured for ${email}`);
  }

  logger.info('seed', `Seed complete. Teams=${TEAMS.length}, Series=${SERIES.length}, Players=${PLAYERS.length}, Matches=${MATCHES.length}, News=${NEWS.length}.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
