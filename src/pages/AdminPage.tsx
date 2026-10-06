import { useMemo, useState } from 'react';
import { ALL_CATEGORY_IDS, getCategory } from '../engine/categories';
import { generatePuzzleBetween, generateRandomPuzzle, type GeneratedPuzzle } from '../engine/generator';
import { createRng } from '../engine/rng';
import { solvePuzzle, describeChain, type SolveResult } from '../engine/solver';
import { validateSolution } from '../engine/validator';
import { puzzleToChallengeCode } from '../engine/puzzle';
import { PokemonSearch } from '../components/PokemonSearch';
import { formatRequiredValue } from '../engine/connection';
import type { CategoryId, PokemonRecord, Puzzle } from '../engine/types';

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'pokebridge-admin';

function PasscodeGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 pt-16 text-center">
      <h1 className="font-display text-2xl font-extrabold">Admin Tools</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        This is a soft client-side gate for a solo-project internal tool, not real authentication.
      </p>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (value === ADMIN_PASSCODE) onUnlock();
            else setError(true);
          }
        }}
        placeholder="Passcode"
        className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-center outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
      />
      {error && <p className="text-sm text-red-500">Incorrect passcode.</p>}
      <button
        onClick={() => (value === ADMIN_PASSCODE ? onUnlock() : setError(true))}
        className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white"
      >
        Unlock
      </button>
    </div>
  );
}

function PokemonPicker({
  label,
  pokemon,
  onChange,
}: {
  label: string;
  pokemon: PokemonRecord | null;
  onChange: (p: PokemonRecord | null) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {pokemon ? (
        <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-3 py-2 dark:border-slate-700">
          <img src={pokemon.spriteUrl} alt="" className="h-8 w-8 object-contain" />
          <span className="flex-1 text-sm font-semibold">{pokemon.name}</span>
          <button onClick={() => onChange(null)} className="text-xs text-slate-400 hover:text-red-500">
            clear
          </button>
        </div>
      ) : (
        <PokemonSearch onSelect={onChange} placeholder="Leave empty for random…" />
      )}
    </div>
  );
}

