import { state } from '../state.js';
import { ELEMENTS, EL_ICONS, CHAKRA_LIST, CHAKRA_MULT, CHAOS_KNOTS, SKILLS, ANCHOR_RELICS, STAGE_RULES, JUDGE_LAWS, SHINTO_SEALS, TOWN_BUILDINGS } from '../data/constants.js';

/* ============================================================================
   TAB 1: OVERWORLD SKY-SHARD + SUB-MAPS + TOWN PLAZA CITIZEN PLACEMENT
   ============================================================================ */
export const BIOME_PALETTES = [
  { name:'Clockwork Bamboo Grove', floorBg:'#132421', accent:'#1e3a34', rule:'clear_sky' },
  { name:'Sunken Salt Ziggurat',   floorBg:'#1c2138', accent:'#262e4d', rule:'leyline_hum' },
  { name:'Superheated Copper Crag',floorBg:'#291817', accent:'#3b221f', rule:'superheated_grates' },
  { name:'Origami Cloud-Shelf',    floorBg:'#182438', accent:'#22334f', rule:'leyline_hum' }
];

export function toggleShintoSeal(sealId) {
  const idx = state.selectedSeals.indexOf(sealId);
  if (idx >= 0) state.selectedSeals.splice(idx, 1);
  else {
    if ((state.sealCounts[sealId] || 0) <= 0) { addLog(`<span style="color:#fca5a5;">No copies of that Shinto Seal left!</span>`); return; }
    if (state.selectedSeals.length >= 3) { addLog(`<span style="color:#fcd34d;">Max 3 Paper Shinto Seals per Sky-Shard!</span>`); return; }
    state.selectedSeals.push(sealId);
  }
  renderExplore();
}

export function revealFogAround(cx, cy) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 3) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && nx < state.map.width && ny >= 0 && ny < state.map.height) state.map.tiles[ny][nx].revealed = true;
      }
    }
  }
}

export function generateNewSkyShard(presetDive = null, consumeSeals = true) {
  window.refillShardBadgePouch();
  state.overworldBackup = null;
  state.subMap = { active:false, kind:null, title:'', floor:1, maxFloors:1, divePrestige:0, stageRule:'clear_sky', townData:null, floorsCache:{} };
  state.blessing = null;

  const W = 11, H = 9;
  const biome = BIOME_PALETTES[Math.floor(Math.random() * BIOME_PALETTES.length)];
  const divePrestige = presetDive ? (presetDive.prestige || 0) : 0;

  const activeSeals = [];
  if (!presetDive && consumeSeals) {
    state.selectedSeals.forEach(sid => { if ((state.sealCounts[sid] || 0) > 0) { state.sealCounts[sid]--; activeSeals.push(sid); } });
    state.selectedSeals = state.selectedSeals.filter(sid => (state.sealCounts[sid] || 0) > 0);
  }

  let chosenEls = [];
  if (presetDive && Array.isArray(presetDive.elements) && presetDive.elements.length > 0) chosenEls = [...presetDive.elements];
  else {
    const cCount = presetDive ? 3 : (Math.random() < 0.30 ? 3 : (Math.random() < 0.65 ? 2 : 1));
    const pool = [...ELEMENTS];
    while (chosenEls.length < cCount && pool.length > 0) chosenEls.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }

  const tiles = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const isCenter = (Math.abs(x - 5) <= 1 && Math.abs(y - 4) <= 1);
      const isWall = !isCenter && Math.random() < 0.10;
      row.push({ x, y, type:isWall ? 'wall' : 'floor', breakable:isWall, bg:(x + y) % 2 === 0 ? biome.floorBg : biome.accent, revealed:false, element:null, attuned:false });
    }
    tiles.push(row);
  }

  const freeCoords = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (tiles[y][x].type === 'floor' && !(x === 5 && y === 4)) freeCoords.push([x, y]);
  const popCoord = () => freeCoords.splice(Math.floor(Math.random() * freeCoords.length), 1)[0];

  chosenEls.forEach(el => { if (freeCoords.length) { const [cx, cy] = popCoord(); tiles[cy][cx].type = 'crystal'; tiles[cy][cx].element = el; } });

  // Guaranteed Town on every Sky-Shard!
  const hasLanternSeal = activeSeals.includes('lantern_seal') || divePrestige >= 2;
  if (freeCoords.length) {
    const [tx, ty] = popCoord();
    tiles[ty][tx].type = 'town';
    tiles[ty][tx].townData = generateTownData(hasLanternSeal);
  }

  const hasArenaSeal = activeSeals.includes('gladiator_writ');
  if ((hasArenaSeal || Math.random() < (0.45 + divePrestige * 0.20)) && freeCoords.length) {
    const [ax, ay] = popCoord();
    tiles[ay][ax].type = 'arena_cellar';
    tiles[ay][ax].arenaBonus = hasArenaSeal || divePrestige >= 1;
  }

  const allBig = activeSeals.includes('hollow_earth');
  const cellarCount = 1 + (Math.random() < 0.65 ? 1 : 0) + Math.min(3, divePrestige);
  for (let i = 0; i < cellarCount && freeCoords.length; i++) {
    const [cx, cy] = popCoord();
    tiles[cy][cx].type = (allBig || Math.random() < (0.22 + divePrestige * 0.28)) ? 'big_cellar' : 'small_cellar';
  }
  if (allBig && freeCoords.length) { const [bx, by] = popCoord(); tiles[by][bx].type = 'big_cellar'; }

  if ((activeSeals.includes('spider_silk') || Math.random() < (0.28 + divePrestige * 0.20)) && freeCoords.length) { const [dx, dy] = popCoord(); tiles[dy][dx].type = 'spider_dungeon'; }
  if ((activeSeals.includes('boiler_seal') || Math.random() < (0.28 + divePrestige * 0.20)) && freeCoords.length) { const [fx, fy] = popCoord(); tiles[fy][fx].type = 'foundry_dungeon'; }

  for (let i = 0; i < 1 + divePrestige && freeCoords.length; i++) {
    const [chx, chy] = popCoord();
    const makeLocked = i > 0 && Math.random() < (0.30 + divePrestige * 0.15);
    tiles[chy][chx].type = makeLocked ? 'chest_locked' : 'chest_unlocked';
    if (makeLocked && divePrestige >= 2) tiles[chy][chx].grandChest = true;
  }

  const oreCount = (activeSeals.includes('geomancer') ? 6 : 2) + chosenEls.length + divePrestige;
  for (let i = 0; i < oreCount && freeCoords.length; i++) { const [ox, oy] = popCoord(); tiles[oy][ox].type = 'ore'; }
  for (let i = 0; i < 3 && freeCoords.length; i++) { const [mx, my] = popCoord(); tiles[my][mx].type = 'monster'; }
  if ((activeSeals.includes('oni_ofuda') || (divePrestige >= 2 && Math.random() < 0.5)) && freeCoords.length) { const [ex, ey] = popCoord(); tiles[ey][ex].type = 'elite'; }
  for (let i = 0; i < 1 + Math.floor((divePrestige + 1) / 2) && freeCoords.length; i++) { const [wx, wy] = popCoord(); tiles[wy][wx].type = 'well'; }
  for (let i = 0; i < 2 + divePrestige && freeCoords.length; i++) { const [evx, evy] = popCoord(); tiles[evy][evx].type = 'mystery_event'; }
  if (freeCoords.length) { const [sx, sy] = popCoord(); tiles[sy][sx].type = 'shrine'; }
  if (freeCoords.length) { const [kx, ky] = popCoord(); tiles[ky][kx].type = 'kaiju'; }

  const cLen = chosenEls.length;
  const typeLabel = cLen >= 4 ? `${cLen}-Crystal Poly` : (cLen === 3 ? 'Triad' : (cLen === 2 ? 'Pair' : 'Single'));
  const pTag = divePrestige > 0 ? ` ★P${divePrestige}` : '';
  state.map = {
    name: presetDive ? `${presetDive.name}${pTag} (Dive)` : `${biome.name} [${typeLabel}]`,
    elements: chosenEls, attuned: [], stabilized: false, isMosaicDive: !!presetDive,
    divePrestige, crystalBoost: 0,
    overclockedDen: activeSeals.includes('faultline') || divePrestige >= 2,
    arenaWritBonus: hasArenaSeal || divePrestige >= 1,
    stageRule: biome.rule, width: W, height: H, px: 5, py: 4, tiles
  };

  revealFogAround(5, 4);
  const pouchIcons = state.badgePouch.map(r => ROLE_BADGE_TYPES[r]?.icon || '🏷').join('');
  addLog(`<span style="color:#67e8f9;">🗺 Entered <b>${state.map.name}</b> (${chosenEls.map(e => EL_ICONS[e] + e).join(', ')}) · Pouch stocked: ${pouchIcons} (${state.badgePouch.length}/5)!</span>`);
  renderExplore();
  updateHeaderUI();
}

export const PROC_HERO_NAMES = ['SORA', 'JIN-WOO', 'MAKO', 'TENZIN', 'RHEA', 'BRICK', 'NYX', 'KIKYO', 'BRAM', 'YUZU', 'OREN', 'VESPER', 'FAYE', 'GIDEON'];
export const UMBRELLA_KIT_TEMPLATES = {
  Ki:       { sprites:['🥋','🗡️','⚡'], f1Pool:[['kael_iaido','kael_guard'],['pkg_gale_slash','kael_furnace'],['pkg_lotus_palm','kael_guard']], f3Pool:['kael_limiter','anc_tempest_sheath'], hp:132, atk:28, spd:26 },
  Artifice: { sprites:['🤖','⚙️','🦾'], f1Pool:[['pip_napalm','pkg_grapple_wire'],['pip_mortar','pkg_origami_bomb'],['pkg_grapple_wire','pip_mortar']], f3Pool:['pip_vent','anc_dynamo_coil'], hp:162, atk:26, spd:19 },
  Patterns: { sprites:['⚗️','📐','🔮'], f1Pool:[['lyra_pillar','lyra_etch'],['pkg_frost_snap','lyra_etch'],['pkg_mirror_ward','pkg_frost_snap']], f3Pool:['lyra_elixir','anc_alkahest_lens'], hp:112, atk:29, spd:23 },
  Mantles:  { sprites:['🛡️','🦸','⚖️'], f1Pool:[['vane_maul','vane_henshin'],['pkg_starlight_vow','pkg_citizen_aegis'],['vane_henshin','pkg_starlight_vow']], f3Pool:['vane_chorus','anc_justice_buckler'], hp:154, atk:25, spd:20 },
  Tethers:  { sprites:['👻','🦊','🎎'], f1Pool:[['zappa_legion','zappa_oversoul'],['pkg_silk_snare','pkg_beast_fang'],['zappa_legion','pkg_beast_fang']], f3Pool:['zappa_kaiju','anc_marionette_spool'], hp:118, atk:27, spd:22 }
};

export function generateRandomAdventurer() {
  const umbrellas = Object.keys(UMBRELLA_KIT_TEMPLATES);
  const umb = umbrellas[Math.floor(Math.random() * umbrellas.length)];
  const kit = UMBRELLA_KIT_TEMPLATES[umb];
  const chosenF1 = kit.f1Pool[Math.floor(Math.random() * kit.f1Pool.length)];
  const chosenF3 = kit.f3Pool[Math.floor(Math.random() * kit.f3Pool.length)];
  const usedNames = new Set(state.heroes.map(h => h.name));
  const avail = PROC_HERO_NAMES.filter(n => !usedNames.has(n));
  const baseName = (avail.length ? avail : PROC_HERO_NAMES)[Math.floor(Math.random() * (avail.length || PROC_HERO_NAMES.length))];
  const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  const sprite = kit.sprites[Math.floor(Math.random() * kit.sprites.length)];
  const row = (umb === 'Patterns' || umb === 'Tethers') ? (Math.random() < 0.75 ? 'Back' : 'Front') : (Math.random() < 0.8 ? 'Front' : 'Back');
  const chakraIds = CHAKRA_LIST.map(c => c.id);
  const leadChakra = chakraIds[Math.floor(Math.random() * chakraIds.length)];
  const chakras = {};
  chakraIds.forEach(cid => { chakras[cid] = 'Open'; });
  chakras[leadChakra] = 'Bloomed';
  const secondBloom = chakraIds.filter(c => c !== leadChakra)[Math.floor(Math.random() * 6)];
  chakras[secondBloom] = 'Bloomed';
  const blockedPick = chakraIds.filter(c => c !== leadChakra && c !== secondBloom)[Math.floor(Math.random() * 5)];
  chakras[blockedPick] = 'Blocked';
  const knotKeys = Object.keys(CHAOS_KNOTS);
  const knot = Math.random() < 0.35 ? knotKeys[Math.floor(Math.random() * knotKeys.length)] : null;
  const avgLvl = Math.max(1, Math.round(state.heroes.reduce((s, h) => s + h.level, 0) / state.heroes.length));

  return {
    id:'adv_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
    name:baseName, sprite, umbrella:umb, element:el, leadChakra, row, level:avgLvl, xp:0,
    ascended:Math.random() < 0.20, knot,
    baseHp:kit.hp + Math.floor(Math.random() * 18) - 6, baseAtk:kit.atk + Math.floor(Math.random() * 5) - 2, baseSpd:kit.spd + Math.floor(Math.random() * 5) - 2,
    chakras, folders:[[...chosenF1], [], [chosenF3], ['throw_badge','basic_strike','focus_spirit']],
    hireCost:knot ? 55 : 35
  };
}

