import { state } from '../state.js';
import { ELEMENTS, EL_ICONS, CHAKRA_LIST, CHAKRA_MULT, CHAOS_KNOTS, SKILLS, ANCHOR_RELICS, STAGE_RULES, JUDGE_LAWS, SHINTO_SEALS, TOWN_BUILDINGS } from '../data/constants.js';

/* ============================================================================
   UTILITY, PRE-TYPED BADGE POUCH & SAVE HELPERS
   ============================================================================ */
export function addLog(html) {
  const box = document.getElementById('log-entries');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'log-line';
  div.innerHTML = html;
  box.prepend(div);
  while (box.children.length > 65) box.removeChild(box.lastChild);
}
export function clearLog() { document.getElementById('log-entries').innerHTML = ''; }
export function openModal(innerHtml) { document.getElementById('modal-box').innerHTML = innerHtml; document.getElementById('modal-backdrop').classList.add('open'); }
export function closeModal() { document.getElementById('modal-backdrop').classList.remove('open'); }

export function syncBadgeCount() {
  if (!Array.isArray(state.badgePouch)) state.badgePouch = ['rival', 'tutor', 'smuggler'];
  if (state.badgePouch.length > MAX_BADGE_POUCH) state.badgePouch = state.badgePouch.slice(0, MAX_BADGE_POUCH);
  state.resources.badges = state.badgePouch.length;
}

export function addRandomTypedBadge(forcedRole = null) {
  syncBadgeCount();
  if (state.badgePouch.length >= MAX_BADGE_POUCH) return null;
  const pick = forcedRole || ROLE_KEYS[Math.floor(Math.random() * ROLE_KEYS.length)];
  state.badgePouch.push(pick);
  syncBadgeCount();
  return ROLE_BADGE_TYPES[pick];
}