function AdminTool() {
  const [start, setStart] = useState<PokemonRecord | null>(null);
  const [target, setTarget] = useState<PokemonRecord | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryId>>(new Set(ALL_CATEGORY_IDS));
  const [categoryCount, setCategoryCount] = useState(6);
  const [preferRare, setPreferRare] = useState(false);
  const [preferObscure, setPreferObscure] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPuzzle | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<SolveResult | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const pool = useMemo(() => ALL_CATEGORY_IDS.filter((id) => selectedCategories.has(id)), [selectedCategories]);

  const toggleCategory = (id: CategoryId) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = () => {
    setGenerateError(null);
    setTestResult(null);
    setSaveMessage(null);
    try {
      const rng = createRng(Date.now());
      if (start && target) {
        const result = generatePuzzleBetween(start, target, { categoryPool: pool, categoryCount, rng, preferRare, preferObscure });
        if (!result) {
          setGenerateError('No solution found between these two Pokémon with the current settings. Try a different category pool, count, or Pokémon.');
          setGenerated(null);
          return;
        }
        setGenerated(result);
      } else {
        const result = generateRandomPuzzle({ categoryPool: pool, categoryCount, rng, start: start ?? undefined, preferRare, preferObscure });
        setGenerated(result);
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed.');
      setGenerated(null);
    }
  };

  const handleTest = () => {
    if (!generated) return;
    const categoryIds = generated.required.map((r) => r.categoryId);
    setTestResult(solvePuzzle(generated.start, generated.target, categoryIds, { maxSolutions: 25 }));
  };

  const handleCopyLink = async () => {
    if (!generated) return;
    const puzzle: Puzzle = {
      id: 'admin-preview',
      mode: 'admin',
      start: generated.start.id,
      target: generated.target.id,
      required: generated.required,
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
    };
    const code = puzzleToChallengeCode(puzzle);
    const url = `${window.location.origin}/play/${code}`;
    await navigator.clipboard.writeText(url);
    setSaveMessage(`Copied: ${url}`);
  };

  const handleDownload = () => {
    if (!generated) return;
    const payload = {
      start: generated.start.id,
      startName: generated.start.name,
      target: generated.target.id,
      targetName: generated.target.name,
      required: generated.required,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokebridge-puzzle-${generated.start.slug}-to-${generated.target.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSaveMessage('Puzzle JSON downloaded.');
  };

  const independentlyValid = useMemo(() => {
    if (!generated) return null;
    const puzzle: Puzzle = {
      id: 'check',
      mode: 'admin',
      start: generated.start.id,
      target: generated.target.id,
      required: generated.required,
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
    };
    return validateSolution(puzzle, generated.solution);
  }, [generated]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-extrabold">Admin Puzzle Creator</h1>

      <section className="flex flex-col gap-3 rounded-2xl border-2 border-slate-200 p-4 dark:border-slate-700">
        <div className="flex gap-3">
          <PokemonPicker label="Start" pokemon={start} onChange={setStart} />
          <PokemonPicker label="Target" pokemon={target} onChange={setTarget} />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Category pool ({pool.length} selected)
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_CATEGORY_IDS.map((id) => (
              <button
                key={id}
                onClick={() => toggleCategory(id)}
                className={`rounded-full border-2 px-3 py-1 text-xs font-semibold ${
                  selectedCategories.has(id)
                    ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'border-slate-200 text-slate-400 dark:border-slate-700'
                }`}
              >
                {getCategory(id).name}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="font-semibold">Number of categories:</span>
          <input
            type="number"
            min={5}
            max={10}
            value={categoryCount}
            onChange={(e) => setCategoryCount(Math.min(10, Math.max(5, Number(e.target.value))))}
            className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={preferRare} onChange={(e) => setPreferRare(e.target.checked)} />
            Prefer rare/uncommon Pokémon
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={preferObscure} onChange={(e) => setPreferObscure(e.target.checked)} />
            Prefer obscure connections
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleGenerate} className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">
            Generate Puzzle
          </button>
          <button
            onClick={handleTest}
            disabled={!generated}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 font-semibold disabled:opacity-40 dark:border-slate-600"
          >
            Test Puzzle
          </button>
          <button
            onClick={handleCopyLink}
            disabled={!generated}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 font-semibold disabled:opacity-40 dark:border-slate-600"
          >
            Copy Challenge Link
          </button>
          <button
            onClick={handleDownload}
            disabled={!generated}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 font-semibold disabled:opacity-40 dark:border-slate-600"
          >
            Save Puzzle (JSON)
          </button>
        </div>
        {generateError && <p className="text-sm text-red-500">{generateError}</p>}
        {saveMessage && <p className="break-all text-xs text-emerald-600 dark:text-emerald-400">{saveMessage}</p>}
      </section>

      {generated && (
        <section className="flex flex-col gap-3 rounded-2xl border-2 border-slate-200 p-4 dark:border-slate-700">
          <h2 className="font-display text-lg font-bold">
            {generated.start.name} → {generated.target.name}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`font-semibold ${independentlyValid?.valid ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {independentlyValid?.valid ? 'Independently verified valid' : 'FAILED independent verification'}
            </span>
          </div>
          <ol className="flex flex-col gap-2">
            {generated.required.map((slot, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs dark:bg-slate-800">{i + 1}</span>
                <span className="font-bold">{getCategory(slot.categoryId).name}</span>
                <span className="text-slate-500 dark:text-slate-400">{formatRequiredValue(slot)}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Solution: {describeChain(generated.solution)}
          </p>
        </section>
      )}

      {testResult && (
        <section className="flex flex-col gap-2 rounded-2xl border-2 border-slate-200 p-4 dark:border-slate-700">
          <h2 className="font-display text-lg font-bold">Test Results</h2>
          <ul className="text-sm text-slate-600 dark:text-slate-300">
            <li>Solutions found: {testResult.solutions.length}{testResult.truncated ? '+ (search budget reached)' : ''}</li>
            <li>Chain length: {testResult.chainLength} Pokémon</li>
            <li>Uniquely solvable: {testResult.isUniquelySolvable ? 'Yes' : 'No'}</li>
          </ul>
          <div className="flex flex-col gap-1">
            {testResult.solutions.slice(0, 5).map((s, i) => (
              <p key={i} className="truncate text-xs text-slate-500 dark:text-slate-400">
                {i + 1}. {describeChain(s.chain)}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PasscodeGate onUnlock={() => setUnlocked(true)} />;
  return <AdminTool />;
}
