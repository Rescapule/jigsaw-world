import { state } from '../state.js';
import { ELEMENTS, EL_ICONS, CHAKRA_LIST, CHAOS_KNOTS, SKILLS, ANCHOR_RELICS } from '../data/constants.js';

export const BADGE_TYPES = {
  rival:     { id: 'rival',     icon: '⚔️', name: 'Rival Badge',     color: '#f472b6', desc: 'Rolls monster as a playable Rival! Beat them 1v1 in Town to recruit into your Squad!' },
  tutor:     { id: 'tutor',     icon: '🥋', name: 'Tutor Badge',     color: '#67e8f9', desc: 'Sends monster to Town Dojo! Beat their 1v1 Target Dummy trial to learn Monster Skills & Bloom Chakras!' },
  smuggler:  { id: 'smuggler',  icon: '💰', name: 'Smuggler Badge',  color: '#fde047', desc: 'Opens an Elemental Black Market in Town selling Key Shards (3 = 1 Key!) & Scrolls!' },
  forge_kin: { id: 'forge_kin', icon: '🔨', name: 'Forge-Kin Badge', color: '#fb923c', desc: 'Sets up a Plaza Tinker stall: Transmute 2 spare Armory skills into a 3-Pip Capstone or boost Shard Crystals!' },
  trickster: { id: 'trickster', icon: '🎲', name: 'Trickster Badge', color: '#a7f3d0', desc: 'Runs a Spirit-Dice wager in Town: Bet Fatigue or Gold for Seals, Tokens, or Chaos Keys!' }
};

export const MONSTER_SIGNATURE_SKILLS = {
  mon_slag_crush:  { id: 'mon_slag_crush',  name: 'Magma Belly Slam',   umbrella: 'Ki',       pips: 2, ap: 3, element: 'Fire',  type: 'active', target: 'foe_front_row', tags: ['Melee','Fire'],        desc: 'Monster Skill: Crushing Fire slam across Front Row (+1 Momentum).', power: 1.50 },
  mon_shell_fort:  { id: 'mon_shell_fort',  name: 'Adamant Shell Guard',umbrella: 'Mantles',  pips: 2, ap: 2, element: 'Earth', type: 'active', target: 'all_allies',    tags: ['Shield','Earth'],      desc: 'Monster Skill: Squad-wide +26 Earth Shield + VOW: Intercepts hurt allies!', shield: 26 },
  mon_tengu_fan:   { id: 'mon_tengu_fan',   name: 'Tengu Razor Gust',   umbrella: 'Patterns', pips: 2, ap: 3, element: 'Air',   type: 'active', target: 'back_foe',      tags: ['Spell','Air'],         desc: 'Monster Skill: Snipes Back Row with slicing wind + spawns +1 Residue!', power: 1.55 },
  mon_kappa_surge: { id: 'mon_kappa_surge', name: 'Mire Tidal Vortex',  umbrella: 'Patterns', pips: 2, ap: 3, element: 'Water', type: 'active', target: 'any_foe',       tags: ['Spell','Water','Heal'],desc: 'Monster Skill: Water blast + mends lowest-HP ally for 26 HP!', power: 1.35, heal: 26 },
  mon_shade_bind:  { id: 'mon_shade_bind',  name: 'Cursed Thread Snare',umbrella: 'Tethers',  pips: 2, ap: 2, element: 'Dark',  type: 'active', target: 'any_foe',       tags: ['Summon','Dark'],       desc: 'Monster Skill: Dark spirit bind + weaves +2 Paper Legion!', power: 1.30 },
  mon_prism_flare: { id: 'mon_prism_flare', name: 'Salt-Wisp Corona',   umbrella: 'Artifice', pips: 2, ap: 3, element: 'Light', type: 'active', target: 'all_foes',      tags: ['Blast','Light'],       desc: 'Monster Skill: Blinding Light AoE across all enemies (+1 Heat).', power: 1.30 }
};

export function registerMonsterSkills() {
  Object.assign(SKILLS, MONSTER_SIGNATURE_SKILLS);
  if (!Array.isArray(state.badgePouch)) {
    state.badgePouch = ['rival', 'tutor', 'smuggler'];
  }
  if (typeof state.keyShards !== 'number') {
    state.keyShards = 0;
  }
  state.resources.badges = state.badgePouch.length;
}

