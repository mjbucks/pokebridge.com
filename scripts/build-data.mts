import { Dex } from '@pkmn/sim';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PokemonRecord, PokemonType, PokedexColor, Classification } from '../src/engine/types.ts';
import { STARTERS, FOSSILS, PSEUDO_LEGENDARIES, BABIES } from './classifications.mts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ALL_TYPES: PokemonType[] = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
];

const DEX_SCOPE_MIN = 1;
const DEX_SCOPE_MAX = 1025; // Gen 1-9 base forms only

/** damageTaken codes: 0 = 1x, 1 = 2x (weak), 2 = 0.5x (resist), 3 = 0x (immune) */
function codeToMultiplier(code: number): number {
  switch (code) {
    case 0: return 1;
    case 1: return 2;
    case 2: return 0.5;
    case 3: return 0;
    default: return 1;
  }
}

function computeWeaknessesAndResistances(types: PokemonType[]): {
  weaknesses: PokemonType[];
  resistances: PokemonType[];
} {
  const weaknesses: PokemonType[] = [];
  const resistances: PokemonType[] = [];

  for (const attackType of ALL_TYPES) {
    let multiplier = 1;
    for (const defendType of types) {
      const typeData = Dex.types.get(defendType);
      const code = typeData.damageTaken[attackType as keyof typeof typeData.damageTaken];
      multiplier *= codeToMultiplier(Number(code ?? 0));
    }
    if (multiplier > 1) weaknesses.push(attackType);
    else if (multiplier < 1) resistances.push(attackType);
  }

  return { weaknesses, resistances };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function classify(speciesId: string, tags: readonly string[]): Classification[] {
  const classifications: Classification[] = [];

  if (tags.includes('Sub-Legendary') || tags.includes('Restricted Legendary')) {
    classifications.push('Legendary');
  }
  if (tags.includes('Mythical')) classifications.push('Mythical');
  if (tags.includes('Ultra Beast')) classifications.push('Ultra Beast');
  if (tags.includes('Paradox')) classifications.push('Paradox');

  if (STARTERS.has(speciesId)) classifications.push('Starter');
  if (FOSSILS.has(speciesId)) classifications.push('Fossil');
  if (PSEUDO_LEGENDARIES.has(speciesId)) classifications.push('Pseudo-Legendary');
  if (BABIES.has(speciesId)) classifications.push('Baby');

  return classifications;
}

function buildDataset(): PokemonRecord[] {
  const records: PokemonRecord[] = [];

  for (const species of Dex.species.all()) {
    if (!species.exists) continue;
    if (species.forme) continue; // base forms only for v1
    if (species.num < DEX_SCOPE_MIN || species.num > DEX_SCOPE_MAX) continue;
    // Keep real Pokémon only: null = standard, 'Past' = valid but gen-gated
    // in the latest format (still a real species). Exclude CAP/Custom/LGPE/Future.
    if (species.isNonstandard !== null && species.isNonstandard !== 'Past') continue;

    const types = species.types as PokemonType[];
    const { weaknesses, resistances } = computeWeaknessesAndResistances(types);

    const abilityEntries = Object.entries(species.abilities).filter(([, v]) => Boolean(v));
    const abilities = abilityEntries.filter(([slot]) => slot !== 'H').map(([, v]) => v);
    const hiddenAbility = species.abilities.H ?? null;

    const stats = {
      hp: species.baseStats.hp,
      atk: species.baseStats.atk,
      def: species.baseStats.def,
      spa: species.baseStats.spa,
      spd: species.baseStats.spd,
      spe: species.baseStats.spe,
    };
    const bst = stats.hp + stats.atk + stats.def + stats.spa + stats.spd + stats.spe;

    const record: PokemonRecord = {
      id: species.num,
      slug: slugify(species.name),
      name: species.name,
      types,
      generation: species.gen,
      abilities,
      hiddenAbility,
      stats,
      bst,
      heightM: species.heightm,
      weightKg: species.weightkg,
      color: species.color as PokedexColor,
      classifications: classify(species.id, species.tags),
      weaknesses,
      resistances,
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${species.num}.png`,
    };

    records.push(record);
  }

  records.sort((a, b) => a.id - b.id);
  return records;
}

function main() {
  const dataset = buildDataset();

  const byNum = new Map<number, number>();
  for (const r of dataset) byNum.set(r.id, (byNum.get(r.id) ?? 0) + 1);
  const duplicates = [...byNum.entries()].filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate dex numbers found: ${duplicates.map(([n]) => n).join(', ')}`);
  }

  const outPath = resolve(__dirname, '../src/data/pokemon.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(dataset, null, 2));

  console.log(`Wrote ${dataset.length} Pokémon records to ${outPath}`);

  const classificationCounts: Record<string, number> = {};
  for (const r of dataset) {
    for (const c of r.classifications) {
      classificationCounts[c] = (classificationCounts[c] ?? 0) + 1;
    }
  }
  console.log('Classification counts:', classificationCounts);
}

main();