export function generateTownData(isBustling = false) {
  const townNames = ['Lantern-Post Hamlet', 'Copperbell Crossing', 'Cloud-Dock Outpost', 'Saltwind Haven'];
  const name = (isBustling ? '🏮 Bustling ' : '') + townNames[Math.floor(Math.random() * townNames.length)];
  const bldgCount = isBustling ? 5 : 4;
  const pool = [...TOWN_BUILDINGS];
  const buildings = [];
  while (buildings.length < bldgCount && pool.length > 0) buildings.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  const pkgCopy = Object.keys(SKILLS).filter(id => id.startsWith('pkg_'));
  const schoolStock = [];
  for (let i = 0; i < 3 && pkgCopy.length > 0; i++) schoolStock.push({ skillId:pkgCopy.splice(Math.floor(Math.random() * pkgCopy.length), 1)[0], sold:false });
  const shopBadgeType = ROLE_KEYS[Math.floor(Math.random() * ROLE_KEYS.length)];

  return {
    name, isBustling, discount:isBustling ? 0.75 : 1.0,
    buildings,
    citizens: [], // Up to 5 Badged Monster Citizens relocate here!
    recruits: [generateRandomAdventurer(), generateRandomAdventurer(), generateRandomAdventurer()],
    schoolStock,
    shopBadgeType, shopBadgeSold: false,
    shopKey: createRandomKey(isBustling ? 2 : 1),
    shopKeySold: Math.random() >= (isBustling ? 0.35 : 0.20),
    shrineUsed: false
  };
}

export function buildProceduralTownFloor(townData) {
  const W = 9, H = 7;
  const tiles = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const border = (x === 0 || y === 0 || x === W - 1 || y === H - 1);
      row.push({ x, y, type:border ? 'wall' : 'floor', bg:(x + y) % 2 === 0 ? '#1d2436' : '#252e45', revealed:true });
    }
    tiles.push(row);
  }
  tiles[1][1].type = 'exit_ladder';
  const bldgSpots = [[3, 2], [6, 2], [3, 4], [6, 4], [5, 3]];
  townData.buildings.forEach((b, idx) => {
    const [bx, by] = bldgSpots[idx];
    tiles[by][bx].type = b.type;
    tiles[by][bx].bldgName = b.name;
  });

  window.placeCitizensInTownGrid(tiles, townData);

  return { width:W, height:H, tiles, entryPos:{ x:1, y:1 }, stairsPos:{ x:1, y:1 } };
}

export function buildProceduralArenaFloor(floorNum) {
  const W = 7, H = 7;
  const ruleKeys = Object.keys(STAGE_RULES);
  const floorStageRule = ruleKeys[floorNum % ruleKeys.length];
  const lawKeys = Object.keys(JUDGE_LAWS);
  const floorJudgeLaw = lawKeys[(floorNum - 1 + Math.floor(Math.random() * lawKeys.length)) % lawKeys.length];
  const tiles = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const border = (x === 0 || y === 0 || x === W - 1 || y === H - 1);
      row.push({ x, y, type:border ? 'wall' : 'floor', bg:(x + y) % 2 === 0 ? '#241538' : '#2f1c47', revealed:true });
    }
    tiles.push(row);
  }
  tiles[3][1].type = 'exit_ladder';
  tiles[1][2].type = 'ore';
  const arenaBldgs = ['bldg_inn', 'bldg_shop', 'bldg_shrine', 'bldg_tavern'];
  tiles[5][2].type = arenaBldgs[Math.floor(Math.random() * arenaBldgs.length)];
  tiles[3][4].type = 'arena_boss';
  tiles[3][4].arenaFloor = floorNum;
  return { width:W, height:H, tiles, stageRule:floorStageRule, judgeLaw:floorJudgeLaw, entryPos:{ x:1, y:3 }, stairsPos:{ x:5, y:3 } };
}

export function enterSubMap(entranceTile) {
  const kind = entranceTile.type;
  state.overworldBackup = JSON.parse(JSON.stringify(state.map));
  state.overworldBackup.entranceCoord = { x:entranceTile.x, y:entranceTile.y };

  if (kind === 'town') {
    const tData = entranceTile.townData || generateTownData(false);
    if (!Array.isArray(tData.citizens)) tData.citizens = [];
    const townFloor = buildProceduralTownFloor(tData);
    state.subMap = { active:true, kind:'town', title:tData.name, floor:1, maxFloors:1, stageRule:'clear_sky', judgeLaw:null, townData:tData, floorsCache:{ 1:townFloor } };
    loadSubMapFloor(1, 'up_entry');
    const citNote = tData.citizens.length > 0 ? ` · <b style="color:#fbcfe8;">${tData.citizens.length} Badged Monster Citizen(s) waiting in the Plaza!</b>` : '';
    addLog(`<span style="color:#fde047; font-weight:bold;">🏘️ Entered <b>${tData.name}</b>! (0 Fatigue inside Town)${citNote}</span>`);
    renderExplore();
    return;
  }

  if (kind === 'arena_cellar') {
    const f1 = buildProceduralArenaFloor(1);
    state.subMap = { active:true, kind:'arena_cellar', title:'🏟️ Grand Crucible Arena', floor:1, maxFloors:99, stageRule:f1.stageRule, judgeLaw:f1.judgeLaw, arenaWritBonus:!!entranceTile.arenaBonus || !!state.overworldBackup.arenaWritBonus, townData:generateTownData(false), floorsCache:{ 1:f1 } };
    loadSubMapFloor(1, 'up_entry');
    const law = JUDGE_LAWS[f1.judgeLaw];
    addLog(`<span style="color:#fde047; font-weight:bold;">🏟️ ENTERED BOSS-RUSH ARENA [Tier 1]!</span> <span style="color:#fbcfe8;">Referee Law: ${law.icon} <b>${law.name}</b>!</span>`);
    renderExplore();
    return;
  }

  let title = 'Hidden Cellar', maxFloors = 1, stageRule = 'damp_mist';
  const diveP = state.overworldBackup?.divePrestige || 0;
  if (kind === 'small_cellar') { title = 'Mossy Root-Cellar'; maxFloors = 1 + (diveP >= 2 ? 1 : 0); stageRule = 'damp_mist'; }
  else if (kind === 'big_cellar') { title = 'Hollow-Earth Deep Cellar'; maxFloors = 2 + (Math.random() < 0.5 ? 1 : 0) + diveP; stageRule = 'leyline_hum'; }
  else if (kind === 'spider_dungeon') { title = 'Lair of the Orb-Weaver'; maxFloors = 3 + Math.floor((diveP + 1) / 2); stageRule = 'sticky_webs'; }
  else if (kind === 'foundry_dungeon') { title = 'Sunken Copper Foundry'; maxFloors = 3 + Math.floor((diveP + 1) / 2); stageRule = 'superheated_grates'; }

  state.subMap = { active:true, kind, title, floor:1, maxFloors, divePrestige:diveP, stageRule, floorsCache:{} };
  loadSubMapFloor(1, 'up_entry');
  addLog(`<span style="color:#fde047; font-weight:bold;">🕳️ Descended into <b>${title}</b> (Floor 1/${maxFloors}) — Stage Rule: ${STAGE_RULES[stageRule].icon} ${STAGE_RULES[stageRule].name}!</span>`);
  renderExplore();
}

export function buildProceduralSubFloor(kind, floorNum, maxFloors) {
  const isDungeon = (kind === 'spider_dungeon' || kind === 'foundry_dungeon');
  const W = isDungeon || kind === 'big_cellar' ? 8 : 7, H = 7;
  const diveP = state.subMap?.divePrestige || 0;
  let floorBg = '#141b2d', accent = '#1d2640';
  if (kind === 'spider_dungeon') { floorBg = '#1e132d'; accent = '#291b3d'; }
  if (kind === 'foundry_dungeon') { floorBg = '#2b1512'; accent = '#3a1e19'; }

  const tiles = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const border = (x === 0 || y === 0 || x === W - 1 || y === H - 1);
      const innerWall = !border && !(x === 1 && y === 1) && !(x === W - 2 && y === H - 2) && Math.random() < 0.14;
      const isWall = border || innerWall;
      row.push({ x, y, type:isWall ? 'wall' : 'floor', breakable:innerWall, bg:(x + y) % 2 === 0 ? floorBg : accent, revealed:false });
    }
    tiles.push(row);
  }
  for (let x = 1; x <= W - 2; x++) { tiles[1][x].type = 'floor'; tiles[1][x].breakable = false; tiles[H - 2][x].type = 'floor'; tiles[H - 2][x].breakable = false; }
  for (let y = 1; y <= H - 2; y++) { tiles[y][W - 2].type = 'floor'; tiles[y][W - 2].breakable = false; }
  tiles[1][1].type = floorNum === 1 ? 'exit_ladder' : 'stairs_up';

  const freeCoords = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (tiles[y][x].type === 'floor' && !(x === 1 && y === 1) && !(x === W - 2 && y === H - 2)) freeCoords.push([x, y]);
  const popCoord = () => freeCoords.splice(Math.floor(Math.random() * freeCoords.length), 1)[0];

  if (floorNum < maxFloors) {
    tiles[H - 2][W - 2].type = 'stairs_down';
    if (freeCoords.length && Math.random() < (0.65 + diveP * 0.15)) { const [cx, cy] = popCoord(); tiles[cy][cx].type = 'chest_unlocked'; }
  } else {
    const isLocked = isDungeon || kind === 'big_cellar' || Math.random() < 0.50;
    tiles[H - 2][W - 2].type = isLocked ? 'chest_locked' : 'chest_unlocked';
    tiles[H - 2][W - 2].grandChest = isDungeon || diveP >= 2;
    tiles[H - 2][W - 2].isFinalCellarChest = true;
    if (isDungeon) {
      tiles[H - 3][W - 2].type = kind === 'spider_dungeon' ? 'boss_spider' : 'boss_foundry';
      tiles[H - 3][W - 2].breakable = false;
      tiles[H - 2][W - 3].type = 'floor'; tiles[H - 2][W - 3].breakable = false;
    }
    if (diveP >= 1 && freeCoords.length) { const [bcx, bcy] = popCoord(); tiles[bcy][bcx].type = 'chest_unlocked'; }
  }

  const mobType = kind === 'spider_dungeon' ? 'mob_spider' : (kind === 'foundry_dungeon' ? 'mob_foundry' : 'monster');
  for (let i = 0; i < (isDungeon ? 2 : 1) && freeCoords.length; i++) { const [mx, my] = popCoord(); tiles[my][mx].type = mobType; }
  for (let i = 0; i < 2 + Math.min(2, diveP) && freeCoords.length; i++) { const [ox, oy] = popCoord(); tiles[oy][ox].type = 'ore'; }
  if (freeCoords.length && Math.random() < (0.45 + diveP * 0.20)) { const [wx, wy] = popCoord(); tiles[wy][wx].type = Math.random() < 0.5 ? 'mystery_event' : 'well'; }

  return { width:W, height:H, tiles, entryPos:{ x:1, y:1 }, stairsPos:{ x:W - 2, y:H - 2 } };
}

