import type { CategoryDef, CategoryId } from '../types';
import { typeCategory } from './type';
import { generationCategory } from './generation';
import { abilityCategory } from './ability';
import { statCategories } from './stats';
import { bstCategory } from './bst';
import { heightCategory } from './height';
import { weightCategory } from './weight';
import { colorCategory } from './color';
import { weaknessCategory } from './weakness';
import { resistanceCategory } from './resistance';
import { classificationCategory } from './classification';

export const CATEGORY_REGISTRY: Record<CategoryId, CategoryDef> = {
  type: typeCategory,
  generation: generationCategory,
  ability: abilityCategory,
  hp: statCategories.hp,
  attack: statCategories.attack,
  defense: statCategories.defense,
  'special-attack': statCategories['special-attack'],
  'special-defense': statCategories['special-defense'],
  speed: statCategories.speed,
  bst: bstCategory,
  height: heightCategory,
  weight: weightCategory,
  color: colorCategory,
  weakness: weaknessCategory,
  resistance: resistanceCategory,
  classification: classificationCategory,
};

export const ALL_CATEGORY_IDS: CategoryId[] = Object.keys(CATEGORY_REGISTRY) as CategoryId[];

export function getCategory(id: CategoryId): CategoryDef {
  return CATEGORY_REGISTRY[id];
}

export * from './type';
export * from './generation';
export * from './ability';
export * from './stats';
export * from './bst';
export * from './height';
export * from './weight';
export * from './color';
export * from './weakness';
export * from './resistance';
export * from './classification';
