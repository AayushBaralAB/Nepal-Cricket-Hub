import axios from 'axios';
import { db } from '../db';
import { logger } from '../utils/logger';
import { nowIso, slugify, safeNum } from '../utils/helpers';
import type { InningsData, PointsRow } from '../types/cricket';

/**
 * One-time importer for the 2024 Nepal Premier League (NPL) season.
 * Source: https://nepal-premiere-league-npl-api.vercel.app/api/npl/
 *
 * Idempotent — safe to re-run. Run with: pnpm import:npl
 *
 * Writes teams + rosters, the NPL 2024 series, all 32 completed matches
 * (with embedded innings) and the points table into MongoDB. Restart the API
 * afterwards so the in-memory cache re-primes from the database.
 */

const NPL_API_URL = 'https://nepal-premiere-league-npl-api.vercel.app/api/npl/';

const NPL_2024_SERIES_ID = 'npl-2024';

// Reuse the franchise ids used by seed.ts so the imported matches line up with
// the same teams as the NPL 2025 seed data. Anything else is created on demand.
const SITE_TEAM_ID_BY_NAME: Record<string, string> = {
  'Janakpur Bolts': '10000000-0000-0000-0000-000000000020',
  'Biratnagar Kings': '10000000-0000-0000-0000-000000000021',
  'Karnali Yaks': '10000000-0000-0000-0000-000000000022',
  'Pokhara Avengers': '10000000-0000-0000-0000-000000000023',
  'Chitwan Rhinos': '10000000-0000-0000-0000-000000000024',
  'Lumbini Lions': '10000000-0000-0000-0000-000000000025',
  'Sudurpaschim Royals': '10000000-0000-0000-0000-000000000026',
  'Kathmandu Gurkhas': '10000000-0000-0000-0000-000000000027',
};

// API team codes plus the site's own short names, all mapped to franchise names.
const TEAM_NAME_BY_CODE: Record<string, string> = {
  JB: 'Janakpur Bolts', JKB: 'Janakpur Bolts',
  BK: 'Biratnagar Kings', BRK: 'Biratnagar Kings',
  CWR: 'Chitwan Rhinos', CHT: 'Chitwan Rhinos',
  KNY: 'Karnali Yaks', KAR: 'Karnali Yaks',
  KMG: 'Kathmandu Gurkhas', KTM: 'Kathmandu Gurkhas',
  LBL: 'Lumbini Lions',
  PKA: 'Pokhara Avengers',
  SPR: 'Sudurpaschim Royals', SDR: 'Sudurpaschim Royals',
};

interface NplTeam {
  id?: string;
  name?: string;
  marquee_player?: string;
  players?: string[];
}

interface NplScore {
  team?: string;
  runs?: number;
  wickets?: number;
  overs?: number;
}

interface NplRawMatch {
  [key: string]: unknown;
  date?: string;
  time?: string;
  match_number?: string | number;
  TITLE?: string;
  title?: string;
  PAIRINGS?: string[];
  pairings?: string[];
  location?: string;
  venue?: string;
  score?: NplScore[];
  result?: string;
  toss_result?: string;
}

