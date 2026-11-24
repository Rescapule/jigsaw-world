import { state } from '../state.js';
import { ELEMENTS, EL_ICONS, CHAKRA_LIST, CHAKRA_MULT, CHAOS_KNOTS, SKILLS, ANCHOR_RELICS, STAGE_RULES, JUDGE_LAWS, SHINTO_SEALS, TOWN_BUILDINGS } from '../data/constants.js';

/* ============================================================================
   TAB 2: 5v5 BATTLE ENGINE + PRE-TYPED TOWN SMOKE-BOMB CAPTURE
   ============================================================================ */
export const MONSTER_TEMPLATES = [
  { name:'Slag Ogre',     sprite:'👹', row:'Front', hp:115, atk:22, spd:16, element:'Fire',  ranged:false },
  { name:'Iron Tortoise', sprite:'🐢', row:'Front', hp:135, atk:18, spd:14, element:'Earth', ranged:false },
  { name:'Gale Tengu',    sprite:'🦅', row:'Back',  hp:88,  atk:23, spd:24, element:'Air',   ranged:true  },
  { name:'Salt Wisp',     sprite:'🔮', row:'Back',  hp:82,  atk:24, spd:21, element:'Light', ranged:true  },
  { name:'Mire Kappa',    sprite:'🐸', row:'Front', hp:105, atk:20, spd:19, element:'Water', ranged:false },
  { name:'Shade Puppet',  sprite:'🎎', row:'Back',  hp:90,  atk:25, spd:22, element:'Dark',  ranged:true  }
];

export function launchMapEncounter(tile, kind) {
  let title = 'Wild Sky-Shard Pack', foes = [], lootMult = 1, isBoss = false, guaranteesKeyDrop = false, isArenaBattle = false;
  let judgeLaw = state.map.judgeLaw || null;
  const stageRule = state.map.stageRule || 'clear_sky';
  const avgLvl = state.heroes.reduce((s, h) => s + h.level, 0) / 5;
  const scale = (1 + (avgLvl - 1) * 0.1) * (1 + (state.map.divePrestige || 0) * 0.08);
  const diveLootMult = 1 + (state.map.divePrestige || 0) * 0.25;

  if (kind === 'arena_boss') {
    const tier = tile.arenaFloor || state.subMap.floor || 1;
    const tierScale = scale * (1 + (tier - 1) * 0.18);
    const writMult = state.subMap.arenaWritBonus ? 1.35 : 1.0;
    isBoss = true; isArenaBattle = true;
    guaranteesKeyDrop = (tier >= 4 && tier % 4 === 0 && Math.random() < 0.55);
    lootMult = Math.round((1.8 + tier * 0.65) * writMult * diveLootMult * 10) / 10;
    const champNames = ['Grandmaster Ryuji', 'Iron-Clad Valkyrie', 'Archon Salt-Weaver', 'Shadow-Tether Sovereign', 'Solaris Champion'];
    const cName = champNames[(tier - 1) % champNames.length], cEl = ELEMENTS[(tier - 1) % 6];
    title = `🏟️ ARENA TIER ${tier}: ${cName.toUpperCase()}`;
    foes = [
      { key:'foe_0', name:`${cName}`, sprite:'🏆', row:'Front', maxHp:Math.round(235 * tierScale), hp:Math.round(235 * tierScale), atk:Math.round(25 * tierScale), spd:21 + tier, element:cEl, ranged:true, shield:20 + tier * 6, armorBreak:false, captured:false },
      { key:'foe_1', name:'Crucible Vanguard', sprite:'🛡️', row:'Front', maxHp:Math.round(125 * tierScale), hp:Math.round(125 * tierScale), atk:Math.round(20 * tierScale), spd:17 + tier, element:ELEMENTS[(tier + 1) % 6], ranged:false, shield:12, armorBreak:false, captured:false },
      { key:'foe_2', name:'Arena Arcanist', sprite:'🔮', row:'Back', maxHp:Math.round(96 * tierScale), hp:Math.round(96 * tierScale), atk:Math.round(23 * tierScale), spd:22 + tier, element:ELEMENTS[(tier + 3) % 6], ranged:true, shield:0, armorBreak:false, captured:false }
    ];
  } else if (kind === 'boss_spider') {
    isBoss = true; lootMult = 3 * diveLootMult; title = '🕸️ FINAL FLOOR BOSS: ARACHNE MATRIARCH';
    foes = [
      { key:'foe_0', name:'Arachne Matriarch', sprite:'🕷️', isSpider:true, row:'Front', maxHp:Math.round(285 * scale), hp:Math.round(285 * scale), atk:Math.round(27 * scale), spd:25, element:'Dark', ranged:true, shield:25, armorBreak:false, captured:false },
      { key:'foe_1', name:'Silkguard Brood', sprite:'🕷️', isSpider:true, row:'Front', maxHp:Math.round(120 * scale), hp:Math.round(120 * scale), atk:Math.round(20 * scale), spd:22, element:'Earth', ranged:false, shield:0, armorBreak:false, captured:false },
      { key:'foe_2', name:'Venom Spinner', sprite:'🦂', isSpider:true, row:'Back', maxHp:Math.round(98 * scale), hp:Math.round(98 * scale), atk:Math.round(24 * scale), spd:24, element:'Dark', ranged:true, shield:0, armorBreak:false, captured:false }
    ];
  } else if (kind === 'boss_foundry') {
    isBoss = true; lootMult = 3 * diveLootMult; title = '⚙️ FINAL FLOOR BOSS: FURNACE TITAN';
    foes = [
      { key:'foe_0', name:'Furnace Titan Mk.IX', sprite:'🤖', row:'Front', maxHp:Math.round(310 * scale), hp:Math.round(310 * scale), atk:Math.round(29 * scale), spd:19, element:'Fire', ranged:true, shield:35, armorBreak:false, captured:false },
      { key:'foe_1', name:'Slag Golem', sprite:'🗿', row:'Front', maxHp:Math.round(135 * scale), hp:Math.round(135 * scale), atk:Math.round(21 * scale), spd:15, element:'Earth', ranged:false, shield:15, armorBreak:false, captured:false },
      { key:'foe_2', name:'Rogue Boiler Drone', sprite:'⚙️', row:'Back', maxHp:Math.round(95 * scale), hp:Math.round(95 * scale), atk:Math.round(25 * scale), spd:22, element:'Fire', ranged:true, shield:0, armorBreak:false, captured:false }
    ];
  } else if (kind === 'spider_pack') {
    title = '🕸️ Orb-Weaver Brood Pack'; lootMult = 1.5;
    foes = [
      { key:'foe_0', name:'Brood-Spinner A', sprite:'🕷️', isSpider:true, row:'Front', maxHp:Math.round(115 * scale), hp:Math.round(115 * scale), atk:Math.round(21 * scale), spd:23, element:'Dark', ranged:false, shield:0, armorBreak:false, captured:false },
      { key:'foe_1', name:'Brood-Spinner B', sprite:'🕷️', isSpider:true, row:'Front', maxHp:Math.round(115 * scale), hp:Math.round(115 * scale), atk:Math.round(21 * scale), spd:22, element:'Earth', ranged:false, shield:0, armorBreak:false, captured:false },
      { key:'foe_2', name:'Venom Weaver', sprite:'🦂', isSpider:true, row:'Back', maxHp:Math.round(90 * scale), hp:Math.round(90 * scale), atk:Math.round(24 * scale), spd:24, element:'Dark', ranged:true, shield:0, armorBreak:false, captured:false }
    ];
  } else if (kind === 'foundry_pack') {
    title = '⚙️ Sunken Foundry Patrol'; lootMult = 1.5;
    foes = [
      { key:'foe_0', name:'Slag Golem', sprite:'🗿', row:'Front', maxHp:Math.round(140 * scale), hp:Math.round(140 * scale), atk:Math.round(22 * scale), spd:15, element:'Earth', ranged:false, shield:12, armorBreak:false, captured:false },
      { key:'foe_1', name:'Rogue Boiler', sprite:'🤖', row:'Front', maxHp:Math.round(120 * scale), hp:Math.round(120 * scale), atk:Math.round(24 * scale), spd:18, element:'Fire', ranged:false, shield:0, armorBreak:false, captured:false },
      { key:'foe_2', name:'Cinder Turret', sprite:'🔥', row:'Back', maxHp:Math.round(92 * scale), hp:Math.round(92 * scale), atk:Math.round(25 * scale), spd:20, element:'Fire', ranged:true, shield:0, armorBreak:false, captured:false }
    ];
  } else if (kind === 'kaiju') {
    isBoss = true; const oc = state.map.overclockedDen ? 1.35 : 1.0; lootMult = state.map.overclockedDen ? 4 : 2;
    const bossEl = state.map.elements[0] || 'Fire';
    title = state.map.overclockedDen ? `🔥 OVERCLOCKED KAIJU: ${bossEl} Leviathan` : `🐉 KAIJU DEN: ${bossEl} Avatar`;
    foes = [
      { key:'foe_0', name:`${bossEl} Great Avatar`, sprite:'🐉', row:'Front', maxHp:Math.round(290 * scale * oc), hp:Math.round(290 * scale * oc), atk:Math.round(28 * scale * oc), spd:21, element:bossEl, ranged:true, shield:30, armorBreak:false, captured:false },
      { key:'foe_1', name:'Shard Carapace', sprite:'🦀', row:'Front', maxHp:Math.round(115 * scale), hp:Math.round(115 * scale), atk:Math.round(19 * scale), spd:16, element:bossEl, ranged:false, shield:0, armorBreak:false, captured:false },
      { key:'foe_2', name:'Chorus Sprite', sprite:'👁️', row:'Back', maxHp:Math.round(90 * scale), hp:Math.round(90 * scale), atk:Math.round(22 * scale), spd:23, element:'Dark', ranged:true, shield:0, armorBreak:false, captured:false }
    ];
  } else if (kind === 'elite') {
    lootMult = 4; title = '👹 CRIMSON ONI RIVAL SQUAD (4x LOOT)';
    foes = [
      { key:'foe_0', name:'Crimson War-Oni', sprite:'👹', row:'Front', maxHp:Math.round(195 * scale), hp:Math.round(195 * scale), atk:Math.round(27 * scale), spd:22, element:'Fire', ranged:false, shield:20, armorBreak:false, captured:false },
      { key:'foe_1', name:'Iron Tortoise', sprite:'🐢', row:'Front', maxHp:Math.round(125 * scale), hp:Math.round(125 * scale), atk:Math.round(18 * scale), spd:15, element:'Earth', ranged:false, shield:0, armorBreak:false, captured:false },
      { key:'foe_2', name:'Gale Tengu', sprite:'🦅', row:'Back', maxHp:Math.round(95 * scale), hp:Math.round(95 * scale), atk:Math.round(23 * scale), spd:24, element:'Air', ranged:true, shield:0, armorBreak:false, captured:false }
    ];
  } else {
    for (let i = 0; i < 5; i++) {
      const tpl = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
      foes.push({ key:'foe_' + i, name:`${tpl.name} ${String.fromCharCode(65 + i)}`, sprite:tpl.sprite, row:i < 3 ? 'Front' : 'Back', maxHp:Math.round(tpl.hp * scale), hp:Math.round(tpl.hp * scale), atk:Math.round(tpl.atk * scale), spd:tpl.spd + Math.floor(Math.random() * 3), element:tpl.element, ranged:tpl.ranged, shield:0, armorBreak:false, captured:false });
    }
  }
  initBattleState(title, foes, tile, isBoss, lootMult, stageRule, guaranteesKeyDrop, judgeLaw, isArenaBattle);
  switchTab('battle');
}