export function spawnSurfacePortalNear(cx, cy) {
  if (!state.subMap.active || state.subMap.kind === 'town' || state.subMap.kind === 'arena_cellar' || state.subMap.floor < state.subMap.maxFloors) return;
  const offsets = [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1]];
  for (const [dx, dy] of offsets) {
    const nx = cx + dx, ny = cy + dy;
    if (nx > 0 && nx < state.map.width - 1 && ny > 0 && ny < state.map.height - 1 && state.map.tiles[ny][nx].type === 'exit_ladder') return;
  }
  for (const [dx, dy] of offsets) {
    const nx = cx + dx, ny = cy + dy;
    if (nx > 0 && nx < state.map.width - 1 && ny > 0 && ny < state.map.height - 1) {
      const t = state.map.tiles[ny][nx];
      if (t.type === 'floor' || (t.type === 'wall' && t.breakable)) {
        t.type = 'exit_ladder'; t.breakable = false; t.revealed = true;
        addLog(`<span style="color:#6ee7b7; font-weight:bold;">🪜 CELLAR COMPLETE! A Sunlit Stairwell to the Surface opened at (${nx}, ${ny})!</span>`);
        return;
      }
    }
  }
}

export function loadSubMapFloor(floorNum, arrivalMode = 'up_entry') {
  const prevFloor = state.subMap.floor;
  if (prevFloor !== floorNum && state.subMap.floorsCache[prevFloor] && state.map.tiles?.length) state.subMap.floorsCache[prevFloor].tiles = state.map.tiles;
  state.subMap.floor = floorNum;
  if (!state.subMap.floorsCache[floorNum]) {
    if (state.subMap.kind === 'arena_cellar') state.subMap.floorsCache[floorNum] = buildProceduralArenaFloor(floorNum);
    else if (state.subMap.kind === 'town') state.subMap.floorsCache[floorNum] = buildProceduralTownFloor(state.subMap.townData);
    else state.subMap.floorsCache[floorNum] = buildProceduralSubFloor(state.subMap.kind, floorNum, state.subMap.maxFloors);
  }
  const fl = state.subMap.floorsCache[floorNum];
  if (state.subMap.kind === 'arena_cellar') { state.subMap.stageRule = fl.stageRule; state.subMap.judgeLaw = fl.judgeLaw; }
  const spawn = arrivalMode === 'down_return' ? (fl.stairsPos || fl.entryPos) : fl.entryPos;
  state.map.width = fl.width; state.map.height = fl.height; state.map.tiles = fl.tiles;
  state.map.px = spawn.x; state.map.py = spawn.y;
  state.map.stageRule = state.subMap.stageRule || 'damp_mist';
  state.map.judgeLaw = state.subMap.judgeLaw || null;
  revealFogAround(state.map.px, state.map.py);
}

export function exitSubMapToOverworld() {
  if (!state.subMap.active || !state.overworldBackup) return;
  if (state.subMap.floorsCache[state.subMap.floor]) state.subMap.floorsCache[state.subMap.floor].tiles = state.map.tiles;
  const ow = state.overworldBackup;
  const ec = ow.entranceCoord || { x:ow.px, y:ow.py };
  if (state.subMap.kind === 'town') ow.tiles[ec.y][ec.x].townData = state.subMap.townData;
  else if (state.subMap.kind === 'arena_cellar') {
    if (state.subMap.floor > 1 || state.map.tiles[3]?.[5]?.type === 'stairs_down') ow.tiles[ec.y][ec.x].type = 'floor';
  } else {
    const finalFl = state.subMap.floorsCache[state.subMap.maxFloors];
    if (finalFl && !finalFl.tiles.flat().some(t => t.type.startsWith('chest_') || t.type.startsWith('boss_'))) ow.tiles[ec.y][ec.x].type = 'floor';
  }
  const exitedTitle = state.subMap.title;
  delete ow.entranceCoord;
  ow.px = ec.x; ow.py = ec.y; ow.judgeLaw = null;
  state.map = ow; state.overworldBackup = null;
  state.subMap = { active:false, kind:null, title:'', floor:1, maxFloors:1, divePrestige:0, stageRule:'clear_sky', judgeLaw:null, townData:null, floorsCache:{} };
  addLog(`<span style="color:#a5f3fc;">🪜 Returned to Overworld <b>${state.map.name}</b> from ${exitedTitle}.</span>`);
  renderExplore();
  updateHeaderUI();
}

export function movePlayer(dx, dy) {
  if (state.activeTab !== 'explore') return;
  const nx = state.map.px + dx, ny = state.map.py + dy;
  if (nx < 0 || nx >= state.map.width || ny < 0 || ny >= state.map.height) return;
  const tile = state.map.tiles[ny][nx];
  if (tile.type === 'wall') {
    if (!tile.breakable) return;
    tile.type = 'floor'; tile.breakable = false;
    const prevTier = getFatigueInfo().tier;
    state.fatigue = Math.min(100, state.fatigue + 6);
    let scrapMsg = '';
    if (Math.random() < 0.30) { const sOre = 2 + Math.floor(Math.random() * 3); state.resources.ore += sOre; scrapMsg = ` & uncovered +${sOre}⛏ Ore`; }
    state.map.px = nx; state.map.py = ny;
    revealFogAround(nx, ny);
    const newInfo = getFatigueInfo();
    addLog(`<span style="color:#fb923c;">⛏️ Smashed Rubble (+6🥾 Fatigue → ${state.fatigue}/100 ${newInfo.tier})${scrapMsg}!</span>`);
    if (newInfo.tier !== prevTier) addLog(`<span style="color:${newInfo.color}; font-weight:bold;">🥾 FATIGUE WARNING: [${newInfo.tier}] (${newInfo.desc})!</span>`);
    renderExplore(); updateHeaderUI(); return;
  }

  const wasOverworld = !state.subMap.active;
  state.map.px = nx; state.map.py = ny;
  revealFogAround(nx, ny);

  if (wasOverworld && tile.type !== 'town') {
    if (state.blessing && state.blessing.id === 'swiftfoot' && state.blessing.freeSteps > 0) {
      state.blessing.freeSteps -= 1;
      if (state.blessing.freeSteps <= 0) { addLog(`<span style="color:#94a3c8;">🌬️ Swiftfoot Blessing expired.</span>`); state.blessing = null; }
    } else {
      const prevTier = getFatigueInfo().tier;
      state.fatigue = Math.min(100, state.fatigue + 2);
      const newInfo = getFatigueInfo();
      if (newInfo.tier !== prevTier) addLog(`<span style="color:${newInfo.color}; font-weight:bold;">🥾 FATIGUE WARNING: [${newInfo.tier}] (${state.fatigue} Fatigue)! Rest at 🏘️ Town Inn!</span>`);
    }
  }
  handleTileStep(tile);
  renderExplore();
  updateHeaderUI();
}

export function clickMapTile(tx, ty) {
  const tile = state.map.tiles[ty][tx];
  if (!tile.revealed || (tile.type === 'wall' && !tile.breakable)) return;
  const dist = Math.abs(tx - state.map.px) + Math.abs(ty - state.map.py);
  if (dist === 0 && (tile.type === 'town_citizen' || tile.type.startsWith('bldg_'))) {
    handleTileStep(tile);
  } else if (dist === 1) {
    movePlayer(tx - state.map.px, ty - state.map.py);
  } else if (dist > 1) {
    const stepX = tx !== state.map.px ? Math.sign(tx - state.map.px) : 0;
    const stepY = stepX === 0 ? Math.sign(ty - state.map.py) : 0;
    const candHoriz = stepX !== 0 ? state.map.tiles[state.map.py][state.map.px + stepX] : null;
    if (candHoriz && (candHoriz.type !== 'wall' || candHoriz.breakable)) movePlayer(stepX, 0);
    else if (ty !== state.map.py) movePlayer(0, Math.sign(ty - state.map.py));
  }
}

export function handleTileStep(tile) {
  const diveMult = 1 + (state.map.divePrestige || 0) * 0.25;
  if (tile.type === 'ore') {
    const pMult = ((state.blessing && state.blessing.id === 'prospector') ? 1.5 : 1.0) * diveMult;
    const oreGain = Math.round((6 + Math.floor(Math.random() * 5)) * pMult);
    const batGain = Math.round((5 + Math.floor(Math.random() * 5)) * pMult);
    const goldGain = Math.round((14 + Math.floor(Math.random() * 10)) * pMult);
    state.resources.ore += oreGain; state.resources.batteries += batGain; state.resources.gold += goldGain;
    tile.type = 'floor';
    addLog(`<span style="color:#fcd34d;">⛏ Prospected Resource Vein: +${oreGain}⛏ Ore, +${batGain}⚡ Batteries, +${goldGain}🪙 Gold!</span>`);
  } else if (['town','arena_cellar','small_cellar','big_cellar','spider_dungeon','foundry_dungeon'].includes(tile.type)) {
    enterSubMap(tile);
  } else if (tile.type === 'town_citizen') {
    window.openTownCitizenModal(tile.citizenId);
  } else if (tile.type.startsWith('bldg_')) {
    openTownBuildingModal(tile.type);
  } else if (tile.type === 'exit_ladder') {
    exitSubMapToOverworld();
  } else if (tile.type === 'stairs_down') {
    loadSubMapFloor(state.subMap.floor + 1, 'up_entry');
    if (state.subMap.kind === 'arena_cellar') addLog(`<span style="color:#fde047; font-weight:bold;">⏬ Arena Tier ${state.subMap.floor}! Law: ${JUDGE_LAWS[state.subMap.judgeLaw].name}!</span>`);
    else addLog(`<span style="color:#a5f3fc;">⏬ Descended to Floor ${state.subMap.floor}/${state.subMap.maxFloors}!</span>`);
  } else if (tile.type === 'stairs_up') {
    loadSubMapFloor(state.subMap.floor - 1, 'down_return');
  } else if (tile.type === 'chest_unlocked') {
    openUnlockedChest(tile);
  } else if (tile.type === 'chest_locked') {
    openLockedChestModal(tile);
  } else if (tile.type === 'crystal' && !tile.attuned) {
    tile.attuned = true;
    state.map.attuned.push(tile.element);
    state.resources.batteries += 8; state.resources.gold += 20;
    addLog(`<span style="color:#a5f3fc;">💎 Attuned ${EL_ICONS[tile.element]} <b>${tile.element} Crystal</b> (+8⚡, +20🪙)!</span>`);
    if (state.map.attuned.length >= state.map.elements.length && !state.map.stabilized) {
      state.map.stabilized = true;
      if (!state.map.isMosaicDive) {
        const boost = state.map.crystalBoost || 0;
        const newShard = {
          id:'sh_' + Date.now() + Math.floor(Math.random() * 99),
          name:state.map.name.replace(/\s*\[.*\]/, '') + (boost > 0 ? ' +' : ''),
          elements:[...state.map.elements],
          batRate:3 * state.map.elements.length + Math.floor(Math.random() * 3) + boost * 3,
          oreRate:2 * state.map.elements.length + Math.floor(Math.random() * 3) + boost * 2,
          prestige:0, prime:false, pinned:false
        };
        state.vaultShards.push(newShard);
        addLog(`<span style="color:#fde047; font-weight:bold;">🌟 SKY-SHARD STABILIZED! Added [${newShard.name}] (+${newShard.batRate}⚡/m, +${newShard.oreRate}⛏/m) to Mosaic Vault!</span>`);
      } else {
        const pBonus = 2 + (state.map.divePrestige || 0);
        state.resources.tokens += pBonus;
        addLog(`<span style="color:#fde047; font-weight:bold;">🌟 SHARD DIVE COMPLETE! +${pBonus}🎰 Dreamsmith Tokens!</span>`);
      }
    }
  } else if (tile.type === 'shrine') {
    state.resources.seals += 1;
    const added = window.grantTypedBadge(1);
    tile.type = 'floor';
    addLog(`<span style="color:#6ee7b7;">⛩ Field Shrine: +1📜 Teacher Seal${added?.length ? ` & +1 ${added.join(', ')}` : ' (Badge Pouch full 5/5)'}!</span>`);
  } else if (tile.type === 'well') { tile.type = 'floor'; openChaosWellModal(); }
  else if (tile.type === 'mystery_event') { tile.type = 'floor'; openMysteryEventModal(); }
  else if (tile.type === 'arena_boss') launchMapEncounter(tile, 'arena_boss');
  else if (tile.type === 'monster') launchMapEncounter(tile, 'pack');
  else if (tile.type === 'mob_spider') launchMapEncounter(tile, 'spider_pack');
  else if (tile.type === 'mob_foundry') launchMapEncounter(tile, 'foundry_pack');
  else if (tile.type === 'boss_spider') launchMapEncounter(tile, 'boss_spider');
  else if (tile.type === 'boss_foundry') launchMapEncounter(tile, 'boss_foundry');
  else if (tile.type === 'elite') launchMapEncounter(tile, 'elite');
  else if (tile.type === 'kaiju') launchMapEncounter(tile, 'kaiju');
}

