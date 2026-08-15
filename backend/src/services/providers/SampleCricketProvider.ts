import { CricketMatch, CricketPlayer, CricketSeries, CricketTeam, PointsRow } from '../../types/cricket';
import { CricketProvider } from '../CricketService';
import { slugify, nowIso, randomBetween, pick } from '../../utils/helpers';

/* ---------------------------------------------------------------------------
 * Static sample catalogue — teams, series, players, fixtures, results.
 * ------------------------------------------------------------------------- */

const SAMPLE_TEAMS: CricketTeam[] = [
  { externalId: 't-nep', name: 'Nepal', shortName: 'NEP', slug: 'nepal', country: 'Nepal', teamType: 'International', isNational: true },
  { externalId: 't-nep-w', name: 'Nepal Women', shortName: 'NEP-W', slug: 'nepal-women', country: 'Nepal', teamType: 'Womens', isNational: true },
  { externalId: 't-nep-u19', name: 'Nepal U19', shortName: 'NEP-U19', slug: 'nepal-u19', country: 'Nepal', teamType: 'U19', isNational: true },
  { externalId: 't-uae', name: 'United Arab Emirates', shortName: 'UAE', slug: 'united-arab-emirates', country: 'UAE', teamType: 'International', isNational: true },
  { externalId: 't-zim', name: 'Zimbabwe', shortName: 'ZIM', slug: 'zimbabwe', country: 'Zimbabwe', teamType: 'International', isNational: true },
  { externalId: 't-oma', name: 'Oman', shortName: 'OMA', slug: 'oman', country: 'Oman', teamType: 'International', isNational: true },
  { externalId: 't-nam', name: 'Namibia', shortName: 'NAM', slug: 'namibia', country: 'Namibia', teamType: 'International', isNational: true },
  { externalId: 't-jkb', name: 'Janakpur Bolts', shortName: 'JKB', slug: 'janakpur-bolts', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: 't-brk', name: 'Biratnagar Kings', shortName: 'BRK', slug: 'biratnagar-kings', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: 't-kar', name: 'Karnali Yaks', shortName: 'KAR', slug: 'karnali-yaks', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: 't-pka', name: 'Pokhara Avengers', shortName: 'PKA', slug: 'pokhara-avengers', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: 't-cht', name: 'Chitwan Rhinos', shortName: 'CHT', slug: 'chitwan-rhinos', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: 't-lbl', name: 'Lumbini Lions', shortName: 'LBL', slug: 'lumbini-lions', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: 't-sdr', name: 'Sudurpaschim Royals', shortName: 'SDR', slug: 'sudurpaschim-royals', country: 'Nepal', teamType: 'NPL', isNational: false },
  { externalId: 't-ktm', name: 'Kathmandu Gurkhas', shortName: 'KTM', slug: 'kathmandu-gurkhas', country: 'Nepal', teamType: 'NPL', isNational: false },
];

const SAMPLE_SERIES: CricketSeries[] = [
  { externalId: 's-npl25', name: 'Nepal Premier League 2025', slug: 'nepal-premier-league-2025', type: 'NPL', category: 'NPL', startDate: '2025-11-15', endDate: '2025-12-14', season: '2025', status: 'live', pointsTableAvailable: true },
  { externalId: 's-tri25', name: 'Nepal Tri-Nation Series 2025', slug: 'nepal-tri-nation-series-2025', type: 'International', category: 'Nepal Cricket', startDate: '2025-09-01', endDate: '2025-09-10', season: '2025', status: 'completed', pointsTableAvailable: true },
  { externalId: 's-uae25', name: 'Nepal tour of UAE 2025', slug: 'nepal-tour-of-uae-2025', type: 'International', category: 'Nepal Cricket', startDate: '2025-11-01', endDate: '2025-11-05', season: '2025', status: 'upcoming', pointsTableAvailable: true },
  { externalId: 's-icct20', name: 'ICC Men\'s T20 World Cup 2026', slug: 'icc-mens-t20-world-cup-2026', type: 'International', category: 'International Cricket', startDate: '2026-02-01', endDate: '2026-03-08', season: '2026', status: 'upcoming', pointsTableAvailable: false },
  { externalId: 's-wom25', name: 'Nepal Women\'s T20I Series', slug: 'nepal-womens-t20i-series', type: 'Womens', category: 'Women\'s Cricket', startDate: '2025-10-10', endDate: '2025-10-14', season: '2025', status: 'upcoming', pointsTableAvailable: false },
  { externalId: 's-u19ac', name: 'ACC U19 Asia Cup', slug: 'acc-u19-asia-cup', type: 'U19', category: 'U19 Cricket', startDate: '2025-12-01', endDate: '2025-12-15', season: '2025', status: 'upcoming', pointsTableAvailable: false },
];