export function startSkirmishBattle(silent = false) {
  const avgLvl = state.heroes.reduce((s, h) => s + h.level, 0) / 5;
  const scale = 1 + (avgLvl - 1) * 0.1;
  const foes = [];
  for (let i = 0; i < 5; i++) {
    const tpl = MONSTER_TEMPLATES[(i + Math.floor(Math.random() * 3)) % MONSTER_TEMPLATES.length];
    foes.push({ key:'foe_' + i, name:`${tpl.name} ${i + 1}`, sprite:tpl.sprite, row:i < 2 ? 'Front' : 'Back', maxHp:Math.round(tpl.hp * scale), hp:Math.round(tpl.hp * scale), atk:Math.round(tpl.atk * scale), spd:tpl.spd, element:tpl.element, ranged:tpl.ranged, shield:0, armorBreak:false, captured:false });
  }
  initBattleState('⚔ Arena Sparring 5v5', foes, null, false, 1, state.map.stageRule || 'clear_sky', false, null, false);
  if (!silent) renderBattle();
}

export function initBattleState(title, foes, sourceTile, isBoss, lootMult, stageRule = 'clear_sky', guaranteesKeyDrop = false, judgeLaw = null, isArenaBattle = false) {
  if (state.battle.timerId) clearTimeout(state.battle.timerId);
  const fInfo = getFatigueInfo();
  const hasSanctuary = state.blessing && state.blessing.id === 'sanctuary';
  const restedShield = state.wellRestedShield || 0;
  state.wellRestedShield = 0;
  const syn = getSquadSynergyInfo(state.heroes);

  const allies = state.heroes.map(h => {
    const st = getHeroStats(h);
    const synMantle = (syn.tier >= 3 && syn.umbrella === 'Mantles') ? 1 : 0;
    const synKiMom = (syn.tier >= 5 && syn.umbrella === 'Ki') ? 2 : ((syn.tier >= 3 && syn.umbrella === 'Ki') ? 1 : 0);
    const synPatRes = (syn.tier >= 3 && syn.umbrella === 'Patterns') ? 1 : 0;
    const synArtShield = (syn.tier >= 3 && syn.umbrella === 'Artifice') ? 18 : 0;
    const synArtAp = (syn.tier >= 3 && syn.umbrella === 'Artifice') ? 1 : 0;
    const synMantleShield = (syn.tier >= 3 && syn.umbrella === 'Mantles') ? 14 : 0;
    const startWard = heroHasPassive(h, 'pkg_mirror_ward');
    let initSpd = h.folders[2].includes('kael_limiter') ? Math.round(st.spd * 0.9) : st.spd;
    if (syn.tier >= 5 && syn.umbrella === 'Ki') initSpd = Math.round(initSpd * 1.15);
    else if (syn.tier >= 3 && syn.umbrella === 'Ki') initSpd = Math.round(initSpd * 1.10);
    if (h.knot === 'gravity_anchor') initSpd = Math.max(8, initSpd - 3);
    if (stageRule === 'sticky_webs' && h.element !== 'Air') initSpd = Math.max(8, Math.round(initSpd * 0.75));
    const bonusAp = (stageRule === 'clear_sky' ? 1 : 0) + synArtAp - fInfo.apPenalty;
    const mistShield = (stageRule === 'damp_mist' ? 10 : 0) + (hasSanctuary ? 24 : 0) + restedShield + synArtShield + synMantleShield;

    return {
      key:'ally_' + h.id, heroId:h.id, name:h.name, sprite:h.sprite, umbrella:h.umbrella, element:h.element, row:h.row, knot:h.knot,
      maxHp:st.maxHp, hp:st.maxHp, atk:st.atk, spd:initSpd, healMult:st.healMult, crownMult:st.crownMult, smartAi:st.smartAi,
      ap:Math.max(1, Math.min(10, (h.umbrella === 'Artifice' ? 6 : 4) + bonusAp)), maxAp:10, upkeepAp:0,
      shield:(startWard ? 28 : 0) + mistShield, momentum:synKiMom, overheat:0, residue:(startWard ? 1 : 0) + synPatRes,
      conviction:(heroHasPassive(h, 'pkg_citizen_aegis') ? 2 : 0) + synMantle, interceptVow:false, atkBuffTurns:0, limiterUsed:false, phoenixUsed:false
    };
  });

  foes.forEach(f => {
    if (stageRule === 'sticky_webs' && !f.isSpider && f.element !== 'Air') f.spd = Math.max(8, Math.round(f.spd * 0.75));
    if (stageRule === 'damp_mist') f.shield = (f.shield || 0) + 10;
  });

  state.battle = {
    ...state.battle, active:true, round:1, title, stageRule, judgeLaw, isArenaBattle, lastSkillElement:null,
    sourceTile, isBoss, guaranteesKeyDrop, lootMult, chainElement:null, chainCount:0,
    canopy:{ turns:0, name:'', dmg:0 }, legionStacks:(syn.tier >= 3 && syn.umbrella === 'Tethers') ? 2 : 0,
    overdrive:Math.min(100, (state.battle.overdrive || 35) + (hasSanctuary ? 25 : 0)),
    allies, foes, queue:[], activeUnitKey:null, selectedSkillId:null, timerId:null
  };
  const rObj = STAGE_RULES[stageRule] || STAGE_RULES.clear_sky;
  addLog(`<span style="color:#fde047; font-weight:bold;">⚔ BATTLE START: ${title}</span> <span style="color:#a5f3fc;">[${rObj.icon} ${rObj.name}]</span>`);
  buildRoundQueue();
  advanceTurn();
}

export function getEffectiveSkillAp(ally, sk) {
  if (ally.knot === 'glass_pendulum' && state.battle.round % 2 === 1) return 0;
  let cost = sk.ap;
  if (state.battle.stageRule === 'sticky_webs' && sk.target === 'back_foe') cost += 1;
  if (state.battle.judgeLaw === 'featherweight_blitz' && sk.pips >= 3) cost += 1;
  if (state.battle.judgeLaw === 'element_flux' && state.battle.lastSkillElement) {
    const skEl = sk.element === 'Neutral' ? ally.element : sk.element;
    if (skEl === state.battle.lastSkillElement) cost += 1;
  }
  return cost;
}

export function buildRoundQueue() {
  const units = [
    ...state.battle.allies.filter(a => a.hp > 0).map(a => ({ key:a.key, spd:a.spd + Math.random() })),
    ...state.battle.foes.filter(f => f.hp > 0 && !f.captured).map(f => ({ key:f.key, spd:f.spd + Math.random() }))
  ];
  units.sort((a, b) => b.spd - a.spd);
  state.battle.queue = units.map(u => u.key);
}

export function setBattleMode(mode) {
  state.battle.mode = mode;
  if (state.battle.timerId) { clearTimeout(state.battle.timerId); state.battle.timerId = null; }
  renderBattle();
  if (state.battle.active && mode !== 'manual') scheduleNextStep();
}
export function toggleAutoBadge() { state.battle.autoBadge = !state.battle.autoBadge; renderBattle(); }
export function getUnitByKey(key) { return key ? (state.battle.allies.find(a => a.key === key) || state.battle.foes.find(f => f.key === key)) : null; }
export function canBadgeToTown() {
  syncBadgeCount();
  if (state.badgePouch.length <= 0) return false;
  const td = getCurrentShardTownData();
  return !td || !Array.isArray(td.citizens) || td.citizens.length < 5;
}