export function refillShardBadgePouch() {
  // Each fresh Sky-Shard guarantees at least 3 Pre-Typed Badges (capped at 5), ensuring good variety!
  state.badgePouch = state.badgePouch.slice(0, MAX_BADGE_POUCH);
  while (state.badgePouch.length < 3) {
    const missingMain = ['rival', 'tutor', 'smuggler', 'forgekin', 'trickster'].filter(r => !state.badgePouch.includes(r));
    const pool = missingMain.length > 0 ? missingMain : ROLE_KEYS;
    state.badgePouch.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  syncBadgeCount();
}

export function moveBadgeToFront(idx) {
  if (idx <= 0 || idx >= state.badgePouch.length) return;
  const [picked] = state.badgePouch.splice(idx, 1);
  state.badgePouch.unshift(picked);
  openBadgePouchModal();
}

export function openBadgePouchModal() {
  syncBadgeCount();
  const td = getCurrentShardTownData();
  const citizenCount = td?.citizens?.length || 0;
  const rows = state.badgePouch.map((rId, idx) => {
    const r = ROLE_BADGE_TYPES[rId] || ROLE_BADGE_TYPES.smuggler;
    return `
      <div class="bevel-inset" style="padding:7px 9px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <span style="font-weight:bold; color:${r.color};">${r.icon} ${r.name}</span>
          ${idx === 0 ? `<span class="u-tag u-Tethers" style="margin-left:5px;">NEXT AUTO-BADGE</span>` : ''}
          <div style="font-size:10.5px; color:var(--text-muted); margin-top:2px;">${r.desc}</div>
        </div>
        ${idx > 0 ? `<button class="btn-cyan" style="padding:3px 7px; font-size:10.5px;" onclick="moveBadgeToFront(${idx})" title="Use this badge first when Auto-Badge triggers!">Set 1st</button>` : ''}
      </div>`;
  }).join('');

  openModal(`
    <div style="font-size:15px; font-weight:900; color:#f472b6; margin-bottom:6px;">🏷 PRE-TYPED ROLE BADGE POUCH (${state.badgePouch.length}/${MAX_BADGE_POUCH})</div>
    <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">
      Each Sky-Shard issues 3 Pre-Typed Badges (cap ${MAX_BADGE_POUCH}). Stamping an <b>[UNMOORED] (&lt;=35% HP)</b> monster makes them smoke-bomb straight to this shard's <b>🏘️ Town Plaza</b> (${citizenCount}/5 Visitor Spots filled)!
    </div>
    <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
      ${rows || `<div class="bevel-inset" style="padding:10px; color:var(--text-muted); text-align:center;">Pouch empty for this shard! Find +1 at a Field Shrine, Town Bazaar, or generate a new Sky-Shard.</div>`}
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span style="font-size:11px; color:#fcd34d;">🗝️ Smuggler Key Shards: <b>${state.keyShards}/3</b> (3 auto-forges an Attuned Key!)</span>
      <button class="btn-gold" onclick="closeModal()">Close</button>
    </div>
  `);
}

export function switchTab(tabId) {
  state.activeTab = tabId;
  ['explore', 'battle', 'lab', 'mosaic'].forEach(t => {
    document.getElementById('view-' + t).classList.toggle('active', t === tabId);
    document.getElementById('tabbtn-' + t).classList.toggle('active', t === tabId);
  });
  if (tabId === 'explore') renderExplore();
  if (tabId === 'battle') {
    if (!state.battle.active && state.battle.foes.length === 0) startSkirmishBattle(true);
    renderBattle();
  }
  if (tabId === 'lab') renderLab();
  if (tabId === 'mosaic') renderMosaic();
}

export function getFatigueInfo() {
  const f = state.fatigue;
  if (f >= 60) return { tier:'Exhausted', color:'#f87171', statMult:0.70, apPenalty:1, suppressLead:true, suppressCore:true, desc:'-30% Stats, Lead/Solar/Sacral Chakras Suppressed, -1 Start AP' };
  if (f >= 40) return { tier:'Weary', color:'#fb923c', statMult:0.82, apPenalty:0, suppressLead:false, suppressCore:true, desc:'-18% Stats, Solar & Sacral Chakras Suppressed' };
  if (f >= 20) return { tier:'Winded', color:'#fde047', statMult:0.91, apPenalty:0, suppressLead:false, suppressCore:false, desc:'-9% Max HP, ATK & SPD' };
  return { tier:'Rested', color:'#6ee7b7', statMult:1.0, apPenalty:0, suppressLead:false, suppressCore:false, desc:'No penalties' };
}

export function getEffectiveChakraState(hero, chakraId) {
  const fInfo = getFatigueInfo();
  if (fInfo.suppressLead && hero.leadChakra === chakraId) return 'Blocked';
  if (fInfo.suppressCore && (chakraId === 'Solar' || chakraId === 'Sacral')) return 'Blocked';
  return hero.chakras[chakraId];
}

export function getHeroStats(hero) {
  const fInfo = getFatigueInfo();
  const lvlScale = 1 + (hero.level - 1) * 0.08;
  const overbloomPenalty = Object.values(hero.chakras).filter(s => s === 'Overbloomed').length * 0.08;
  const sheathThrottle = hero.folders[2]?.includes('anc_tempest_sheath') ? 0.94 : 1.0;
  return {
    maxHp: Math.max(45, Math.round(hero.baseHp * lvlScale * CHAKRA_MULT[getEffectiveChakraState(hero, 'Root')] * (1 - overbloomPenalty) * sheathThrottle * fInfo.statMult)),
    atk: Math.max(10, Math.round(hero.baseAtk * lvlScale * CHAKRA_MULT[getEffectiveChakraState(hero, 'Solar')] * fInfo.statMult)),
    spd: Math.max(8, Math.round(hero.baseSpd * CHAKRA_MULT[getEffectiveChakraState(hero, 'Sacral')] * fInfo.statMult)),
    healMult: CHAKRA_MULT[getEffectiveChakraState(hero, 'Heart')],
    vowMult: CHAKRA_MULT[getEffectiveChakraState(hero, 'Throat')],
    smartAi: getEffectiveChakraState(hero, 'ThirdEye') !== 'Blocked',
    crownMult: CHAKRA_MULT[getEffectiveChakraState(hero, 'Crown')]
  };
}

export function getSquadSynergyInfo(unitList = state.heroes) {
  const counts = {};
  unitList.forEach(u => { counts[u.umbrella] = (counts[u.umbrella] || 0) + 1; });
  const [topUmb, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ['Ki', 0];
  if (topCount >= 5) return { tier:5, umbrella:topUmb, label:`5/5 ${topUmb}: ${UMBRELLA_GESTALTS[topUmb].name}`, desc:UMBRELLA_GESTALTS[topUmb].short5 };
  if (topCount >= 3) return { tier:3, umbrella:topUmb, label:`${topCount}/5 ${topUmb} Resonance`, desc:UMBRELLA_GESTALTS[topUmb].short3 };
  if (Object.keys(counts).length >= 5) return { tier:1, umbrella:'Quintet', label:'5-Color Jigsaw Quintet', desc:'1 of each Umbrella: +15% Overdrive Charge & +15 Prismatic Overdrive Bonus!' };
  return { tier:0, umbrella:null, label:'Mixed Clan Formation', desc:'Draft 3+ or 5/5 of one Umbrella at Town Taverns (or run 1 of each) for Squad Gestalt bonuses!' };
}

/* ============================================================================
   LOCALSTORAGE AUTO-SAVE, EXPORT/IMPORT & CLEAN RESET
   ============================================================================ */
export const SAVE_STORAGE_KEY = 'jigsaw_world_v02e_save_v1';
let lastSaveTime = Date.now();
let resetConfirmArmed = false;

export function saveGameToStorage() {
  try {
    syncBadgeCount();
    const payload = {
      v: '0.2f', savedAt: Date.now(),
      resources: state.resources, badgePouch: state.badgePouch, keyShards: state.keyShards,
      fatigue: state.fatigue, wellRestedShield: state.wellRestedShield, blessing: state.blessing,
      keys: state.keys, lastCollectedTimestamp: state.lastCollectedTimestamp,
      sealCounts: state.sealCounts, selectedSeals: state.selectedSeals,
      armory: state.armory, anchorVault: state.anchorVault,
      heroes: state.heroes, selectedLabHeroId: state.selectedLabHeroId,
      map: state.map, overworldBackup: state.overworldBackup, subMap: state.subMap,
      vaultShards: state.vaultShards, glassifiedMosaics: state.glassifiedMosaics, benchRoster: state.benchRoster
    };
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    lastSaveTime = Date.now();
  } catch (err) {}
}

export function loadGameFromStorage() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.heroes) || !data.map || !Array.isArray(data.map.tiles)) return false;
    if (data.resources) Object.assign(state.resources, data.resources);
    state.badgePouch = Array.isArray(data.badgePouch) ? data.badgePouch : ['rival', 'tutor', 'smuggler'];
    state.keyShards = typeof data.keyShards === 'number' ? data.keyShards : 0;
    if (typeof data.fatigue === 'number') state.fatigue = data.fatigue;
    if (typeof data.wellRestedShield === 'number') state.wellRestedShield = data.wellRestedShield;
    state.blessing = data.blessing || null;
    if (Array.isArray(data.keys)) state.keys = data.keys;
    if (typeof data.lastCollectedTimestamp === 'number') state.lastCollectedTimestamp = data.lastCollectedTimestamp;
    if (data.sealCounts) Object.assign(state.sealCounts, data.sealCounts);
    if (Array.isArray(data.selectedSeals)) state.selectedSeals = data.selectedSeals;
    if (Array.isArray(data.armory)) state.armory = data.armory;
    if (Array.isArray(data.anchorVault)) state.anchorVault = data.anchorVault;
    state.heroes = data.heroes;
    state.selectedLabHeroId = data.selectedLabHeroId || state.heroes[0]?.id || 'kael';
    state.map = data.map;
    state.overworldBackup = data.overworldBackup || null;
    if (data.subMap) state.subMap = data.subMap;
    if (Array.isArray(data.vaultShards)) state.vaultShards = data.vaultShards;
    if (Array.isArray(data.glassifiedMosaics)) state.glassifiedMosaics = data.glassifiedMosaics;
    if (Array.isArray(data.benchRoster)) state.benchRoster = data.benchRoster;
    syncBadgeCount();
    // Ensure existing saved town has citizens array ready
    const td = getCurrentShardTownData();
    if (td && !Array.isArray(td.citizens)) td.citizens = [];
    return true;
  } catch (err) { return false; }
}

