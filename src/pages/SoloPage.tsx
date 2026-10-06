import { useCallback, useState } from 'react';
import { GamePage } from './GamePage';
import { buildSoloRandomPuzzle } from '../engine/puzzle';

export function SoloPage() {
  const [session, setSession] = useState(() => buildSoloRandomPuzzle());

  const newPuzzle = useCallback(() => setSession(buildSoloRandomPuzzle()), []);

  return (
    <GamePage
      key={session.puzzle.id}
      puzzle={session.puzzle}
      title="Solo Random"
      onPlayAgain={newPuzzle}
    />
  );
}