export function checkBattleEnd() {
  const aliveFoes = state.battle.foes.filter(f => f.hp > 0 && !f.captured);
  const aliveAllies = state.battle.allies.filter(a => a.hp > 0);
  if (aliveFoes.length === 0) {
    if (state.battle.citizenTrial) window.handleCitizenTrialEnd(true);
    state.battle.active = false;
    if (state.battle.timerId) clearTimeout(state.battle.timerId);
    const bMult = (state.blessing && state.blessing.id === 'prospector') ? 1.5 : 1.0;
    const goldReward = Math.round((22 + Math.floor(Math.random() * 14)) * state.battle.lootMult * bMult);
    const batReward = Math.round((10 + Math.floor(Math.random() * 6)) * state.battle.lootMult * bMult);
    const oreReward = Math.round((6 + Math.floor(Math.random() * 5)) * state.battle.lootMult * bMult);
    const tokReward = state.battle.isBoss || state.battle.lootMult >= 3 ? 2 : (Math.random() < 0.35 ? 1 : 0);
    state.resources.gold += goldReward; state.resources.batteries += batReward; state.resources.ore += oreReward; state.resources.tokens += tokReward;
    grantSquadXp(Math.round(35 * state.battle.lootMult));

    let keyDropMsg = '';
    const rareBossKeyRoll = state.battle.guaranteesKeyDrop || (!state.battle.isArenaBattle && state.battle.isBoss && Math.random() < 0.30);
    if (rareBossKeyRoll) {
      const droppedKey = createRandomKey(state.battle.guaranteesKeyDrop ? 2 : 1);
      state.keys.push(droppedKey); keyDropMsg = ` + 🗝️ <b>${droppedKey.name}</b>`;
    }
    if (state.battle.sourceTile) {
      const cx = state.battle.sourceTile.x, cy = state.battle.sourceTile.y;
      const wasBoss = (state.battle.sourceTile.type === 'boss_spider' || state.battle.sourceTile.type === 'boss_foundry');
      state.battle.sourceTile.type = 'floor';
      if (wasBoss) spawnSurfacePortalNear(cx, cy);
    }
    let arenaBonusMsg = '';
    if (state.battle.isArenaBattle && state.subMap.active && state.subMap.kind === 'arena_cellar') {
      const tier = state.subMap.floor;
      if (state.map.tiles[3]?.[5]) state.map.tiles[3][5].type = 'stairs_down';
      if (tier % 3 === 0 && state.map.tiles[2]?.[5]) { state.map.tiles[2][5].type = 'chest_locked'; state.map.tiles[2][5].grandChest = true; }
      arenaBonusMsg = ` · ⏬ <b>Stairs to Tier ${tier + 1}</b> unlocked!`;
    }
    addLog(`<span style="color:#6ee7b7; font-weight:bold;">🏆 VICTORY! +${goldReward}🪙, +${batReward}⚡, +${oreReward}⛏${tokReward ? `, +${tokReward}🎰` : ''}${keyDropMsg}${arenaBonusMsg}</span>`);
    updateHeaderUI(); renderBattle(); return true;
  }
  if (aliveAllies.length === 0) {
    if (state.battle.citizenTrial) window.handleCitizenTrialEnd(false);
    state.battle.active = false;
    if (state.battle.timerId) clearTimeout(state.battle.timerId);
    addLog(`<span style="color:#fca5a5; font-weight:bold;">💫 Squad Unmoored! Retreating safely...</span>`);
    renderBattle(); return true;
  }
  return false;
}

export function advanceTurn() {
  if (!state.battle.active || checkBattleEnd()) return;
  state.battle.queue = state.battle.queue.filter(k => { const u = getUnitByKey(k); return u && u.hp > 0 && !u.captured; });
  if (state.battle.queue.length === 0) {
    runEndOfRoundEffects();
    if (checkBattleEnd()) return;
    state.battle.round += 1; state.battle.chainElement = null; state.battle.chainCount = 0;
    buildRoundQueue();
  }
  const nextKey = state.battle.queue.shift();
  state.battle.activeUnitKey = nextKey; state.battle.selectedSkillId = null;
  const activeUnit = getUnitByKey(nextKey);
  if (!activeUnit) return;
  if (nextKey.startsWith('ally_')) {
    const cap = activeUnit.maxAp - activeUnit.upkeepAp;
    activeUnit.ap = Math.min(cap, activeUnit.ap + 1 + ((state.battle.stageRule === 'leyline_hum' && state.battle.round >= 2) ? 1 : 0));
    if (activeUnit.atkBuffTurns > 0) activeUnit.atkBuffTurns--;
  if (activeUnit.knot === 'glass_pendulum' && state.battle.round % 2 === 0) {
    activeUnit.shield += 32;
    addLog(`<span style="color:#fbcfe8;">⏳ <b>${activeUnit.name}</b>'s Glass-Pendulum freezes into a Crystal Statue (+32 Shield, skips action)!</span>`);
    renderBattle();
    scheduleNextStep(advanceTurn);
    return;
  }
  if (state.battle.mode === 'manual') {
    const hero = state.heroes.find(h => h.id === activeUnit.heroId);
    const firstValid = pickAutoGambitMove(activeUnit, hero);
    if (firstValid) state.battle.selectedSkillId = firstValid.skill.id;
  }
  }
  renderBattle();
  if (nextKey.startsWith('foe_') || state.battle.mode !== 'manual') {
  scheduleNextStep();
  }
}



export function scheduleNextStep(customFn = null) {

  if (state.battle.timerId) clearTimeout(state.battle.timerId);

  const delay = state.battle.mode === 'auto4' ? 175 : 680;

  state.battle.timerId = setTimeout(() => {

    if (!state.battle.active) return;

    if (customFn) {

      customFn();

      return;

    }

    const u = getUnitByKey(state.battle.activeUnitKey);

    if (!u) { advanceTurn(); return; }

    if (u.key.startsWith('foe_')) {

      executeEnemyTurn(u);

    } else {

      executeAutoGambitTurn(u);

    }

  }, delay);

}



export function runEndOfRoundEffects() {

  const aliveFoes = state.battle.foes.filter(f => f.hp > 0 && !f.captured);

  if (aliveFoes.length === 0) return;



  // Stage Rule: Superheated Grates deals 6 Fire chip to unshielded units!

  if (state.battle.stageRule === 'superheated_grates') {

    state.battle.allies.filter(a => a.hp > 0 && a.shield <= 0).forEach(a => {

      a.hp = Math.max(1, a.hp - 6);

      spawnFloatingText(a.key, `-6🔥`, '#fb923c');

    });

    state.battle.foes.filter(f => f.hp > 0 && !f.captured && f.shield <= 0 && f.element !== 'Fire').forEach(f => {

      f.hp = Math.max(1, f.hp - 6);

      spawnFloatingText(f.key, `-6🔥`, '#fb923c');

    });

    addLog(`<span style="color:#fb923c;">🔥 <b>Superheated Grates</b> scorches unshielded fighters for 6 burn chip!</span>`);

  }



  // Shikigami Paper Legion Companion Strike

  if (state.battle.legionStacks > 0) {

    const frontFoes = aliveFoes.filter(f => f.row === 'Front');

    const target = (frontFoes.length ? frontFoes : aliveFoes)[0];

    const dmg = 10 + state.battle.legionStacks * 7;

    applyDamageToFoe(target, dmg, 'Dark');

    addLog(`<span style="color:#a7f3d0;">📜 <b>Paper Legion x${state.battle.legionStacks}</b> swarms ${target.name} for <b>${dmg}</b> Dark dmg!</span>`);

  }



  // Overhead Canopy Kaiju Strike

  if (state.battle.canopy.turns > 0) {

    state.battle.foes.filter(f => f.hp > 0 && !f.captured).forEach(foe => {

      applyDamageToFoe(foe, state.battle.canopy.dmg, 'Dark');

    });

    state.battle.canopy.turns -= 1;

    addLog(`<span style="color:#34d399;">🐉 <b>${state.battle.canopy.name}</b> rains <b>${state.battle.canopy.dmg}</b> Dark AoE from the Canopy! (${state.battle.canopy.turns} rnds left)</span>`);

    if (state.battle.canopy.turns === 0) {

      const zappa = state.battle.allies.find(a => a.heroId === 'zappa');

      if (zappa) zappa.upkeepAp = Math.max(0, zappa.upkeepAp - 2);

    }

  }

}



/* Strict 1A -> 4D Priority Scanner for Auto-Gambit (+ High-Priority Auto-Badge Interrupt!) */

export function pickAutoGambitMove(ally, hero) {

  const aliveFoes = state.battle.foes.filter(f => f.hp > 0 && !f.captured);

  if (!aliveFoes.length) return null;



  // v0.2e FIX: If Auto-Badge is ON and an [UNMOORED] foe exists, fire Throw Role Badge BEFORE Folder 1 attacks KO them!

  if (state.battle.autoBadge && state.badgePouch.length > 0) {

    const unmoored = aliveFoes.find(f => isUnmoored(f));

    if (unmoored) {

      for (let fIdx = 0; fIdx < 4; fIdx++) {

        const sIdx = hero.folders[fIdx].indexOf('throw_badge');

        if (sIdx >= 0) {

          return {

            skill: SKILLS.throw_badge,

            targetKey: unmoored.key,

            code: `${fIdx + 1}${String.fromCharCode(65 + sIdx)}`

          };

        }

      }

    }

  }



  for (let fIdx = 0; fIdx < 4; fIdx++) {

    const folder = hero.folders[fIdx];

    for (let sIdx = 0; sIdx < folder.length; sIdx++) {

      const sid = folder[sIdx];

      const sk = SKILLS[sid];

      if (!sk || sk.type === 'passive') continue;



      const effectiveAp = getEffectiveSkillAp(ally, sk);

      if (ally.ap < effectiveAp) continue;



      if (sk.umbrella === 'Artifice' && sid !== 'pip_vent' && sid !== 'anc_dynamo_coil' && ally.overheat >= 3) continue;



      // Smart Conditions so 1A -> 4D plays tactically

      if (sid === 'pip_vent' && ally.overheat < 2 && ally.ap >= 3) continue;

      if (sid === 'throw_badge') {

        if (!state.battle.autoBadge || state.badgePouch.length <= 0) continue;

        const unmoored = aliveFoes.find(f => isUnmoored(f));

        if (!unmoored) continue;

        return { skill: sk, targetKey: unmoored.key, code: `${fIdx + 1}${String.fromCharCode(65 + sIdx)}` };

      }

      if (sid === 'lyra_elixir' || sid === 'anc_marionette_spool') {

        const hurtAlly = state.battle.allies.filter(a => a.hp > 0 && a.hp / a.maxHp < 0.72)

          .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];

        if (!hurtAlly && sid === 'lyra_elixir') continue;

        if (hurtAlly) return { skill: sk, targetKey: hurtAlly.key, code: `${fIdx + 1}${String.fromCharCode(65 + sIdx)}` };

      }

      if (sid === 'kael_guard' && ally.ap >= 4 && ally.hp / ally.maxHp > 0.65) continue;

      if (sid === 'kael_limiter' && ally.momentum < 2 && ally.smartAi) continue;

      if (sid === 'zappa_legion' && state.battle.legionStacks >= 5) continue;

      if (sid === 'zappa_kaiju' && state.battle.canopy.turns > 0) continue;



      // Pick appropriate target

      const target = chooseSmartTarget(ally, sk, aliveFoes);

      if (!target) continue;

      return { skill: sk, targetKey: target.key, code: `${fIdx + 1}${String.fromCharCode(65 + sIdx)}` };

    }

  }

  return null;

}



