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
  { externalId: '10000000-0000-0000-0000-000000000030', name: 'Nepal A', shortName: 'NEP-A', slug: 'nepal-a', country: 'Nepal', teamType: 'A Team', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000031', name: 'Nepal Women U19', shortName: 'NEP-W-U19', slug: 'nepal-women-u19', country: 'Nepal', teamType: 'Womens U19', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000032', name: 'Nepal U16', shortName: 'NEP-U16', slug: 'nepal-u16', country: 'Nepal', teamType: 'U16', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000004', name: 'India', shortName: 'IND', slug: 'india', country: 'India', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000005', name: 'Pakistan', shortName: 'PAK', slug: 'pakistan', country: 'Pakistan', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000006', name: 'Sri Lanka', shortName: 'SL', slug: 'sri-lanka', country: 'Sri Lanka', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000007', name: 'Bangladesh', shortName: 'BAN', slug: 'bangladesh', country: 'Bangladesh', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000008', name: 'Afghanistan', shortName: 'AFG', slug: 'afghanistan', country: 'Afghanistan', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000009', name: 'United Arab Emirates', shortName: 'UAE', slug: 'united-arab-emirates', country: 'UAE', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000010', name: 'Oman', shortName: 'OMA', slug: 'oman', country: 'Oman', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000011', name: 'Namibia', shortName: 'NAM', slug: 'namibia', country: 'Namibia', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000012', name: 'Zimbabwe', shortName: 'ZIM', slug: 'zimbabwe', country: 'Zimbabwe', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000013', name: 'West Indies', shortName: 'WI', slug: 'west-indies', country: 'West Indies', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000014', name: 'Scotland', shortName: 'SCO', slug: 'scotland', country: 'Scotland', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000015', name: 'United States', shortName: 'USA', slug: 'united-states', country: 'United States', teamType: 'International', isNational: true },
  { externalId: '10000000-0000-0000-0000-000000000016', name: 'Netherlands', shortName: 'NED', slug: 'netherlands', country: 'Netherlands', teamType: 'International', isNational: true },
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
const NEPAL_A = TEAMS[3].externalId;
const NEPAL_W_U19 = TEAMS[4].externalId;
const NEPAL_U16 = TEAMS[5].externalId;
const UAE = TEAMS[8].externalId;
const OMA = TEAMS[9].externalId;
const NAM = TEAMS[11].externalId;
const ZIM = TEAMS[12].externalId;
const WI = TEAMS[13].externalId;
const SCO = TEAMS[14].externalId;
const USA_SLUG = TEAMS[15].externalId;
const NED = TEAMS[16].externalId;
const JKB = TEAMS[17].externalId;
const BRK = TEAMS[18].externalId;
const KAR = TEAMS[19].externalId;
const PKA = TEAMS[20].externalId;
const CHT = TEAMS[21].externalId;
const LBL = TEAMS[22].externalId;
const SDR = TEAMS[23].externalId;
const KTM = TEAMS[24].externalId;