/* ============================================================================
   v0.2f BADGED MONSTER CITIZEN PLAZA INTERACTIONS (SMUGGLER, FORGE-KIN, TRICKSTER + RIVAL/TUTOR SHEETS)
   ============================================================================ */
export function openTownCitizenModal(citizenIdx) {
  const td = state.subMap.townData;
  const cit = td?.citizens?.[citizenIdx];
  if (!cit) return;
  const rMeta = ROLE_BADGE_TYPES[cit.role] || ROLE_BADGE_TYPES.smuggler;

  if (cit.role === 'smuggler') {
    const sk = SKILLS[cit.smugglerSkill] || SKILLS.pkg_gale_slash;
    const skCost = cit.tier >= 2 ? 22 : 28;
    const shardCost = cit.tier >= 2 ? 28 : 38;
    openModal(`
      <div style="font-size:15px; font-weight:900; color:#fcd34d; margin-bottom:4px;">
        💰 ${cit.sprite} ${cit.name.toUpperCase()} — ELEMENTAL BLACK MARKET ${cit.tier >= 2 ? '<span class="u-tag u-Chaos">ELITE TIER</span>' : ''}
      </div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:10px;">
        <i>"Heh, beats getting pummeled in the wilds! Check out what I smuggled out of the ${cit.element} veins..."</i>
      </div>
      <div style="display:flex; flex-direction:column; gap:7px; margin-bottom:12px;">
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <b>🧩 Attuned Key Shard (${state.keyShards}/3 Held)</b>
            <div style="font-size:10.5px; color:var(--text-muted);">Collect 3 Key Shards to auto-forge a <b>Lv.${cit.tier >= 2 ? 2 : 1} ${cit.element}-Attuned Key</b>!</div>
          </div>
          <button class="btn-gold" ${cit.shardSold ? 'disabled' : ''} onclick="useCitizenSmuggler(${citizenIdx}, 'keyshard', ${shardCost})">
            ${cit.shardSold ? 'Sold Out' : `Buy (${shardCost}🪙)`}
          </button>
        </div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <b>📦 ${sk.name}</b> <span class="u-tag u-${sk.umbrella}">${sk.umbrella}</span> <span class="el-tag el-${sk.element}">${EL_ICONS[sk.element]} ${sk.element}</span>
            <div style="font-size:10.5px; color:var(--text-muted);">${sk.desc}</div>
          </div>
          <button class="btn-cyan" ${cit.smugglerSkillSold ? 'disabled' : ''} onclick="useCitizenSmuggler(${citizenIdx}, 'skill', ${skCost})">
            ${cit.smugglerSkillSold ? 'Bought' : `Buy (${skCost}🪙)`}
          </button>
        </div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <b>🍙 Smuggled Monster Jerky</b>
            <div style="font-size:10.5px; color:var(--text-muted);">Clears <b>-35🥾 Fatigue</b> + +10⚡ Batteries (Cheap contrabands!)</div>
          </div>
          <button class="btn-emerald" onclick="useCitizenSmuggler(${citizenIdx}, 'jerky', 10)">Buy (10🪙)</button>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Leave Stall</button></div>
    `);
  } else if (cit.role === 'forgekin') {
    const canTransmute = state.armory.length >= 2;
    openModal(`
      <div style="font-size:15px; font-weight:900; color:#fb923c; margin-bottom:4px;">🔨 ${cit.sprite} ${cit.name.toUpperCase()} — FORGE-KIN TINKER STALL</div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:10px;">
        <i>"Give me two spare Armory scrolls and I'll hammer 'em into a high-pip technique—or let me supercharge this shard's Crystals!"</i>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <b style="color:#fde68a;">🔥 2-for-1 Armory Transmutation (${state.armory.length} spare in Armory)</b>
            <div style="font-size:10.5px; color:var(--text-muted);">Consumes 2 spare Armory skills to forge a 2–3 Pip Capstone or Monster Signature Scroll!</div>
          </div>
          <button class="btn-gold" ${!canTransmute ? 'disabled' : ''} onclick="useCitizenForgeKin(${citizenIdx}, 'transmute')">Transmute (2 Scrolls)</button>
        </div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <b style="color:#67e8f9;">💎 Supercharge Sky-Shard Leylines (12⛏ Ore)</b>
            <div style="font-size:10.5px; color:var(--text-muted);">Permanently boosts this Sky-Shard's Vault yield by <b>+3⚡/min &amp; +2⛏/min</b> when Stabilized (+15⚡ now)!</div>
          </div>
          <button class="btn-cyan" ${cit.usedService ? 'disabled' : ''} onclick="useCitizenForgeKin(${citizenIdx}, 'supercharge')">
            ${cit.usedService ? 'Supercharged!' : 'Boost (12⛏)'}
          </button>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Back to Plaza</button></div>
    `);
  } else if (cit.role === 'trickster') {
    openModal(`
      <div style="font-size:15px; font-weight:900; color:#c084fc; margin-bottom:4px;">🎲 ${cit.sprite} ${cit.name.toUpperCase()} — COVENANT SPIRIT-DICE BOOTH</div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:10px;">
        <i>"Step right up! Under Covenant Law nobody dies, so wager a little sweat or coin on my 50/50 Spirit Bones!"</i>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <b style="color:#fde047;">🎲 Stamina Wager (+18🥾 Fatigue)</b>
            <div style="font-size:10.5px; color:var(--text-muted);">55% Win: <b>🗝️ Lv.${cit.tier} ${cit.element}-Attuned Key</b>! · 45% Lose: +2🎰 Casino Tokens consolation.</div>
          </div>
          <button class="btn-magenta" ${cit.usedService ? 'disabled' : ''} onclick="useCitizenTrickster(${citizenIdx}, 'key')">
            ${cit.usedService ? 'Rolled!' : 'Roll (+18🥾)'}
          </button>
        </div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <b style="color:#6ee7b7;">🪞 Vault Shard Mirror-Flip (35🪙 Gold)</b>
            <div style="font-size:10.5px; color:var(--text-muted);">55% Win: <b>Clones a random Vault Sky-Shard</b> (great for Prestige Fracking!) · 45% Lose: +2 Shinto Seals.</div>
          </div>
          <button class="btn-gold" ${cit.usedService ? 'disabled' : ''} onclick="useCitizenTrickster(${citizenIdx}, 'clone')">
            ${cit.usedService ? 'Rolled!' : 'Flip (35🪙)'}
          </button>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Back to Plaza</button></div>
    `);
  } else if (cit.role === 'rival') {
    const rv = cit.rivalSheet || rollMonsterAdventurerSheet({ name:cit.name, sprite:cit.sprite, element:cit.element, maxHp:140, atk:25, spd:22 });
    cit.rivalSheet = rv;
    const st = getHeroStats(rv);
    const sig = SKILLS[rv.sigSkillId];
    const bloomList = Object.entries(rv.chakras).filter(([, v]) => v === 'Bloomed').map(([k]) => k).join(', ');
    openModal(`
      <div style="font-size:15px; font-weight:900; color:#f472b6; margin-bottom:4px;">⚔️ RIVAL IN TOWN: ${rv.sprite} ${rv.name}</div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">
        <i>"You slapped a Rival Seal on me—so train up! Beat my champion form 1-on-1 and I'll join your Clan Squad!"</i>
      </div>
      <div class="bevel-inset" style="padding:9px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <div>
            <b style="color:#fde047; font-size:13px;">${rv.sprite} ${rv.name} (Lv.${rv.level} Monster-Adventurer)</b>
            <span class="u-tag u-${rv.umbrella}">${rv.umbrella}</span>
            <span class="el-tag el-${rv.element}">${EL_ICONS[rv.element]} ${rv.element}</span>
          </div>
          <span class="u-tag u-Tethers">🌟 Dual-Awakened</span>
        </div>
        <div style="font-size:11px; margin-top:5px;">HP <b>${st.maxHp}</b> · ATK <b>${st.atk}</b> · SPD <b>${st.spd}</b> · Row: <b>${rv.row}</b> · <span style="color:#34d399;">Bloomed: ${bloomList}</span></div>
        <div style="font-size:11px; color:#a5f3fc; margin-top:3px;">🔥 Signature Monster Move: <b>${sig ? sig.name : 'Monster Technique'}</b> — ${sig ? sig.desc : ''}</div>
        ${rv.knot ? `<div style="font-size:11px; color:#f472b6; margin-top:3px;">🔮 Innate Knot: <b>${CHAOS_KNOTS[rv.knot].name}</b></div>` : ''}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <button class="btn-magenta" ${cit.usedService ? 'disabled' : ''} onclick="claimWarmupSpar(${citizenIdx}, 'rival')">
          ${cit.usedService ? '✓ Warmup Claimed (1v1 Duel Next in v0.2g!)' : '🥊 Warmup Spar (+3🎰 Tokens & +1 Oni Ofuda)'}
        </button>
        <button class="btn-gold" onclick="closeModal()">Back to Plaza</button>
      </div>
    `);
  } else {
    // Tutor Citizen Preview + Instant Chakra Warmup Lesson (1v1 Target Dummy Trial coming in v0.2g!)
    const sig = SKILLS[cit.sigSkillId] || SKILLS.mon_slag_crush;
    openModal(`
      <div style="font-size:15px; font-weight:900; color:#67e8f9; margin-bottom:4px;">🥋 SENSEI IN TOWN: ${cit.sprite} MASTER ${cit.name.toUpperCase()}</div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">
        <i>"Setting up my Wooden Target Dummies (🎯) in the courtyard! Take a Chakra Breathing pointer now—full 1v1 Target Trials open in v0.2g!"</i>
      </div>
      <div class="bevel-inset" style="padding:9px; margin-bottom:10px;">
        <div style="font-size:11.5px; color:#fde047; font-weight:bold;">📜 Signature Dojo Scroll: ${sig.name} (${sig.umbrella} · ${sig.pips}■)</div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${sig.desc}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <button class="btn-cyan" ${cit.usedService ? 'disabled' : ''} onclick="claimWarmupSpar(${citizenIdx}, 'tutor')">
          ${cit.usedService ? '✓ Pointer Claimed (1v1 Target Trial in v0.2g!)' : '🧘 Take Breathing Pointer (Unblock 1 Chakra + 1📜)'}
        </button>
        <button class="btn-gold" onclick="closeModal()">Back to Plaza</button>
      </div>
    `);
  }
}

export function useCitizenSmuggler(citizenIdx, action, cost) {
  const cit = state.subMap.townData?.citizens?.[citizenIdx];
  if (!cit) return;
  if (state.resources.gold < cost) { addLog(`<span style="color:#fca5a5;">Need ${cost}🪙 Gold!</span>`); return; }
  state.resources.gold -= cost;

  if (action === 'keyshard' && !cit.shardSold) {
    cit.shardSold = true;
    state.keyShards += 1;
    if (state.keyShards >= 3) {
      state.keyShards -= 3;
      const forged = createRandomKey(cit.tier >= 2 ? 2 : 1, cit.element);
      state.keys.push(forged);
      addLog(`<span style="color:#fde047; font-weight:bold;">🗝️ 3/3 KEY SHARDS FORGED! Assembled <b>${forged.name}</b>!</span>`);
    } else {
      addLog(`<span style="color:#fcd34d;">🧩 Bought Smuggler Key Shard (${state.keyShards}/3 toward an Attuned Key)!</span>`);
    }
  } else if (action === 'skill' && !cit.smugglerSkillSold) {
    cit.smugglerSkillSold = true;
    state.armory.push(cit.smugglerSkill);
    addLog(`<span style="color:#67e8f9;">💰 Bought Black-Market Scroll <b>[${SKILLS[cit.smugglerSkill].name}]</b>!</span>`);
  } else if (action === 'jerky') {
    state.fatigue = Math.max(0, state.fatigue - 35);
    state.resources.batteries += 10;
    addLog(`<span style="color:#6ee7b7;">🍙 Ate Smuggled Jerky: -35🥾 Fatigue & +10⚡ Batteries!</span>`);
  }
  updateHeaderUI();
  openTownCitizenModal(citizenIdx);
}