export function chooseSmartTarget(ally, sk, aliveFoes) {

  const frontFoes = aliveFoes.filter(f => f.row === 'Front');

  const backFoes = aliveFoes.filter(f => f.row === 'Back');



  if (sk.target === 'self' || sk.target === 'all_allies' || sk.target === 'ally_front_row') return ally;

  if (sk.target === 'lowest_ally') {

    return state.battle.allies.filter(a => a.hp > 0).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];

  }

  if (sk.target === 'unmoored_foe') {

    return aliveFoes.find(f => isUnmoored(f)) || null;

  }

  if (sk.target === 'highest_foe') {

    const pool = (frontFoes.length > 0 && ally.knot !== 'coil_rubber') ? frontFoes : aliveFoes;

    return [...pool].sort((a, b) => b.hp - a.hp)[0];

  }

  if (sk.target === 'back_foe') {

    return (backFoes.length ? backFoes : aliveFoes)[0];

  }

  if (sk.target === 'front_foe') {

    if (ally.knot === 'coil_rubber') return [...aliveFoes].sort((a, b) => a.hp - b.hp)[0];

    return (frontFoes.length ? frontFoes : aliveFoes)[0];

  }

  return [...aliveFoes].sort((a, b) => a.hp - b.hp)[0];

}



export function isUnmoored(foe) {

  return foe && foe.hp > 0 && !foe.captured && (foe.hp / foe.maxHp <= 0.35);

}



export function executeAutoGambitTurn(ally) {

  if (state.battle.overdrive >= 100) {

    triggerSquadOverdrive();

    if (checkBattleEnd()) return;

  }



  const hero = state.heroes.find(h => h.id === ally.heroId);

  const choice = pickAutoGambitMove(ally, hero);

  if (!choice) {

    advanceTurn();

    return;

  }



  const btnEl = document.getElementById('gambit-slot-' + choice.code);

  if (btnEl) btnEl.classList.add('gambit-fire');



  executeAllySkill(ally, choice.skill, choice.targetKey, choice.code, true);

}



export function selectManualSkill(skillId) {

  if (!state.battle.active || state.battle.mode !== 'manual') return;

  const ally = getUnitByKey(state.battle.activeUnitKey);

  if (!ally || !ally.key.startsWith('ally_')) return;

  const sk = SKILLS[skillId];

  if (!sk || sk.type === 'passive') return;



  const cost = getEffectiveSkillAp(ally, sk);

  if (ally.ap < cost) return;

  if (sk.umbrella === 'Artifice' && skillId !== 'pip_vent' && skillId !== 'anc_dynamo_coil' && ally.overheat >= 3) return;



  state.battle.selectedSkillId = skillId;



  if (['self', 'all_allies', 'ally_front_row', 'all_foes', 'foe_front_row'].includes(sk.target)) {

    const aliveFoes = state.battle.foes.filter(f => f.hp > 0 && !f.captured);

    const dummyTarget = sk.target.includes('foe') ? (aliveFoes[0]?.key) : ally.key;

    executeAllySkill(ally, sk, dummyTarget, 'MANUAL', false);

    return;

  }



  renderBattle();

}



export function clickUnitInBattle(unitKey) {

  if (!state.battle.active || state.battle.mode !== 'manual') return;

  const ally = getUnitByKey(state.battle.activeUnitKey);

  if (!ally || !ally.key.startsWith('ally_')) return;



  const sk = SKILLS[state.battle.selectedSkillId];

  if (!sk) return;



  const target = getUnitByKey(unitKey);

  if (!target || target.hp <= 0 || target.captured) return;



  const isFoeTarget = unitKey.startsWith('foe_');

  if (sk.target === 'lowest_ally' && isFoeTarget) return;

  if (sk.target !== 'lowest_ally' && !['self', 'all_allies', 'ally_front_row'].includes(sk.target) && !isFoeTarget) return;



  if (sk.target === 'unmoored_foe' && !isUnmoored(target)) {

    addLog(`<span style="color:#fca5a5;">Target must be [UNMOORED] (<=35% HP) to slap a Role Badge!</span>`);

    return;

  }



  const frontFoes = state.battle.foes.filter(f => f.hp > 0 && !f.captured && f.row === 'Front');

  if (sk.target === 'front_foe' && target.row === 'Back' && frontFoes.length > 0 && ally.knot !== 'coil_rubber') {

    addLog(`<span style="color:#fcd34d;">🛡 Enemy Front Row blocks direct melee! Use Back-Row snipe, Ember Iaido, or Coil-Rubber Knot.</span>`);

    return;

  }



  executeAllySkill(ally, sk, unitKey, 'MANUAL', false);

}