export function pickSignatureSkillForElement(el) {
  if (el === 'Fire') return 'mon_slag_crush';
  if (el === 'Earth') return 'mon_shell_fort';
  if (el === 'Air') return 'mon_tengu_fan';
  if (el === 'Water') return 'mon_kappa_surge';
  if (el === 'Dark') return 'mon_shade_bind';
  return 'mon_prism_flare';
}

export function rollRandomBadgeType() {
  const weighted = ['rival', 'rival', 'tutor', 'tutor', 'smuggler', 'forge_kin', 'trickster'];
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function refillShardBadgePouch() {
  registerMonsterSkills();
  while (state.badgePouch.length < 3) {
    state.badgePouch.push(rollRandomBadgeType());
  }
  state.badgePouch = state.badgePouch.slice(0, 5);
  state.resources.badges = state.badgePouch.length;
}

export function grantTypedBadge(count = 1, forcedType = null) {
  registerMonsterSkills();
  const added = [];
  for (let i = 0; i < count; i++) {
    if (state.badgePouch.length >= 5) break;
    const bt = forcedType || rollRandomBadgeType();
    state.badgePouch.push(bt);
    added.push(BADGE_TYPES[bt].icon + ' ' + BADGE_TYPES[bt].name);
  }
  state.resources.badges = state.badgePouch.length;
  return added;
}

export function openBadgePouchModal() {
  registerMonsterSkills();
  const rows = state.badgePouch.map((btId, i) => {
    const bt = BADGE_TYPES[btId] || BADGE_TYPES.rival;
    return `
      <div class="bevel-inset" style="padding:7px 9px; display:flex; justify-content:space-between; align-items:center;">
        <div><b style="color:${bt.color};">${bt.icon} #${i + 1}: ${bt.name}</b><div style="font-size:10.5px; color:var(--text-muted);">${bt.desc}</div></div>
      </div>`;
  }).join('');

  window.openModal(`
    <div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:6px;">🏷️ COVENANT PRE-TYPED BADGE POUCH (${state.badgePouch.length}/5)</div>
    <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">
      Each Sky-Shard refills your pouch up to <b>3 Pre-Typed Badges</b> (max cap <b>5</b>). Stamping an <b>[UNMOORED] (&le;35% HP)</b> enemy sends them straight to the local <b>🏘️ Town Plaza</b>!
      <div style="margin-top:4px; color:#67e8f9;">🗝️ Smuggler Key Shards: <b>${state.keyShards}/3</b> (3 Shards auto-forge an Attuned Key!)</div>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
      ${rows || `<div class="bevel-inset" style="padding:10px; text-align:center; color:var(--text-muted);">Pouch empty for this shard! Roll a new Sky-Shard or check Shrines/Bazaars.</div>`}
    </div>
    <div style="display:flex; justify-content:flex-end;"><button class="btn-gold" onclick="closeModal()">Close</button></div>
  `);
}

/* Roll a full playable Monster-Adventurer Sheet when stamped as a Rival! */
export function buildPlayableMonsterRival(foe) {
  const sigSkillId = pickSignatureSkillForElement(foe.element);
  const sigSkill = SKILLS[sigSkillId] || MONSTER_SIGNATURE_SKILLS.mon_slag_crush;
  const umb = sigSkill.umbrella;
  const anchorChoices = Object.keys(ANCHOR_RELICS).filter(k => ANCHOR_RELICS[k].umbrella === umb);
  const f3Relic = anchorChoices[0] || 'kael_limiter';

  const chakraIds = CHAKRA_LIST.map(c => c.id);
  const leadChakra = chakraIds[Math.floor(Math.random() * chakraIds.length)];
  const chakras = {};
  chakraIds.forEach(cid => { chakras[cid] = 'Open'; });
  chakras[leadChakra] = 'Bloomed';
  chakras[chakraIds[(chakraIds.indexOf(leadChakra) + 2) % 7]] = 'Bloomed';

  const knotKeys = Object.keys(CHAOS_KNOTS);
  const knot = Math.random() < 0.45 ? knotKeys[Math.floor(Math.random() * knotKeys.length)] : null;
  const avgLvl = Math.max(1, Math.round(state.heroes.reduce((s, h) => s + h.level, 0) / state.heroes.length));
  const cleanName = foe.name.replace(/\s+[A-E1-9]$/, '');

  return {
    id: 'mon_riv_' + Date.now() + '_' + Math.floor(Math.random() * 999),
    name: cleanName.toUpperCase(),
    sprite: foe.sprite,
    umbrella: umb,
    element: foe.element || 'Fire',
    leadChakra,
    row: foe.ranged ? 'Back' : 'Front',
    level: avgLvl,
    xp: 0,
    ascended: true, // Monster Rivals come Dual-Awakened!
    knot,
    baseHp: Math.min(180, Math.max(120, Math.round(foe.maxHp * 1.15))),
    baseAtk: Math.min(34, Math.max(25, Math.round(foe.atk * 1.22))),
    baseSpd: Math.min(28, Math.max(17, foe.spd)),
    chakras,
    folders: [
      [sigSkillId],
      [],
      [f3Relic],
      ['throw_badge', 'basic_strike', 'focus_spirit']
    ]
  };
}

/* Locate active Sky-Shard's TownData (works whether on Overworld or inside a Cellar/Dungeon!) */
function getCurrentShardTownData() {
  if (state.subMap.active && state.subMap.kind === 'town' && state.subMap.townData) {
    return state.subMap.townData;
  }
  const mapSource = state.overworldBackup || state.map;
  const townTile = mapSource.tiles?.flat().find(t => t.type === 'town');
  if (townTile) {
    if (!townTile.townData) townTile.townData = window.generateTownData(false);
    return townTile.townData;
  }
  return null;
}

/* Place Town Citizens onto the 9x7 Town Plaza Floor */
export function placeCitizensInTownGrid(tiles, townData) {
  if (!townData || !Array.isArray(townData.citizens)) return;
  const visitorSpots = [[2, 2], [7, 2], [2, 4], [7, 4], [4, 5]];
  townData.citizens.slice(0, 5).forEach((cit, idx) => {
    if (cit.resolved && cit.role === 'rival') return; // Recruited rivals are now in your party!
    const [vx, vy] = visitorSpots[idx];
    if (tiles[vy] && tiles[vy][vx]) {
      tiles[vy][vx].type = 'town_citizen';
      tiles[vy][vx].citizenId = cit.id;
      tiles[vy][vx].citizenSprite = cit.sprite;
      tiles[vy][vx].citizenRole = cit.role;
      tiles[vy][vx].citizenName = cit.name;
    }
  });
}

/* Called in Battle when Throw Role Badge hits an [UNMOORED] Foe */
export function openPreTypedBadgeModal(foe) {
  registerMonsterSkills();
  if (state.badgePouch.length === 0) {
    window.addLog(`<span style="color:#fca5a5;">No Pre-Typed Role Badges left in your Shard Pouch!</span>`);
    return;
  }
  const cards = state.badgePouch.map((btId, idx) => {
    const bt = BADGE_TYPES[btId] || BADGE_TYPES.rival;
    return `
      <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <div style="font-weight:bold; color:${bt.color};">${bt.icon} ${bt.name}</div>
          <div style="font-size:11px; color:var(--text-muted);">${bt.desc}</div>
        </div>
        <button class="btn-gold" onclick="stampMonsterToTown('${foe.key}', ${idx}, false)">Stamp &amp; Send to Town</button>
      </div>`;
  }).join('');

  window.openModal(`
    <div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:6px;">🏷️ STAMP PRE-TYPED BADGE: ${foe.sprite} ${foe.name}</div>
    <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
      Choose a badge from your pouch (${state.badgePouch.length}/5 left)—<b>${foe.name}</b> will smoke-bomb out of combat and wait for you at the <b>🏘️ Town Plaza</b>!
    </div>
    <div style="display:flex; flex-direction:column; gap:7px;">${cards}</div>
  `);
}

export function stampMonsterToTown(foeKey, pouchIdx = 0, fromAuto = false) {
  registerMonsterSkills();
  const foe = window.getUnitByKey(foeKey);
  if (!foe || state.badgePouch.length === 0) {
    if (!fromAuto) window.closeModal();
    return;
  }
  const roleId = state.badgePouch.splice(pouchIdx, 1)[0];
  state.resources.badges = state.badgePouch.length;
  const bt = BADGE_TYPES[roleId] || BADGE_TYPES.rival;

  foe.captured = true;
  foe.hp = 0;

  const cleanName = foe.name.replace(/\s+[A-E1-9]$/, '');
  const citizen = {
    id: 'cit_' + Date.now() + '_' + Math.floor(Math.random() * 999),
    name: cleanName,
    sprite: foe.sprite,
    element: foe.element || 'Fire',
    role: roleId,
    sigSkillId: pickSignatureSkillForElement(foe.element),
    rivalSheet: roleId === 'rival' ? buildPlayableMonsterRival(foe) : null,
    duelWon: false,
    resolved: false,
    stockSold: false
  };

  const tData = getCurrentShardTownData();
  if (tData) {
    if (!Array.isArray(tData.citizens)) tData.citizens = [];
    if (tData.citizens.length < 5) {
      tData.citizens.push(citizen);
    }
  }

  window.addLog(`<span style="color:${bt.color}; font-weight:bold;">💨 ${bt.icon} Badged <b>${foe.sprite} ${cleanName}</b> with <b>[${bt.name}]</b>! They smoke-bombed straight to the 🏘️ Town Plaza! (${state.badgePouch.length} badges left)</span>`);
  if (!fromAuto) {
    window.closeModal();
    window.updateHeaderUI();
    window.renderBattle();
    if (!window.checkBattleEnd()) setTimeout(window.advanceTurn, 220);
  }
}

/* Town Plaza Interaction Modal when stepping onto a Badged Citizen */
export function openTownCitizenModal(citizenId) {
  registerMonsterSkills();
  const td = state.subMap.townData;
  const cit = td?.citizens?.find(c => c.id === citizenId);
  if (!cit) return;
  const bt = BADGE_TYPES[cit.role] || BADGE_TYPES.rival;
  const heroOptions = state.heroes.map((h, i) => `<option value="${i}">${h.sprite} ${h.name} (Lv.${h.level} ${h.umbrella} · ${h.element})</option>`).join('');

  if (cit.role === 'rival') {
    const rv = cit.rivalSheet;
    const st = window.getHeroStats(rv);
    const sigSk = SKILLS[cit.sigSkillId];
    if (cit.duelWon && !cit.resolved) {
      const swapOpts = state.heroes.map((h, idx) => `<option value="${idx}">Swap into Squad w/ ${h.sprite} ${h.name}</option>`).join('');
      window.openModal(`
        <div style="font-size:15px; font-weight:900; color:#6ee7b7; margin-bottom:6px;">🏆 RIVAL DEFEATED: RECRUIT ${rv.sprite} ${rv.name}!</div>
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
          <i>"Hah! Fair fight! My blade and shard are yours, Boss!"</i> — Recruit Dual-Awakened <b>${rv.name}</b> (${rv.umbrella}/${rv.element}, Signature: <b>${sigSk.name}</b>):
        </div>
        <div class="bevel-inset" style="padding:8px; margin-bottom:10px;">
          <div><b>${rv.sprite} ${rv.name}</b> · HP <b>${st.maxHp}</b> · ATK <b>${st.atk}</b> · SPD <b>${st.spd}</b> · 🌟Dual-Awakened</div>
          ${rv.knot ? `<div style="font-size:11px; color:#f472b6; margin-top:3px;">🔮 Knot: <b>${CHAOS_KNOTS[rv.knot].name}</b></div>` : ''}
          <div style="display:flex; gap:6px; margin-top:8px;">
            <select id="rival-swap-sel" style="flex:1; padding:4px; background:#0d1224; color:#fff; border:1px solid #4a5a8a; font-family:inherit;">${swapOpts}</select>
            <button class="btn-gold" onclick="recruitDefeatedRival('${cit.id}', true)">⚔️ Join 5v5 Squad</button>
            <button class="btn-cyan" onclick="recruitDefeatedRival('${cit.id}', false)">👷 Bench</button>
          </div>
        </div>
      `);
      return;
    }

    window.openModal(`
      <div style="font-size:15px; font-weight:900; color:#f472b6; margin-bottom:6px;">⚔️ RIVAL CHALLENGE: ${rv.sprite} ${rv.name} (${rv.umbrella}/${rv.element})</div>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
        <i>"Been waiting for you! Beat me <b>1-on-1</b> under Duelist Law and I'll join your active Squad!"</i>
      </div>
      <div class="bevel-inset" style="padding:8px; margin-bottom:10px; font-size:11.5px;">
        <div><b>Playable Monster Stats:</b> HP ${st.maxHp} · ATK ${st.atk} · SPD ${st.spd} · 🌟Dual-Awakened</div>
        <div style="color:#fde68a; margin-top:3px;">🔥 Signature Move: <b>${sigSk.name}</b> — ${sigSk.desc}</div>
        ${rv.knot ? `<div style="color:#f472b6; margin-top:2px;">🔮 Chaos Knot: <b>${CHAOS_KNOTS[rv.knot].name}</b></div>` : ''}
      </div>
      <div style="margin-bottom:10px;">
        <div style="font-size:11px; color:#fde047; font-weight:bold; margin-bottom:4px;">CHOOSE YOUR 1v1 CHAMPION:</div>
        <select id="duel-hero-sel" style="width:100%; padding:5px; background:#0d1224; color:#fff; border:1px solid #4a5a8a; font-family:inherit;">${heroOptions}</select>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <button class="btn-magenta" onclick="launchCitizen1v1Trial('${cit.id}', 'rival')">⚔️ Start 1v1 Recruitment Duel!</button>
        <button onclick="closeModal()">Not Yet</button>
      </div>
    `);
  } else if (cit.role === 'tutor') {
    const sigSk = SKILLS[cit.sigSkillId];
    window.openModal(`
      <div style="font-size:15px; font-weight:900; color:#67e8f9; margin-bottom:6px;">🥋 DOJO TUTOR: Master ${cit.sprite} ${cit.name}</div>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
        ${cit.resolved
          ? `Master ${cit.name} bows deeply—you have already mastered their Target Trial!`
          : `<i>"Shatter my <b>🎯 Wooden Target Dummies</b> and best me in a 1v1 trial! Do so, and your chosen student learns <b>[${sigSk.name}]</b> &amp; Blooms a Chakra!"</i>`}
      </div>
      ${!cit.resolved ? `
        <div class="bevel-inset" style="padding:8px; margin-bottom:10px; font-size:11px;">
          <b style="color:#fde047;">Reward Technique:</b> ${sigSk.name} (${sigSk.umbrella} · ${sigSk.pips}■) — ${sigSk.desc}
        </div>
        <select id="duel-hero-sel" style="width:100%; padding:5px; margin-bottom:10px; background:#0d1224; color:#fff; border:1px solid #4a5a8a; font-family:inherit;">${heroOptions}</select>
        <div style="display:flex; justify-content:space-between;">
          <button class="btn-cyan" onclick="launchCitizen1v1Trial('${cit.id}', 'tutor')">🎯 Enter 1v1 Target Dummy Trial!</button>
          <button onclick="closeModal()">Close</button>
        </div>` : `<div style="display:flex; justify-content:flex-end;"><button class="btn-gold" onclick="closeModal()">Close</button></div>`}
    `);
  } else if (cit.role === 'smuggler') {
    const sigSk = SKILLS[cit.sigSkillId];
    window.openModal(`
      <div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:6px;">💰 BLACK MARKET STALL: ${cit.sprite} ${cit.name} (${cit.element})</div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:10px;">
        🗝️ Key Shards Held: <b style="color:#67e8f9;">${state.keyShards}/3</b> · Clan Gold: <b>${state.resources.gold}🪙</b>
      </div>
      <div style="display:flex; flex-direction:column; gap:7px; margin-bottom:12px;">
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><b>🗝️ Smuggled ${cit.element} Key Shard</b><div style="font-size:10.5px; color:var(--text-muted);">Collect 3 Key Shards to forge a Lv.2 ${cit.element}-Attuned Key!</div></div>
          <button class="btn-gold" ${cit.stockSold ? 'disabled' : ''} onclick="useCitizenService('${cit.id}', 'key_shard')">${cit.stockSold ? 'Bought' : 'Buy (28🪙)'}</button>
        </div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><b>📦 Monster Scroll: ${sigSk.name}</b><div style="font-size:10.5px; color:var(--text-muted);">${sigSk.desc}</div></div>
          <button class="btn-cyan" ${cit.resolved ? 'disabled' : ''} onclick="useCitizenService('${cit.id}', 'scroll')">${cit.resolved ? 'Sold' : 'Buy (34🪙)'}</button>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Close</button></div>
    `);
  } else if (cit.role === 'forge_kin') {
    window.openModal(`
      <div style="font-size:15px; font-weight:900; color:#fb923c; margin-bottom:6px;">🔨 PLAZA FORGE-KIN: ${cit.sprite} ${cit.name}</div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:10px;">Armory Packages Available: <b>${state.armory.length}</b></div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><b>🔥 Transmute 2 Spare Armory Packages</b><div style="font-size:10.5px; color:var(--text-muted);">Reforges 2 unequipped Armory packages into a 3-Pip Capstone + +12⚡!</div></div>
          <button class="btn-gold" ${state.armory.length < 2 ? 'disabled' : ''} onclick="useCitizenService('${cit.id}', 'transmute')">Transmute (2 Pkgs)</button>
        </div>
        <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><b>💎 Overcharge Local Sky-Shard Leylines</b><div style="font-size:10.5px; color:var(--text-muted);">Costs 10⛏ Ore: Grants +22⚡ Batteries &amp; clears -20🥾 Fatigue!</div></div>
          <button class="btn-emerald" ${cit.resolved ? 'disabled' : ''} onclick="useCitizenService('${cit.id}', 'leyline')">${cit.resolved ? 'Done' : 'Tune (10⛏)'}</button>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end;"><button onclick="closeModal()">Close</button></div>
    `);
  } else {
    window.openModal(`
      <div style="font-size:15px; font-weight:900; color:#a7f3d0; margin-bottom:6px;">🎲 ALLEYWAY TRICKSTER: ${cit.sprite} ${cit.name}</div>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
        <i>"Care to roll Spirit Dice, friend? Bet <b>+18🥾 Fatigue</b> on a 55% win chance for rare prizes!"</i>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <button class="btn-magenta" ${cit.resolved ? 'disabled' : ''} onclick="useCitizenService('${cit.id}', 'gamble')">${cit.resolved ? 'Table Closed' : '🎲 Roll Dice (+18🥾 Fatigue)'}</button>
        <button onclick="closeModal()">Leave</button>
      </div>
    `);
  }
}

export function launchCitizen1v1Trial(citizenId, mode) {
  const td = state.subMap.townData;
  const cit = td?.citizens?.find(c => c.id === citizenId);
  if (!cit) return;
  const sel = document.getElementById('duel-hero-sel');
  const heroIdx = sel ? parseInt(sel.value, 10) : 0;
  const hero = state.heroes[heroIdx] || state.heroes[0];
  window.closeModal();

  const avgLvl = hero.level;
  const scale = 1 + (avgLvl - 1) * 0.1;

  let foes = [];
  let title = '';
  if (mode === 'rival') {
    const rv = cit.rivalSheet;
    const st = window.getHeroStats(rv);
    title = `⚔️ 1v1 RIVAL DUEL: ${hero.name} vs. ${rv.name}`;
    foes = [{
      key: 'foe_0', name: rv.name, sprite: rv.sprite, row: 'Front',
      maxHp: Math.round(st.maxHp * 1.15), hp: Math.round(st.maxHp * 1.15),
      atk: Math.round(st.atk * 0.92), spd: st.spd, element: rv.element,
      ranged: true, shield: 18, armorBreak: false, captured: false
    }];
  } else {
    title = `🎯 1v1 TUTOR TRIAL: ${hero.name} vs. Master ${cit.name}`;
    foes = [
      { key: 'foe_0', name: 'Target Dummy (Front)', sprite: '🎯', row: 'Front', maxHp: Math.round(75 * scale), hp: Math.round(75 * scale), atk: 4, spd: 8, element: 'Earth', ranged: false, shield: 0, armorBreak: false, captured: false },
      { key: 'foe_1', name: `Master ${cit.name}`, sprite: cit.sprite, row: 'Back', maxHp: Math.round(115 * scale), hp: Math.round(115 * scale), atk: Math.round(18 * scale), spd: 19, element: cit.element, ranged: true, shield: 12, armorBreak: false, captured: false },
      { key: 'foe_2', name: 'Target Dummy (Back)', sprite: '🎯', row: 'Back', maxHp: Math.round(65 * scale), hp: Math.round(65 * scale), atk: 4, spd: 8, element: 'Air', ranged: true, shield: 0, armorBreak: false, captured: false }
    ];
  }

  // Launch standard battle engine, then trim allies down to the single chosen Hero!
  window.initBattleState(title, foes, null, true, 1.5, 'clear_sky', false, mode === 'rival' ? 'honorable_duel' : null, false);
  state.battle.allies = state.battle.allies.filter(a => a.heroId === hero.id);
  state.battle.allies[0].row = 'Front';
  state.battle.allies[0].ap = Math.min(10, state.battle.allies[0].ap + 2);
  state.battle.citizenTrial = { citizenId: cit.id, mode, heroId: hero.id };
  window.buildRoundQueue();
  state.battle.activeUnitKey = null;
  window.switchTab('battle');
  window.advanceTurn();
}

export function handleCitizenTrialEnd(playerWon) {
  const trial = state.battle.citizenTrial;
  if (!trial) return false;
  state.battle.citizenTrial = null;

  const td = getCurrentShardTownData();
  const cit = td?.citizens?.find(c => c.id === trial.citizenId);
  const hero = state.heroes.find(h => h.id === trial.heroId) || state.heroes[0];
  if (!cit) return false;

  if (playerWon) {
    if (trial.mode === 'rival') {
      cit.duelWon = true;
      window.addLog(`<span style="color:#fde047; font-weight:bold;">🏆 1v1 DUEL WON! Return to Town and talk to <b>${cit.sprite} ${cit.name}</b> to recruit them into your Squad!</span>`);
    } else {
      cit.resolved = true;
      state.armory.push(cit.sigSkillId);
      const cKey = Object.keys(hero.chakras).find(k => hero.chakras[k] === 'Blocked')
                || Object.keys(hero.chakras).find(k => hero.chakras[k] === 'Open');
      if (cKey) hero.chakras[cKey] = hero.chakras[cKey] === 'Blocked' ? 'Open' : 'Bloomed';
      window.addLog(`<span style="color:#67e8f9; font-weight:bold;">🥋 TUTOR TRIAL PASSED! Learned Monster Skill <b>[${SKILLS[cit.sigSkillId].name}]</b>${cKey ? ` &amp; advanced ${hero.name}'s ${cKey} Chakra` : ''}!</span>`);
    }
  } else {
    state.resources.tokens += 1;
    window.addLog(`<span style="color:#fbcfe8;">💫 Bested in 1v1 Sparring! By Covenant Law, ${cit.name} tosses you +1🎰 Token—tweak your 4×4 loadout and rematch anytime in Town!</span>`);
  }
  return true;
}

export function recruitDefeatedRival(citizenId, intoSquad = true) {
  const td = state.subMap.townData;
  const cit = td?.citizens?.find(c => c.id === citizenId);
  if (!cit || !cit.rivalSheet) return;
  const rv = cit.rivalSheet;
  cit.resolved = true;

  if (intoSquad) {
    const sel = document.getElementById('rival-swap-sel');
    const swapIdx = sel ? parseInt(sel.value, 10) : 0;
    const outgoing = state.heroes[swapIdx];
    if (outgoing) {
      state.benchRoster.push({
        id: 'b_out_' + Date.now(),
        name: `${outgoing.name} (Benched ${outgoing.umbrella})`,
        icon: outgoing.sprite,
        role: '+25% ⚡ & +25% ⛏ Mosaic Yield',
        batMult: 0.25, oreMult: 0.25, xpBonus: 10, badgeBonus: 0,
        assigned: state.benchRoster.filter(b => b.assigned).length < 3
      });
      state.heroes[swapIdx] = rv;
      state.selectedLabHeroId = rv.id;
      window.addLog(`<span style="color:#6ee7b7; font-weight:bold;">⚔️ MONSTER RIVAL RECRUITED! <b>${rv.sprite} ${rv.name}</b> joined your active 5-Hero Squad!</span>`);
    }
  } else {
    state.benchRoster.push({
      id: 'b_riv_' + Date.now(),
      name: `${rv.name} (Rival Enforcer)`,
      icon: rv.sprite,
      role: '+35% ⚡ & +35% ⛏ Mosaic Yield',
      batMult: 0.35, oreMult: 0.35, xpBonus: 12, badgeBonus: 0,
      assigned: state.benchRoster.filter(b => b.assigned).length < 3
    });
    window.addLog(`<span style="color:#67e8f9;">👷 Recruited Rival <b>${rv.sprite} ${rv.name}</b> onto your Mosaic Logistics Bench!</span>`);
  }

  // Clear tile in Town Plaza
  state.map.tiles.flat().forEach(t => {
    if (t.citizenId === cit.id) t.type = 'floor';
  });
  window.closeModal();
  window.renderExplore();
  window.updateHeaderUI();
}

export function useCitizenService(citizenId, action) {
  const td = state.subMap.townData;
  const cit = td?.citizens?.find(c => c.id === citizenId);
  if (!cit) return;

  if (action === 'key_shard') {
    if (state.resources.gold < 28) { window.addLog(`<span style="color:#fca5a5;">Need 28🪙 Gold!</span>`); return; }
    state.resources.gold -= 28;
    cit.stockSold = true;
    state.keyShards = (state.keyShards || 0) + 1;
    if (state.keyShards >= 3) {
      state.keyShards -= 3;
      const forged = window.createRandomKey(2, cit.element);
      state.keys.push(forged);
      window.addLog(`<span style="color:#fde047; font-weight:bold;">🗝️ 3/3 KEY SHARDS ASSEMBLED! Forged <b>${forged.name}</b>!</span>`);
    } else {
      window.addLog(`<span style="color:#fde047;">💰 Bought Smuggled Key Shard (<b>${state.keyShards}/3</b> toward a Lv.2 ${cit.element} Key)!</span>`);
    }
    window.openTownCitizenModal(citizenId);
  } else if (action === 'scroll') {
    if (state.resources.gold < 34) { window.addLog(`<span style="color:#fca5a5;">Need 34🪙 Gold!</span>`); return; }
    state.resources.gold -= 34;
    cit.resolved = true;
    state.armory.push(cit.sigSkillId);
    window.addLog(`<span style="color:#67e8f9; font-weight:bold;">📦 Bought Monster Technique <b>[${SKILLS[cit.sigSkillId].name}]</b>!</span>`);
    window.openTownCitizenModal(citizenId);
  } else if (action === 'transmute') {
    if (state.armory.length < 2) return;
    state.armory.splice(0, 2);
    const capstones = ['pkg_heaven_beam', 'pkg_boiler_overdrive', 'lyra_pillar'];
    const won = capstones[Math.floor(Math.random() * capstones.length)];
    state.armory.push(won);
    state.resources.batteries += 12;
    window.addLog(`<span style="color:#fb923c; font-weight:bold;">🔨 Forge-Kin transmuted 2 spare packages into <b>[${SKILLS[won].name}]</b> + 12⚡!</span>`);
    window.openTownCitizenModal(citizenId);
  } else if (action === 'leyline') {
    if (state.resources.ore < 10) { window.addLog(`<span style="color:#fca5a5;">Need 10⛏ Forge Ore!</span>`); return; }
    state.resources.ore -= 10;
    cit.resolved = true;
    state.resources.batteries += 22;
    state.fatigue = Math.max(0, state.fatigue - 20);
    window.addLog(`<span style="color:#6ee7b7;">💎 Forge-Kin tuned local leylines: +22⚡ Batteries &amp; -20🥾 Fatigue!</span>`);
    window.closeModal();
  } else if (action === 'gamble') {
    cit.resolved = true;
    state.fatigue = Math.min(100, state.fatigue + 18);
    if (Math.random() < 0.55) {
      const k = window.createRandomKey(2, 'Chaos');
      state.keys.push(k);
      state.resources.tokens += 2;
      window.addLog(`<span style="color:#fde047; font-weight:bold;">🎲 SPIRIT DICE WIN! Won 🗝️ <b>${k.name}</b> + 2🎰 Tokens (+18🥾 Fatigue)!</span>`);
    } else {
      state.resources.seals += 1;
      window.addLog(`<span style="color:#fbcfe8;">🎲 Snake Eyes! Trickster laughs and leaves you +1📜 Teacher Seal (+18🥾 Fatigue).</span>`);
    }
    window.closeModal();
  }
  window.updateHeaderUI();
}