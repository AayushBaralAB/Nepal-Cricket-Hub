export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'abandoned' | 'cancelled';
export type MatchType = 'Test' | 'ODI' | 'T20' | 'T10' | 'Other';

export interface BattingEntry {
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
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface InningsData {
  inningsNumber: number;
  battingTeam?: string;
  battingTeamId?: string;
  runs: number;
  wickets: number;
  overs: number;
  runRate: number;
  target?: number;
  extras?: number;
  declared?: boolean;
  isCompleted: boolean;
  batting: BattingEntry[];
  bowling: BowlingEntry[];
  fallOfWickets: { wicketNumber: number; runs: number; over: number; playerName?: string }[];
  partnerships: { playerA?: string; playerB?: string; runs: number; balls: number }[];
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
  teamName?: string;
}

export interface PlayerProfile extends CricketPlayer {
  bio?: string;
  statistics: Record<string, Record<string, number | string>>;
  recent: Array<{
    matchLabel: string;
    date?: string;
    runs: number | null;
    balls: number | null;
    wickets: number | null;
    economy: number | null;
    isNotOut: boolean;
  }>;
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

export interface StatRow {
  player: string;
  slug?: string;
  country?: string;
  role?: string;
  matches: number;
  innings?: number;
  runs?: number;
  wickets?: number;
  average?: number;
  strikeRate?: number;
  economy?: number;
  hundreds?: number;
  fifties?: number;
  bestBowling?: string;
}

export interface NewsItem {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  isBreaking: boolean;
  isFeatured?: boolean;
  publishedAt?: string;
  createdAt?: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  source: string;
  category: string;
  publishedAt?: string;
  isFeatured?: boolean;
}

export interface Advertisement {
  id: string;
  name: string;
  slot: string;
  format: string;
  type: string;
  imageUrl?: string;
  html?: string;
  adClient?: string;
  linkUrl?: string;
}

export interface SearchResults {
  query: string;
  news: NewsItem[];
  players: CricketPlayer[];
  teams: CricketTeam[];
  matches: CricketMatch[];
  series: CricketSeries[];
}

export interface AdminStats {
  news: number;
  liveMatches: number;
  upcomingMatches: number;
  completedMatches: number;
  players: number;
  teams: number;
  series: number;
  dbConnected: boolean;
  apiErrors: Array<{
    id?: string;
    level?: string;
    endpoint?: string;
    message?: string;
    created_at?: string;
    [key: string]: unknown;
  }>;
  syncStatus?: Array<{
    id?: string;
    component?: string;
    status?: string;
    message?: string;
    last_sync_at?: string;
    [key: string]: unknown;
  }>;
  lastCricketUpdate?: string | null;
  lastNewsUpdate?: string | null;
}

export interface AdminHealth {
  cricket: {
    provider: string;
    isConfigured: boolean;
    lastSyncAttemptAt?: string | null;
    lastSyncSuccessAt?: string | null;
    lastSyncError?: string | null;
    liveMatches: number;
    upcomingMatches: number;
    completedMatches: number;
  };
  news: {
    lastFetchAttemptAt?: string | null;
    lastFetchSuccessAt?: string | null;
    lastFetchError?: string | null;
    lastFetchedCount?: number;
    totalCached: number;
  };
  db: boolean;
}

export interface AdminSyncResult {
  ok: boolean;
  message: string;
}

export interface AdminAnalytics {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsPerDay: Array<{ date: string; views: number }>;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ ref: string; views: number }>;
  deviceBreakdown: Array<{ device: string; views: number }>;
}

export interface LiveStream {
  id: string;
  title: string;
  videoId: string;
  embedUrl: string;
  platform: string;
  order: number;
}

export interface Photo {
  _id?: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  photographer?: string;
  matchId?: string;
  tags: string[];
  uploadedAt: string;
}

export interface Prediction {
  _id?: string;
  matchId: string;
  userIdentifier: string;
  predictedWinner: string;
  predictedScore?: number;
  predictedManOfMatch?: string;
  points?: number;
  createdAt: string;
}

export interface PredictionStats {
  totalVotes: number;
  winnerVotes: Array<{ team: string; count: number; percentage: number }>;
  avgPredictedScore: number;
}

export interface MatchReminder {
  _id?: string;
  matchId: string;
  matchTitle: string;
  userIdentifier: string;
  remindBeforeMinutes: number;
  notified: boolean;
  createdAt: string;
}