export function executeAllySkill(ally, sk, targetKey, slotCode, isAuto) {

  const hero = state.heroes.find(h => h.id === ally.heroId);

  const target = getUnitByKey(targetKey);

  const isOddPendulum = (ally.knot === 'glass_pendulum' && state.battle.round % 2 === 1);

  const cost = getEffectiveSkillAp(ally, sk);

  ally.ap = Math.max(0, ally.ap - cost);



  const syn = getSquadSynergyInfo(state.battle.allies);

  const synOdMult = syn.umbrella === 'Quintet' ? 1.15 : 1.0;

  state.battle.overdrive = Math.min(100, Math.round(state.battle.overdrive + (10 + sk.pips * 4) * ally.crownMult * synOdMult));

  triggerUnitAnim(ally.key, 'lunge-right');



  if (sk.id === 'throw_badge') {

    if (!target || !isUnmoored(target) || state.badgePouch.length <= 0) {

      advanceTurn();

      return;

    }

    if (isAuto) {
      addLog(`<span style="color:#34d399; font-weight:bold;">🏷 [AUTO-BADGE ${slotCode}] <b>${ally.name}</b> intercepts &amp; stamps a Role Badge onto Unmoored <b>${target.name}</b>!</span>`);
      window.stampMonsterToTown(target.key, 0, true);

      updateHeaderUI();

      renderBattle();

      if (!checkBattleEnd()) scheduleNextStep(advanceTurn);

    } else {
      window.openPreTypedBadgeModal(target);

    }

    return;

  }



  if (sk.id === 'basic_strike') {

    const cap = ally.maxAp - ally.upkeepAp;

    ally.ap = Math.min(cap, ally.ap + 2);

  }

  if (sk.id === 'focus_spirit') {

    const cap = ally.maxAp - ally.upkeepAp;

    ally.ap = Math.min(cap, ally.ap + 3);

  }



  if (ally.knot === 'mercury_mimic') {

    if (state.battle.lastSkillElement && state.battle.lastSkillElement !== 'Neutral') {

      ally.element = state.battle.lastSkillElement;

    }

    if (sk.tags.includes('Spell') || sk.tags.includes('Blast')) {

      ally.shield += 14;

      spawnFloatingText(ally.key, `+14🛡`, '#e2e8f0');

    }

  }



  const el = sk.element === 'Neutral' ? ally.element : sk.element;

  let mult = 1.0;

  if (ally.knot === 'mercury_mimic' && state.battle.lastSkillElement === el) mult *= 1.20;

  if (isOddPendulum) mult *= 1.65;

  if (ally.atkBuffTurns > 0) mult *= 1.25;

  if (el === 'Fire' && heroHasPassive(hero, 'kael_furnace')) mult *= 1.30;

  if (state.battle.stageRule === 'superheated_grates' && (el === 'Fire' || sk.umbrella === 'Artifice')) mult *= 1.25;

  if (state.battle.stageRule === 'damp_mist' && (el === 'Water' || el === 'Dark')) mult *= 1.20;

  if (sk.id === 'pkg_boiler_overdrive' && ally.overheat > 0) mult *= (1 + ally.overheat * 0.25);

  if (ally.momentum > 0) mult *= (1 + ally.momentum * 0.15);

  if (ally.conviction > 0) mult *= (1 + ally.conviction * 0.12);



  const isAoE = (sk.target === 'all_foes' || sk.target === 'foe_front_row');

  if (state.battle.judgeLaw === 'honorable_duel') {

    if (isAoE && sk.power) {

      mult *= 0.60;

      ally.ap = Math.max(0, ally.ap - 1);

      addLog(`<span style="color:#fca5a5;">⚖️ REFEREE FINE! AoE broke Duelist Law (-40% dmg & -1 AP)!</span>`);

    } else if (sk.power) {

      mult *= 1.35;

    }

  } else if (state.battle.judgeLaw === 'element_flux') {

    if (state.battle.lastSkillElement && el !== state.battle.lastSkillElement) {

      mult *= 1.30;

      ally.ap = Math.min(ally.maxAp - ally.upkeepAp, ally.ap + 1);

      addLog(`<span style="color:#a7f3d0;">🌈 Prismatic Flux Bonus! Switched to ${el} (+30% dmg & +1 AP)!</span>`);

    }

  } else if (state.battle.judgeLaw === 'featherweight_blitz' && sk.pips === 1) {

    mult *= 1.45;

    state.battle.overdrive = Math.min(100, state.battle.overdrive + 10);

  } else if (state.battle.judgeLaw === 'guardian_mercy') {

    if (sk.tags.includes('Heal') || sk.tags.includes('Shield')) {

      ally.shield += 16;

      ally.ap = Math.min(ally.maxAp - ally.upkeepAp, ally.ap + 1);

    }

    if (sk.power && target && target.key.startsWith('foe_') && isUnmoored(target)) {

      mult *= 0.70;

    }

  }



  if (ally.knot === 'fortune_dice' && sk.power) {

    const d6 = 1 + Math.floor(Math.random() * 6);

    if (d6 <= 2) {

      mult *= 0.85;

      addLog(`<span style="color:#94a3c8;">🎲 ${ally.name} rolled [${d6}] on Gambler's Knot (0.85x graze).</span>`);

    } else if (d6 <= 5) {

      mult *= 1.35;

      ally.ap = Math.min(ally.maxAp - ally.upkeepAp, ally.ap + 1);

      addLog(`<span style="color:#6ee7b7;">🎲 ${ally.name} rolled [${d6}] on Gambler's Knot (1.35x +1 AP)!</span>`);

    } else {

      mult *= 2.20;

      state.resources.gold += 8;

      addLog(`<span style="color:#fde047; font-weight:bold;">🎲 JACKPOT SIX! ${ally.name}'s Gambler Knot hits for 2.2x CRIT & +8🪙 Gold!</span>`);

    }

  }



  if (sk.id === 'kael_limiter') {

    mult *= (1 + ally.momentum * 0.35);

    ally.momentum = 0;

    ally.limiterUsed = true;

  }



  if (['kael_iaido', 'kael_guard', 'pkg_gale_slash', 'pkg_lotus_palm', 'anc_tempest_sheath'].includes(sk.id)) {

    ally.momentum = Math.min(5, ally.momentum + 1);

  }

  if (sk.id === 'anc_tempest_sheath') {

    ally.shield += Math.round(18 * ally.healMult);

    spawnFloatingText(ally.key, `+${Math.round(18 * ally.healMult)}🛡`, '#67e8f9');

  }

  if (sk.id === 'kael_guard') {

    const cap = ally.maxAp - ally.upkeepAp;

    ally.ap = Math.min(cap, ally.ap + 2);

  }



  if (sk.umbrella === 'Artifice' && sk.id !== 'pip_vent' && sk.id !== 'anc_dynamo_coil') {

    const heatStep = state.battle.stageRule === 'superheated_grates' ? 2 : 1;

    ally.overheat = Math.min(3, ally.overheat + heatStep);

  }

  if (sk.id === 'anc_dynamo_coil') {

    if (ally.overheat > 0) {

      ally.overheat -= 1;

      ally.ap = Math.min(ally.maxAp - ally.upkeepAp, ally.ap + 2);

      addLog(`<span style="color:#fde047;">⚡ Dynamo Arc Capacitor drains 1 Heat into +2 Spirit AP!</span>`);

    } else {

      ally.overheat = Math.min(3, ally.overheat + 1);

    }

  }

  if (sk.id === 'pip_vent') {

    ally.overheat = 0;

    const cap = ally.maxAp - ally.upkeepAp;

    ally.ap = Math.min(cap, ally.ap + 2);

    state.battle.allies.filter(a => a.hp > 0 && a.row === 'Front').forEach(a => {

      a.shield += Math.round(sk.shield * ally.healMult);

      spawnFloatingText(a.key, `+${Math.round(sk.shield * ally.healMult)}🛡`, '#67e8f9');

    });

    addLog(`<span style="color:#fed7aa;">💨 [${slotCode}] <b>${ally.name}</b> vents Copper Core: Overheat cleared & Front Row shielded!</span>`);

  }



  if (sk.id === 'lyra_etch') {

    ally.residue = Math.min(3, ally.residue + 1);

    const lowApAlly = state.battle.allies.filter(a => a.hp > 0).sort((a, b) => a.ap - b.ap)[0];

    if (lowApAlly) lowApAlly.ap = Math.min(lowApAlly.maxAp - lowApAlly.upkeepAp, lowApAlly.ap + 1);

  }

  if (sk.id === 'anc_alkahest_lens') {

    ally.residue = Math.min(3, ally.residue + 2);

  }

  let breakArmorOnHit = false;

  if (sk.id === 'lyra_pillar' && ally.residue > 0) {

    ally.residue -= 1;

    mult *= 2.0;

    breakArmorOnHit = true;

  }

  if (sk.id === 'pkg_frost_snap' && ally.residue > 0) {

    ally.residue -= 1;

    mult *= 1.8;

    ally.hp = Math.min(ally.maxHp, ally.hp + 28);

  }



  if (sk.id === 'vane_maul' && target) {

    const highestHp = Math.max(...state.battle.foes.filter(f => f.hp > 0 && !f.captured).map(f => f.hp));

    if (target.hp >= highestHp) {

      ally.conviction = Math.min(5, ally.conviction + 1);

      ally.ap = Math.min(ally.maxAp - ally.upkeepAp, ally.ap + 1);

      addLog(`<span style="color:#dbeafe;">⚖ VOW HONORED! <b>${ally.name}</b> gains +1 Conviction & +1 AP refund!</span>`);

    } else {

      mult *= 0.5;

      addLog(`<span style="color:#fca5a5;">⚖ Vow Broken (did not target highest-HP foe): 0.5x dmg!</span>`);

    }

  }

  if (sk.id === 'vane_henshin' || sk.id === 'anc_justice_buckler') {

    ally.interceptVow = true;

    const shGain = sk.id === 'anc_justice_buckler' ? 26 : 22;

    ally.shield += shGain;

    if (sk.id === 'anc_justice_buckler') ally.conviction = Math.min(5, ally.conviction + 1);

  }

  if (sk.id === 'vane_chorus') {

    const sh = Math.round(sk.shield * ally.healMult * (heroHasPassive(hero, 'pkg_citizen_aegis') ? 1.3 : 1));

    state.battle.allies.filter(a => a.hp > 0).forEach(a => {

      a.shield += sh;

      if (a.row === 'Front') a.ap = Math.min(a.maxAp - a.upkeepAp, a.ap + 1);

      spawnFloatingText(a.key, `+${sh}🛡`, '#fef08a');

    });

  }



  if (sk.id === 'zappa_legion') {

    if (state.battle.legionStacks === 0) {

      ally.upkeepAp = Math.min(4, ally.upkeepAp + 2);

      ally.ap = Math.min(ally.maxAp - ally.upkeepAp, ally.ap);

    }

    state.battle.legionStacks = Math.min(6, state.battle.legionStacks + 3);

    addLog(`<span style="color:#a7f3d0;">📜 [${slotCode}] <b>${ally.name}</b> summons <b>Paper Legion x${state.battle.legionStacks}</b> to Front Row!</span>`);

  }

  if (sk.id === 'anc_marionette_spool') {

    state.battle.legionStacks = Math.min(6, state.battle.legionStacks + 2);

    addLog(`<span style="color:#a7f3d0;">🎎 [${slotCode}] <b>${ally.name}</b>'s Marionette Spool weaves <b>+2 Paper Legion</b> (now x${state.battle.legionStacks})!</span>`);

  }

  if (sk.id === 'zappa_oversoul') {

    const topAtkAlly = [...state.battle.allies].filter(a => a.hp > 0).sort((a, b) => b.atk - a.atk)[0];

    if (topAtkAlly) topAtkAlly.atkBuffTurns = 2;

  }

  if (sk.id === 'zappa_kaiju') {

    if (state.battle.canopy.turns === 0) {

      ally.upkeepAp = Math.min(4, ally.upkeepAp + 2);

    }

    state.battle.canopy = { turns: 2, name: 'Umbral Kaiju Shadow', dmg: Math.round(ally.atk * 1.25) };

    addLog(`<span style="color:#34d399; font-weight:bold;">🐉 [${slotCode}] <b>${ally.name}</b> fills the CANOPY SLOT with <b>Umbral Kaiju Shadow</b>!</span>`);

  }



  if (sk.heal && target) {

    const healAmt = Math.round(sk.heal * ally.healMult * (heroHasPassive(hero, 'pkg_citizen_aegis') ? 1.3 : 1));

    target.hp = Math.min(target.maxHp, target.hp + healAmt);

    if (sk.shield) target.shield += Math.round(sk.shield * ally.healMult);

    spawnFloatingText(target.key, `+${healAmt}💚`, '#34d399');

    addLog(`<span style="color:#6ee7b7;">⚗ [${slotCode}] <b>${ally.name}</b> casts ${sk.name} on ${target.name} (+${healAmt} HP)!</span>`);

  } else if (sk.shield && sk.target === 'self') {

    const shAmt = Math.round(sk.shield * ally.healMult);

    ally.shield += shAmt;

    spawnFloatingText(ally.key, `+${shAmt}🛡`, '#38bdf8');

  }



  if (ally.knot === 'inverted_heart' && (sk.tags.includes('Heal') || sk.tags.includes('Shield'))) {

    const weakFoe = state.battle.foes.filter(f => f.hp > 0 && !f.captured).sort((a, b) => a.hp - b.hp)[0];

    if (weakFoe) {

      const hexDmg = Math.round(ally.atk * 1.15);

      applyDamageToFoe(weakFoe, hexDmg, 'Dark');

      addLog(`<span style="color:#f472b6;">💜 Inverted Heart Knot hexes ${weakFoe.name} for <b>${hexDmg}</b> Void dmg!</span>`);

    }

  }



  if (sk.power) {

    let targets = [];

    const aliveFoes = state.battle.foes.filter(f => f.hp > 0 && !f.captured);

    if (sk.target === 'all_foes') targets = aliveFoes;

    else if (sk.target === 'foe_front_row') {

      const ff = aliveFoes.filter(f => f.row === 'Front');

      targets = ff.length ? ff : aliveFoes;

    } else if (target && target.key.startsWith('foe_')) {

      targets = [target];

    }



    if ((sk.id === 'pkg_grapple_wire' || (ally.knot === 'gravity_anchor' && targets.length === 1)) && target && target.row === 'Back') {

      target.row = 'Front';

      target.armorBreak = true;

      addLog(`<span style="color:#fed7aa;">🪝 <b>${ally.name}</b> drags ${target.name} into the Front Row!</span>`);

    }

    if (sk.id === 'pkg_silk_snare' && target) {

      target.armorBreak = true;

      target.spd = Math.max(8, target.spd - 4);

    }



    const seamSplitActive = (ally.knot === 'seam_split' && (ally.hp / ally.maxHp <= 0.60));

    targets.forEach(foe => {

      if (breakArmorOnHit) foe.armorBreak = true;

      const gravMult = (ally.knot === 'gravity_anchor' && foe.row === 'Front') ? 1.30 : 1.0;

      const rawDmg = Math.max(6, Math.round(ally.atk * sk.power * mult * gravMult * (0.94 + Math.random() * 0.12)));

      applyDamageToFoe(foe, rawDmg, el);



      if (seamSplitActive && foe.hp > 0) {

        const echoDmg = Math.max(5, Math.round(rawDmg * 0.5));

        applyDamageToFoe(foe, echoDmg, el);

      }

    });



    if (targets.length > 0) {

      addLog(`<span>⚔ [${slotCode}] <b>${ally.name}</b> uses <b style="color:#fde68a;">${sk.name}</b> (${EL_ICONS[el] || ''}${el})!${seamSplitActive ? ' <i style="color:#f472b6;">[Seam-Split x2!]</i>' : ''}</span>`);

      registerElementalChain(el);

    }

  }



  state.battle.lastSkillElement = el;

  updateHeaderUI();

  renderBattle();



  if (!checkBattleEnd()) {

    if (state.battle.mode === 'manual') {

      setTimeout(advanceTurn, 260);

    } else {

      scheduleNextStep(advanceTurn);

    }

  }

}