const PLAYERS: SeedPlayer[] = [
  // ═══════════════════════════════════════════════════════════════════
  // Nepal Men's Senior (source: cricketnepal.org.np, Aug 2026)
  // ═══════════════════════════════════════════════════════════════════
  { externalId: '30000000-0000-0000-0000-000000000001', name: 'Rohit Paudel', slug: 'rohit-paudel', fullName: 'Rohit Kumar Paudel', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'Nepal captain across all formats and one of the most consistent batters in Nepali cricket.' },
  { externalId: '30000000-0000-0000-0000-000000000002', name: 'Sandeep Lamichhane', slug: 'sandeep-lamichhane', fullName: 'Sandeep Lamichhane', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm leg-break', teamId: NEPAL, bio: 'Leg-spinner who has played in franchise leagues around the world.' },
  { externalId: '30000000-0000-0000-0000-000000000003', name: 'Kushal Bhurtel', slug: 'kushal-bhurtel', fullName: 'Kushal Bhurtel', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'Aggressive opening batter and handy medium pacer.' },
  { externalId: '30000000-0000-0000-0000-000000000004', name: 'Karan KC', slug: 'karan-kc', fullName: 'Karan Khatri Chhetri', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast-medium', teamId: NEPAL, bio: 'Pace spearhead of the Nepal attack.' },
  { externalId: '30000000-0000-0000-0000-000000000005', name: 'Sompal Kami', slug: 'sompal-kami', fullName: 'Sompal Kami', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL, bio: 'Experienced seamer and reliable lower-order hitter.' },
  { externalId: '30000000-0000-0000-0000-000000000006', name: 'Aasif Sheikh', slug: 'aasif-sheikh', fullName: 'Aasif Sheikh', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL, bio: 'Wicketkeeper-batter known for counter-attacking knocks.' },
  { externalId: '30000000-0000-0000-0000-000000000007', name: 'Dipendra Singh Airee', slug: 'dipendra-singh-airee', fullName: 'Dipendra Singh Airee', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'Explosive finisher; holds the record for fastest T20I fifty.' },
  { externalId: '30000000-0000-0000-0000-000000000008', name: 'Kushal Malla', slug: 'kushal-malla', fullName: 'Kushal Malla', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL, bio: 'Young left-hander who smashed the fastest ODI fifty.' },
  { externalId: '30000000-0000-0000-0000-000000000009', name: 'Aarif Sheikh', slug: 'aarif-sheikh', fullName: 'Aarif Sheikh', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'Dependable middle-order batter and part-time seamer.' },
  { externalId: '30000000-0000-0000-0000-000000000010', name: 'Gulshan Jha', slug: 'gulshan-jha', fullName: 'Gulshan Kumar Jha', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'Tall left-handed batter who also bowls medium pace.' },
  { externalId: '30000000-0000-0000-0000-000000000011', name: 'Abinash Bohara', slug: 'abinash-bohara', fullName: 'Abinash Bohara', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm leg-break', teamId: NEPAL, bio: 'Leg-spinner with a big leg-break and googly.' },
  { externalId: '30000000-0000-0000-0000-000000000012', name: 'Pratis GC', slug: 'pratis-gc', fullName: 'Pratis GC', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast', teamId: NEPAL, bio: 'Young fast bowler clocking serious speeds.' },
  { externalId: '30000000-0000-0000-0000-000000000013', name: 'Lalit Rajbanshi', slug: 'lalit-rajbanshi', fullName: 'Lalit Rajbanshi', country: 'Nepal', role: 'Bowler', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL, bio: 'Left-arm orthodox spinner in Nepal colours.' },
  { externalId: '30000000-0000-0000-0000-000000000014', name: 'Bibek Yadav', slug: 'bibek-yadav', fullName: 'Bibek Yadav', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL, bio: 'Hard-hitting all-rounder and death-over option.' },
  { externalId: '30000000-0000-0000-0000-000000000015', name: 'Dev Khanal', slug: 'dev-khanal', fullName: 'Dev Khanal', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'Promising top-order batter.' },
  { externalId: '30000000-0000-0000-0000-000000000016', name: 'Anil Kumar Sah', slug: 'anil-kumar-sah', fullName: 'Anil Kumar Sah', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL, bio: 'Experienced wicketkeeper-batter in the middle order.' },
  { externalId: '30000000-0000-0000-0000-000000000017', name: 'Sandeep Jora', slug: 'sandeep-jora', fullName: 'Sandeep Jora', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'Top-order batter with a solid technique.' },
  { externalId: '30000000-0000-0000-0000-000000000018', name: 'Bhim Sharki', slug: 'bhim-sharki', fullName: 'Bhim Sharki', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL, bio: 'Middle-order batter known for his composure.' },
  { externalId: '30000000-0000-0000-0000-000000000019', name: 'Sagar Dhakal', slug: 'sagar-dhakal', fullName: 'Sagar Dhakal', country: 'Nepal', role: 'Bowler', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL, bio: 'Left-arm spinner who has been a regular in the Nepal squad.' },
  { externalId: '30000000-0000-0000-0000-000000000033', name: 'Shahab Alam', slug: 'shahab-alam', fullName: 'Shahab Alam', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'Off-spinner in the Nepal squad.' },
  { externalId: '30000000-0000-0000-0000-000000000034', name: 'Akash Chand', slug: 'akash-chand', fullName: 'Akash Chand', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL, bio: 'Right-arm fast-medium bowler.' },
  { externalId: '30000000-0000-0000-0000-000000000035', name: 'Surya Tamang', slug: 'surya-tamang', fullName: 'Surya Tamang', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'All-rounder from the Nepal squad.' },
  { externalId: '30000000-0000-0000-0000-000000000036', name: 'Rijan Dhakal', slug: 'rijan-dhakal', fullName: 'Rijan Dhakal', country: 'Nepal', role: 'Bowler', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL, bio: 'Left-arm spinner in the Nepal setup.' },
  { externalId: '30000000-0000-0000-0000-000000000037', name: 'Mayan Yadav', slug: 'mayan-yadav', fullName: 'Mayan Yadav', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL, bio: 'Top-order batter in the national squad.' },
  { externalId: '30000000-0000-0000-0000-000000000038', name: 'Dipesh Kandel', slug: 'dipesh-kandel', fullName: 'Dipesh Prasad Kandel', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL, bio: 'All-rounder who bowls off-break and bats in the middle order.' },
  { externalId: '30000000-0000-0000-0000-000000000039', name: 'Rupesh Singh', slug: 'rupesh-singh', fullName: 'Rupesh Singh', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'All-rounder in the Nepal squad.' },
  { externalId: '30000000-0000-0000-0000-000000000040', name: 'Arjun Kumal', slug: 'arjun-kumal', fullName: 'Arjun Kumal', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL, bio: 'Right-hand batter in the Nepal squad.' },
  { externalId: '30000000-0000-0000-0000-000000000041', name: 'Santosh Yadav', slug: 'santosh-yadav', fullName: 'Santosh Yadav', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL, bio: 'Medium-pace bowler in the Nepal setup.' },
  { externalId: '30000000-0000-0000-0000-000000000042', name: 'Lokesh Bam', slug: 'lokesh-bam', fullName: 'Lokesh Bam', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL, bio: 'Young opening batter in the Nepal squad.' },
  { externalId: '30000000-0000-0000-0000-000000000043', name: 'Nandan Yadav', slug: 'nandan-yadav', fullName: 'Nandan Yadav', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL, bio: 'Right-arm medium-fast bowler in the T20 World Cup squad.' },
  { externalId: '30000000-0000-0000-0000-000000000044', name: 'Sher Malla', slug: 'sher-malla', fullName: 'Sher Malla', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Left-arm orthodox', teamId: NEPAL, bio: 'Left-handed all-rounder in the T20 World Cup squad.' },

  // ═══════════════════════════════════════════════════════════════════
  // Nepal Women's Senior (source: cricketnepal.org.np, Aug 2026)
  // ═══════════════════════════════════════════════════════════════════
  { externalId: '30000000-0000-0000-0000-000000000020', name: 'Indu Barma', slug: 'indu-barma', fullName: 'Indu Barma', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL_W, bio: 'Captain of the Nepal Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000021', name: 'Rubina Chhetry', slug: 'rubina-chhetry', fullName: 'Rubina Chhetry', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'Experienced all-rounder in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000022', name: 'Sita Rana Magar', slug: 'sita-rana-magar', fullName: 'Sita Rana Magar', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'Senior batter and bowler in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000023', name: 'Kabita Joshi', slug: 'kabita-joshi', fullName: 'Kabita Joshi', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'Right-arm medium bowler in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000024', name: 'Puja Mahato', slug: 'puja-mahato', fullName: 'Puja Mahato', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL_W, bio: 'Vice-captain and all-rounder in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000025', name: 'Kabita Kunwar', slug: 'kabita-kunwar', fullName: 'Kabita Kunwar', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W, bio: 'Right-hand batter in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000026', name: 'Samjhana Khadka', slug: 'samjhana-khadka', fullName: 'Samjhana Khadka', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'All-rounder in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000027', name: 'Bindu Rawal', slug: 'bindu-rawal', fullName: 'Bindu Rawal', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W, bio: 'Right-hand batter in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000028', name: 'Sana Praveen', slug: 'sana-praveen', fullName: 'Sana Praveen', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W, bio: 'Top-order batter in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000029', name: 'Riya Sharma', slug: 'riya-sharma', fullName: 'Riya Sharma', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'Bowler in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000045', name: 'Seemana KC', slug: 'seemana-kc', fullName: 'Seemana KC', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'All-rounder in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000046', name: 'Sabitri Dhami', slug: 'sabitri-dhami', fullName: 'Sabitri Dhami', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'Medium-pace bowler in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000047', name: 'Roma Thapa', slug: 'roma-thapa', fullName: 'Roma Thapa', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL_W, bio: 'Off-spinner in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000048', name: 'Ishwori Bista', slug: 'ishwori-bista', fullName: 'Ishwori Bista', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W, bio: 'Right-hand batter in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000049', name: 'Krishma Gurung', slug: 'krishma-gurung', fullName: 'Krishma Gurung', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'Leading wicket-taker at the NECOS Cup.' },
  { externalId: '30000000-0000-0000-0000-000000000050', name: 'Jyotsnika Marasini', slug: 'jyotsnika-marasini', fullName: 'Jyotsnika Marasini', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W, bio: 'Right-hand batter in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000051', name: 'Rachana Chaudhary', slug: 'rachana-chaudhary', fullName: 'Rachana Kumari Chaudhary', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'All-rounder in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000052', name: 'Manisha Upadhyay', slug: 'manisha-upadhyay', fullName: 'Manisha Kumari Upadhyay', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W, bio: 'Bowler in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000053', name: 'Kajal Shrestha', slug: 'kajal-shrestha', fullName: 'Kajal Shrestha', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W, bio: 'Wicketkeeper-batter in the Women\'s team.' },
  { externalId: '30000000-0000-0000-0000-000000000054', name: 'Rajmati Airee', slug: 'rajmati-airee', fullName: 'Rajmati Airee', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL_W, bio: 'All-rounder in the Women\'s team.' },

  // ═══════════════════════════════════════════════════════════════════
  // Nepal A (source: cricketnepal.org.np, Aug 2026)
  // ═══════════════════════════════════════════════════════════════════
  { externalId: '30000000-0000-0000-0000-000000000055', name: 'Anil Kumar Sah', slug: 'anil-kumar-sah-a', fullName: 'Anil Kumar Sah', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_A, bio: 'Captain of Nepal A.' },
  { externalId: '30000000-0000-0000-0000-000000000056', name: 'Narayan Joshi', slug: 'narayan-joshi', fullName: 'Narayan Joshi', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_A, bio: 'All-rounder in Nepal A.' },
  { externalId: '30000000-0000-0000-0000-000000000057', name: 'Pawan Sarraf', slug: 'pawan-sarraf', fullName: 'Pawan Sarraf', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_A, bio: 'All-rounder in Nepal A.' },
  { externalId: '30000000-0000-0000-0000-000000000058', name: 'Bipin Khatri', slug: 'bipin-khatri', fullName: 'Bipin Khatri', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_A, bio: 'Medium-pace bowler in Nepal A.' },
  { externalId: '30000000-0000-0000-0000-000000000059', name: 'Rashid Khan', slug: 'rashid-khan-nepal', fullName: 'Rashid Khan', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: NEPAL_A, bio: 'Off-spinner in Nepal A.' },
  { externalId: '30000000-0000-0000-0000-000000000060', name: 'Yuvraj Khatri', slug: 'yuvraj-khatri', fullName: 'Yuvraj Khatri', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm leg-break', teamId: NEPAL_A, bio: 'Leg-spinner in Nepal A.' },
  { externalId: '30000000-0000-0000-0000-000000000061', name: 'Deepak Dumre', slug: 'deepak-dumre', fullName: 'Deepak Dumre', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_A, bio: 'Right-hand batter in Nepal A.' },
  { externalId: '30000000-0000-0000-0000-000000000062', name: 'Trit Raj Das', slug: 'trit-raj-das', fullName: 'Trit Raj Das', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_A, bio: 'All-rounder in Nepal A.' },
  { externalId: '30000000-0000-0000-0000-000000000063', name: 'Basir Ahamad', slug: 'basir-ahamad', fullName: 'Basir Ahamad', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL_A, bio: 'Fast-medium bowler in Nepal A.' },

  // ═══════════════════════════════════════════════════════════════════
  // Nepal Men's U19 (source: cricketnepal.org.np, ACC U19 Asia Cup 2025-2026)
  // ═══════════════════════════════════════════════════════════════════
  { externalId: '30000000-0000-0000-0000-000000000070', name: 'Naren Bhatta', slug: 'naren-bhatta', fullName: 'Naren Bhattacharya', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U19, bio: 'Captain of Nepal U19.' },
  { externalId: '30000000-0000-0000-0000-000000000071', name: 'Abhishek Tiwari', slug: 'abhishek-tiwari', fullName: 'Abhishek Tiwari', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: NEPAL_U19, bio: 'Vice-captain of Nepal U19. NPL experience with Pokhara Avengers.' },
  { externalId: '30000000-0000-0000-0000-000000000072', name: 'Niraj Kumar Yadav', slug: 'niraj-kumar-yadav', fullName: 'Niraj Kumar Yadav', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U19, bio: 'Right-hand batter from Madhesh Province.' },
  { externalId: '30000000-0000-0000-0000-000000000073', name: 'Sahil Patel', slug: 'sahil-patel', fullName: 'Sahil Patel', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U19, bio: 'Wicketkeeper-batter. NPL experience with Biratnagar Kings.' },
  { externalId: '30000000-0000-0000-0000-000000000074', name: 'Cibrin Shrestha', slug: 'cibrin-shrestha', fullName: 'Cibrin Shrestha', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL_U19, bio: 'Left-handed all-rounder from Gandaki Province.' },
  { externalId: '30000000-0000-0000-0000-000000000075', name: 'Roshan Bishwakarma', slug: 'roshan-bishwakarma', fullName: 'Roshan Bishwakarma', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U19, bio: 'Right-hand batter from Bagmati Province.' },
  { externalId: '30000000-0000-0000-0000-000000000076', name: 'Darsh Sonar', slug: 'darsh-sonar', fullName: 'Darsh Sonar', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U19, bio: 'Right-hand batter in the U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000077', name: 'Dilsad Ali', slug: 'dilsad-ali', fullName: 'Dilsad Ali', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U19, bio: 'Wicketkeeper-batter from Lumbini Province.' },
  { externalId: '30000000-0000-0000-0000-000000000078', name: 'Santosh Yadav', slug: 'santosh-yadav-u19', fullName: 'Santosh Yadav', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U19, bio: 'All-rounder in the U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000079', name: 'Ashok Dhami', slug: 'ashok-dhami', fullName: 'Ashok Dhami', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL_U19, bio: 'Captain of Nepal U19 (previous squad). All-rounder from Sudurpashchim.' },
  { externalId: '30000000-0000-0000-0000-000000000080', name: 'Dayanand Mandal', slug: 'dayanand-mandal', fullName: 'Dayanand Mandal', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Left-arm medium', teamId: NEPAL_U19, bio: 'Left-arm medium pacer from Bagmati Province.' },
  { externalId: '30000000-0000-0000-0000-000000000081', name: 'Aprajit Poudel', slug: 'aprajit-poudel', fullName: 'Aprajit Poudel', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U19, bio: 'Medium-pace bowler in the U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000082', name: 'Bipin Sharma', slug: 'bipin-sharma-u19', fullName: 'Bipin Prasad Sharma', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL_U19, bio: 'Left-arm orthodox spinner from Karnali Province. NPL experience with Karnali Yaks.' },
  { externalId: '30000000-0000-0000-0000-000000000083', name: 'Vansh Chhetri', slug: 'vansh-chhetri', fullName: 'Vansh Chhetri', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U19, bio: 'Right-hand batter from Gandaki Province.' },
  { externalId: '30000000-0000-0000-0000-000000000084', name: 'Nischal Kshetri', slug: 'nischal-kshetri', fullName: 'Nischal Kshetri', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U19, bio: 'Right-hand batter from Sudurpaschim Province.' },
  { externalId: '30000000-0000-0000-0000-000000000085', name: 'Nitesh Patel', slug: 'nitesh-patel', fullName: 'Nitesh Patel', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U19, bio: 'Right-arm medium pacer from Madhesh Province.' },
  { externalId: '30000000-0000-0000-0000-000000000086', name: 'Arvind Gharti', slug: 'arvind-gharti', fullName: 'Arvind Gharti', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U19, bio: 'All-rounder in the U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000087', name: 'Sohail Kunwar', slug: 'sohail-kunwar', fullName: 'Sohail Kunwar', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U19, bio: 'Right-hand batter in the U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000088', name: 'Amar Mishra', slug: 'amar-mishra', fullName: 'Amar Mishra', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U19, bio: 'Medium-pace bowler in the U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000089', name: 'Aashish Lohar', slug: 'aashish-lohar', fullName: 'Aashish Lohar', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U19, bio: 'Wicketkeeper-batter from Sudurpashchim Province.' },

  // ═══════════════════════════════════════════════════════════════════
  // Nepal Women's U19 (source: cricnepal.com, ACC Women's U19 Premier Cup 2026)
  // ═══════════════════════════════════════════════════════════════════
  { externalId: '30000000-0000-0000-0000-000000000090', name: 'Sony Pakhrin', slug: 'sony-pakhrin', fullName: 'Sony Pakhrin', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'Captain of Nepal Women U19. Standout performer at NECOS Cup.' },
  { externalId: '30000000-0000-0000-0000-000000000091', name: 'Anjila Pathak', slug: 'anjila-pathak', fullName: 'Anjila Pathak', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'All-rounder in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000092', name: 'Karuna Bista', slug: 'karuna-bista', fullName: 'Karuna Bista', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W_U19, bio: 'Right-hand batter in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000093', name: 'Pratima Sah', slug: 'pratima-sah', fullName: 'Pratima Sah', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W_U19, bio: 'Right-hand batter in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000094', name: 'Trisana Bishwokarma', slug: 'trisana-bishwokarma', fullName: 'Trisana Bishwokarma', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'All-rounder in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000095', name: 'Alisha Yadav', slug: 'alisha-yadav', fullName: 'Alisha Yadav', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W_U19, bio: 'Wicketkeeper-batter in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000096', name: 'Manisha Upadhyay', slug: 'manisha-upadhyay-u19', fullName: 'Manisha Upadhyay', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'Bowler in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000097', name: 'Riya Sharma', slug: 'riya-sharma-u19', fullName: 'Riya Sharma', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'Bowler in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000098', name: 'Rachana Chaudhary', slug: 'rachana-chaudhary-u19', fullName: 'Rachana Chaudhary', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'All-rounder in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000099', name: 'Krishma Gurung', slug: 'krishma-gurung-u19', fullName: 'Krishma Gurung', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'Bowler in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000100', name: 'Manisha Chaudhary', slug: 'manisha-chaudhary', fullName: 'Manisha Chaudhary', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'Bowler in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000101', name: 'Sneha Mahara', slug: 'sneha-mahara', fullName: 'Sneha Mahara', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'Bowler in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000102', name: 'Prisana Rana Magar', slug: 'prisana-rana-magar', fullName: 'Prisana Rana Magar', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W_U19, bio: 'Right-hand batter in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000103', name: 'Sakshi Yadav', slug: 'sakshi-yadav', fullName: 'Sakshi Yadav', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W_U19, bio: 'Right-hand batter in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000104', name: 'Ashna Chaudhary', slug: 'ashna-chaudhary', fullName: 'Ashna Chaudhary', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W_U19, bio: 'Right-hand batter in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000105', name: 'Anu Kadayat', slug: 'anu-kadayat', fullName: 'Anu Kadayat', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_W_U19, bio: 'Batting all-rounder in the Women U19 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000106', name: 'Sana Praveen', slug: 'sana-praveen-u19', fullName: 'Sana Praveen', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_W_U19, bio: 'Top-order batter in the Women U19 squad.' },

  // ═══════════════════════════════════════════════════════════════════
  // Nepal Men's U16 (source: cricketnepal.org.np, ACC U16 East Zone Cup 2025)
  // ═══════════════════════════════════════════════════════════════════
  { externalId: '30000000-0000-0000-0000-000000000110', name: 'Bipin Prasad Sharma', slug: 'bipin-prasad-sharma', fullName: 'Bipin Prasad Sharma', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: NEPAL_U16, bio: 'Captain of Nepal U16. Youngest player in inaugural NPL with Karnali Yaks.' },
  { externalId: '30000000-0000-0000-0000-000000000111', name: 'Suryanshu Koirala', slug: 'suryanshu-koirala', fullName: 'Suryanshu Koirala', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U16, bio: 'Vice-captain of Nepal U16.' },
  { externalId: '30000000-0000-0000-0000-000000000112', name: 'Shiwansh Bajgai', slug: 'shiwansh-bajgai', fullName: 'Shiwansh Bajgai', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U16, bio: 'Wicketkeeper-batter in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000113', name: 'Parimarjan Yadav', slug: 'parimarjan-yadav', fullName: 'Parimarjan Yadav', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U16, bio: 'Wicketkeeper-batter in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000114', name: 'Raunak Shrivastav', slug: 'raunak-shrivastav', fullName: 'Raunak Shrivastav', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U16, bio: 'Right-hand batter who smashed a double century for Lumbini in national tournament.' },
  { externalId: '30000000-0000-0000-0000-000000000115', name: 'Abhay Yadav', slug: 'abhay-yadav', fullName: 'Abhay Yadav', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U16, bio: 'Right-hand batter in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000116', name: 'Sachin Bhatta', slug: 'sachin-bhatta', fullName: 'Sachin Bhatta', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U16, bio: 'Impressive bowler throughout the national tournament.' },
  { externalId: '30000000-0000-0000-0000-000000000117', name: 'Sugam Budhathoki', slug: 'sugam-budhathoki', fullName: 'Sugam Budhathoki', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U16, bio: 'Right-hand batter in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000118', name: 'Suyog Bhattarai', slug: 'suyog-bhattarai', fullName: 'Suyog Bhattarai', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U16, bio: 'All-rounder in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000119', name: 'Sushil Rawal', slug: 'sushil-rawal', fullName: 'Sushil Rawal', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U16, bio: 'All-rounder in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000120', name: 'Shubham Khanal', slug: 'shubham-khanal', fullName: 'Shubham Khanal', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U16, bio: 'Medium-pace bowler in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000121', name: 'Prasiddha Jaishi', slug: 'prasiddha-jaishi', fullName: 'Prasiddha Jaishi', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U16, bio: 'Medium-pace bowler in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000122', name: 'Joy Thapa', slug: 'joy-thapa', fullName: 'Joy Thapa', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', teamId: NEPAL_U16, bio: 'Right-hand batter in the U16 squad.' },
  { externalId: '30000000-0000-0000-0000-000000000123', name: 'Roshan Shahi', slug: 'roshan-shahi', fullName: 'Roshan Shahi', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: NEPAL_U16, bio: 'Medium-pace bowler in the U16 squad.' },
];

// [playerSlug, format, matches, innings, runs, highScore, average, strikeRate, hundreds, fifties, wickets, economy, bbW, bbR]
const STATS: Array<[string, string, number, number, number, number, number, number, number, number, number, number, number, number]> = [
  // Nepal Men's Senior
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
  { externalId: '20000000-0000-0000-0000-000000000001', name: 'Nepal Premier League 2025', slug: 'nepal-premier-league-2025', type: 'NPL', category: 'NPL', startDate: '2025-11-15', endDate: '2025-12-14', season: '2025', status: 'completed', pointsTableAvailable: true },
  { externalId: '20000000-0000-0000-0000-000000000004', name: "ICC Men's T20 World Cup 2026", slug: 'icc-mens-t20-world-cup-2026', type: 'International', category: 'International Cricket', startDate: '2026-02-15', endDate: '2026-03-08', season: '2026', status: 'completed', pointsTableAvailable: false },
  { externalId: '20000000-0000-0000-0000-000000000007', name: 'ICC CWC League 2 — Nepal/UAE/Oman', slug: 'cwcl2-nepal-uae-oman-2026', type: 'International', category: 'ICC CWC League 2', startDate: '2026-04-25', endDate: '2026-05-05', season: '2026', status: 'completed', pointsTableAvailable: true },
  { externalId: '20000000-0000-0000-0000-000000000008', name: 'ICC CWC League 2 — Nepal/Scotland/USA', slug: 'cwcl2-nepal-scotland-usa-2026', type: 'International', category: 'ICC CWC League 2', startDate: '2026-05-12', endDate: '2026-05-22', season: '2026', status: 'completed', pointsTableAvailable: true },
  { externalId: '20000000-0000-0000-0000-000000000009', name: 'ICC CWC League 2 — Nepal/Netherlands/Namibia', slug: 'cwcl2-nepal-netherlands-namibia-2026', type: 'International', category: 'ICC CWC League 2', startDate: '2026-07-21', endDate: '2026-07-31', season: '2026', status: 'completed', pointsTableAvailable: true },
];

const NPL_SERIES = SERIES[0].externalId;
const T20WC = SERIES[1].externalId;
const CWCL2_UOE = SERIES[2].externalId;
const CWCL2_SUA = SERIES[3].externalId;
const CWCL2_NNL = SERIES[4].externalId;

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
  // ─── NPL 2025 ──────────────────────────────────────────────
  ['LIVE-1001', NPL_SERIES, JKB, BRK, 'Janakpur Bolts vs Biratnagar Kings', 'janakpur-bolts-vs-biratnagar-kings', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', -2 * 3600 * 1000, 'live', 'Biratnagar need 32 runs off 18 balls', null, 'Janakpur Bolts', 'bat', true, '164/7 (17.2)', null],
  ['LIVE-1002', NPL_SERIES, KTM, PKA, 'Kathmandu Gurkhas vs Pokhara Avengers', 'kathmandu-gurkhas-vs-pokhara-avengers', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', 3 * 3600 * 1000, 'upcoming', 'Match starts at 6:30 PM NPT', null, null, null, false, null, null],
  ['RES-1001', NPL_SERIES, CHT, KAR, 'Chitwan Rhinos vs Karnali Yaks', 'chitwan-rhinos-vs-karnali-yaks', 'T20', 'Tribhuvan University International Cricket Ground', 'Kirtipur', -24 * 3600 * 1000, 'completed', null, 'Chitwan Rhinos won by 6 wickets', 'Karnali Yaks', 'bat', false, '142/6 (18.4)', '138/8 (20)'],

  // ─── ICC Men's T20 World Cup 2026 (India & Sri Lanka) ──────
  ['T20WC-1001', T20WC, NEPAL, WI, 'Nepal vs West Indies', 'nepal-vs-west-indies-t20wc', 'T20', 'Wankhede Stadium', 'Mumbai', '2026-02-15T05:30:00.000Z', 'completed', null, 'West Indies won by 5 wickets', 'Nepal', 'bat', false, '156/8 (20)', '157/5 (18.2)'],
  ['T20WC-1002', T20WC, SCO, NEPAL, 'Scotland vs Nepal', 'scotland-vs-nepal-t20wc', 'T20', 'Wankhede Stadium', 'Mumbai', '2026-02-17T13:30:00.000Z', 'completed', null, 'Nepal won by 7 wickets', 'Scotland', 'bat', false, '132/9 (20)', '133/3 (16.4)'],

  // ─── ICC CWC League 2 — Nepal/UAE/Oman (Kirtipur) ──────────
  ['CWCL2UOE-1001', CWCL2_UOE, NEPAL, UAE, 'Nepal vs UAE', 'nepal-vs-uae-cwcl2-apr', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2026-04-25T04:00:00.000Z', 'completed', null, 'Nepal won by 48 runs', 'Nepal', 'bat', false, '267/8 (50)', '219 (43.3)'],
  ['CWCL2UOE-1002', CWCL2_UOE, OMA, NEPAL, 'Oman vs Nepal', 'oman-vs-nepal-cwcl2-apr', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2026-04-29T04:00:00.000Z', 'completed', null, 'Nepal won by 6 wickets', 'Oman', 'bat', false, '198 (46.2)', '199/4 (38.1)'],
  ['CWCL2UOE-1003', CWCL2_UOE, NEPAL, UAE, 'Nepal vs UAE', 'nepal-vs-uae-cwcl2-may1', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2026-05-01T04:00:00.000Z', 'completed', null, 'UAE won by 3 wickets', 'Nepal', 'bat', false, '224/9 (50)', '225/7 (47.4)'],
  ['CWCL2UOE-1004', CWCL2_UOE, OMA, NEPAL, 'Oman vs Nepal', 'oman-vs-nepal-cwcl2-may5', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2026-05-05T04:00:00.000Z', 'completed', null, 'Nepal won by 7 wickets', 'Oman', 'bat', false, '176 (44.1)', '177/3 (33.5)'],

  // ─── ICC CWC League 2 — Nepal/Scotland/USA (Kirtipur) ──────
  ['CWCL2SUA-1001', CWCL2_SUA, NEPAL, SCO, 'Nepal vs Scotland', 'nepal-vs-scotland-cwcl2-may12', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2026-05-12T04:00:00.000Z', 'completed', null, 'Scotland won by 2 runs (DLS)', 'Scotland', 'bat', false, '243/8 (50)', '218/7 (39)'],
  ['CWCL2SUA-1002', CWCL2_SUA, USA_SLUG, NEPAL, 'USA vs Nepal', 'usa-vs-nepal-cwcl2-may16', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2026-05-16T04:00:00.000Z', 'completed', null, 'Nepal won by 9 wickets', 'USA', 'bat', false, '195 (43.3)', '199/1 (36.4)'],
  ['CWCL2SUA-1003', CWCL2_SUA, NEPAL, SCO, 'Nepal vs Scotland', 'nepal-vs-scotland-cwcl2-may18', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2026-05-18T04:00:00.000Z', 'completed', null, 'Nepal won by 6 wickets', 'Scotland', 'bat', false, '194 (39.1)', '199/4 (38.1)'],
  ['CWCL2SUA-1004', CWCL2_SUA, NEPAL, USA_SLUG, 'Nepal vs USA', 'nepal-vs-usa-cwcl2-may22', 'ODI', 'Tribhuvan University International Cricket Ground', 'Kirtipur', '2026-05-22T04:00:00.000Z', 'completed', null, 'Nepal won by 122 runs', 'Nepal', 'bat', false, '317/8 (50)', '195 (41.2)'],

  // ─── ICC CWC League 2 — Nepal/Netherlands/Namibia (Utrecht) ─
  ['CWCL2NNL-1001', CWCL2_NNL, NEPAL, NAM, 'Nepal vs Namibia', 'nepal-vs-namibia-cwcl2-jul21', 'ODI', 'Sportpark Maarschalkerweerd', 'Utrecht', '2026-07-21T09:15:00.000Z', 'completed', null, 'Nepal won by 3 wickets', 'Namibia', 'bat', false, '215 (48.2)', '216/7 (45.5)'],
  ['CWCL2NNL-1002', CWCL2_NNL, NED, NEPAL, 'Netherlands vs Nepal', 'netherlands-vs-nepal-cwcl2-jul23', 'ODI', 'Sportpark Maarschalkerweerd', 'Utrecht', '2026-07-23T09:15:00.000Z', 'completed', null, 'Netherlands won by 5 runs', 'Netherlands', 'bat', false, '241/7 (50)', '236 (49.3)'],
  ['CWCL2NNL-1003', CWCL2_NNL, NAM, NEPAL, 'Namibia vs Nepal', 'namibia-vs-nepal-cwcl2-jul27', 'ODI', 'Sportpark Maarschalkerweerd', 'Utrecht', '2026-07-27T09:15:00.000Z', 'completed', null, 'Nepal won by 42 runs', 'Nepal', 'bat', false, '278/6 (50)', '236 (42.1)'],
  ['CWCL2NNL-1004', CWCL2_NNL, NEPAL, NED, 'Nepal vs Netherlands', 'nepal-vs-netherlands-cwcl2-jul29', 'ODI', 'Sportpark Maarschalkerweerd', 'Utrecht', '2026-07-29T09:15:00.000Z', 'completed', null, 'Nepal won by 28 runs', 'Nepal', 'bat', false, '285/7 (50)', '257 (46.4)'],

  // ─── Upcoming Nepal matches ─────────────────────────────────
  ['UP-1001', CWCL2_NNL, NEPAL, UAE, 'Nepal vs UAE', 'nepal-vs-uae-oct-2026', 'ODI', 'Al Amerat Cricket Ground', 'Muscat', '2026-10-08T04:00:00.000Z', 'upcoming', null, null, null, null, false, null, null],
  ['UP-1002', CWCL2_NNL, NEPAL, OMA, 'Nepal vs Oman', 'nepal-vs-oman-oct-2026', 'ODI', 'Al Amerat Cricket Ground', 'Muscat', '2026-10-12T04:00:00.000Z', 'upcoming', null, null, null, null, false, null, null],
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

  // Live streams (YouTube embeds — inline, no outbound links, no channel branding)
  const LIVE_STREAMS = [
    { title: "Men's T20 World Cup 2026 LIVE", videoId: 'mhEoBlRqfaE', order: 1 },
    { title: "Men's T20 World Cup 2026 LIVE", videoId: 'iHT48AVOQ80', order: 2 },
    { title: "Men's T20 World Cup 2026 LIVE", videoId: 're9P6hmJ_sY', order: 3 },
    { title: "Men's T20 World Cup 2026 LIVE", videoId: 'iOid998g1eI', order: 4 },
    { title: "Men's T20 World Cup 2026 LIVE", videoId: 'M7-F_oMl7nk', order: 5 },
  ];
  for (const stream of LIVE_STREAMS) {
    await db.collection('live_streams').updateOne(
      { videoId: stream.videoId },
      {
        $set: {
          title: stream.title,
          videoId: stream.videoId,
          embedUrl: `https://www.youtube.com/embed/${stream.videoId}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&controls=0`,
          platform: 'youtube',
          order: stream.order,
          enabled: true,
          updatedAt: nowIso(),
        },
        $setOnInsert: {
          createdAt: nowIso(),
        },
      },
      { upsert: true },
    );
  }

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

  logger.info('seed', `Seed complete. Teams=${TEAMS.length}, Series=${SERIES.length}, Players=${PLAYERS.length} (Men: ${PLAYERS.filter(p => p.teamId === NEPAL).length}, Women: ${PLAYERS.filter(p => p.teamId === NEPAL_W).length}, A: ${PLAYERS.filter(p => p.teamId === NEPAL_A).length}, U19: ${PLAYERS.filter(p => p.teamId === NEPAL_U19).length}, W U19: ${PLAYERS.filter(p => p.teamId === NEPAL_W_U19).length}, U16: ${PLAYERS.filter(p => p.teamId === NEPAL_U16).length}), Matches=${MATCHES.length}, News=${NEWS.length}.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