export function openSaveModal() {
  resetConfirmArmed = false;
  saveGameToStorage();
  const secAgo = Math.max(0, Math.round((Date.now() - lastSaveTime) / 1000));
  const encoded = btoa(unescape(encodeURIComponent(localStorage.getItem(SAVE_STORAGE_KEY) || '{}')));
  openModal(`
    <div style="font-size:15px; font-weight:900; color:#6ee7b7; margin-bottom:6px;">💾 CLAN CHRONICLE AUTO-SAVE (v0.2f)</div>
    <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Progress auto-saves continuously in browser storage (Last saved: <b>${secAgo}s ago</b>).</div>
    <div class="bevel-inset" style="padding:8px; margin-bottom:10px;">
      <div style="font-size:11px; font-weight:bold; color:#fde047; margin-bottom:4px;">📋 EXPORT / IMPORT SAVE CODE:</div>
      <textarea id="save-code-box" style="width:100%; height:64px; background:#080b14; color:#a5f3fc; border:1px solid #3c4d7d; padding:5px; font-family:inherit; font-size:10.5px;">${encoded}</textarea>
      <div style="display:flex; gap:6px; margin-top:6px;">
        <button class="btn-cyan" onclick="importSaveCode()">📥 Import Code Above</button>
        <button class="btn-emerald" onclick="saveGameToStorage(); addLog('<span style=\\'color:#6ee7b7;\\'>💾 Manual save complete!</span>'); closeModal();">💾 Save Now</button>
      </div>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
      <button id="btn-wipe-save" class="btn-crimson" onclick="armOrExecuteSaveWipe()">🗑️ Wipe Save &amp; Fresh Start</button>
      <button class="btn-gold" onclick="closeModal()">Close</button>
    </div>
  `);
}

