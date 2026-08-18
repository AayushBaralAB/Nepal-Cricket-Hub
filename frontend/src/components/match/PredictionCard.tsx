'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CricketMatch, PredictionStats } from '@/lib/types';

interface PredictionCardProps {
  match: CricketMatch;
}

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('crickethub_user_id');
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('crickethub_user_id', id);
  }
  return id;
}

export function PredictionCard({ match }: PredictionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [predicted, setPredicted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [predictedScore, setPredictedScore] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/predictions/${match.externalId}/stats`);
      if (res.ok) {
        const body = await res.json();
        if (body.data) setStats(body.data);
      }
    } catch {
      // ignore
    }
  }, [match.externalId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (submitted) fetchStats();
  }, [submitted, fetchStats]);

  const handleVote = async (team: string) => {
    setSelected(team);
    setShowScore(true);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    const userId = getUserId();

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.externalId,
          userIdentifier: userId,
          predictedWinner: selected,
          predictedScore: predictedScore ? Number(predictedScore) : undefined,
        }),
      });
      if (res.ok) {
        setPredicted(true);
        setSubmitted(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const homeVotes = stats?.winnerVotes.find((v) => v.team === match.homeTeam);
  const awayVotes = stats?.winnerVotes.find((v) => v.team === match.awayTeam);
  const homePercent = homeVotes?.percentage ?? 0;
  const awayPercent = awayVotes?.percentage ?? 0;
  const totalVotes = stats?.totalVotes ?? 0;

  return (
    <div className="card overflow-hidden p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          {match.seriesName ?? 'Predict the Match'}
        </p>
        <span className="chip bg-nch-50 text-nch-700">{totalVotes} votes</span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-bold text-slate-800">{match.homeTeam}</p>
        <p className="text-xs text-slate-400">vs</p>
        <p className="text-sm font-bold text-slate-800">{match.awayTeam}</p>
      </div>

      {!predicted ? (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Who will win?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleVote(match.homeTeam)}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 ${
                selected === match.homeTeam
                  ? 'border-nch-500 bg-nch-50 text-nch-700 shadow-soft'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-nch-300 hover:bg-nch-50/50'
              }`}
            >
              {match.homeTeamShort}
            </button>
            <button
              type="button"
              onClick={() => handleVote(match.awayTeam)}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 ${
                selected === match.awayTeam
                  ? 'border-nch-500 bg-nch-50 text-nch-700 shadow-soft'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-nch-300 hover:bg-nch-50/50'
              }`}
            >
              {match.awayTeamShort}
            </button>
          </div>

          {showScore && (
            <div className="animate-fade-in-up">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Predicted Score (optional)
              </label>
              <input
                type="number"
                value={predictedScore}
                onChange={(e) => setPredictedScore(e.target.value)}
                placeholder={`e.g. ${match.homeTeamShort} 180`}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-nch-500 focus:outline-none focus:ring-2 focus:ring-nch-500/20"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Prediction'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-nch-50 p-4 text-center">
          <svg className="mx-auto h-8 w-8 text-nch-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <p className="mt-2 text-sm font-bold text-nch-700">Prediction submitted!</p>
          <p className="text-xs text-nch-600/70">You picked {selected}</p>
        </div>
      )}

      {/* Stats bars */}
      {totalVotes > 0 && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Current predictions</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">{match.homeTeamShort}</span>
              <span className="tabular-nums text-slate-500">{homePercent.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-nch-500 to-nch-400 transition-all duration-700 ease-out"
                style={{ width: `${homePercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">{match.awayTeamShort}</span>
              <span className="tabular-nums text-slate-500">{awayPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-saffron-400 transition-all duration-700 ease-out"
                style={{ width: `${awayPercent}%` }}
              />
            </div>
          </div>

          {stats?.avgPredictedScore ? (
            <p className="text-xs text-slate-500">
              Avg predicted score: <span className="font-bold text-slate-700">{stats.avgPredictedScore}</span>
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
