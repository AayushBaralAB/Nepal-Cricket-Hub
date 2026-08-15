export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'abandoned' | 'cancelled';
export type MatchType = 'Test' | 'ODI' | 'T20' | 'T10' | 'Other';

export interface CricketTeam {
  externalId: string;
  name: string;
  shortName: string;
  slug: string;
  logoUrl?: string;
  country?: string;
  teamType?: string;
  isNational?: boolean;
}

export interface CricketPlayer {
  externalId: string;
  name: string;
  slug: string;
  fullName?: string;
  photoUrl?: string;
  country?: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  teamId?: string;
}

export interface BattingEntry {
  playerId?: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal?: string;
  isNotOut: boolean;
  isOut: boolean;
}

export interface BowlingEntry {
  playerId?: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface InningsData {
  inningsNumber: number;
  battingTeamId?: string;
  battingTeam: string;
  runs: number;
  wickets: number;
  overs: number;
  runRate: number;
  target?: number;
  extras?: number;
  declared?: boolean;
  isCompleted: boolean;
  batting?: BattingEntry[];
  bowling?: BowlingEntry[];
  fallOfWickets?: { wicketNumber: number; runs: number; over: number; playerName?: string }[];
  partnerships?: { playerA?: string; playerB?: string; runs: number; balls: number }[];
}

export interface BallEntry {
  inningsNumber: number;
  over: number;
  ballInOver: number;
  batsman?: string;
  bowler?: string;
  runs: number;
  extraRuns: number;
  isWicket: boolean;
  wicketDesc?: string;
  commentary?: string;
}

export interface CommentaryItem {
  over: number;
  ballInOver: number;
  runs: number;
  isWicket: boolean;
  batsman?: string;
  bowler?: string;
  text: string;
}

export interface CricketMatch {
  externalId: string;
  name: string;
  slug: string;
  seriesId?: string;
  seriesName?: string;
  seriesSlug?: string;
  tournamentId?: string;
  tournamentName?: string;
  matchType: MatchType;
  homeTeamId: string;
  homeTeam: string;
  homeTeamShort: string;
  homeTeamSlug: string;
  awayTeamId: string;
  awayTeam: string;
  awayTeamShort: string;
  awayTeamSlug: string;
  venue: string;
  city?: string;
  startTime: string;
  status: MatchStatus;
  matchState?: string;
  result?: string;
  tossWinner?: string;
  tossDecision?: 'bat' | 'bowl';
  currentInnings?: number;
  homeScore?: string;
  awayScore?: string;
  innings: InningsData[];
  commentary?: CommentaryItem[];
  isWomen?: boolean;
  isU19?: boolean;
}

export interface CricketSeries {
  externalId: string;
  name: string;
  slug: string;
  type: string;
  category: string;
  startDate?: string;
  endDate?: string;
  season?: string;
  status?: string;
  pointsTableAvailable?: boolean;
}

export interface PointsRow {
  teamId: string;
  teamName: string;
  shortName: string;
  slug: string;
  logoUrl?: string;
  matches: number;
  wins: number;
  losses: number;
  noResult: number;
  ties: number;
  points: number;
  netRunRate: number;
  position: number;
}

export interface LiveScoreSummary {
  matchId: string;
  matchName: string;
  status: 'live' | 'upcoming' | 'completed' | string;
  state: string;
  homeScore: string;
  awayScore: string;
  result?: string;
  currentInnings?: number;
  ballsThisInnings?: number;
}