export function applyDamageToFoe(foe, dmg, element) {

  let finalDmg = foe.armorBreak ? Math.round(dmg * 1.3) : dmg;

  if (foe.shield > 0) {

    const absorbed = Math.min(foe.shield, finalDmg);

    foe.shield -= absorbed;

    finalDmg -= absorbed;

  }

  foe.hp = Math.max(0, foe.hp - finalDmg);

  triggerUnitAnim(foe.key, 'hit-shake');

  spawnFloatingText(foe.key, `-${finalDmg}`, '#fca5a5');

  return finalDmg;

}



export function registerElementalChain(el) {

  if (!el || el === 'Neutral') return;

  if (state.battle.chainElement === el) {

    state.battle.chainCount += 1;

  } else {

    state.battle.chainElement = el;

    state.battle.chainCount = 1;

  }



  if (state.battle.chainCount >= 3) {

    state.battle.chainCount = 0;

    const burstDmg = state.battle.stageRule === 'leyline_hum' ? 52 : 36;

    state.battle.foes.filter(f => f.hp > 0 && !f.captured).forEach(foe => {

      applyDamageToFoe(foe, burstDmg, el);

    });

    addLog(`<span style="color:#fde047; font-weight:bold;">💥 3x ${EL_ICONS[el]} ${el.toUpperCase()} CRYSTAL CHAIN BURST! ${burstDmg} bonus AoE dmg across all foes!</span>`);

  }

}



export function triggerSquadOverdrive() {

  if (!state.battle.active || state.battle.overdrive < 100) return;

  state.battle.overdrive = 0;



  const syn = getSquadSynergyInfo(state.battle.allies);

  const els = new Set(state.battle.allies.map(a => a.element));

  const isMonoEl = els.size === 1;

  const aliveFoes = state.battle.foes.filter(f => f.hp > 0 && !f.captured);

  const aliveAllies = state.battle.allies.filter(a => a.hp > 0);



  let burst = 58 + (isMonoEl ? 22 : 0) + (syn.umbrella === 'Quintet' ? 15 : 0);

  let shieldGain = 25;

  let titleBanner = 'SQUAD CROWN OVERDRIVE';



  if (syn.tier >= 5) {

    if (syn.umbrella === 'Ki') {

      titleBanner = '🥋 5/5 KI GESTALT: GRAND SECT ECHO ARRAY';

      burst = 90;

      aliveAllies.forEach(a => { a.momentum = Math.min(5, a.momentum + 2); });

    } else if (syn.umbrella === 'Artifice') {

      titleBanner = '🤖 5/5 ARTIFICE GESTALT: VOLTRON SUPER-COMBINER';

      burst = 96;

      shieldGain = 40;

      aliveAllies.forEach(a => { a.overheat = 0; });

    } else if (syn.umbrella === 'Patterns') {

      titleBanner = '⚗️ 5/5 PATTERNS GESTALT: GRAND TRANSMUTATION CIRCLE';

      burst = 88;

      aliveFoes.forEach(f => { f.armorBreak = true; });

      aliveAllies.forEach(a => { a.residue = Math.min(3, a.residue + 2); });

    } else if (syn.umbrella === 'Mantles') {

      titleBanner = '🛡️ 5/5 MANTLES GESTALT: SACRED ARENA DOMAIN';

      burst = 82;

      shieldGain = 45;

      aliveAllies.forEach(a => { a.conviction = Math.min(5, a.conviction + 2); a.interceptVow = true; });

    } else if (syn.umbrella === 'Tethers') {

      titleBanner = '🐉 5/5 TETHERS GESTALT: GREAT BEAST MANIFEST';

      burst = 82;

      state.battle.canopy = { turns: 3, name: 'Great Sovereign Kaiju', dmg: 42 };

      state.battle.legionStacks = Math.min(6, state.battle.legionStacks + 3);

    }

  } else if (syn.tier >= 3) {

    titleBanner = `✨ ${syn.label.toUpperCase()} OVERDRIVE`;

    burst += 16;

    shieldGain = 32;

  } else if (syn.umbrella === 'Quintet') {

    titleBanner = '🌈 5-COLOR JIGSAW QUINTET OVERDRIVE';

  }



  aliveFoes.forEach(foe => {

    applyDamageToFoe(foe, burst, state.battle.allies[0].element);

  });

  aliveAllies.forEach(a => {

    a.shield += shieldGain;

    a.ap = Math.min(a.maxAp - a.upkeepAp, a.ap + 2);

    spawnFloatingText(a.key, `+${shieldGain}🛡 +2AP`, '#fde047');

  });



  addLog(`<span style="color:#fde047; font-weight:bold;">🌟 ${titleBanner}${isMonoEl ? ' [5x ELEMENTAL HARMONY!]' : ''}! ${burst} AoE dmg + +${shieldGain}🛡 & +2 AP!</span>`);

  renderBattle();

  checkBattleEnd();

}



export function executeEnemyTurn(foe) {

  const aliveAllies = state.battle.allies.filter(a => a.hp > 0);

  if (!aliveAllies.length) { advanceTurn(); return; }



  triggerUnitAnim(foe.key, 'lunge-left');



  if (!foe.ranged && state.battle.legionStacks > 0 && Math.random() < 0.45) {

    state.battle.legionStacks -= 1;

    addLog(`<span style="color:#a7f3d0;">📜 Paper Legion intercepts ${foe.name}'s attack! (${state.battle.legionStacks} stacks left)</span>`);

    if (state.battle.legionStacks === 0) {

      const zappa = state.battle.allies.find(a => a.heroId === 'zappa');

      if (zappa) zappa.upkeepAp = Math.max(0, zappa.upkeepAp - 2);

    }

    renderBattle();

    scheduleNextStep(advanceTurn);

    return;

  }



  const frontAllies = aliveAllies.filter(a => a.row === 'Front');

  const pool = (!foe.ranged && frontAllies.length > 0) ? frontAllies : aliveAllies;

  let target = pool[Math.floor(Math.random() * pool.length)];



  const interceptor = aliveAllies.find(a => a.interceptVow && a.key !== target.key);

  if (interceptor && target.hp / target.maxHp < 0.60) {

    target = interceptor;

    interceptor.conviction = Math.min(5, interceptor.conviction + 1);

    addLog(`<span style="color:#dbeafe;">🛡 <b>${interceptor.name}</b> honors Vow & intercepts ${foe.name}'s strike (+1 Conviction)!</span>`);

  }



  let dmg = Math.max(6, Math.round(foe.atk * (0.9 + Math.random() * 0.2)));

  if (target.knot === 'coil_rubber' && foe.element === 'Water') dmg = Math.round(dmg * 1.3);

  if (target.knot === 'glass_pendulum' && state.battle.round % 2 === 0) dmg = Math.round(dmg * 0.5);



  const hadShield = target.shield > 0;

  if (target.shield > 0) {

    const abs = Math.min(target.shield, dmg);

    target.shield -= abs;

    dmg -= abs;

  }

  target.hp = Math.max(0, target.hp - dmg);

  triggerUnitAnim(target.key, 'hit-shake');

  spawnFloatingText(target.key, `-${dmg}`, '#f87171');

  addLog(`<span style="color:#fda4af;">👾 <b>${foe.name}</b> strikes ${target.name} for <b>${dmg}</b> ${foe.element} dmg!</span>`);



  if (target.hp <= 0 && target.knot === 'phoenix_ash' && !target.phoenixUsed) {

    target.phoenixUsed = true;

    target.hp = Math.round(target.maxHp * 0.55);

    target.ap = Math.min(target.maxAp - target.upkeepAp, target.ap + 3);

    spawnFloatingText(target.key, `🔥REBORN!`, '#fde047');

    state.battle.foes.filter(f => f.hp > 0 && !f.captured).forEach(f => {

      applyDamageToFoe(f, 32, 'Fire');

    });

    addLog(`<span style="color:#fde047; font-weight:bold;">🔥 CINDER-MOLT KNOT! <b>${target.name}</b> rises from ash at 55% HP (+3 AP) & blasts all foes for 32 Fire dmg!</span>`);

  }



  const hero = state.heroes.find(h => h.id === target.heroId);

  if (hadShield && hero && heroHasPassive(hero, 'kael_furnace') && foe.hp > 0) {

    applyDamageToFoe(foe, 16, 'Fire');

    addLog(`<span style="color:#fde68a;">🔥 Inner Furnace scorches ${foe.name} for 16 Fire dmg!</span>`);

  }



  if (!foe.ranged && target.knot === 'coil_rubber' && foe.hp > 0) {

    const refl = Math.max(5, Math.round(foe.atk * 0.28));

    applyDamageToFoe(foe, refl, 'Neutral');

    addLog(`<span style="color:#fbcfe8;">➰ Coil-Rubber bounces ${refl} dmg back onto ${foe.name}!</span>`);

  }



  if (target.hp > 0 && hero && heroHasPassive(hero, 'pkg_iron_counter') && Math.random() < 0.55 && foe.hp > 0) {

    const cDmg = Math.round(target.atk * 0.9);

    applyDamageToFoe(foe, cDmg, target.element);

    target.ap = Math.min(target.maxAp - target.upkeepAp, target.ap + 1);

    addLog(`<span style="color:#fde047;">🥋 <b>${target.name}</b> triggers Iron Body Counter for ${cDmg} dmg (+1 AP)!</span>`);

  }



  renderBattle();

  if (!checkBattleEnd()) {

    if (state.battle.mode === 'manual') {

      setTimeout(advanceTurn, 260);

    } else {

      scheduleNextStep(advanceTurn);

    }

  }

}