export function importSaveCode() {
  const box = document.getElementById('save-code-box');
  if (!box || !box.value.trim()) return;
  try {
    const json = decodeURIComponent(escape(atob(box.value.trim())));
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.heroes)) throw new Error('Invalid');
    localStorage.setItem(SAVE_STORAGE_KEY, json);
    loadGameFromStorage();
    closeModal();
    renderExplore();
    updateHeaderUI();
    addLog(`<span style="color:#6ee7b7; font-weight:bold;">📥 Imported Save Chronicle successfully!</span>`);
  } catch (e) { addLog(`<span style="color:#fca5a5;">⚠ Invalid Save Code.</span>`); }
}

export function armOrExecuteSaveWipe() {
  const btn = document.getElementById('btn-wipe-save');
  if (!resetConfirmArmed) {
    resetConfirmArmed = true;
    if (btn) btn.textContent = '⚠ CLICK AGAIN TO CONFIRM FULL WIPE';
    return;
  }
  try { localStorage.removeItem(SAVE_STORAGE_KEY); } catch (e) {}
  window.location.reload();
}

export function getFolderPipsUsed(folderArr) { return folderArr.reduce((sum, sid) => sum + (SKILLS[sid] ? SKILLS[sid].pips : 0), 0); }
export function heroHasPassive(hero, skillId) { return hero.folders.some(f => f.includes(skillId)); }

/* ============================================================================
   KEYS, SMUGGLER KEY SHARDS & REAL-TIMESTAMP IDLE ENGINE
   ============================================================================ */
export function createRandomKey(forcedLevel = null, forcedElement = null) {
  const lvl = forcedLevel || (Math.random() < 0.20 ? 3 : (Math.random() < 0.55 ? 2 : 1));
  const elPool = ['Fire', 'Water', 'Air', 'Earth', 'Light', 'Dark', 'Chaos'];
  const el = forcedElement || elPool[Math.floor(Math.random() * elPool.length)];
  return { id:'key_' + Date.now() + '_' + Math.floor(Math.random() * 999), level:lvl, element:el, name:`Lv.${lvl} ${el}-Attuned Key` };
}