export function useCitizenForgeKin(citizenIdx, mode) {
  const cit = state.subMap.townData?.citizens?.[citizenIdx];
  if (!cit) return;
  if (mode === 'transmute') {
    if (state.armory.length < 2) return;
    const s1 = SKILLS[state.armory.pop()]?.name || 'Scroll';
    const s2 = SKILLS[state.armory.pop()]?.name || 'Scroll';
    const rarePool = ['pkg_heaven_beam','pkg_boiler_overdrive','pkg_lotus_palm','pkg_starlight_vow','mon_slag_crush','mon_gale_fan','mon_shell_fortress','mon_umbral_strings'];
    const forgedId = rarePool[Math.floor(Math.random() * rarePool.length)];
    state.armory.push(forgedId);
    addLog(`<span style="color:#fb923c; font-weight:bold;">🔨 FORGE-KIN TRANSMUTE! Melted [${s1}] + [${s2}] → <b>[${SKILLS[forgedId].name}]</b>!</span>`);
  } else if (mode === 'supercharge' && !cit.usedService) {
    if (state.resources.ore < 12) { addLog(`<span style="color:#fca5a5;">Need 12⛏ Forge Ore!</span>`); return; }
    state.resources.ore -= 12;
    cit.usedService = true;
    if (state.overworldBackup) state.overworldBackup.crystalBoost = (state.overworldBackup.crystalBoost || 0) + 1;
    state.resources.batteries += 15;
    addLog(`<span style="color:#67e8f9; font-weight:bold;">💎 Forge-Kin ${cit.name} supercharged this Sky-Shard's Crystal Leylines (+3⚡/m & +2⛏/m Vault Yield + 15⚡ now)!</span>`);
  }
  updateHeaderUI();
  openTownCitizenModal(citizenIdx);
}

export function useCitizenTrickster(citizenIdx, wagerKind) {
  const cit = state.subMap.townData?.citizens?.[citizenIdx];
  if (!cit || cit.usedService) return;
  if (wagerKind === 'key') {
    cit.usedService = true;
    state.fatigue = Math.min(100, state.fatigue + 18);
    if (Math.random() < 0.55) {
      const k = createRandomKey(cit.tier >= 2 ? 2 : 1, cit.element);
      state.keys.push(k);
      addLog(`<span style="color:#fde047; font-weight:bold;">🎲 SPIRIT DICE WIN! ${cit.name} hands over 🗝️ <b>${k.name}</b> (+18🥾 Fatigue)!</span>`);
    } else {
      state.resources.tokens += 2;
      addLog(`<span style="color:#c084fc;">🎲 Snake eyes! ${cit.name} cackles and tosses you +2🎰 Casino Tokens (+18🥾 Fatigue).</span>`);
    }
  } else {
    if (state.resources.gold < 35) { addLog(`<span style="color:#fca5a5;">Need 35🪙 Gold!</span>`); return; }
    state.resources.gold -= 35;
    cit.usedService = true;
    if (Math.random() < 0.55 && state.vaultShards.length > 0) {
      const src = state.vaultShards[Math.floor(Math.random() * state.vaultShards.length)];
      const clone = { ...src, id:'clone_' + Date.now(), name:`Mirrored ${src.name}`, elements:[...src.elements], pinned:false };
      state.vaultShards.push(clone);
      addLog(`<span style="color:#6ee7b7; font-weight:bold;">🪞 MIRROR-FLIP JACKPOT! Cloned Vault Shard <b>[${clone.name}]</b>!</span>`);
    } else {
      const sPick = SHINTO_SEALS[Math.floor(Math.random() * SHINTO_SEALS.length)];
      state.sealCounts[sPick.id] = (state.sealCounts[sPick.id] || 0) + 2;
      addLog(`<span style="color:#c084fc;">🎲 Trickster flip missed, but awarded <b>+2× ${sPick.icon} ${sPick.name}</b>!</span>`);
    }
  }
  closeModal();
  updateHeaderUI();
}

export function claimWarmupSpar(citizenIdx, kind) {
  const cit = state.subMap.townData?.citizens?.[citizenIdx];
  if (!cit || cit.usedService) return;
  cit.usedService = true;
  if (kind === 'rival') {
    state.resources.tokens += 3;
    state.sealCounts.oni_ofuda = (state.sealCounts.oni_ofuda || 0) + 1;
    addLog(`<span style="color:#f472b6; font-weight:bold;">⚔️ Clashed fists with Rival <b>${cit.name}</b> (+3🎰 Tokens & +1👹 Oni Ofuda)!</span>`);
  } else {
    state.resources.seals += 1;
    let note = '+1📜 Teacher Seal';
    for (const h of state.heroes) {
      const blk = Object.keys(h.chakras).find(k => h.chakras[k] === 'Blocked');
      if (blk) { h.chakras[blk] = 'Open'; note = `Unblocked ${h.name}'s ${blk} Chakra + 1📜 Seal`; break; }
    }
    addLog(`<span style="color:#67e8f9; font-weight:bold;">🥋 Sensei <b>${cit.name}</b>'s pointer: ${note}!</span>`);
  }
  updateHeaderUI();
  openTownCitizenModal(citizenIdx);
}

/* ============================================================================
   TOWN BUILDINGS (TAVERN, INN, BAZAAR, SCHOOL, SHRINE, KEYSMITH)
   ============================================================================ */
export function openTownBuildingModal(bldgType) {
  const td = state.subMap.townData;
  if (!td) return;
  const disc = td.discount || 1.0;

  if (bldgType === 'bldg_tavern') {
    const rerollCost = Math.round(16 * disc);
    const cardsHtml = td.recruits.map((adv, idx) => {
      if (adv.hired) return `<div class="bevel-inset" style="padding:10px; opacity:0.5; text-align:center;">✓ <b>${adv.name}</b> already joined your Clan!</div>`;
      const st = getHeroStats(adv);
      const cost = Math.round(adv.hireCost * disc);
      const bloomList = Object.entries(adv.chakras).filter(([, v]) => v === 'Bloomed').map(([k]) => k).join(', ');
      const blockList = Object.entries(adv.chakras).filter(([, v]) => v === 'Blocked').map(([k]) => k).join(', ');
      const f1Names = adv.folders[0].map(sid => SKILLS[sid]?.name).filter(Boolean).join(' + ');
      const relicObj = ANCHOR_RELICS[adv.folders[2][0]];
      const swapOpts = state.heroes.map((h, hIdx) => `<option value="${hIdx}">Swap w/ ${h.sprite} ${h.name} (${h.umbrella})</option>`).join('');
      return `
        <div class="bevel-inset" style="padding:8px; display:flex; flex-direction:column; gap:5px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div>
              <b style="font-size:13px; color:#fde047;">${adv.sprite} ${adv.name}</b>
              <span class="u-tag u-${adv.umbrella}">${adv.umbrella}</span>
              <span class="el-tag el-${adv.element}">${EL_ICONS[adv.element]} ${adv.element}</span>
              <span style="font-size:11px; color:#94a3c8;">[${adv.row} · Lv.${adv.level}${adv.ascended ? ' · 🌟Ascended' : ''}]</span>
            </div>
            <span style="font-weight:bold; color:#fcd34d;">${cost}🪙 Gold</span>
          </div>
          <div style="font-size:11px;">HP <b>${st.maxHp}</b> · ATK <b>${st.atk}</b> · SPD <b>${st.spd}</b> | <span style="color:#34d399;">Bloomed: ${bloomList}</span> · <span style="color:#f87171;">Blocked: ${blockList}</span></div>
          <div style="font-size:10.5px; color:#a5f3fc;">⚔ Kit: <b>${f1Names}</b> · ⚓ Relic: <b>${relicObj ? relicObj.relicName : 'Standard'}</b></div>
          ${adv.knot ? `<div style="font-size:10.5px; color:#f472b6;">🔮 <b>Pre-Knotted:</b> ${CHAOS_KNOTS[adv.knot].name}</div>` : ''}
          <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top:2px;">
            <select id="tavern-swap-${idx}" style="padding:4px 6px; background:#0d1224; color:#fff; border:1px solid #4a5a8a; font-family:inherit; font-size:11px; flex:1;">${swapOpts}</select>
            <button class="btn-gold" onclick="hireTavernAdventurer(${idx}, true)">⚔ Hire &amp; Swap</button>
            <button class="btn-cyan" onclick="hireTavernAdventurer(${idx}, false)">👷 Bench</button>
          </div>
        </div>`;
    }).join('');
    openModal(`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:15px; font-weight:900; color:#fde047;">🍺 WAYFARER TAVERN — DRAFT ADVENTURER</span>
        <button class="btn-magenta" style="padding:3px 8px; font-size:11px;" onclick="rerollTavernRecruits()">🎲 Buy Round (${rerollCost}🪙)</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">${cardsHtml}</div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Back to Town</button></div>
    `);
  } else if (bldgType === 'bldg_inn') {
    const soupCost = Math.round(16 * disc), bedCost = Math.round(32 * disc), fInfo = getFatigueInfo();
    openModal(`
      <div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:6px;">🛏️ HEARTHSTONE INN — REST &amp; RECOVERY</div>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Party Fatigue: <b style="color:${fInfo.color};">${state.fatigue}/100 (${fInfo.tier})</b> — ${fInfo.desc}.</div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><b style="color:#fde68a;">🍲 Herbal Broth (${soupCost}🪙)</b><div style="font-size:11px; color:var(--text-muted);">Removes -40 Fatigue immediately.</div></div>
          <button class="btn-cyan" onclick="useTownInn('broth', ${soupCost})">Rest (${soupCost}🪙)</button>
        </div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><b style="color:#6ee7b7;">🛏️ Featherbed Suite (${bedCost}🪙)</b><div style="font-size:11px; color:var(--text-muted);">Clears ALL Fatigue to 0 + +22 Well-Rested Shield!</div></div>
          <button class="btn-gold" onclick="useTownInn('suite', ${bedCost})">Full Rest (${bedCost}🪙)</button>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Back to Town</button></div>
    `);
  } else if (bldgType === 'bldg_shop') {
    const badgeCost = Math.round(24 * disc), rationCost = Math.round(14 * disc), sealCost = Math.round(28 * disc), keyCost = Math.round(95 * disc);
    const bType = ROLE_BADGE_TYPES[td.shopBadgeType || 'rival'];
    const pouchFull = state.badgePouch.length >= MAX_BADGE_POUCH;
    openModal(`
      <div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:6px;">🛒 PEDDLER BAZAAR (${state.resources.gold}🪙 Held)</div>
      <div style="display:flex; flex-direction:column; gap:7px; margin-bottom:12px;">
        <div class="bevel-inset" style="padding:7px 9px; display:flex; justify-content:space-between; align-items:center;">
          <div><b>🍙 Wayfarer Camp Rations</b><div style="font-size:10.5px; color:var(--text-muted);">-25🥾 Fatigue + +6⚡ Batteries</div></div>
          <button class="btn-emerald" onclick="buyShopItem('rations', ${rationCost})">Buy (${rationCost}🪙)</button>
        </div>
        <div class="bevel-inset" style="padding:7px 9px; display:flex; justify-content:space-between; align-items:center;">
          <div><b style="color:${bType.color};">${bType.icon} 1× ${bType.name}</b><div style="font-size:10.5px; color:var(--text-muted);">${td.shopBadgeSold ? 'Sold out for this shard' : (pouchFull ? 'Badge Pouch at max 5/5!' : bType.desc)}</div></div>
          <button class="btn-cyan" ${(td.shopBadgeSold || pouchFull) ? 'disabled' : ''} onclick="buyShopItem('badges', ${badgeCost})">${td.shopBadgeSold ? 'Sold' : `Buy (${badgeCost}🪙)`}</button>
        </div>
        <div class="bevel-inset" style="padding:7px 9px; display:flex; justify-content:space-between; align-items:center;">
          <div><b>⛩️ Random Shinto Seal + 1📜 Teacher Seal</b></div>
          <button class="btn-magenta" onclick="buyShopItem('seals', ${sealCost})">Buy (${sealCost}🪙)</button>
        </div>
        <div class="bevel-inset" style="padding:7px 9px; display:flex; justify-content:space-between; align-items:center;">
          <div><b>🗝️ ${td.shopKeySold ? 'Rare Attuned Key (Out of Stock)' : td.shopKey.name}</b></div>
          <button class="btn-gold" ${td.shopKeySold ? 'disabled' : ''} onclick="buyShopItem('key', ${keyCost})">${td.shopKeySold ? 'Unavailable' : `Buy (${keyCost}🪙)`}</button>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Back to Town</button></div>
    `);
  } else if (bldgType === 'bldg_school') {
    const rows = td.schoolStock.map((entry, idx) => {
      const sk = SKILLS[entry.skillId], cost = Math.round((28 + sk.pips * 12) * disc);
      return `<div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div><b>${sk.name}</b> <span class="u-tag u-${sk.umbrella}">${sk.umbrella}</span> <span style="font-size:11px; color:#fde047;">${sk.pips}■</span><div style="font-size:10.5px; color:var(--text-muted);">${sk.desc}</div></div>
        <button class="btn-gold" ${entry.sold ? 'disabled' : ''} onclick="buySchoolTechnique(${idx}, ${cost})">${entry.sold ? 'Learned' : `Learn (${cost}🪙)`}</button>
      </div>`;
    }).join('');
    openModal(`<div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:8px;">🥋 TECHNIQUE SCHOOL</div><div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">${rows}</div><div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Back to Town</button></div>`);
  } else if (bldgType === 'bldg_shrine') {
    if (td.shrineUsed) { openModal(`<div style="font-size:15px; font-weight:900; color:#6ee7b7; margin-bottom:8px;">⛩️ TOWN SHRINE</div><div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">Blessing already claimed on this Sky-Shard!</div><button class="btn-gold" onclick="closeModal()">Close</button>`); return; }
    openModal(`
      <div style="font-size:15px; font-weight:900; color:#6ee7b7; margin-bottom:8px;">⛩️ TOWN BLESSING SHRINE</div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;"><div><b style="color:#67e8f9;">🌬️ Gale-Walker's Stride</b><div style="font-size:11px; color:var(--text-muted);">-15 Fatigue &amp; next 18 Overworld steps cost 0 Fatigue!</div></div><button class="btn-cyan" onclick="claimTownBlessing('swiftfoot')">Receive</button></div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;"><div><b style="color:#fde047;">⛏️ Geomancer's Fortune</b><div style="font-size:11px; color:var(--text-muted);">+50% Gold, Ore &amp; Batteries on this Sky-Shard!</div></div><button class="btn-gold" onclick="claimTownBlessing('prospector')">Receive</button></div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;"><div><b style="color:#a7f3d0;">🛡️ Covenant Sanctuary Ward</b><div style="font-size:11px; color:var(--text-muted);">+24 Start Shield &amp; +25% Overdrive in battles!</div></div><button class="btn-emerald" onclick="claimTownBlessing('sanctuary')">Receive</button></div>
      </div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Back to Town</button></div>
    `);
  } else if (bldgType === 'bldg_keysmith') {
    const upgOre = Math.round(10 * disc);
    const keyRows = state.keys.map((k, idx) => `
      <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <div><span class="el-tag el-${k.element === 'Chaos' ? 'Dark' : k.element}">${EL_ICONS[k.element] || '🗝️'} Lv.${k.level}</span> <b style="margin-left:5px;">${k.name}</b></div>
        <div style="display:flex; gap:5px;">
          <button class="btn-gold" style="padding:3px 7px; font-size:10.5px;" ${k.level >= 3 ? 'disabled' : ''} onclick="upgradeKeyAtSmith(${idx}, ${upgOre})">${k.level >= 3 ? 'Max' : `⬆ Lv.${k.level + 1} (${upgOre}⛏)`}</button>
          <button class="btn-magenta" style="padding:3px 7px; font-size:10.5px;" onclick="reattuneKeyChaos(${idx})">🌀 Chaos (18⚡)</button>
        </div>
      </div>`).join('');
    openModal(`<div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:8px;">🔨 RELIQUARY KEYSMITH</div><div style="display:flex; flex-direction:column; gap:7px; margin-bottom:12px;">${keyRows || `<div class="bevel-inset" style="padding:10px; color:var(--text-muted); text-align:center;">No keys held!</div>`}</div><div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Back to Town</button></div>`);
  }
}