/** Read the first present key from an object (API keys are inconsistently cased). */
function field(obj: NplRawMatch, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function titleCase(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function cleanMatchName(raw: string): string {
  return raw
    .split(/\s+VS\s+/i)
    .map((part) => titleCase(part))
    .join(' vs ');
}

/** "2024/11/30" + "12:15 PM" (Nepal local, UTC+5:45) -> ISO UTC string. */
function parseStart(dateStr: string, timeStr: string): string | null {
  const [y, m, d] = String(dateStr).split('/').map(Number);
  if (!y || !m || !d) return null;
  const t = String(timeStr ?? '').trim();
  let hour = 0;
  let min = 0;
  const match = t.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    hour = Number(match[1]);
    min = Number(match[2]);
  }
  if (/PM/i.test(t) && hour < 12) hour += 12;
  if (/AM/i.test(t) && hour === 12) hour = 0;
  const utc = Date.UTC(y, m - 1, d, hour - 5, min - 45);
  return Number.isNaN(utc) ? null : new Date(utc).toISOString();
}

function parseToss(toss: string): { winner: string; decision: 'bat' | 'bowl' } | null {
  const match = /^(.+?)\s+won the toss and elected to (bat|field|bowl)/i.exec(String(toss ?? '').trim());
  if (!match) return null;
  const decision = match[2].toLowerCase() === 'field' ? 'bowl' : match[2].toLowerCase() as 'bat' | 'bowl';
  return { winner: titleCase(match[1].trim()), decision };
}

function toRunRate(runs: number, overs: number): number {
  const whole = Math.floor(overs);
  const frac = Math.round((overs - whole) * 10);
  const balls = whole * 6 + frac;
  return balls > 0 ? (runs * 6) / balls : 0;
}

async function upsertSeries() {
  await db.collection('series').updateOne(
    { externalId: NPL_2024_SERIES_ID },
    {
      $setOnInsert: {
        name: 'Nepal Premier League 2024',
        slug: 'nepal-premier-league-2024',
        type: 'NPL',
        category: 'NPL',
        startDate: '2024-11-30',
        endDate: '2024-12-21',
        season: '2024',
        status: 'completed',
        pointsTableAvailable: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    },
    { upsert: true },
  );
}

async function resolveTeam(name: string, code: string): Promise<Record<string, unknown>> {
  const existing = await db.collection('teams').findOne({ name });
  if (existing) return existing;
  const externalId = SITE_TEAM_ID_BY_NAME[name] ?? `npl-2024-${code.toLowerCase()}`;
  await db.collection('teams').updateOne(
    { externalId },
    {
      $setOnInsert: {
        externalId,
        name,
        shortName: code,
        slug: slugify(name),
        logoUrl: null,
        country: 'Nepal',
        teamType: 'NPL',
        isNational: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    },
    { upsert: true },
  );
  const created = await db.collection('teams').findOne({ externalId });
  return created ?? { externalId, name, shortName: code, slug: slugify(name) };
}

async function importTeamsAndPlayers(apiTeams: NplTeam[]) {
  const teamByCode = new Map<string, Record<string, unknown>>();
  const teamByName = new Map<string, Record<string, unknown>>();
  let players = 0;

  for (const t of apiTeams) {
    const name = titleCase(String(t.name ?? ''));
    const code = String(t.id ?? '');
    if (!name) continue;
    const team = await resolveTeam(name, code);
    teamByCode.set(code, team);
    teamByName.set(name, team);

    for (const playerName of t.players ?? []) {
      const pname = titleCase(String(playerName));
      if (!pname) continue;
      const slug = slugify(pname);
      await db.collection('players').updateOne(
        { slug },
        {
          $setOnInsert: {
            externalId: `npl-2024-${slug}`,
            name: pname,
            fullName: pname,
            slug,
            photoUrl: null,
            country: 'Nepal',
            role: 'Batter',
            battingStyle: null,
            bowlingStyle: null,
            teamId: String(team.externalId ?? ''),
            isNepal: true,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          },
        },
        { upsert: true },
      );
      players += 1;
    }
  }

  return { teamByCode, teamByName, players };
}

function scoreLabel(entry: NplScore): string | null {
  if (entry.runs === undefined) return null;
  const overs = entry.overs !== undefined ? ` (${entry.overs})` : '';
  return `${entry.runs}/${entry.wickets ?? 0}${overs}`;
}

async function importMatches(rawMatches: Record<string, NplRawMatch>, teamByCode: Map<string, Record<string, unknown>>) {
  const matches = Object.values(rawMatches)
    .map((m) => ({ m, key: `${String(m.date ?? '')} ${String(m.time ?? '')}` }))
    .sort((a, b) => a.key.localeCompare(b.key));

  let imported = 0;
  for (let i = 0; i < matches.length; i++) {
    const raw = matches[i].m;
    const name = cleanMatchName(String(field(raw, ['TITLE', 'title']) ?? ''));
    const pairings = (field(raw, ['PAIRINGS', 'pairings']) as string[] | undefined) ?? [];
    if (!name || pairings.length < 2) continue;

    const homeName = TEAM_NAME_BY_CODE[String(pairings[0]).toUpperCase()] ?? titleCase(String(pairings[0]));
    const awayName = TEAM_NAME_BY_CODE[String(pairings[1]).toUpperCase()] ?? titleCase(String(pairings[1]));
    const home = teamByCode.get(String(pairings[0])) ?? (await resolveTeam(homeName, String(pairings[0])));
    const away = teamByCode.get(String(pairings[1])) ?? (await resolveTeam(awayName, String(pairings[1])));

    const startTime = parseStart(String(raw.date ?? ''), String(raw.time ?? '')) ?? new Date().toISOString();
    const venue = String(field(raw, ['venue', 'location']) ?? '');
    const toss = parseToss(String(raw.toss_result ?? ''));

    const innings: InningsData[] = [];
    const score = Array.isArray(raw.score) ? raw.score : [];
    score.forEach((entry, idx) => {
      const entryTeamName = TEAM_NAME_BY_CODE[String(entry.team ?? '').toUpperCase()]
        ?? titleCase(String(entry.team ?? ''));
      const battingTeam = entryTeamName === homeName ? home : away;
      innings.push({
        inningsNumber: idx + 1,
        battingTeamId: String(battingTeam.externalId ?? ''),
        battingTeam: String(battingTeam.name ?? entryTeamName),
        runs: safeNum(entry.runs),
        wickets: safeNum(entry.wickets),
        overs: safeNum(entry.overs),
        runRate: toRunRate(safeNum(entry.runs), safeNum(entry.overs)),
        target: idx > 0 && innings[0] ? innings[0].runs + 1 : undefined,
        isCompleted: true,
      });
    });

    const homeScores = score.filter((s) => {
      const n = TEAM_NAME_BY_CODE[String(s.team ?? '').toUpperCase()] ?? titleCase(String(s.team ?? ''));
      return n === homeName;
    });
    const awayScores = score.filter((s) => {
      const n = TEAM_NAME_BY_CODE[String(s.team ?? '').toUpperCase()] ?? titleCase(String(s.team ?? ''));
      return n === awayName;
    });

    await db.collection('matches').updateOne(
      { externalId: `NPL-2024-${String(i + 1).padStart(2, '0')}` },
      {
        $setOnInsert: {
          externalId: `NPL-2024-${String(i + 1).padStart(2, '0')}`,
          name,
          slug: slugify(name),
          seriesId: NPL_2024_SERIES_ID,
          seriesName: 'Nepal Premier League 2024',
          seriesSlug: 'nepal-premier-league-2024',
          matchType: 'T20',
          homeTeamId: String(home.externalId ?? ''),
          homeTeam: String(home.name ?? homeName),
          homeTeamShort: String(home.shortName ?? pairings[0]),
          homeTeamSlug: String(home.slug ?? ''),
          awayTeamId: String(away.externalId ?? ''),
          awayTeam: String(away.name ?? awayName),
          awayTeamShort: String(away.shortName ?? pairings[1]),
          awayTeamSlug: String(away.slug ?? ''),
          venue: venue || null,
          city: venue.toLowerCase().includes('kirtipur') ? 'Kirtipur' : undefined,
          startTime,
          status: 'completed',
          matchState: null,
          result: String(raw.result ?? '') || null,
          tossWinner: toss ? toss.winner : null,
          tossDecision: toss ? toss.decision : null,
          currentInnings: innings.length,
          homeScore: homeScores[0] ? scoreLabel(homeScores[0]) : null,
          awayScore: awayScores[0] ? scoreLabel(awayScores[0]) : null,
          isLive: false,
          isWomen: false,
          isU19: false,
          innings,
          commentary: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      },
      { upsert: true },
    );
    imported += 1;
  }
  return imported;
}

async function importPointsTable(rows: Array<Record<string, unknown>>, teamByName: Map<string, Record<string, unknown>>) {
  let imported = 0;
  for (const row of rows) {
    const teamName = titleCase(String(row.team ?? ''));
    if (!teamName) continue;
    const team = teamByName.get(teamName) ?? (await resolveTeam(teamName, ''));
    const pointsRow: PointsRow = {
      teamId: String(team.externalId ?? ''),
      teamName,
      shortName: String(team.shortName ?? ''),
      slug: String(team.slug ?? slugify(teamName)),
      logoUrl: undefined,
      matches: safeNum(row.matches_played),
      wins: safeNum(row.wins),
      losses: safeNum(row.losses),
      noResult: 0,
      ties: 0,
      points: safeNum(row.points),
      netRunRate: safeNum(String(row.nrr ?? '0')),
      position: safeNum(row.rank),
    };
    await db.collection('points_table').updateOne(
      { seriesId: NPL_2024_SERIES_ID, teamId: pointsRow.teamId },
      { $setOnInsert: { ...pointsRow, createdAt: nowIso(), updatedAt: nowIso() } },
      { upsert: true },
    );
    imported += 1;
  }
  return imported;
}

async function main() {
  if (!db.isConfigured) {
    console.error('MongoDB is not configured. Set MONGO_URL in backend/.env');
    process.exit(1);
  }
  await db.connect();

  logger.info('import:npl', `Fetching ${NPL_API_URL}`);
  const { data } = await axios.get(NPL_API_URL, { timeout: 30000 });
  const apiTeams: NplTeam[] = Array.isArray(data?.teams) ? data.teams : [];
  const rawMatches: Record<string, NplRawMatch> = (data?.matches ?? {}) as Record<string, NplRawMatch>;
  const pointsRows: Array<Record<string, unknown>> = Array.isArray(data?.points_table) ? data.points_table : [];

  if (!apiTeams.length) throw new Error('NPL API returned no teams — check the source URL.');
  if (!Object.keys(rawMatches).length) throw new Error('NPL API returned no matches.');

  await upsertSeries();

  const { teamByCode, teamByName, players } = await importTeamsAndPlayers(apiTeams);
  const matches = await importMatches(rawMatches, teamByCode);
  const points = await importPointsTable(pointsRows, teamByName);

  logger.info('import:npl', `Import complete. Teams=${teamByName.size}, Players=${players}, Matches=${matches}, PointsTableRows=${points}. Restart the API to re-prime the cache.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