export function openKeyVaultModal() {
  const rows = state.keys.map(k => `
    <div class="bevel-inset" style="padding:7px 9px; display:flex; justify-content:space-between; align-items:center;">
      <div><span class="el-tag el-${k.element === 'Chaos' ? 'Dark' : k.element}">${EL_ICONS[k.element] || '🗝️'} Lv.${k.level}</span><b style="margin-left:6px;">${k.name}</b></div>
      <span style="font-size:11px; color:var(--text-muted);">${k.element === 'Chaos' ? 'Guarantees Chaos Knot / Relic!' : `${k.level}x Loot + ${k.element} Bias`}</span>
    </div>`).join('');
  openModal(`
    <div style="font-size:15px; font-weight:900; color:#fde047; margin-bottom:6px;">🗝️ ATTUNED KEYCHAIN (${state.keys.length} Keys · ${state.keyShards}/3 Key Shards)</div>
    <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
      Use Attuned Keys on <b>🔒 Locked Chests</b>. Collect <b>3 Key Shards</b> from Badged Town Smugglers to forge an Attuned Key!
    </div>
    <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
      ${rows || `<div class="bevel-inset" style="padding:10px; color:var(--text-muted); text-align:center;">No keys held! Win keys via Dreamsmith Slot Jackpots, Town Smuggler Key Shards, or Deep Arenas.</div>`}
    </div>
    <div style="display:flex; justify-content:flex-end;"><button class="btn-gold" onclick="closeModal()">Close</button></div>
  `);
}

export function calculatePassiveRates() {
  let goldPerMin = 12, batPerMin = 4, orePerMin = 2;
  const activeSockets = new Set();
  state.vaultShards.filter(s => s.pinned).forEach(s => {
    goldPerMin += s.elements.length * 6; batPerMin += s.batRate; orePerMin += s.oreRate;
    s.elements.forEach(el => activeSockets.add(el));
  });
  state.glassifiedMosaics.forEach(m => { goldPerMin += 24; batPerMin += m.batRate; orePerMin += m.oreRate; });
  const isHarmonic = activeSockets.size === 6;
  if (isHarmonic) { goldPerMin = Math.round(goldPerMin * 1.5); batPerMin = Math.round(batPerMin * 1.5); orePerMin = Math.round(orePerMin * 1.5); }
  let batMult = 1, oreMult = 1, xpBonus = 0, badgeBonus = 0;
  state.benchRoster.filter(b => b.assigned).forEach(b => { batMult += b.batMult; oreMult += b.oreMult; xpBonus += b.xpBonus; badgeBonus += b.badgeBonus; });
  return { goldPerMin, batPerMin:Math.round(batPerMin * batMult), orePerMin:Math.round(orePerMin * oreMult), xpBonus, badgeBonus, activeSocketCount:activeSockets.size, isHarmonic };
}

export function getPendingIdleLoot() {
  const elapsedSec = Math.max(0, (Date.now() - state.lastCollectedTimestamp) / 1000);
  const rates = calculatePassiveRates();
  return {
    elapsedSec: Math.floor(elapsedSec),
    goldGain: Math.floor((elapsedSec / 60) * rates.goldPerMin),
    batGain: Math.floor((elapsedSec / 60) * rates.batPerMin),
    oreGain: Math.floor((elapsedSec / 60) * rates.orePerMin),
    badgeGain: elapsedSec >= 45 && rates.badgeBonus > 0 && state.badgePouch.length < MAX_BADGE_POUCH ? 1 : 0,
    xpBonus: rates.xpBonus
  };
}