export function rerollTavernRecruits() {
  const td = state.subMap.townData; if (!td) return;
  const cost = Math.round(16 * (td.discount || 1));
  if (state.resources.gold < cost) { addLog(`<span style="color:#fca5a5;">Need ${cost}🪙 Gold!</span>`); return; }
  state.resources.gold -= cost;
  td.recruits = [generateRandomAdventurer(), generateRandomAdventurer(), generateRandomAdventurer()];
  updateHeaderUI(); openTownBuildingModal('bldg_tavern');
}

export function hireTavernAdventurer(recIdx, swapIntoParty) {
  const td = state.subMap.townData, adv = td?.recruits[recIdx];
  if (!adv || adv.hired) return;
  const cost = Math.round(adv.hireCost * (td.discount || 1));
  if (state.resources.gold < cost) { addLog(`<span style="color:#fca5a5;">Need ${cost}🪙 Gold!</span>`); return; }
  state.resources.gold -= cost; adv.hired = true;
  if (swapIntoParty) {
    const sel = document.getElementById('tavern-swap-' + recIdx);
    const swapIdx = sel ? parseInt(sel.value, 10) : 0;
    const outgoing = state.heroes[swapIdx];
    if (outgoing) {
      state.benchRoster.push({ id:'b_hero_' + outgoing.id + '_' + Date.now(), name:`${outgoing.name} (Benched ${outgoing.umbrella})`, icon:outgoing.sprite, role:'+25% ⚡ & +25% ⛏ Mosaic Yield', batMult:0.25, oreMult:0.25, xpBonus:10, badgeBonus:0, assigned:state.benchRoster.filter(b => b.assigned).length < 3 });
      state.heroes[swapIdx] = adv; state.selectedLabHeroId = adv.id;
      addLog(`<span style="color:#6ee7b7; font-weight:bold;">🍺 Drafted <b>${adv.sprite} ${adv.name}</b> into Squad!</span>`);
    }
  } else {
    state.benchRoster.push({ id:'b_adv_' + adv.id, name:`${adv.name} (${adv.umbrella} Scout)`, icon:adv.sprite, role:'+30% ⚡ & +20% ⛏ Mosaic Yield', batMult:0.30, oreMult:0.20, xpBonus:5, badgeBonus:0, assigned:state.benchRoster.filter(b => b.assigned).length < 3 });
    addLog(`<span style="color:#67e8f9;">🍺 Recruited <b>${adv.sprite} ${adv.name}</b> to Logistics Bench!</span>`);
  }
  updateHeaderUI(); openTownBuildingModal('bldg_tavern');
}

export function useTownInn(tier, cost) {
  if (state.resources.gold < cost) { addLog(`<span style="color:#fca5a5;">Need ${cost}🪙 Gold!</span>`); return; }
  state.resources.gold -= cost;
  if (tier === 'broth') { state.fatigue = Math.max(0, state.fatigue - 40); addLog(`<span style="color:#6ee7b7;">🍲 Herbal Broth: Fatigue reduced to ${state.fatigue}!</span>`); }
  else { state.fatigue = 0; state.wellRestedShield = 22; addLog(`<span style="color:#fde047; font-weight:bold;">🛏️ Full Rest! Fatigue 0 & +22 Well-Rested Shield!</span>`); }
  closeModal(); updateHeaderUI();
}

export function buyShopItem(kind, cost) {
  const td = state.subMap.townData;
  if (state.resources.gold < cost) { addLog(`<span style="color:#fca5a5;">Need ${cost}🪙 Gold!</span>`); return; }
  state.resources.gold -= cost;
  if (kind === 'rations') { state.fatigue = Math.max(0, state.fatigue - 25); state.resources.batteries += 6; addLog(`<span style="color:#6ee7b7;">🍙 Ate Rations: -25 Fatigue & +6⚡!</span>`); }
  else if (kind === 'badges' && td && !td.shopBadgeSold) {
    td.shopBadgeSold = true;
    const added = window.grantTypedBadge(1, td.shopBadgeType || 'rival');
    if (added.length) addLog(`<span style="color:#f472b6; font-weight:bold;">🛒 Purchased ${added[0]}!</span>`);
  } else if (kind === 'seals') {
    const sPick = SHINTO_SEALS[Math.floor(Math.random() * SHINTO_SEALS.length)];
    state.sealCounts[sPick.id] = (state.sealCounts[sPick.id] || 0) + 1; state.resources.seals += 1;
    addLog(`<span style="color:#f472b6;">🛒 Purchased ${sPick.icon} <b>${sPick.name}</b> + 1📜 Seal!</span>`);
  } else if (kind === 'key' && td && !td.shopKeySold) {
    td.shopKeySold = true; state.keys.push(td.shopKey);
    addLog(`<span style="color:#fde047; font-weight:bold;">🗝️ Purchased <b>${td.shopKey.name}</b>!</span>`);
  }
  updateHeaderUI(); openTownBuildingModal('bldg_shop');
}

export function buySchoolTechnique(idx, cost) {
  const entry = state.subMap.townData?.schoolStock[idx];
  if (!entry || entry.sold || state.resources.gold < cost) return;
  state.resources.gold -= cost; entry.sold = true; state.armory.push(entry.skillId);
  addLog(`<span style="color:#fde047; font-weight:bold;">🥋 Learned <b>[${SKILLS[entry.skillId].name}]</b>!</span>`);
  updateHeaderUI(); openTownBuildingModal('bldg_school');
}

export function claimTownBlessing(blessingId) {
  const td = state.subMap.townData; if (!td || td.shrineUsed) return;
  td.shrineUsed = true;
  if (blessingId === 'swiftfoot') { state.fatigue = Math.max(0, state.fatigue - 15); state.blessing = { id:'swiftfoot', name:'Gale-Walker', icon:'🌬️', desc:'0 Fatigue steps', freeSteps:18 }; }
  else if (blessingId === 'prospector') state.blessing = { id:'prospector', name:'Geomancer +50%', icon:'⛏️', desc:'+50% Shard Loot', freeSteps:0 };
  else state.blessing = { id:'sanctuary', name:'Sanctuary Ward', icon:'🛡️', desc:'+24 Start Shield & +25% Overdrive', freeSteps:0 };
  addLog(`<span style="color:#6ee7b7; font-weight:bold;">⛩️ Claimed Blessing: <b>${state.blessing.name}</b>!</span>`);
  closeModal(); updateHeaderUI();
}

export function upgradeKeyAtSmith(keyIdx, oreCost) {
  const k = state.keys[keyIdx]; if (!k || k.level >= 3 || state.resources.ore < oreCost) return;
  state.resources.ore -= oreCost; k.level += 1; k.name = `Lv.${k.level} ${k.element}-Attuned Key`;
  updateHeaderUI(); openTownBuildingModal('bldg_keysmith');
}

export function reattuneKeyChaos(keyIdx) {
  const k = state.keys[keyIdx]; if (!k || state.resources.batteries < 18) return;
  state.resources.batteries -= 18; k.element = 'Chaos'; k.name = `Lv.${k.level} Chaos-Attuned Key`;
  updateHeaderUI(); openTownBuildingModal('bldg_keysmith');
}

/* ============================================================================
   CHESTS, CHAOS WELLS, EVENTS & HOVER TOOLTIPS
   ============================================================================ */
export function openUnlockedChest(tile) {
  const wasFinal = !!tile.isFinalCellarChest || (state.subMap.active && state.subMap.floor === state.subMap.maxFloors);
  tile.type = 'floor';
  const diveMult = 1 + (state.map.divePrestige || 0) * 0.25;
  const gold = Math.round((30 + Math.floor(Math.random() * 25)) * diveMult);
  const bat = Math.round((10 + Math.floor(Math.random() * 8)) * diveMult);
  const ore = Math.round((7 + Math.floor(Math.random() * 6)) * diveMult);
  state.resources.gold += gold; state.resources.batteries += bat; state.resources.ore += ore;
  let bonusMsg = '';
  const rareKeyOdds = state.subMap.kind === 'big_cellar' ? (0.05 + (state.map.divePrestige || 0) * 0.02) : 0;
  if (rareKeyOdds > 0 && Math.random() < rareKeyOdds) { const k = createRandomKey(1); state.keys.push(k); bonusMsg = ` + 🗝️ <b>${k.name}</b>!`; }
  else if (Math.random() < 0.35) { const pool = ['pkg_gale_slash','pkg_grapple_wire','pkg_frost_snap','pkg_beast_fang']; const p = pool[Math.floor(Math.random() * pool.length)]; state.armory.push(p); bonusMsg = ` + 📦 <b>${SKILLS[p].name}</b>!`; }
  addLog(`<span style="color:#fde047;">📦 Opened Chest: +${gold}🪙, +${bat}⚡, +${ore}⛏${bonusMsg}</span>`);
  if (wasFinal) spawnSurfacePortalNear(tile.x, tile.y);
  updateHeaderUI();
}

