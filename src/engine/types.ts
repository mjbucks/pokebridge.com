export type PokemonType =
  | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
  | 'Rock' | 'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy';

export type PokedexColor =
  | 'Black' | 'Blue' | 'Brown' | 'Gray' | 'Green'
  | 'Pink' | 'Purple' | 'Red' | 'White' | 'Yellow';

export type Classification =
  | 'Starter'
  | 'Legendary'
  | 'Mythical'
  | 'Pseudo-Legendary'
  | 'Fossil'
  | 'Ultra Beast'
  | 'Paradox'
  | 'Baby';

export type StatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonRecord {
  /** National Dex number. */
  id: number;
  /** URL/search-safe slug, e.g. "mr-mime". */
  slug: string;
  name: string;
  types: PokemonType[];
  generation: number;
  abilities: string[];
  hiddenAbility: string | null;
  stats: BaseStats;
  bst: number;
  heightM: number;
  weightKg: number;
  color: PokedexColor;
  classifications: Classification[];
  /** Attacking types this species takes >1x damage from. */
  weaknesses: PokemonType[];
  /** Attacking types this species takes <1x damage from (including immunities). */
  resistances: PokemonType[];
  spriteUrl: string;
}

export type PokemonDataset = PokemonRecord[];

export type CategoryId =
  | 'type'
  | 'generation'
  | 'ability'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed'
  | 'bst'
  | 'height'
  | 'weight'
  | 'color'
  | 'weakness'
  | 'resistance'
  | 'classification';

export const STAT_CATEGORY_IDS = [
  'hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed',
] as const satisfies readonly CategoryId[];

export const STAT_KEY_BY_CATEGORY: Record<(typeof STAT_CATEGORY_IDS)[number], StatKey> = {
  hp: 'hp',
  attack: 'atk',
  defense: 'def',
  'special-attack': 'spa',
  'special-defense': 'spd',
  speed: 'spe',
};

export type CategoryValue =
  | { categoryId: 'type'; type: PokemonType }
  | { categoryId: 'generation'; generation: number }
  | { categoryId: 'ability'; ability: string }
  | { categoryId: (typeof STAT_CATEGORY_IDS)[number]; amount: number }
  | { categoryId: 'bst'; amount: number }
  | { categoryId: 'height'; meters: number }
  | { categoryId: 'weight'; kg: number }
  | { categoryId: 'color'; color: PokedexColor }
  | { categoryId: 'weakness'; types: PokemonType[] }
  | { categoryId: 'resistance'; types: PokemonType[] }
  | { categoryId: 'classification'; classification: Classification };

export interface ConnectionResult {
  valid: boolean;
  categoryId: CategoryId;
  /** Human-readable representation of the shared property (or, when invalid, empty). */
  sharedValues: string[];
  /** Explanation shown to the player, especially on failure. */
  reason: string;
}

export interface CategoryDef {
  id: CategoryId;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** All values shared between a and b that this category could be assigned as, for puzzle generation. */
  possibleValues(a: PokemonRecord, b: PokemonRecord): CategoryValue[];
  /** Deterministically checks whether a -> b satisfies this category for the given assigned value. */
  check(a: PokemonRecord, b: PokemonRecord, value: CategoryValue): ConnectionResult;
  /** Human-readable label for a required-category chip, e.g. "GENERATION 1" or "WEAKNESS: GROUND, PSYCHIC". */
  formatValue(value: CategoryValue): string;
}

export interface RequiredCategorySlot {
  categoryId: CategoryId;
  value: CategoryValue;
}

export interface Puzzle {
  id: string;
  mode: 'daily' | 'solo' | 'challenge' | 'admin';
  start: number;
  target: number;
  required: RequiredCategorySlot[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface ChainLink {
  pokemonId: number;
  /** The category used to connect the PREVIOUS chain Pokémon to this one. Null for the start. */
  categoryId: CategoryId | null;
}