export function openQuickBadgeModal() {

  if (!state.battle.active || state.badgePouch.length <= 0) return;

  const unmoored = state.battle.foes.find(f => isUnmoored(f));

  if (!unmoored) return;

  window.openPreTypedBadgeModal(unmoored);

}



export function openRoleBadgeModal(foe) {

  openModal(`

    <div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:6px;">🏷 ROLE BADGE CAPTURE: ${foe.sprite} ${foe.name}</div>

    <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">

      By Covenant Law, Chaos cannot destroy—only re-assign! Choose which Role Badge to stamp onto <b>${foe.name}</b>:

    </div>

    <div style="display:flex; flex-direction:column; gap:8px;">

      <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">

        <div>

          <div style="font-weight:bold; color:#fcd34d;">💰 MERCHANT BADGE</div>

          <div style="font-size:11px; color:var(--text-muted);">Opens pop-up monster shop (+22⚡ Batteries, +16⛏ Ore) & recruits ${foe.name} as a Mosaic Bench Merchant!</div>

        </div>

        <button class="btn-gold" onclick="pickBadgeRole('${foe.key}', 'merchant')">Stamp Merchant</button>

      </div>

      <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">

        <div>

          <div style="font-weight:bold; color:#67e8f9;">📜 TEACHER BADGE</div>

          <div style="font-size:11px; color:var(--text-muted);">Issues instant Breakthrough Trial: Unblocks/Blooms a Chakra on one of your heroes + grants +1 Teacher Seal!</div>

        </div>

        <button class="btn-cyan" onclick="pickBadgeRole('${foe.key}', 'teacher')">Stamp Teacher</button>

      </div>

      <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">

        <div>

          <div style="font-weight:bold; color:#f472b6;">⚔ RIVAL BADGE</div>

          <div style="font-size:11px; color:var(--text-muted);">Swears an eternal shonen rivalry: awards +3🎰 Dreamsmith Casino Tokens & +1 Oni Ofuda Seal!</div>

        </div>

        <button class="btn-magenta" onclick="pickBadgeRole('${foe.key}', 'rival')">Stamp Rival</button>

      </div>

    </div>

  `);

}



export function pickBadgeRole(foeKey, roleKind) {

  const foe = getUnitByKey(foeKey);

  closeModal();

  if (foe) resolveRoleBadgeCapture(foe, roleKind, false);

  updateHeaderUI();

  renderBattle();

  if (!checkBattleEnd()) {

    setTimeout(advanceTurn, 220);

  }

}



export function resolveRoleBadgeCapture(foe, roleKind, fromAuto) {

  foe.captured = true;

  foe.hp = 0;



  if (roleKind === 'merchant') {

    state.resources.batteries += 22;

    state.resources.ore += 16;

    if (state.benchRoster.length < 7) {

      state.benchRoster.push({

        id: 'b_' + Date.now(),

        name: `${foe.name} (Badged Merchant)`,

        icon: foe.sprite,

        role: '+25% ⚡ & +25% ⛏ Mosaic Yield',

        batMult: 0.25, oreMult: 0.25, xpBonus: 0, badgeBonus: 0,

        assigned: state.benchRoster.filter(b => b.assigned).length < 3

      });

    }

    addLog(`<span style="color:#fde047;">🏷 Badged <b>${foe.name}</b> as a <b>MERCHANT</b> (+22⚡, +16⛏ & joined Mosaic Bench)!</span>`);

  } else if (roleKind === 'teacher') {

    state.resources.seals += 1;

    let upgradedText = '+1📜 Teacher Seal';

    for (const h of state.heroes) {

      const blockedKey = Object.keys(h.chakras).find(k => h.chakras[k] === 'Blocked');

      if (blockedKey) {

        h.chakras[blockedKey] = 'Open';

        upgradedText = `Unblocked ${h.name}'s ${blockedKey} Chakra + 1📜 Seal`;

        break;

      }

    }

    addLog(`<span style="color:#67e8f9;">🏷 Badged <b>${foe.name}</b> as a <b>TEACHER</b> (${upgradedText})!</span>`);

  } else {

    state.resources.tokens += 3;

    state.sealCounts.oni_ofuda = (state.sealCounts.oni_ofuda || 0) + 1;

    addLog(`<span style="color:#f472b6;">🏷 Badged <b>${foe.name}</b> as a <b>RIVAL</b> (+3🎰 Tokens & +1 Oni Ofuda)!</span>`);

  }

}



export function triggerUnitAnim(unitKey, cls) {

  setTimeout(() => {

    const el = document.getElementById('unit-' + unitKey);

    if (el) {

      el.classList.add(cls);

      setTimeout(() => el.classList.remove(cls), 220);

    }

  }, 10);

}



export function spawnFloatingText(unitKey, text, color) {

  setTimeout(() => {

    const card = document.getElementById('unit-' + unitKey);

    if (!card) return;

    const span = document.createElement('span');

    span.className = 'float-num';

    span.style.color = color;

    span.textContent = text;

    card.appendChild(span);

    setTimeout(() => span.remove(), 750);

  }, 20);

}