let pendingChestTile = null;
export function openLockedChestModal(tile) {
  pendingChestTile = tile;
  const isGrand = !!tile.grandChest;
  const keyRows = state.keys.map((k, idx) => `
    <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
      <div><span class="el-tag el-${k.element === 'Chaos' ? 'Dark' : k.element}">${EL_ICONS[k.element] || '🗝️'} Lv.${k.level}</span> <b style="color:#fde68a;">${k.name}</b></div>
      <button class="btn-gold" onclick="unlockChestWithKey(${idx})">Use Key</button>
    </div>`).join('');
  openModal(`
    <div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:6px;">${isGrand ? '🔒 GRAND RELIQUARY CHEST' : '🔒 ATTUNED LOCKED CHEST'}</div>
    <div style="display:flex; flex-direction:column; gap:7px; margin-bottom:12px;">
      ${keyRows || `<div class="bevel-inset" style="padding:10px; color:#fca5a5; text-align:center;">0 Keys held! Earn Key Shards from Badged Town Smugglers or Slot Jackpots, or Force Pry below.</div>`}
    </div>
    <div style="display:flex; justify-content:space-between;"><button class="btn-crimson" onclick="pryLockedChest()">🪓 Force Pry (25% Scrap)</button><button onclick="closeModal()">Leave Locked</button></div>
  `);
}

export function unlockChestWithKey(keyIdx) {
  const key = state.keys[keyIdx];
  if (!key || !pendingChestTile) { closeModal(); return; }
  state.keys.splice(keyIdx, 1);
  const cx = pendingChestTile.x, cy = pendingChestTile.y;
  const wasFinal = !!pendingChestTile.isFinalCellarChest || (state.subMap.active && state.subMap.floor === state.subMap.maxFloors);
  const isGrand = !!pendingChestTile.grandChest;
  pendingChestTile.type = 'floor'; pendingChestTile = null;

  const mult = key.level * (isGrand ? 1.8 : 1.0) * (1 + (state.map.divePrestige || 0) * 0.20);
  const gold = Math.round(55 * mult), bat = Math.round(20 * mult), ore = Math.round(14 * mult);
  state.resources.gold += gold; state.resources.batteries += bat; state.resources.ore += ore;
  const notes = [`+${gold}🪙`, `+${bat}⚡`, `+${ore}⛏`];

  if (key.element === 'Chaos') {
    const kList = Object.keys(CHAOS_KNOTS);
    const pickK = CHAOS_KNOTS[kList[Math.floor(Math.random() * kList.length)]];
    const lead = state.heroes.find(h => h.id === state.selectedLabHeroId) || state.heroes[0];
    lead.knot = pickK.id; state.armory.push('pkg_silk_snare');
    notes.push(`🌀 <b>${pickK.name}</b> on ${lead.name}`);
  } else {
    const allPkgs = Object.keys(SKILLS).filter(id => id.startsWith('pkg_'));
    const match = allPkgs.filter(id => SKILLS[id].element === key.element);
    const won = (match.length ? match : allPkgs)[Math.floor(Math.random() * (match.length || allPkgs.length))];
    state.armory.push(won); notes.push(`📦 <b>${SKILLS[won].name}</b>`);
    if (key.level >= 2 || isGrand) {
      state.vaultShards.push({ id:'chest_sh_' + Date.now(), name:`Reliquary ${key.element} Shard`, elements:[key.element], batRate:4 + key.level * 2, oreRate:3 + key.level, prestige:key.level >= 3 ? 1 : 0, prime:key.level === 3, pinned:false });
      notes.push(`💎 <b>Reliquary ${key.element} Shard</b>`);
    }
  }
  addLog(`<span style="color:#fde047; font-weight:bold;">🗝️ Unlocked w/ [${key.name}]: ${notes.join(' · ')}!</span>`);
  if (wasFinal) spawnSurfacePortalNear(cx, cy);
  closeModal(); updateHeaderUI(); renderExplore();
}

export function pryLockedChest() {
  if (!pendingChestTile) { closeModal(); return; }
  const cx = pendingChestTile.x, cy = pendingChestTile.y;
  const wasFinal = !!pendingChestTile.isFinalCellarChest || (state.subMap.active && state.subMap.floor === state.subMap.maxFloors);
  pendingChestTile.type = 'floor'; pendingChestTile = null;
  state.resources.gold += 14; state.resources.batteries += 5; state.resources.ore += 4;
  addLog(`<span style="color:#cbd5e1;">🪓 Pried Locked Chest (25% scrap): +14🪙, +5⚡, +4⛏.</span>`);
  if (wasFinal) spawnSurfacePortalNear(cx, cy);
  closeModal(); updateHeaderUI(); renderExplore();
}

export function openChaosWellModal() {
  const keys = Object.keys(CHAOS_KNOTS).sort(() => Math.random() - 0.5).slice(0, 2);
  const heroOpts = state.heroes.map((h, i) => `<option value="${i}">${h.sprite} ${h.name} (${h.knot ? CHAOS_KNOTS[h.knot].name : 'Unknotted'})</option>`).join('');
  const cards = keys.map(kid => `<div class="bevel-inset" style="padding:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;"><div><b style="color:#fbcfe8;">🔮 ${CHAOS_KNOTS[kid].name}</b><div style="font-size:11px;color:var(--text-muted);">${CHAOS_KNOTS[kid].desc}</div></div><button class="btn-magenta" onclick="spliceChaosKnot('${kid}')">Splice</button></div>`).join('');
  openModal(`<div style="font-size:15px;font-weight:900;color:#f472b6;margin-bottom:6px;">❓ PRIMAL CHAOS WELL</div><div style="margin-bottom:8px;"><select id="well-hero-sel" style="width:100%;padding:5px;background:#0d1224;color:#fff;border:1px solid #4a5a8a;font-family:inherit;">${heroOpts}</select></div><div style="display:flex;flex-direction:column;gap:7px;margin-bottom:10px;">${cards}</div><div style="display:flex;justify-content:space-between;"><button class="btn-gold" onclick="state.resources.tokens+=3;addLog('<span style=\\'color:#fde047;\\'>❓ Bottled Chaos vapor (+3🎰)!</span>');closeModal();updateHeaderUI();">🎰 Bottle (+3 Tokens)</button><button onclick="closeModal()">Leave</button></div>`);
}

export function spliceChaosKnot(knotId) {
  const sel = document.getElementById('well-hero-sel');
  const h = state.heroes[sel ? parseInt(sel.value, 10) : 0] || state.heroes[0];
  h.knot = knotId;
  addLog(`<span style="color:#f472b6;font-weight:bold;">🔮 CHAOS SPLICED! <b>${h.name}</b> gained [${CHAOS_KNOTS[knotId].name}]!</span>`);
  closeModal(); updateHeaderUI();
}

export const MYSTERY_EVENTS = [
  { id:'cart', title:'🎪 Contraband Dreamsmith Cart', desc:'A masked goblin peddler offers a sealed crate of salvaged tech for 20🪙 Gold.', a:'Buy Crate (20🪙)', b:'Salvage (+12⚡ +8⛏)' },
  { id:'obelisk', title:'🪞 Mirror-Glass Obelisk', desc:'A shimmering monolith hums with leyline energy.', a:'Meditate (-30🥾 Fatigue & +1📜)', b:'Siphon Shard (+18⚡)' },
  { id:'whale', title:'🐋 Stranded Sky-Whale Calf', desc:'A young cloud-leviathan is tangled near the shard rim.', a:'Free It (+1 Pre-Typed Badge & +25 XP)', b:'Harvest (+14⛏ +25🪙)' },
  { id:'riddle', title:'⚖️ Wandering Referee’s Wager', desc:'A Spirit Referee flips a golden coin: double your luck or take steady stipend.', a:'Call Heads (45% Rare Key / +2🎰)', b:'Take Stipend (+35🪙)' }
];

export function openMysteryEventModal() {
  const ev = MYSTERY_EVENTS[Math.floor(Math.random() * MYSTERY_EVENTS.length)];
  openModal(`<div style="font-size:15px;font-weight:900;color:#67e8f9;margin-bottom:6px;">${ev.title}</div><div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">${ev.desc}</div><div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;"><button class="btn-gold" onclick="resolveMysteryEvent('${ev.id}','a')">${ev.a}</button><button class="btn-cyan" onclick="resolveMysteryEvent('${ev.id}','b')">${ev.b}</button></div>`);
}

export function resolveMysteryEvent(id, choice) {
  if (id === 'cart') {
    if (choice === 'a' && state.resources.gold >= 20) { state.resources.gold -= 20; const allP = Object.keys(SKILLS).filter(k => k.startsWith('pkg_')); const w = allP[Math.floor(Math.random() * allP.length)]; state.armory.push(w); addLog(`<span style="color:#fde047;">🎪 Unboxed <b>[${SKILLS[w].name}]</b>!</span>`); }
    else { state.resources.batteries += 12; state.resources.ore += 8; addLog(`<span style="color:#67e8f9;">🎪 Salvaged +12⚡ & +8⛏!</span>`); }
  } else if (id === 'obelisk') {
    if (choice === 'a') { state.fatigue = Math.max(0, state.fatigue - 30); state.resources.seals += 1; addLog(`<span style="color:#6ee7b7;">🪞 Meditated: -30🥾 Fatigue & +1📜!</span>`); }
    else { state.resources.batteries += 18; addLog(`<span style="color:#67e8f9;">🪞 Siphoned +18⚡!</span>`); }
  } else if (id === 'whale') {
    if (choice === 'a') { const b = addRandomTypedBadge(); grantSquadXp(25); addLog(`<span style="color:#6ee7b7;">🐋 Freed Sky-Whale: ${b ? `+1 ${b.icon} <b>${b.name}</b>` : '+15🪙'} & +25 XP!</span>`); if (!b) state.resources.gold += 15; }
    else { state.resources.ore += 14; state.resources.gold += 25; addLog(`<span style="color:#fcd34d;">🐋 Gathered +14⛏ & +25🪙!</span>`); }
  } else {
    if (choice === 'a' && Math.random() < 0.45) { const k = createRandomKey(2); state.keys.push(k); addLog(`<span style="color:#fde047;font-weight:bold;">⚖️ WON WAGER! Awarded 🗝️ <b>${k.name}</b>!</span>`); }
    else if (choice === 'a') { state.resources.tokens += 2; addLog(`<span style="color:#f472b6;">⚖️ Tails! +2🎰 Tokens.</span>`); }
    else { state.resources.gold += 35; addLog(`<span style="color:#fde047;">⚖️ Stipend: +35🪙!</span>`); }
  }
  closeModal(); updateHeaderUI();
}

