import rawData from '../data/pokemon.json';
import type { Classification, PokedexColor, PokemonRecord, PokemonType, StatKey } from './types';

export const DATASET: PokemonRecord[] = rawData as PokemonRecord[];

export const DATASET_VERSION = 'pkmn-sim-gen1-9-base-forms-v1';

const byId = new Map<number, PokemonRecord>();
const bySlug = new Map<string, PokemonRecord>();
const byNameLower = new Map<string, PokemonRecord>();

for (const p of DATASET) {
  byId.set(p.id, p);
  bySlug.set(p.slug, p);
  byNameLower.set(p.name.toLowerCase(), p);
}

export function getPokemonById(id: number): PokemonRecord | undefined {
  return byId.get(id);
}

export function getPokemonBySlug(slug: string): PokemonRecord | undefined {
  return bySlug.get(slug);
}

export function getPokemonByName(name: string): PokemonRecord | undefined {
  return byNameLower.get(name.toLowerCase());
}

export function allAbilities(p: PokemonRecord): string[] {
  return p.hiddenAbility ? [...p.abilities, p.hiddenAbility] : p.abilities;
}

function buildIndex<K>(keyFn: (p: PokemonRecord) => K[]): Map<K, Set<number>> {
  const index = new Map<K, Set<number>>();
  for (const p of DATASET) {
    for (const key of keyFn(p)) {
      let set = index.get(key);
      if (!set) {
        set = new Set();
        index.set(key, set);
      }
      set.add(p.id);
    }
  }
  return index;
}

export const INDEX = {
  byType: buildIndex<PokemonType>((p) => p.types),
  byGeneration: buildIndex<number>((p) => [p.generation]),
  byAbility: buildIndex<string>((p) => allAbilities(p)),
  byStat: {
    hp: buildIndex<number>((p) => [p.stats.hp]),
    atk: buildIndex<number>((p) => [p.stats.atk]),
    def: buildIndex<number>((p) => [p.stats.def]),
    spa: buildIndex<number>((p) => [p.stats.spa]),
    spd: buildIndex<number>((p) => [p.stats.spd]),
    spe: buildIndex<number>((p) => [p.stats.spe]),
  } satisfies Record<StatKey, Map<number, Set<number>>>,
  byBst: buildIndex<number>((p) => [p.bst]),
  byHeight: buildIndex<number>((p) => [p.heightM]),
  byWeight: buildIndex<number>((p) => [p.weightKg]),
  byColor: buildIndex<PokedexColor>((p) => [p.color]),
  byClassification: buildIndex<Classification>((p) => p.classifications),
  byWeaknessType: buildIndex<PokemonType>((p) => p.weaknesses),
  byResistanceType: buildIndex<PokemonType>((p) => p.resistances),
};

export function intersectSets(sets: Set<number>[]): Set<number> {
  if (sets.length === 0) return new Set();
  const [first, ...rest] = sets;
  const result = new Set<number>();
  for (const id of first) {
    if (rest.every((s) => s.has(id))) result.add(id);
  }
  return result;
}