export function updateHeaderUI() {
  syncBadgeCount();
  document.getElementById('res-gold').textContent = state.resources.gold;
  document.getElementById('res-batteries').textContent = state.resources.batteries;
  document.getElementById('res-ore').textContent = state.resources.ore;
  document.getElementById('res-badges').textContent = state.badgePouch.length;
  document.getElementById('res-seals').textContent = state.resources.seals;
  document.getElementById('res-tokens').textContent = state.resources.tokens;
  document.getElementById('res-keys').textContent = state.keys.length + (state.keyShards > 0 ? ` (${state.keyShards}/3🧩)` : '');

  const fInfo = getFatigueInfo();
  const fValEl = document.getElementById('res-fatigue');
  const fTierEl = document.getElementById('res-fatigue-tier');
  const fPill = document.getElementById('fatigue-pill');
  if (fValEl && fTierEl && fPill) {
    fValEl.textContent = state.fatigue;
    fTierEl.textContent = fInfo.tier;
    fTierEl.style.color = fInfo.color;
    fPill.style.borderColor = state.fatigue >= 40 ? fInfo.color : '#354470';
  }
  const bPill = document.getElementById('blessing-pill');
  if (bPill) {
    if (state.blessing) {
      bPill.style.display = 'flex';
      bPill.innerHTML = `${state.blessing.icon} ${state.blessing.name}${state.blessing.id === 'swiftfoot' ? ` (${state.blessing.freeSteps})` : ''}`;
    } else bPill.style.display = 'none';
  }
  const pending = getPendingIdleLoot();
  document.getElementById('idle-preview').textContent = `+${pending.goldGain}🪙 +${pending.batGain}⚡ +${pending.oreGain}⛏ (${pending.elapsedSec}s)`;
}

export function collectIdleLoot() {
  const pending = getPendingIdleLoot();
  if (pending.batGain === 0 && pending.oreGain === 0 && pending.elapsedSec < 5) {
    addLog(`<span style="color:#94a3c8;">⏳ Clan Hearth is still gathering ambient shards (${pending.elapsedSec}s elapsed).</span>`);
    return;
  }
  const g = Math.max(3, pending.goldGain), b = Math.max(1, pending.batGain), o = Math.max(1, pending.oreGain);
  state.resources.gold += g; state.resources.batteries += b; state.resources.ore += o;
  let bNote = '';
  if (pending.badgeGain > 0) {
    const added = addRandomTypedBadge();
    if (added) bNote = `, +1 ${added.icon} ${added.name}`;
  }
  if (pending.xpBonus > 0 && pending.elapsedSec >= 15) grantSquadXp(pending.xpBonus);
  state.lastCollectedTimestamp = Date.now();
  addLog(`<span style="color:#fde047;">🔥 Collected Hearth Chest: +${g}🪙, +${b}⚡, +${o}⛏${bNote}!</span>`);
  updateHeaderUI();
  if (state.activeTab === 'lab') renderLab();
}

export function grantSquadXp(amount) {
  state.heroes.forEach(h => {
    h.xp += amount;
    while (h.xp >= 100) {
      h.xp -= 100; h.level += 1;
      addLog(`<span style="color:#6ee7b7;">⬆ ${h.name} reached Clan Resonance Lv.${h.level}!</span>`);
    }
  });
}

/* ============================================================================
   TOWN CITIZEN HELPERS & MONSTER-ADVENTURER ROLL-UP (v0.2f)
   ============================================================================ */
export const TOWN_VISITOR_SPOTS = [[2, 2], [7, 2], [2, 4], [7, 4], [4, 5]];

export function getCurrentShardTownData() {
  if (state.subMap.active && state.subMap.kind === 'town' && state.subMap.townData) return state.subMap.townData;
  const targetMap = (state.subMap.active && state.overworldBackup) ? state.overworldBackup : state.map;
  if (!targetMap || !Array.isArray(targetMap.tiles)) return null;
  for (const row of targetMap.tiles) {
    for (const t of row) {
      if (t.type === 'town' && t.townData) return t.townData;
    }
  }
  return null;
}

export function getSignatureMoveForMonster(foe) {
  if (foe.sprite === '🦅' || foe.element === 'Air') return 'mon_gale_fan';
  if (foe.sprite === '🐢') return 'mon_shell_fortress';
  if (foe.sprite === '🐸' || foe.element === 'Water') return 'mon_kappa_torrent';
  if (foe.sprite === '🕷️' || foe.sprite === '🦂') return 'pkg_silk_snare';
  if (foe.sprite === '🎎' || foe.element === 'Dark') return 'mon_umbral_strings';
  return 'mon_slag_crush';
}