export function getTileHoverTooltip(t, isPlayer) {
  if (!t.revealed) return '🌫️ Unexplored Fog of War — Move closer to scout!';
  const prefix = isPlayer ? '🧙 YOUR PARTY HERE — ' : '';
  if (t.type === 'town_citizen') {
    const cit = state.subMap.townData?.citizens?.find(c => c.id === t.citizenId);
    if (cit) {
      const r = ROLE_BADGE_TYPES[cit.role] || ROLE_BADGE_TYPES.smuggler;
      return `${prefix}${cit.sprite} ${cit.name} — ${r.name} (${r.short})! Step/Click to interact!`;
    }
  }
  switch (t.type) {
    case 'wall': return t.breakable ? `${prefix}🪨 Cracked Rubble — Walk/Click to smash (+6🥾 Fatigue, 30% Ore)` : `${prefix}🧱 Solid Bedrock Wall`;
    case 'town': {
      const cLen = t.townData?.citizens?.length || 0;
      return `${prefix}🏘️ ${t.townData?.name || 'Wayfarer Town'} (${cLen}/5 Badged Citizens in Plaza) — Step inside (0 Fatigue!)`;
    }
    case 'arena_cellar': return `${prefix}🏟️ Grand Crucible Arena — Boss-Rush gauntlet with Spirit Referee Judge Laws!`;
    case 'arena_boss': return `${prefix}🏆 Arena Tier ${t.arenaFloor || 1} Champion — Defeat to unlock Stairs deeper (⏬)!`;
    case 'bldg_tavern': return `${prefix}🍺 Wayfarer Tavern — Draft 1 of 3 procedural Adventurers`;
    case 'bldg_inn': return `${prefix}🛏️ Hearthstone Inn — Clear Overworld Fatigue & gain Well-Rested Shield`;
    case 'bldg_shop': return `${prefix}🛒 Peddler Bazaar — Buy Camp Rations, Pre-Typed Badges, Seals & rare Keys`;
    case 'bldg_school': return `${prefix}🥋 Technique School — Purchase Skill Packages for Clan Armory`;
    case 'bldg_shrine': return `${prefix}⛩️ Town Blessing Shrine — Claim a map-wide Sky-Shard Blessing`;
    case 'bldg_keysmith': return `${prefix}🔨 Reliquary Keysmith — Upgrade Key Levels or Chaos-attune Keys`;
    case 'crystal': return t.attuned ? `${prefix}✨ Attuned ${t.element} Crystal` : `${prefix}💎 Wild ${t.element} Crystal — Step here to Attune!`;
    case 'small_cellar': return `${prefix}🕳️ Mossy Root-Cellar — 1-Floor mini-dungeon (0 Fatigue inside)`;
    case 'big_cellar': return `${prefix}🏛️ Hollow-Earth Deep Cellar — Multi-floor mini-dungeon (0 Fatigue inside)`;
    case 'spider_dungeon': return `${prefix}🕸️ Lair of the Orb-Weaver — 3+ Floor Dungeon [Sticky Web Floor]`;
    case 'foundry_dungeon': return `${prefix}⚙️ Sunken Copper Foundry — 3+ Floor Dungeon [Superheated Grates]`;
    case 'exit_ladder': return `${prefix}🪜 Surface Ascent Stairwell — Return directly to Overworld!`;
    case 'stairs_down': return `${prefix}⏬ Downward Stairs — Descend to Floor ${(state.subMap.floor || 1) + 1}`;
    case 'stairs_up': return `${prefix}⏫ Upward Stairs — Ascend to Floor ${Math.max(1, (state.subMap.floor || 2) - 1)}`;
    case 'chest_unlocked': return `${prefix}📦 Unlocked Treasure Chest`;
    case 'chest_locked': return `${prefix}🔒 ${t.grandChest ? 'Grand Reliquary' : 'Attuned'} Locked Chest — Use an Attuned Key!`;
    case 'ore': return `${prefix}⛏ Rich Resource Vein — Prospect Ore, Batteries & Gold`;
    case 'monster': return `${prefix}👾 Wild Monster Pack — Weaken to <=35% HP to stamp a Pre-Typed Role Badge!`;
    case 'mob_spider': return `${prefix}🕷️ Orb-Weaver Brood Pack (1.5x Loot)`;
    case 'mob_foundry': return `${prefix}🤖 Sunken Foundry Patrol (1.5x Loot)`;
    case 'boss_spider': return `${prefix}🕷️ DUNGEON BOSS: Arachne Matriarch (3x Loot)`;
    case 'boss_foundry': return `${prefix}🔥 DUNGEON BOSS: Overclocked Furnace Titan (3x Loot)`;
    case 'elite': return `${prefix}👹 Crimson War-Oni Rival Squad (4x Loot — Prime Rival/Smuggler Badge target!)`;
    case 'well': return `${prefix}❓ Primal Chaos Well — Splice a Devil-Knot mutator`;
    case 'mystery_event': return `${prefix}❔ Mystery Encounter`;
    case 'shrine': return `${prefix}⛩ Field Shrine — +1📜 Seal & +1 Pre-Typed Role Badge`;
    case 'kaiju': return `${prefix}🐉 ${state.map.overclockedDen ? 'OVERCLOCKED ' : ''}Kaiju Avatar Den`;
    default: return isPlayer ? `🧙 Your Clan Squad at (${t.x}, ${t.y})` : `Terrain (${t.x}, ${t.y})`;
  }
}

export function renderExplore() {
  document.getElementById('shinto-seal-list').innerHTML = SHINTO_SEALS.map(s => {
    const count = state.sealCounts[s.id] || 0, isSel = state.selectedSeals.includes(s.id);
    return `<div class="seal-card ${isSel ? 'selected' : ''}" onclick="toggleShintoSeal('${s.id}')"><div><div style="font-weight:bold; font-size:11.5px;">${s.icon} ${s.name} <span style="color:#fde047;">(x${count})</span></div><div style="font-size:10.5px; color:var(--text-muted);">${s.desc}</div></div><span style="font-size:11px; font-weight:bold; color:${isSel ? '#fde047' : '#64748b'};">${isSel ? 'ON' : 'OFF'}</span></div>`;
  }).join('');

  document.getElementById('shard-title-label').textContent = state.map.name;
  document.getElementById('shard-crystals-status').innerHTML = state.map.elements.map(el => {
    const done = state.map.attuned.includes(el);
    return `<span class="el-tag el-${el}" style="margin-right:4px;">${EL_ICONS[el]} ${el}: ${done ? '✓' : 'Unattuned'}</span>`;
  }).join('') + (state.map.stabilized ? `<div style="color:#6ee7b7; font-weight:bold; margin-top:4px;">✓ STABILIZED IN VAULT</div>` : '');

  const td = getCurrentShardTownData();
  const cits = td?.citizens || [];
  document.getElementById('shard-town-citizens').innerHTML = cits.length > 0
    ? `🏘️ <b>Town Plaza Citizens (${cits.length}/5):</b> ` + cits.map(c => `${c.sprite}${ROLE_BADGE_TYPES[c.role]?.icon || ''}`).join(' ')
    : `🏘️ Town Plaza: 0/5 Badged Citizens (Stamp Unmoored foes!)`;

  const sRule = STAGE_RULES[state.map.stageRule] || STAGE_RULES.clear_sky;
  const jLaw = state.map.judgeLaw ? JUDGE_LAWS[state.map.judgeLaw] : null;
  const subLabel = state.subMap.kind === 'arena_cellar' ? `${state.subMap.title} [Tier ${state.subMap.floor}]` : `${state.subMap.title} [Floor ${state.subMap.floor}/${state.subMap.maxFloors}]`;
  document.getElementById('explore-banner').innerHTML = state.subMap.active && state.overworldBackup
    ? `<span style="color:#94a3c8; cursor:pointer; text-decoration:underline;" onclick="exitSubMapToOverworld()">${state.overworldBackup.name}</span> &gt; <b style="color:#fde047;">${subLabel}</b>`
    : `<b style="color:#fde68a;">${state.map.name}</b> — (${state.map.px}, ${state.map.py})`;
  document.getElementById('explore-stage-tag').innerHTML = `${sRule.icon} <b>${sRule.name}</b>${jLaw ? ` · <span style="color:#fde047;">${jLaw.icon} ${jLaw.name}</span>` : ''}`;

  const gridEl = document.getElementById('shard-grid');
  gridEl.style.gridTemplateColumns = `repeat(${state.map.width}, 42px)`;
  gridEl.style.gridTemplateRows = `repeat(${state.map.height}, 42px)`;

  let html = '';
  for (let y = 0; y < state.map.height; y++) {
    for (let x = 0; x < state.map.width; x++) {
      const t = state.map.tiles[y][x];
      const isPlayer = (x === state.map.px && y === state.map.py);
      const safeTip = getTileHoverTooltip(t, isPlayer).replace(/"/g, '&quot;');
      if (!t.revealed) { html += `<div class="map-tile fog" title="${safeTip}">·</div>`; continue; }
      let icon = '', extraStyle = '', subPip = '';
      if (t.type === 'town_citizen') {
        const cit = state.subMap.townData?.citizens?.find(c => c.id === t.citizenId);
        const r = cit ? ROLE_BADGE_TYPES[cit.role] : null;
        icon = isPlayer ? '🧙' : (t.citizenSprite || cit?.sprite || '👾');
        extraStyle = `border:2px solid ${r?.color || '#f0abfc'}; box-shadow:0 0 10px #f0abfc, inset 0 0 8px rgba(244,114,182,0.45);`;
        if (r) subPip = `<span class="citizen-pip">${r.icon}</span>`;
      } else if (isPlayer) icon = '🧙';
      else if (t.type === 'wall') icon = t.breakable ? '🪨' : '🧱';
      else if (t.type === 'town') {
        icon = '🏘️'; extraStyle = 'border:2px solid #fde047; box-shadow:inset 0 0 8px rgba(253,224,71,0.35);';
        const cCount = t.townData?.citizens?.length || 0;
        if (cCount > 0) subPip = `<span class="citizen-pip">${cCount}</span>`;
      }
      else if (t.type === 'arena_cellar') { icon = '🏟️'; extraStyle = 'border:2px solid #f59e0b;'; }
      else if (t.type === 'arena_boss') { icon = '🏆'; extraStyle = 'border:2px solid #fde047;'; }
      else if (t.type === 'bldg_tavern') { icon = '🍺'; extraStyle = 'border:2px solid #f59e0b;'; }
      else if (t.type === 'bldg_inn') { icon = '🛏️'; extraStyle = 'border:2px solid #34d399;'; }
      else if (t.type === 'bldg_shop') { icon = '🛒'; extraStyle = 'border:2px solid #38bdf8;'; }
      else if (t.type === 'bldg_school') { icon = '🥋'; extraStyle = 'border:2px solid #f472b6;'; }
      else if (t.type === 'bldg_shrine') { icon = '⛩️'; extraStyle = 'border:2px solid #a7f3d0;'; }
      else if (t.type === 'bldg_keysmith') { icon = '🔨'; extraStyle = 'border:2px solid #fcd34d;'; }
      else if (t.type === 'crystal') { icon = t.attuned ? '✨' : '💎'; if (!t.attuned) extraStyle = 'border:2px solid #38bdf8;'; }
      else if (t.type === 'small_cellar') { icon = '🕳️'; extraStyle = 'border:1px dashed #94a3c8;'; }
      else if (t.type === 'big_cellar') { icon = '🏛️'; extraStyle = 'border:2px solid #fcd34d;'; }
      else if (t.type === 'spider_dungeon') { icon = '🕸️'; extraStyle = 'border:2px solid #c084fc;'; }
      else if (t.type === 'foundry_dungeon') { icon = '⚙️'; extraStyle = 'border:2px solid #fb923c;'; }
      else if (t.type === 'exit_ladder') { icon = '🪜'; extraStyle = 'border:2px solid #34d399;'; }
      else if (t.type === 'stairs_down') { icon = '⏬'; extraStyle = 'border:2px solid #38bdf8;'; }
      else if (t.type === 'stairs_up') { icon = '⏫'; extraStyle = 'border:1px solid #93c5fd;'; }
      else if (t.type === 'chest_unlocked') { icon = '📦'; extraStyle = 'border:1px solid #fde047;'; }
      else if (t.type === 'chest_locked') { icon = '🔒'; extraStyle = 'border:2px solid #f59e0b;'; }
      else if (t.type === 'ore') icon = '⛏';
      else if (t.type === 'monster') icon = '👾';
      else if (t.type === 'mob_spider') icon = '🕷️';
      else if (t.type === 'mob_foundry') icon = '🤖';
      else if (t.type === 'boss_spider') { icon = '🕷️'; extraStyle = 'border:2px solid #f43f5e;'; }
      else if (t.type === 'boss_foundry') { icon = '🔥'; extraStyle = 'border:2px solid #f43f5e;'; }
      else if (t.type === 'elite') icon = '👹';
      else if (t.type === 'well') icon = '❓';
      else if (t.type === 'mystery_event') { icon = '❔'; extraStyle = 'border:1px dashed #67e8f9;'; }
      else if (t.type === 'shrine') icon = '⛩';
      else if (t.type === 'kaiju') icon = '🐉';

      html += `<div class="map-tile ${t.type === 'wall' ? 'wall' : ''} ${t.type === 'wall' && t.breakable ? 'breakable' : ''} ${isPlayer ? 'player-here' : ''}" style="background:${t.bg}; ${extraStyle}" title="${safeTip}" onclick="clickMapTile(${x},${y})">${icon}${subPip}</div>`;
    }
  }
  gridEl.innerHTML = html;
}

window.addEventListener('keydown', (e) => {
  if (state.activeTab !== 'explore' || document.getElementById('modal-backdrop').classList.contains('open')) return;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); movePlayer(0, -1); }
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); movePlayer(0, 1); }
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); movePlayer(-1, 0); }
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); movePlayer(1, 0); }
});
