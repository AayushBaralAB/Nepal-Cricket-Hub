'use client';

import { useState, useEffect, useCallback } from 'react';

interface MatchReminderButtonProps {
  matchId: string;
  matchTitle?: string;
}

const REMINDER_OPTIONS = [
  { label: '1 hour before', minutes: 60 },
  { label: '3 hours before', minutes: 180 },
  { label: '1 day before', minutes: 1440 },
];

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('crickethub_user_id');
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('crickethub_user_id', id);
  }
  return id;
}

export function MatchReminderButton({ matchId, matchTitle }: MatchReminderButtonProps) {
  const [reminderSet, setReminderSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(60);

  const checkReminder = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await fetch(`/api/reminders?matchId=${matchId}&userIdentifier=${userId}`);
      if (res.ok) {
        const body = await res.json();
        if (body.data) setReminderSet(true);
      }
    } catch {
      // ignore
    }
  }, [matchId]);

  useEffect(() => {
    checkReminder();
  }, [checkReminder]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-reminder-dropdown]')) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleSetReminder = async (minutes: number) => {
    const userId = getUserId();
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          matchTitle: matchTitle ?? '',
          userIdentifier: userId,
          remindBeforeMinutes: minutes,
        }),
      });
      if (res.ok) {
        setReminderSet(true);
        setDropdownOpen(false);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (reminderSet) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-nch-50 px-3.5 py-1.5 text-sm font-bold text-nch-700 border border-nch-200">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Reminder Set
      </span>
    );
  }

  return (
    <div className="relative inline-block" data-reminder-dropdown>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={loading}
        className="btn-secondary !px-4 !py-2 text-sm"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {loading ? 'Setting...' : 'Set Reminder'}
      </button>

      {dropdownOpen && (
        <div className="absolute left-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-card">
          {REMINDER_OPTIONS.map((opt) => (
            <button
              key={opt.minutes}
              type="button"
              onClick={() => handleSetReminder(opt.minutes)}
              disabled={loading}
              className={`flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-nch-50 ${
                selectedMinutes === opt.minutes ? 'text-nch-700 bg-nch-50' : 'text-slate-700'
              }`}
            >
              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