export function rollMonsterAdventurerSheet(foe) {
  const sigSkillId = getSignatureMoveForMonster(foe);
  const sigSkill = SKILLS[sigSkillId] || SKILLS.mon_slag_crush;
  const umb = sigSkill.umbrella === 'Clan' ? 'Ki' : sigSkill.umbrella;
  const kit = UMBRELLA_KIT_TEMPLATES[umb] || UMBRELLA_KIT_TEMPLATES.Ki;
  const secondaryMove = kit.f1Pool[0].find(id => id !== sigSkillId) || 'pkg_gale_slash';
  const anchorPick = kit.f3Pool[Math.floor(Math.random() * kit.f3Pool.length)];
  const chakraIds = CHAKRA_LIST.map(c => c.id);
  const leadChakra = chakraIds[Math.floor(Math.random() * chakraIds.length)];
  const chakras = {};
  chakraIds.forEach(cid => { chakras[cid] = 'Open'; });
  chakras[leadChakra] = 'Bloomed';
  chakras[chakraIds[(chakraIds.indexOf(leadChakra) + 2) % 7]] = 'Bloomed';

  const knotKeys = Object.keys(CHAOS_KNOTS);
  const knot = (foe.maxHp >= 150 || Math.random() < 0.45) ? knotKeys[Math.floor(Math.random() * knotKeys.length)] : null;
  const avgLvl = Math.max(1, Math.round(state.heroes.reduce((s, h) => s + h.level, 0) / state.heroes.length));
  const cleanName = foe.name.replace(/\s+[A-E1-5]$/, '').toUpperCase();

  return {
    id: 'mon_adv_' + Date.now() + '_' + Math.floor(Math.random() * 999),
    name: cleanName,
    sprite: foe.sprite,
    umbrella: umb,
    element: foe.element || 'Fire',
    leadChakra,
    row: foe.ranged ? 'Back' : 'Front',
    level: avgLvl,
    xp: 0,
    ascended: true, // Monster-Rivals are Dual-Awakened!
    knot,
    isMonsterRecruit: true,
    sigSkillId,
    baseHp: Math.min(185, Math.max(120, Math.round(foe.maxHp * 0.95))),
    baseAtk: Math.min(33, Math.max(25, Math.round(foe.atk * 1.15))),
    baseSpd: Math.min(28, Math.max(17, foe.spd)),
    chakras,
    folders: [
      getFolderPipsUsed([sigSkillId, secondaryMove]) <= 4 ? [sigSkillId, secondaryMove] : [sigSkillId],
      [],
      [anchorPick],
      ['throw_badge', 'basic_strike', 'focus_spirit']
    ]
  };
}

export function buildCitizenRecord(foe, roleId) {
  const isElite = foe.maxHp >= 145 || state.battle.isBoss || state.battle.lootMult >= 1.5;
  const sigSkillId = getSignatureMoveForMonster(foe);
  const cleanName = foe.name.replace(/\s+[A-E1-5]$/, '');
  const matchingPkgs = Object.keys(SKILLS).filter(id => id.startsWith('pkg_') && SKILLS[id].element === foe.element);
  const allPkgs = Object.keys(SKILLS).filter(id => id.startsWith('pkg_'));
  const smugglerSkill = (matchingPkgs.length ? matchingPkgs : allPkgs)[Math.floor(Math.random() * (matchingPkgs.length || allPkgs.length))];

  return {
    id: 'cit_' + Date.now() + '_' + Math.floor(Math.random() * 999),
    name: cleanName,
    sprite: foe.sprite,
    element: foe.element || 'Fire',
    role: roleId,
    tier: isElite ? 2 : 1,
    sigSkillId,
    rivalSheet: roleId === 'rival' ? rollMonsterAdventurerSheet(foe) : null,
    smugglerSkill,
    smugglerSkillSold: false,
    shardSold: false,
    usedService: false
  };
}
