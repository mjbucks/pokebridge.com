import { describe, expect, it } from 'vitest';
import { getPokemonByName } from '../../src/engine/dataset';
import {
  isAbilityConnection,
  isBSTConnection,
  isClassificationConnection,
  isColorConnection,
  isGenerationConnection,
  isHeightConnection,
  isResistanceConnection,
  isTypeConnection,
  isWeaknessConnection,
  isWeightConnection,
  isHPConnection,
  isAttackConnection,
  isDefenseConnection,
  isSpAttackConnection,
  isSpDefenseConnection,
  isSpeedConnection,
} from '../../src/engine/categories';

function mon(name: string) {
  const p = getPokemonByName(name);
  if (!p) throw new Error(`Fixture Pokémon not found: ${name}`);
  return p;
}

describe('type connection', () => {
  it('matches a shared type', () => {
    const result = isTypeConnection(mon('Charizard'), mon('Dragonite'), 'Flying');
    expect(result.valid).toBe(true);
  });
  it('rejects a type neither Pokémon has', () => {
    const result = isTypeConnection(mon('Charizard'), mon('Dragonite'), 'Water');
    expect(result.valid).toBe(false);
  });
  it('rejects a type only one Pokémon has', () => {
    const result = isTypeConnection(mon('Charizard'), mon('Dragonite'), 'Fire');
    expect(result.valid).toBe(false);
  });
});

describe('generation connection', () => {
  it('matches same generation', () => {
    expect(isGenerationConnection(mon('Garchomp'), mon('Lucario'), 4).valid).toBe(true);
  });
  it('rejects different generations', () => {
    expect(isGenerationConnection(mon('Garchomp'), mon('Bulbasaur'), 4).valid).toBe(false);
  });
});

describe('ability connection', () => {
  it('matches a shared normal ability', () => {
    expect(isAbilityConnection(mon('Gyarados'), mon('Salamence'), 'Intimidate').valid).toBe(true);
  });
  it('matches via hidden ability', () => {
    expect(isAbilityConnection(mon('Gyarados'), mon('Salamence'), 'Moxie').valid).toBe(true);
  });
  it('rejects an ability neither has', () => {
    expect(isAbilityConnection(mon('Gyarados'), mon('Salamence'), 'Levitate').valid).toBe(false);
  });
});

describe('base stat connections', () => {
  it('matches exact HP and rejects a non-matching amount', () => {
    const bulbasaur = mon('Bulbasaur'); // hp 45
    expect(isHPConnection(bulbasaur, mon('Bulbasaur'), 45).valid).toBe(true);
    expect(isHPConnection(bulbasaur, mon('Squirtle'), 45).valid).toBe(bulbasaur.stats.hp === mon('Squirtle').stats.hp);
    expect(isHPConnection(bulbasaur, mon('Squirtle'), 9999).valid).toBe(false);
  });
  it('matches exact equal stats and rejects unequal ones', () => {
    const pikachu = mon('Pikachu');
    const self = mon('Pikachu');
    expect(isAttackConnection(pikachu, self, pikachu.stats.atk).valid).toBe(true);
    expect(isDefenseConnection(pikachu, mon('Charizard'), pikachu.stats.def).valid).toBe(
      pikachu.stats.def === mon('Charizard').stats.def,
    );
    expect(isSpAttackConnection(pikachu, mon('Charizard'), 9999).valid).toBe(false);
    expect(isSpDefenseConnection(pikachu, mon('Charizard'), 9999).valid).toBe(false);
    expect(isSpeedConnection(pikachu, mon('Charizard'), 9999).valid).toBe(false);
  });
});

describe('BST connection', () => {
  it('matches equal base stat totals', () => {
    const pikachu = mon('Pikachu');
    expect(isBSTConnection(pikachu, pikachu, pikachu.bst).valid).toBe(true);
  });
  it('rejects unequal totals', () => {
    expect(isBSTConnection(mon('Pikachu'), mon('Charizard'), mon('Pikachu').bst).valid).toBe(false);
  });
});

describe('height/weight connection', () => {
  it('matches equal height exactly', () => {
    const p = mon('Pikachu');
    expect(isHeightConnection(p, p, p.heightM).valid).toBe(true);
  });
  it('matches equal weight exactly', () => {
    const p = mon('Pikachu');
    expect(isWeightConnection(p, p, p.weightKg).valid).toBe(true);
  });
  it('rejects mismatched height/weight', () => {
    expect(isHeightConnection(mon('Pikachu'), mon('Charizard'), mon('Pikachu').heightM).valid).toBe(false);
    expect(isWeightConnection(mon('Pikachu'), mon('Charizard'), mon('Pikachu').weightKg).valid).toBe(false);
  });
});

describe('color connection', () => {
  it('matches same Pokédex color', () => {
    expect(isColorConnection(mon('Pikachu'), mon('Pikachu'), 'Yellow').valid).toBe(true);
  });
  it('rejects different colors', () => {
    expect(isColorConnection(mon('Pikachu'), mon('Charizard'), 'Yellow').valid).toBe(false);
  });
});

describe('weakness connection', () => {
  it('matches the documented Glimmora/Emboar shared weaknesses', () => {
    const result = isWeaknessConnection(mon('Glimmora'), mon('Emboar'), ['Ground']);
    expect(result.valid).toBe(true);
    const multi = isWeaknessConnection(mon('Glimmora'), mon('Emboar'), ['Ground', 'Water']);
    expect(multi.valid).toBe(true);
  });
  it('requires ALL assigned types to be shared', () => {
    // Glimmora is not weak to Flying even though Emboar is.
    const result = isWeaknessConnection(mon('Glimmora'), mon('Emboar'), ['Ground', 'Flying']);
    expect(result.valid).toBe(false);
  });
  it('rejects when no shared weakness', () => {
    expect(isWeaknessConnection(mon('Pikachu'), mon('Pikachu'), ['Fire']).valid).toBe(false);
  });
});

describe('resistance connection', () => {
  it('matches a shared resistance', () => {
    const p = mon('Pikachu'); // resists Electric, Flying, Steel
    expect(isResistanceConnection(p, p, ['Electric']).valid).toBe(true);
  });
  it('rejects a non-shared resistance', () => {
    expect(isResistanceConnection(mon('Pikachu'), mon('Charizard'), ['Electric']).valid).toBe(false);
  });
});

describe('classification connection', () => {
  it('matches Pseudo-Legendary for Tyranitar/Dragonite', () => {
    expect(isClassificationConnection(mon('Tyranitar'), mon('Dragonite'), 'Pseudo-Legendary').valid).toBe(true);
  });
  it('rejects a classification neither shares', () => {
    expect(isClassificationConnection(mon('Pikachu'), mon('Charizard'), 'Legendary').valid).toBe(false);
  });
});