const SAMPLE_PLAYERS: CricketPlayer[] = [
  { externalId: 'p-paudel', name: 'Rohit Paudel', slug: 'rohit-paudel', fullName: 'Rohit Kumar Paudel', country: 'Nepal', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: 't-nep' },
  { externalId: 'p-lamichhane', name: 'Sandeep Lamichhane', slug: 'sandeep-lamichhane', fullName: 'Sandeep Lamichhane', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm leg-break', teamId: 't-nep' },
  { externalId: 'p-bhurtel', name: 'Kushal Bhurtel', slug: 'kushal-bhurtel', fullName: 'Kushal Bhurtel', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: 't-nep' },
  { externalId: 'p-kc', name: 'Karan KC', slug: 'karan-kc', fullName: 'Karan KC', country: 'Nepal', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast-medium', teamId: 't-nep' },
  { externalId: 'p-kami', name: 'Sompal Kami', slug: 'sompal-kami', fullName: 'Sompal Kami', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: 't-nep' },
  { externalId: 'p-sheikh', name: 'Aasif Sheikh', slug: 'aasif-sheikh', fullName: 'Aasif Sheikh', country: 'Nepal', role: 'Wicketkeeper-Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: 't-nep' },
  { externalId: 'p-airee', name: 'Dipendra Singh Airee', slug: 'dipendra-singh-airee', fullName: 'Dipendra Singh Airee', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-break', teamId: 't-nep' },
  { externalId: 'p-malla', name: 'Kushal Malla', slug: 'kushal-malla', fullName: 'Kushal Malla', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', teamId: 't-nep' },
  { externalId: 'p-aarif', name: 'Aarif Sheikh', slug: 'aarif-sheikh', fullName: 'Aarif Sheikh', country: 'Nepal', role: 'All-rounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', teamId: 't-nep' },
  { externalId: 'p-jha', name: 'Gulsan Jha', slug: 'gulsan-jha', fullName: 'Gulsan Jha', country: 'Nepal', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Right-arm medium-fast', teamId: 't-nep' },
];

const NPL_ROSTERS: Record<string, string[]> = {
  'Janakpur Bolts': ['Aasif Sheikh', 'Lokesh Bam', 'Harsh Thaker', 'Sher Malla', 'Hussain Talat', 'Lalit Rajbanshi', 'Mohammad Mohsin', 'Tahir Mukhtar', 'Sunar Ali', 'Kishor Mahato'],
  'Biratnagar Kings': ['Martin Guptill', 'Scott Edwards', 'Basir Ahamad', 'Nick Greenwood', 'Subash Khakurel', 'Shimron Hetmyer', 'Chris Sole', 'Samson Godara', 'Aqib Ilyas', 'Prithu Baskota'],
  'Karnali Yaks': ['Rohit Paudel', 'Chadwick Walton', 'Gulsan Jha', 'Zeeshan Maqsood', 'Sompal Kami', 'Babar Hayat', 'Arjun Saud', 'Nandan Yadav', 'William Bosisto', 'Rijan Dhakal'],
  'Pokhara Avengers': ['Kushal Bhurtel', 'Michael Leask', 'Andries Gous', 'Bipin Sharma', 'Karan KC', 'Raymon Reifer', 'Sagar Pun', 'Brendan Taylor', 'Krishna Karki', 'Dilip Nath'],
  'Chitwan Rhinos': ['Dipendra Singh Airee', 'Kamrul Islam', 'Rohan Mustafa', 'Santosh Karki', 'Abinash Bohara', 'Shantosh Bhatta', 'Basanta Regmi', 'Naresh Budhayair', 'Amar Routela', 'Janak Pratap'],
  'Lumbini Lions': ['Tom Moores', 'Benny Howell', 'Kushal Malla', 'Sundeep Jora', 'Sagar Dhakal', 'Bihari Pokharel', 'Siddhant Lohani', 'Unmukt Chand', 'Durgesh Gupta', 'Rijan Dhakal'],
  'Sudurpaschim Royals': ['Naren Saud', 'Brandon McMullen', 'Arjun Saud', 'Rijan Dhakal', 'Durgesh Gupta', 'Aarif Sheikh', 'Sanjay Sharma', 'Ishan Pandey', 'Karan KC', 'Bipin Singh'],
  'Kathmandu Gurkhas': ['Sandeep Lamichhane', 'Gerhard Erasmus', 'Pratis GC', 'Michael van Lingen', 'Bipin Rawal', 'Shakib Al Hasan', 'Benny Howell', 'Shubham Kaushik', 'Sushant Mishra', 'Ravi Bopara'],
};

const NPL_MATCH_FIXTURES: Array<{
  externalId: string; home: string; away: string; start: string; status: 'live' | 'upcoming' | 'completed';
  result?: string; homeScore?: string; awayScore?: string;
}> = [
  { externalId: 'm-live-1', home: 'Janakpur Bolts', away: 'Biratnagar Kings', start: '2025-11-20T11:00:00+05:45', status: 'live' },
  { externalId: 'm-up-1', home: 'Kathmandu Gurkhas', away: 'Pokhara Avengers', start: '2025-11-21T12:00:00+05:45', status: 'upcoming' },
  { externalId: 'm-up-2', home: 'Karnali Yaks', away: 'Lumbini Lions', start: '2025-11-22T12:00:00+05:45', status: 'upcoming' },
  { externalId: 'm-up-3', home: 'Chitwan Rhinos', away: 'Sudurpaschim Royals', start: '2025-11-23T12:00:00+05:45', status: 'upcoming' },
  { externalId: 'm-res-1', home: 'Chitwan Rhinos', away: 'Karnali Yaks', start: '2025-11-19T12:00:00+05:45', status: 'completed', result: 'Chitwan Rhinos won by 6 wickets', homeScore: '142/6 (18.4)', awayScore: '138/8 (20)' },
  { externalId: 'm-res-2', home: 'Lumbini Lions', away: 'Sudurpaschim Royals', start: '2025-11-19T08:00:00+05:45', status: 'completed', result: 'Sudurpaschim Royals won by 9 runs', homeScore: '148/7 (20)', awayScore: '157/5 (20)' },
  { externalId: 'm-res-3', home: 'Kathmandu Gurkhas', away: 'Karnali Yaks', start: '2025-11-18T12:00:00+05:45', status: 'completed', result: 'Kathmandu Gurkhas won by 21 runs', homeScore: '168/6 (20)', awayScore: '147/9 (20)' },
  { externalId: 'm-res-4', home: 'Janakpur Bolts', away: 'Pokhara Avengers', start: '2025-11-18T08:00:00+05:45', status: 'completed', result: 'Janakpur Bolts won by 4 wickets', homeScore: '151/6 (19.2)', awayScore: '150/7 (20)' },
  { externalId: 'm-res-5', home: 'Biratnagar Kings', away: 'Chitwan Rhinos', start: '2025-11-17T12:00:00+05:45', status: 'completed', result: 'Biratnagar Kings won by 7 wickets', homeScore: '154/3 (16.3)', awayScore: '153/6 (20)' },
];

const INT_MATCH_FIXTURES: Array<{
  externalId: string; home: string; away: string; start: string; status: 'upcoming' | 'completed'; result?: string;
  homeScore?: string; awayScore?: string; series: string; isWomen?: boolean; isU19?: boolean;
}> = [
  { externalId: 'm-int-1', home: 'Nepal', away: 'United Arab Emirates', start: '2025-11-01T12:00:00+05:45', status: 'upcoming', series: 's-uae25' },
  { externalId: 'm-int-2', home: 'Nepal', away: 'Oman', start: '2025-11-03T12:00:00+05:45', status: 'upcoming', series: 's-uae25' },
  { externalId: 'm-int-3', home: 'Nepal', away: 'United Arab Emirates', start: '2025-09-05T12:00:00+05:45', status: 'completed', result: 'Nepal won by 32 runs', homeScore: '248/9 (50)', awayScore: '216 (44.3)', series: 's-tri25' },
  { externalId: 'm-int-4', home: 'United Arab Emirates', away: 'Nepal', start: '2025-09-03T12:00:00+05:45', status: 'completed', result: 'UAE won by 4 wickets', homeScore: '232 (48.2)', awayScore: '233/6 (46.1)', series: 's-tri25' },
  { externalId: 'm-int-5', home: 'Nepal', away: 'Namibia', start: '2025-09-01T12:00:00+05:45', status: 'completed', result: 'Nepal won by 7 wickets', homeScore: '168/3 (31.2)', awayScore: '165 (43.4)', series: 's-tri25' },
  { externalId: 'm-wom-1', home: 'Nepal Women', away: 'Zimbabwe', start: '2025-10-10T10:00:00+05:45', status: 'upcoming', series: 's-wom25', isWomen: true },
  { externalId: 'm-wom-2', home: 'Nepal Women', away: 'Zimbabwe', start: '2025-10-12T10:00:00+05:45', status: 'upcoming', series: 's-wom25', isWomen: true },
  { externalId: 'm-u19-1', home: 'Nepal U19', away: 'Afghanistan U19', start: '2025-12-01T10:00:00+05:45', status: 'upcoming', series: 's-u19ac', isU19: true },
];

const NPL_POINTS: PointsRow[] = [
  { teamId: 't-jkb', teamName: 'Janakpur Bolts', shortName: 'JKB', slug: 'janakpur-bolts', matches: 8, wins: 6, losses: 2, noResult: 0, ties: 0, points: 12, netRunRate: 0.862, position: 1 },
  { teamId: 't-brk', teamName: 'Biratnagar Kings', shortName: 'BRK', slug: 'biratnagar-kings', matches: 8, wins: 5, losses: 3, noResult: 0, ties: 0, points: 10, netRunRate: 0.54, position: 2 },
  { teamId: 't-ktm', teamName: 'Kathmandu Gurkhas', shortName: 'KTM', slug: 'kathmandu-gurkhas', matches: 8, wins: 5, losses: 3, noResult: 0, ties: 0, points: 10, netRunRate: 0.312, position: 3 },
  { teamId: 't-pka', teamName: 'Pokhara Avengers', shortName: 'PKA', slug: 'pokhara-avengers', matches: 8, wins: 4, losses: 4, noResult: 0, ties: 0, points: 8, netRunRate: -0.045, position: 4 },
  { teamId: 't-cht', teamName: 'Chitwan Rhinos', shortName: 'CHT', slug: 'chitwan-rhinos', matches: 8, wins: 4, losses: 4, noResult: 0, ties: 0, points: 8, netRunRate: -0.21, position: 5 },
  { teamId: 't-kar', teamName: 'Karnali Yaks', shortName: 'KAR', slug: 'karnali-yaks', matches: 8, wins: 3, losses: 5, noResult: 0, ties: 0, points: 6, netRunRate: -0.388, position: 6 },
  { teamId: 't-sdr', teamName: 'Sudurpaschim Royals', shortName: 'SDR', slug: 'sudurpaschim-royals', matches: 8, wins: 3, losses: 5, noResult: 0, ties: 0, points: 6, netRunRate: -0.455, position: 7 },
  { teamId: 't-lbl', teamName: 'Lumbini Lions', shortName: 'LBL', slug: 'lumbini-lions', matches: 8, wins: 2, losses: 6, noResult: 0, ties: 0, points: 4, netRunRate: -0.74, position: 8 },
];

/* ---------------------------------------------------------------------------
 * Live match simulation engine
 * ------------------------------------------------------------------------- */

interface SimBatsman {
  name: string; runs: number; balls: number; fours: number; sixes: number;
  out: boolean; notOut: boolean; dismissal?: string;
}

interface SimBowler {
  name: string; runs: number; wickets: number; balls: number; maidens: number;
}

interface SimInnings {
  number: number; battingTeam: string; battingTeamId: string;
  runs: number; wickets: number; balls: number; target?: number;
  batsmen: SimBatsman[]; striker: number; nonStriker: number; nextBatsman: number;
  bowlers: SimBowler[]; currentBowler: number;
  recentBalls: string[]; commentary: { text: string; over: number; ball: number }[];
  firstInningsFinished: boolean;
}

interface SimState {
  matchId: string;
  homeTeam: string; awayTeam: string;
  homeTeamId: string; awayTeamId: string;
  tossWinner: string; tossDecision: 'bat' | 'bowl';
  innings: SimInnings[];
  currentInnings: number;
  lastTick: number;
  finished: boolean;
  result?: string;
}

const MAX_OVERS = 20;

function makeTeamState(teamId: string, teamName: string, roster: string[], target?: number, bowlerRoster?: string[]): SimInnings {
  const batsmen: SimBatsman[] = roster.slice(0, 8).map((name) => ({
    name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, notOut: false,
  }));
  const bowlers: SimBowler[] = (bowlerRoster ?? roster).slice(1, 6).map((name) => ({
    name, runs: 0, wickets: 0, balls: 0, maidens: 0,
  }));
  return {
    number: 0, battingTeam: teamName, battingTeamId: teamId,
    runs: 0, wickets: 0, balls: 0, target,
    batsmen, striker: 0, nonStriker: 1, nextBatsman: 2,
    bowlers, currentBowler: 0,
    recentBalls: [], commentary: [], firstInningsFinished: false,
  };
}

function ballText(runs: number, extra: number, isWicket: boolean, kind?: string): string {
  if (isWicket) return 'W';
  const total = runs + extra;
  if (extra > 0 && kind === 'wide') return `${runs}+wd`;
  if (extra > 0 && kind === 'noball') return `${runs}+nb`;
  return total === 0 ? '0' : String(total);
}

function simulateBall(innings: SimInnings): { text: string; commentary: string; isWicket: boolean } {
  const striker = innings.batsmen[innings.striker];
  const bowler = innings.bowlers[innings.currentBowler];
  bowler.balls += 1;
  innings.balls += 1;

  const wicketChance = 0.11;
  const roll = Math.random();

  if (roll < wicketChance) {
    const dismissedName = striker.name;
    const fielders = innings.batsmen.filter((b) => b.name !== dismissedName);
    const fielder = fielders.length ? pick(fielders).name : undefined;
    const kind = ['c', 'b', 'lbw', 'c', 'st'][randomBetween(0, 4)];
    striker.out = true;
    striker.dismissal = kind === 'b' ? `b ${bowler.name}` : `${kind} ${fielder} b ${bowler.name}`;
    striker.notOut = false;
    innings.wickets += 1;
    bowler.wickets += 1;
    const ball = ballText(0, 0, true);
    const batsman = innings.batsmen[innings.nextBatsman];
    batsman.notOut = true;
    innings.striker = innings.nextBatsman;
    innings.nextBatsman += 1;
    if (innings.nextBatsman >= innings.batsmen.length) innings.nextBatsman = innings.batsmen.length - 1;
    return { text: ball, commentary: `OUT! ${dismissedName} ${striker.dismissal}. Huge wicket for ${bowler.name}.`, isWicket: true };
  }

  // run distribution
  const r = Math.random();
  let runs = 0;
  if (r < 0.42) runs = 0;
  else if (r < 0.68) runs = 1;
  else if (r < 0.78) runs = 2;
  else if (r < 0.8) runs = 3;
  else if (r < 0.9) runs = 4;
  else runs = 6;

  // extras ~3%
  let extra = 0; let kind: string | undefined;
  if (Math.random() < 0.03) { extra = 1; kind = 'wide'; }

  innings.runs += runs + extra;
  bowler.runs += runs + extra;

  if (runs > 0) {
    striker.runs += runs;
    striker.balls += 1;
    if (runs === 4) striker.fours += 1;
    if (runs === 6) striker.sixes += 1;
  } else if (!extra) {
    striker.balls += 1;
  }

  if (runs % 2 === 1) {
    const t = innings.striker;
    innings.striker = innings.nonStriker;
    innings.nonStriker = t;
  }

  if (innings.balls % 6 === 0) {
    innings.currentBowler = (innings.currentBowler + 1) % innings.bowlers.length;
    if (innings.balls % 6 === 0 && runs + extra === 0 && innings.balls > 0) {
      // maidens tracked loosely
    }
  }

  const text = ballText(runs, extra, false, kind);
  let commentary: string;
  if (runs === 6) commentary = `SIX! ${striker.name} launches ${bowler.name} over the ropes!`;
  else if (runs === 4) commentary = `FOUR! ${striker.name} finds the gap against ${bowler.name}.`;
  else if (runs === 0) commentary = `Dot ball from ${bowler.name} to ${striker.name}.`;
  else commentary = `${runs} run${runs > 1 ? 's' : ''} off ${bowler.name}.`;

  return { text, commentary, isWicket: false };
}

function buildMatchFromSim(sim: SimState, seriesId: string, seriesName: string): CricketMatch {
  const allInnings = sim.innings.map((inn) => ({
    inningsNumber: inn.number,
    battingTeamId: inn.battingTeamId,
    battingTeam: inn.battingTeam,
    runs: inn.runs,
    wickets: inn.wickets,
    overs: Math.floor(inn.balls / 6) + (inn.balls % 6) / 10,
    runRate: inn.balls > 0 ? +((inn.runs * 6) / inn.balls).toFixed(2) : 0,
    target: inn.target,
    isCompleted: inn.firstInningsFinished,
    batting: inn.batsmen.map((b) => ({
      name: b.name,
      runs: b.runs,
      balls: b.balls,
      fours: b.fours,
      sixes: b.sixes,
      strikeRate: b.balls > 0 ? +((b.runs * 100) / b.balls).toFixed(2) : 0,
      dismissal: b.dismissal,
      isNotOut: b.notOut,
      isOut: b.out,
    })),
    bowling: inn.bowlers.map((bowler) => ({
      name: bowler.name,
      overs: Math.floor(bowler.balls / 6) + (bowler.balls % 6) / 10,
      maidens: 0,
      runs: bowler.runs,
      wickets: bowler.wickets,
      economy: bowler.balls > 0 ? +((bowler.runs * 6) / bowler.balls).toFixed(2) : 0,
    })),
    fallOfWickets: [],
    partnerships: [],
  }));

  const current = sim.innings[sim.currentInnings];
  const overs = Math.floor(current.balls / 6) + (current.balls % 6) / 10;

  let state: string;
  let result: string | undefined = sim.result;
  if (sim.finished) {
    state = result ?? 'Match completed';
  } else if (sim.currentInnings === 0) {
    state = `${current.battingTeam} ${current.runs}/${current.wickets} (${overs} ov)`;
  } else {
    const target = current.target ?? 0;
    const remainingRuns = target - current.runs;
    const remainingBalls = MAX_OVERS * 6 - current.balls;
    if (remainingRuns <= 0) {
      state = `${current.battingTeam} have won`;
    } else {
      state = `${current.battingTeam} need ${remainingRuns} off ${remainingBalls} balls`;
    }
  }

  const homeScore = sim.innings[0] ? `${sim.innings[0].runs}/${sim.innings[0].wickets} (${Math.floor(sim.innings[0].balls / 6)}.${sim.innings[0].balls % 6})` : undefined;
  const awayScore = sim.innings[1] ? `${sim.innings[1].runs}/${sim.innings[1].wickets} (${Math.floor(sim.innings[1].balls / 6)}.${sim.innings[1].balls % 6})` : undefined;

  return {
    externalId: sim.matchId,
    name: `${sim.homeTeam} vs ${sim.awayTeam}`,
    slug: slugify(`${sim.homeTeam} vs ${sim.awayTeam}`),
    seriesId,
    seriesName,
    seriesSlug: slugify(seriesName),
    matchType: 'T20',
    homeTeamId: sim.homeTeamId, homeTeam: sim.homeTeam, homeTeamShort: sim.homeTeam.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(), homeTeamSlug: slugify(sim.homeTeam),
    awayTeamId: sim.awayTeamId, awayTeam: sim.awayTeam, awayTeamShort: sim.awayTeam.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(), awayTeamSlug: slugify(sim.awayTeam),
    venue: 'Tribhuvan University International Cricket Ground', city: 'Kirtipur',
    startTime: new Date().toISOString(),
    status: sim.finished ? 'completed' : 'live',
    matchState: state,
    result,
    tossWinner: sim.tossWinner, tossDecision: sim.tossDecision,
    currentInnings: sim.currentInnings,
    homeScore, awayScore,
    innings: allInnings,
    commentary: current.commentary.slice(-40).map((c) => ({
      over: c.over, ballInOver: c.ball, runs: 0, isWicket: false, batsman: undefined, bowler: undefined, text: c.text,
    })),
  };
}

function ensureSimProgression(sim: SimState, secondsSinceTick: number): SimState {
  if (sim.finished) return sim;
  const ballsToSimulate = Math.min(24, Math.floor(secondsSinceTick / 25) || 1);

  for (let b = 0; b < ballsToSimulate; b++) {
    const inn = sim.innings[sim.currentInnings];

    if (inn.target !== undefined && inn.runs >= inn.target) {
      const won = sim.innings[0].battingTeam !== inn.battingTeam ? sim.innings[1].battingTeam : sim.innings[0].battingTeam;
      sim.finished = true;
      sim.result = `${won} won by ${10 - inn.wickets} wickets (with ${MAX_OVERS * 6 - inn.balls} balls to spare)`;
      inn.firstInningsFinished = true;
      return sim;
    }
    if (inn.wickets >= 10 || inn.balls >= MAX_OVERS * 6) {
      inn.firstInningsFinished = true;
      if (sim.currentInnings === 0) {
        sim.currentInnings = 1;
        sim.innings[1] = makeTeamState(sim.awayTeamId, sim.awayTeam, NPL_ROSTERS[sim.awayTeam] ?? [], inn.runs + 1, NPL_ROSTERS[sim.homeTeam]);
        sim.innings[1].number = 1;
        continue;
      } else {
        const first = sim.innings[0];
        const second = sim.innings[1];
        if (second.runs > first.runs) sim.result = `${second.battingTeam} won by ${10 - second.wickets} wickets`;
        else if (second.runs < first.runs) sim.result = `${first.battingTeam} won by ${first.runs - second.runs} runs`;
        else sim.result = 'Match tied';
        sim.finished = true;
        return sim;
      }
    }

    const { text, commentary, isWicket } = simulateBall(inn);
    inn.recentBalls.push(text);
    if (inn.recentBalls.length > 6) inn.recentBalls.shift();
    inn.commentary.push({ text: commentary, over: Math.floor(inn.balls / 6) + 1, ball: inn.balls % 6 });

    // end of innings check for innings 1
    if ((inn.wickets >= 10 || inn.balls >= MAX_OVERS * 6) && sim.currentInnings === 0) {
      inn.firstInningsFinished = true;
      sim.currentInnings = 1;
      sim.innings[1] = makeTeamState(sim.awayTeamId, sim.awayTeam, NPL_ROSTERS[sim.awayTeam] ?? [], inn.runs + 1, NPL_ROSTERS[sim.homeTeam]);
      sim.innings[1].number = 1;
    }
  }
  sim.lastTick = Date.now();
  return sim;
}

/* ---------------------------------------------------------------------------
 * Provider
 * ------------------------------------------------------------------------- */

export class SampleCricketProvider implements CricketProvider {
  readonly name = 'sample';

  private liveSims = new Map<string, SimState>();

  constructor() {
    const live = NPL_MATCH_FIXTURES.find((m) => m.status === 'live');
    if (live) {
      this.liveSims.set(live.externalId, this.bootLiveMatch(live));
    }
  }

  isConfigured(): boolean {
    return true;
  }

  private bootLiveMatch(fixture: { externalId: string; home: string; away: string }): SimState {
    const home = SAMPLE_TEAMS.find((t) => t.name === fixture.home);
    const away = SAMPLE_TEAMS.find((t) => t.name === fixture.away);
    const tossWinner = [fixture.home, fixture.away][randomBetween(0, 1)];
    const tossDecision = Math.random() < 0.5 ? 'bat' : 'bowl' as const;

    const sim: SimState = {
      matchId: fixture.externalId,
      homeTeam: fixture.home, awayTeam: fixture.away,
      homeTeamId: home?.externalId ?? 't-unknown', awayTeamId: away?.externalId ?? 't-unknown',
      tossWinner, tossDecision,
      innings: [],
      currentInnings: 0,
      lastTick: Date.now() - randomBetween(30000, 60000),
      finished: false,
    };
    sim.innings.push(makeTeamState(sim.homeTeamId, sim.homeTeam, NPL_ROSTERS[sim.homeTeam] ?? [], undefined, NPL_ROSTERS[sim.awayTeam]));
    sim.innings[0].number = 0;

    // Let the match progress a bit so the live view is populated immediately.
    let progressing = sim;
    for (let i = 0; i < randomBetween(30, 80); i++) {
      progressing = ensureSimProgression(progressing, 30);
      if (progressing.finished) break;
    }
    return progressing;
  }

  async getLiveMatches(): Promise<CricketMatch[]> {
    const now = Date.now();
    const out: CricketMatch[] = [];
    for (const [id, simState] of this.liveSims) {
      const secs = (now - simState.lastTick) / 1000;
      const updated = ensureSimProgression(simState, secs);
      this.liveSims.set(id, updated);
      if (!updated.finished) {
        out.push(buildMatchFromSim(updated, 's-npl25', 'Nepal Premier League 2025'));
      }
    }
    return out;
  }

  async getMatch(matchId: string): Promise<CricketMatch | null> {
    const live = await this.getLiveMatches();
    const found = live.find((m) => m.externalId === matchId);
    if (found) return found;

    const result = NPL_MATCH_FIXTURES.find((m) => m.externalId === matchId && m.status === 'completed');
    if (result) return this.fixtureToMatch(result, 's-npl25', 'Nepal Premier League 2025');
    const upcoming = NPL_MATCH_FIXTURES.find((m) => m.externalId === matchId && m.status === 'upcoming');
    if (upcoming) return this.fixtureToMatch(upcoming, 's-npl25', 'Nepal Premier League 2025');
    return null;
  }

  async getUpcomingMatches(): Promise<CricketMatch[]> {
    const out = NPL_MATCH_FIXTURES.filter((m) => m.status === 'upcoming').map((m) =>
      this.fixtureToMatch(m, 's-npl25', 'Nepal Premier League 2025'));
    const intl = INT_MATCH_FIXTURES.filter((m) => m.status === 'upcoming').map((m) => this.internationalToMatch(m));
    return [...intl, ...out];
  }

  async getCompletedMatches(limit = 12): Promise<CricketMatch[]> {
    const npl = NPL_MATCH_FIXTURES.filter((m) => m.status === 'completed').map((m) =>
      this.fixtureToMatch(m, 's-npl25', 'Nepal Premier League 2025'));
    const intl = INT_MATCH_FIXTURES.filter((m) => m.status === 'completed').map((m) => this.internationalToMatch(m));
    return [...intl, ...npl].slice(0, limit);
  }

  async getMatchesByDate(date: string): Promise<CricketMatch[]> {
    const all = [...NPL_MATCH_FIXTURES, ...INT_MATCH_FIXTURES];
    const day = date.slice(0, 10);
    return all
      .filter((m) => m.start.slice(0, 10) === day)
      .map((m) => {
        if (m.externalId.startsWith('m-int-') || m.externalId.startsWith('m-wom-') || m.externalId.startsWith('m-u19-')) {
          return this.internationalToMatch(m as typeof INT_MATCH_FIXTURES[number]);
        }
        return this.fixtureToMatch(m, 's-npl25', 'Nepal Premier League 2025');
      });
  }

  async getSeries(): Promise<CricketSeries[]> {
    return SAMPLE_SERIES;
  }

  async getPointsTable(_seriesId: string): Promise<PointsRow[]> {
    return [...NPL_POINTS].sort((a, b) => a.position - b.position);
  }

  async getPlayers(): Promise<CricketPlayer[]> {
    return SAMPLE_PLAYERS;
  }

  async getTeams(): Promise<CricketTeam[]> {
    return SAMPLE_TEAMS;
  }

  private fixtureToMatch(f: (typeof NPL_MATCH_FIXTURES)[number], seriesId: string, seriesName: string): CricketMatch {
    const home = SAMPLE_TEAMS.find((t) => t.name === f.home);
    const away = SAMPLE_TEAMS.find((t) => t.name === f.away);
    return {
      externalId: f.externalId,
      name: `${f.home} vs ${f.away}`,
      slug: slugify(`${f.home} vs ${f.away}`),
      seriesId, seriesName, seriesSlug: slugify(seriesName),
      matchType: 'T20',
      homeTeamId: home?.externalId ?? '', homeTeam: f.home, homeTeamShort: home?.shortName ?? '', homeTeamSlug: slugify(f.home),
      awayTeamId: away?.externalId ?? '', awayTeam: f.away, awayTeamShort: away?.shortName ?? '', awayTeamSlug: slugify(f.away),
      venue: 'Tribhuvan University International Cricket Ground', city: 'Kirtipur',
      startTime: f.start,
      status: f.status,
      matchState: f.status === 'upcoming' ? 'Match starts soon' : f.result,
      result: f.result,
      homeScore: f.homeScore, awayScore: f.awayScore,
      innings: [],
      commentary: [],
    };
  }

  private internationalToMatch(f: (typeof INT_MATCH_FIXTURES)[number]): CricketMatch {
    const home = SAMPLE_TEAMS.find((t) => t.name === f.home);
    const away = SAMPLE_TEAMS.find((t) => t.name === f.away);
    const series = SAMPLE_SERIES.find((s) => s.externalId === f.series);
    return {
      externalId: f.externalId,
      name: `${f.home} vs ${f.away}`,
      slug: slugify(`${f.home} vs ${f.away}`),
      seriesId: series?.externalId, seriesName: series?.name, seriesSlug: series?.slug,
      matchType: 'ODI',
      homeTeamId: home?.externalId ?? '', homeTeam: f.home, homeTeamShort: home?.shortName ?? '', homeTeamSlug: slugify(f.home),
      awayTeamId: away?.externalId ?? '', awayTeam: f.away, awayTeamShort: away?.shortName ?? '', awayTeamSlug: slugify(f.away),
      venue: 'Tribhuvan University International Cricket Ground', city: 'Kirtipur',
      startTime: f.start,
      status: f.status,
      matchState: f.status === 'upcoming' ? 'Match starts soon' : f.result,
      result: f.result,
      homeScore: f.homeScore, awayScore: f.awayScore,
      innings: [], commentary: [],
      isWomen: f.isWomen, isU19: f.isU19,
    };
  }
}
