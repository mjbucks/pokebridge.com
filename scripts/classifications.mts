// Hand-curated classification lists. These are not reliably derivable from
// @pkmn/sim's `tags` field (which only covers Legendary/Mythical/Ultra
// Beast/Paradox), so Starter/Fossil/Pseudo-Legendary/Baby are defined
// explicitly here, matched by species id (lowercase, no dashes/spaces).

export const STARTERS = new Set([
  // Gen 1
  'bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charmeleon', 'charizard',
  'squirtle', 'wartortle', 'blastoise',
  // Gen 2
  'chikorita', 'bayleef', 'meganium', 'cyndaquil', 'quilava', 'typhlosion',
  'totodile', 'croconaw', 'feraligatr',
  // Gen 3
  'treecko', 'grovyle', 'sceptile', 'torchic', 'combusken', 'blaziken',
  'mudkip', 'marshtomp', 'swampert',
  // Gen 4
  'turtwig', 'grotle', 'torterra', 'chimchar', 'monferno', 'infernape',
  'piplup', 'prinplup', 'empoleon',
  // Gen 5
  'snivy', 'servine', 'serperior', 'tepig', 'pignite', 'emboar',
  'oshawott', 'dewott', 'samurott',
  // Gen 6
  'chespin', 'quilladin', 'chesnaught', 'fennekin', 'braixen', 'delphox',
  'froakie', 'frogadier', 'greninja',
  // Gen 7
  'rowlet', 'dartrix', 'decidueye', 'litten', 'torracat', 'incineroar',
  'popplio', 'brionne', 'primarina',
  // Gen 8
  'grookey', 'thwackey', 'rillaboom', 'scorbunny', 'raboot', 'cinderace',
  'sobble', 'drizzile', 'inteleon',
  // Gen 9
  'sprigatito', 'floragato', 'meowscarada', 'fuecoco', 'crocalor', 'skeledirge',
  'quaxly', 'quaxwell', 'quaquaval',
]);

export const FOSSILS = new Set([
  'omanyte', 'omastar', 'kabuto', 'kabutops', 'aerodactyl',
  'lileep', 'cradily', 'anorith', 'armaldo',
  'cranidos', 'rampardos', 'shieldon', 'bastiodon',
  'tirtouga', 'carracosta', 'archen', 'archeops',
  'tyrunt', 'tyrantrum', 'amaura', 'aurorus',
  'dracozolt', 'arctozolt', 'dracovish', 'arctovish',
]);

// Final-evolution, 600 BST signature "pseudo-legendary" lines only.
export const PSEUDO_LEGENDARIES = new Set([
  'dragonite', 'tyranitar', 'salamence', 'metagross', 'garchomp',
  'hydreigon', 'goodra', 'kommoo', 'dragapult', 'baxcalibur',
]);

export const BABIES = new Set([
  'pichu', 'cleffa', 'igglybuff', 'tyrogue', 'smoochum', 'elekid', 'magby',
  'azurill', 'wynaut', 'budew', 'chingling', 'bonsly', 'mimejr', 'happiny',
  'munchlax', 'riolu', 'mantyke', 'toxel',
]);
