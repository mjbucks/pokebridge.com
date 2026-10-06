import { useLocalStorage } from './useLocalStorage';

export interface DailyRecord {
  completed: boolean;
  score: number;
  timeSeconds: number;
  wrongGuesses: number;
  hintsUsed: number;
}

type DailyHistory = Record<string, DailyRecord>;

function computeStreak(history: DailyHistory, todayStr: string): number {
  let streak = 0;
  const cursor = new Date(`${todayStr}T00:00:00Z`);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (history[key]?.completed) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function useDailyProgress(todayStr: string) {
  const [history, setHistory] = useLocalStorage<DailyHistory>('pokebridge:daily-history', {});

  const recordCompletion = (record: DailyRecord) => {
    setHistory((prev) => ({ ...prev, [todayStr]: record }));
  };

  return {
    todayRecord: history[todayStr] ?? null,
    streak: computeStreak(history, todayStr),
    recordCompletion,
  };
}