export function renderBattle() {

  document.getElementById('mode-manual').className = state.battle.mode === 'manual' ? 'btn-gold' : '';

  document.getElementById('mode-auto1').className = state.battle.mode === 'auto1' ? 'btn-cyan' : '';

  document.getElementById('mode-auto4').className = state.battle.mode === 'auto4' ? 'btn-magenta' : '';

  const abBtn = document.getElementById('btn-autobadge');

  abBtn.className = state.battle.autoBadge ? 'btn-emerald' : '';

  abBtn.textContent = `🏷 Auto-Badge: ${state.battle.autoBadge ? 'ON' : 'OFF'}`;



  const syn = getSquadSynergyInfo(state.battle.allies.length ? state.battle.allies : state.heroes);

  const synEl = document.getElementById('synergy-tracker');

  if (synEl) {

    synEl.innerHTML = `🧩 ${syn.label}`;

    synEl.title = syn.desc;

    synEl.style.borderColor = syn.tier >= 5 ? '#fde047' : (syn.tier >= 3 ? '#38bdf8' : '#354470');

  }



  const chEl = state.battle.chainElement;

  document.getElementById('chain-tracker').innerHTML = chEl

    ? `⛓ Chain: <span class="el-${chEl}">${EL_ICONS[chEl]} ${chEl} (${state.battle.chainCount}/3)</span>`

    : `⛓ Chain: None (0/3)`;



  const odBtn = document.getElementById('btn-overdrive');

  odBtn.textContent = `★ OVERDRIVE (${state.battle.overdrive}%)`;

  odBtn.disabled = !state.battle.active || state.battle.overdrive < 100;



  const qStrip = document.getElementById('turn-queue');

  const fullQ = state.battle.activeUnitKey ? [state.battle.activeUnitKey, ...state.battle.queue] : state.battle.queue;

  qStrip.innerHTML = fullQ.slice(0, 9).map((k, idx) => {

    const u = getUnitByKey(k);

    if (!u) return '';

    const isFoe = k.startsWith('foe_');

    return `<span class="q-chip ${idx === 0 ? 'active' : ''} ${isFoe ? 'foe' : ''}">${u.sprite} ${u.name}</span>`;

  }).join('');



  const pCanopy = document.getElementById('player-canopy');

  if (state.battle.canopy.turns > 0) {

    pCanopy.className = 'canopy-banner active';

    pCanopy.innerHTML = `<span>🐉 <b>${state.battle.canopy.name}</b> (Rains ${state.battle.canopy.dmg} Dark AoE/rnd)</span><span>${state.battle.canopy.turns} Rnds</span>`;

  } else {

    pCanopy.className = 'canopy-banner';

    pCanopy.innerHTML = `<span>☁ CANOPY SLOT: Empty (Invoke via Zappa-Lin's Spirit Bell)</span>`;

  }



  document.getElementById('encounter-title').textContent = state.battle.title;

  document.getElementById('round-counter').textContent = `Round ${state.battle.round}`;



  const sRule = STAGE_RULES[state.battle.stageRule] || STAGE_RULES.clear_sky;

  const sBar = document.getElementById('stage-rule-bar');

  sBar.className = `stage-rule-bar ${sRule.css || ''}`;

  document.getElementById('stage-rule-name').textContent = `${sRule.icon} STAGE RULE: ${sRule.name}`;

  document.getElementById('stage-rule-desc').textContent = sRule.desc;



  const jBar = document.getElementById('judge-law-bar');

  if (state.battle.judgeLaw && JUDGE_LAWS[state.battle.judgeLaw]) {

    const jLaw = JUDGE_LAWS[state.battle.judgeLaw];

    jBar.classList.add('active');

    document.getElementById('judge-law-name').textContent = `${jLaw.icon} JUDGE LAW: ${jLaw.name}`;

    document.getElementById('judge-law-desc').textContent = jLaw.desc;

  } else {

    jBar.classList.remove('active');

  }



  const selSkill = SKILLS[state.battle.selectedSkillId];

  const renderAllyCard = (a) => {

    const isTurn = state.battle.activeUnitKey === a.key && state.battle.active;

    const effMaxAp = a.maxAp - a.upkeepAp;

    const hpPct = Math.round((a.hp / a.maxHp) * 100);

    const apPct = Math.round((a.ap / a.maxAp) * 100);

    const quirkBadges = [];

    if (a.momentum > 0) quirkBadges.push(`<span style="color:#fde047;">Mom:${a.momentum}</span>`);

    if (a.overheat > 0) quirkBadges.push(`<span style="color:#fb923c;">Heat:${a.overheat}/3</span>`);

    if (a.residue > 0) quirkBadges.push(`<span style="color:#67e8f9;">Res:${a.residue}</span>`);

    if (a.conviction > 0) quirkBadges.push(`<span style="color:#bfdbfe;">Vow:${a.conviction}</span>`);

    if (a.upkeepAp > 0) quirkBadges.push(`<span style="color:#a7f3d0;">Upk:-${a.upkeepAp}AP</span>`);

    if (a.knot) quirkBadges.push(`<span style="color:#f472b6;">🔮Knot</span>`);



    const validHeal = state.battle.mode === 'manual' && selSkill && selSkill.target === 'lowest_ally' && a.hp > 0;



    return `

      <div class="unit-card ${isTurn ? 'active-turn' : ''} ${validHeal ? 'valid-target' : ''} ${a.hp <= 0 ? 'ko' : ''}"

           id="unit-${a.key}" onclick="clickUnitInBattle('${a.key}')">

        <div style="display:flex; justify-content:space-between; align-items:center;">

          <span style="font-weight:bold; font-size:11.5px;">${a.sprite} ${a.name}</span>

          <span class="u-tag u-${a.umbrella}">${a.umbrella}</span>

        </div>

        <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-top:2px;">

          <span>HP ${a.hp}/${a.maxHp} ${a.shield > 0 ? `<b style="color:#67e8f9;">(+${a.shield}🛡)</b>` : ''}</span>

          <span style="color:#93c5fd;">AP ${a.ap}/${effMaxAp} ${EL_ICONS[a.element]}</span>

        </div>

        <div class="bar-track"><div class="hp-fill ${hpPct < 35 ? 'low' : ''}" style="width:${hpPct}%;"></div></div>

        <div class="bar-track" style="height:4px;"><div class="ap-fill" style="width:${apPct}%;"></div></div>

        ${quirkBadges.length ? `<div style="font-size:10px; margin-top:3px; display:flex; gap:5px; flex-wrap:wrap;">${quirkBadges.join('')}</div>` : ''}

      </div>

    `;

  };



  document.getElementById('ally-back-col').innerHTML =

    state.battle.allies.filter(a => a.row === 'Back').map(renderAllyCard).join('');



  let frontHtml = state.battle.allies.filter(a => a.row === 'Front').map(renderAllyCard).join('');

  if (state.battle.legionStacks > 0) {

    frontHtml += `

      <div class="unit-card" style="border-color:#34d399; background:#142b2b;">

        <div style="display:flex; justify-content:space-between;">

          <span style="font-weight:bold; color:#a7f3d0;">📜 Paper Legion x${state.battle.legionStacks}</span>

          <span class="u-tag u-Tethers">Summon</span>

        </div>

        <div style="font-size:10.5px; color:var(--text-muted);">Swarms each round & intercepts Front hits</div>

      </div>

    `;

  }

  document.getElementById('ally-front-col').innerHTML = frontHtml;



  const renderFoeCard = (f) => {

    if (f.captured) {

      return `<div class="unit-card ko"><div style="font-size:11px; color:#fde047;">🏷 ${f.name} — Role Badged!</div></div>`;

    }

    const isTurn = state.battle.activeUnitKey === f.key && state.battle.active;

    const hpPct = Math.round((f.hp / f.maxHp) * 100);

    const unm = isUnmoored(f);

    const canClickFoe = state.battle.mode === 'manual' && selSkill && f.hp > 0 && !['self', 'all_allies', 'ally_front_row', 'lowest_ally'].includes(selSkill.target);



    return `

      <div class="unit-card ${isTurn ? 'active-turn' : ''} ${canClickFoe ? 'foe-target' : ''} ${f.hp <= 0 ? 'ko' : ''}"

           id="unit-${f.key}" onclick="clickUnitInBattle('${f.key}')">

        <div style="display:flex; justify-content:space-between; align-items:center;">

          <span style="font-weight:bold; font-size:11.5px;">${f.sprite} ${f.name}</span>

          <span class="el-tag el-${f.element}">${EL_ICONS[f.element]} ${f.element}</span>

        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; margin-top:2px;">

          <span>HP ${f.hp}/${f.maxHp} ${f.shield > 0 ? `<b style="color:#67e8f9;">(+${f.shield}🛡)</b>` : ''} ${f.armorBreak ? '<b style="color:#fb923c;">[BRK]</b>' : ''}</span>

          ${unm ? `<span class="unmoored-pill" title="<=35% HP! Throw a Role Badge to capture as Merchant, Teacher, or Rival!">UNMOORED!</span>` : `<span style="color:var(--text-muted);">${f.ranged ? 'Ranged' : 'Melee'}</span>`}

        </div>

        <div class="bar-track"><div class="hp-fill ${hpPct <= 35 ? 'low' : ''}" style="width:${hpPct}%;"></div></div>

      </div>

    `;

  };



  document.getElementById('foe-front-col').innerHTML =

    state.battle.foes.filter(f => f.row === 'Front').map(renderFoeCard).join('');

  document.getElementById('foe-back-col').innerHTML =

    state.battle.foes.filter(f => f.row === 'Back').map(renderFoeCard).join('');



  renderCommandDeck();

}



export function renderCommandDeck() {

  const deck = document.getElementById('command-deck');

  if (!state.battle.active) {

    const returnLabel = state.subMap.active ? `🕳️ Return to ${state.subMap.title}` : `🗺 Return to Sky-Shard Map`;

    deck.innerHTML = `

      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin:auto 0;">

        <div>

          <div style="font-size:14px; font-weight:bold; color:#fde047;">✨ Encounter Complete!</div>

          <div style="font-size:12px; color:var(--text-muted);">Return to your active map to claim chests or descend deeper, or run a Sparring Fight.</div>

        </div>

        <div style="display:flex; gap:8px;">

          <button class="btn-gold" onclick="switchTab('explore')">${returnLabel}</button>

          <button class="btn-cyan" onclick="startSkirmishBattle()">⚔ New 5v5 Sparring Battle</button>

        </div>

      </div>

    `;

    return;

  }



  const activeUnit = getUnitByKey(state.battle.activeUnitKey);

  const unmooredExists = state.battle.foes.some(f => isUnmoored(f));



  const displayAlly = (activeUnit && activeUnit.key.startsWith('ally_'))

    ? activeUnit

    : state.battle.allies.find(a => a.hp > 0);

  if (!displayAlly) return;



  const hero = state.heroes.find(h => h.id === displayAlly.heroId);

  const folderTitles = ['1: PRIMARY', '2: SECONDARY', '3: ANCHOR GEAR', '4: CLAN & BADGES'];



  const foldersHtml = hero.folders.map((fArr, fIdx) => {

    const pips = getFolderPipsUsed(fArr);

    const itemsHtml = fArr.map((sid, sIdx) => {

      const sk = SKILLS[sid];

      if (!sk) return '';

      const code = `${fIdx + 1}${String.fromCharCode(65 + sIdx)}`;

      const isPassive = sk.type === 'passive';

      const cost = getEffectiveSkillAp(displayAlly, sk);

      const lockedHeat = sk.umbrella === 'Artifice' && sid !== 'pip_vent' && sid !== 'anc_dynamo_coil' && displayAlly.overheat >= 3;

      const canUse = !isPassive && displayAlly.ap >= cost && !lockedHeat && state.battle.mode === 'manual' && activeUnit?.key === displayAlly.key;

      const isSel = state.battle.selectedSkillId === sid && state.battle.mode === 'manual';



      return `

        <button id="gambit-slot-${code}"

                class="skill-btn ${isPassive ? 'passive' : ''} ${isSel ? 'selected-skill' : ''}"

                ${(!isPassive && !canUse && state.battle.mode === 'manual') ? 'disabled' : ''}

                title="${sk.desc}"

                onclick="${isPassive ? '' : `selectManualSkill('${sid}')`}">

          <span><b style="color:#fde047;">${code}</b> ${sk.name} <span style="color:#94a3c8;">[${sk.pips}■]</span></span>

          <span style="color:#93c5fd;">${isPassive ? 'PASSIVE' : `${cost}AP`}</span>

        </button>

      `;

    }).join('');



    return `

      <div class="folder-col">

        <div style="display:flex; justify-content:space-between; font-size:10.5px; color:var(--text-muted); font-weight:bold;">

          <span>${folderTitles[fIdx]}</span>

          <span>${pips}/4■</span>

        </div>

        ${itemsHtml || `<div style="font-size:10.5px; color:var(--text-dim); padding:4px;">Empty (Edit in Lab)</div>`}

      </div>

    `;

  }).join('');



  const statusPrompt = state.battle.mode === 'manual'

    ? (activeUnit?.key.startsWith('ally_')

        ? `▶ <b>${displayAlly.name}'s Turn</b> — Select a skill below, then click a highlighted Enemy/Ally card!`

        : `⏳ Enemy acting...`)

    : `⚡ <b>AUTO-GAMBIT (${state.battle.mode === 'auto4' ? '4x TURBO' : '1x'})</b> scanning ${displayAlly.name}'s 4×4 slots (1A → 4D)...`;



  deck.innerHTML = `

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">

      <div style="font-size:12px;">${statusPrompt}</div>

      ${(unmooredExists && state.badgePouch.length > 0 && state.battle.mode === 'manual' && activeUnit?.key.startsWith('ally_'))
        ? `<button class="btn-magenta" onclick="openQuickBadgeModal()">🏷 QUICK-BADGE UNMOORED FOE (${state.badgePouch.length} left)</button>`

        : ''}

    </div>

    <div class="folders-row">${foldersHtml}</div>

  `;

}
