import { state } from '../state.js';
import { ELEMENTS, EL_ICONS, CHAKRA_LIST, CHAKRA_MULT, CHAOS_KNOTS, SKILLS, ANCHOR_RELICS, STAGE_RULES, JUDGE_LAWS, SHINTO_SEALS, TOWN_BUILDINGS } from '../data/constants.js';

/* ============================================================================

   TAB 4: 6-ELEMENT MOSAIC ARRAY, BENCHWARMERS, VOID FRACKING & SLOTS

   ============================================================================ */

export function togglePinShard(shardId) {

  const shard = state.vaultShards.find(s => s.id === shardId);

  if (!shard) return;



  if (shard.pinned) {

    shard.pinned = false;

    addLog(`<span>🧩 Unpinned <b>${shard.name}</b> from the 6-Element Array.</span>`);

    renderMosaic();

    return;

  }



  const occupied = {};

  state.vaultShards.filter(s => s.pinned).forEach(s => {

    s.elements.forEach(el => { occupied[el] = s.name; });

  });



  for (const el of shard.elements) {

    if (occupied[el]) {

      addLog(`<span style="color:#fca5a5;">Socket Conflict: ${EL_ICONS[el]} <b>${el}</b> is already filled by [${occupied[el]}]! Unpin it first or Void Frack them together!</span>`);

      return;

    }

  }



  shard.pinned = true;

  addLog(`<span style="color:#6ee7b7;">🧩 Snapped <b>${shard.name}</b> (${shard.elements.join('+')}) into the Crystal Array!</span>`);

  renderMosaic();

  updateHeaderUI();

}



export function toggleBenchAssign(benchId) {

  const b = state.benchRoster.find(x => x.id === benchId);

  if (!b) return;

  if (b.assigned) {

    b.assigned = false;

  } else {

    if (state.benchRoster.filter(x => x.assigned).length >= 3) {

      addLog(`<span style="color:#fcd34d;">Max 3 Logistics Specialists can be stationed at once!</span>`);

      return;

    }

    b.assigned = true;

  }

  renderMosaic();

  updateHeaderUI();

}



export function glassifyArray() {

  const rates = calculatePassiveRates();

  if (!rates.isHarmonic) return;



  const pinned = state.vaultShards.filter(s => s.pinned);

  const sumBat = pinned.reduce((s, x) => s + x.batRate, 0) + 4;

  const sumOre = pinned.reduce((s, x) => s + x.oreRate, 0) + 3;

  const maxPrestige = Math.max(1, ...pinned.map(x => x.prestige || 0));



  state.vaultShards = state.vaultShards.filter(s => !s.pinned);

  const mosaic = {

    id: 'mos_' + Date.now(),

    name: `Glassified Prismatic Mosaic #${state.glassifiedMosaics.length + 1}`,

    elements: ['Fire', 'Water', 'Air'],

    prestige: maxPrestige,

    batRate: sumBat,

    oreRate: sumOre

  };

  state.glassifiedMosaics.push(mosaic);

  state.resources.tokens += 3;



  addLog(`<span style="color:#fde047; font-weight:bold;">🌈 GLASSIFIED 6/6 ARRAY! Created permanent <b>${mosaic.name} [★P${maxPrestige}]</b> (+${sumBat}⚡/m, +${sumOre}⛏/m forever), freed all 6 sockets, and earned +3🎰 Tokens!</span>`);

  updateHeaderUI();

  renderMosaic();

}



export function diveIntoMosaic(mosaicId) {

  const m = state.glassifiedMosaics.find(x => x.id === mosaicId);

  if (!m) return;

  generateNewSkyShard(m);

  switchTab('explore');

}



export function diveIntoVaultShard(shardId) {

  const sh = state.vaultShards.find(x => x.id === shardId);

  if (!sh) return;

  generateNewSkyShard(sh);

  switchTab('explore');

}



export function toggleFrackSelect(shardId) {

  const idx = state.frackSelection.indexOf(shardId);

  if (idx >= 0) {

    state.frackSelection.splice(idx, 1);

  } else {

    if (state.frackSelection.length >= 2) state.frackSelection.shift();

    state.frackSelection.push(shardId);

  }

  renderMosaic();

}



export function getPrestigeTitle(p) {

  if (p <= 0) return '';

  if (p === 1) return 'Tempered';

  if (p === 2) return 'Resonant';

  if (p === 3) return 'Mythic';

  return 'Astral';

}



export function initiateVoidFrack() {

  if (state.frackSelection.length !== 2) return;

  const s1 = state.vaultShards.find(s => s.id === state.frackSelection[0]);

  const s2 = state.vaultShards.find(s => s.id === state.frackSelection[1]);

  if (!s1 || !s2) return;



  const shared = s1.elements.filter(el => s2.elements.includes(el));

  const bothPrestiged = (s1.prestige || 0) >= 1 && (s2.prestige || 0) >= 1;

  if (shared.length === 0 && !bothPrestiged) {

    addLog(`<span style="color:#fca5a5;">Void Fracking requires 2 Vault Shards sharing at least 1 Element (or 2 already-Prestiged ★P1+ Shards)!</span>`);

    return;

  }



  const newPrestige = Math.max(s1.prestige || 0, s2.prestige || 0) + 1;

  const unionPool = [...new Set([...shared, ...s1.elements, ...s2.elements])];



  const minCount = Math.max(s1.elements.length, s2.elements.length);

  const evolveRoll = Math.random() < Math.min(0.90, 0.52 + newPrestige * 0.12);

  const maxCap = newPrestige >= 3 ? 6 : (newPrestige >= 2 ? 4 : 3);

  const targetCount = Math.min(maxCap, evolveRoll ? Math.max(minCount + 1, Math.min(maxCap, unionPool.length)) : minCount);



  const finalEls = unionPool.slice(0, targetCount);

  const missingEls = ELEMENTS.filter(e => !finalEls.includes(e));

  while (finalEls.length < targetCount && missingEls.length > 0) {

    const pick = missingEls.splice(Math.floor(Math.random() * missingEls.length), 1)[0];

    finalEls.push(pick);

  }



  state.vaultShards = state.vaultShards.filter(s => s.id !== s1.id && s.id !== s2.id);

  state.frackSelection = [];



  const tierWord = getPrestigeTitle(newPrestige);

  const sizeWord = finalEls.length >= 4 ? `Poly-${finalEls.length} Nexus` : (finalEls.length === 3 ? 'Triad' : (finalEls.length === 2 ? 'Pair' : 'Singularity'));

  const fusedBat = Math.round((Math.max(s1.batRate, s2.batRate) + 3 * newPrestige + finalEls.length * 2) * 1.15);

  const fusedOre = Math.round((Math.max(s1.oreRate, s2.oreRate) + 2 * newPrestige + finalEls.length * 2) * 1.15);



  const fusedShard = {

    id: 'prime_' + Date.now(),

    name: `★P${newPrestige} ${tierWord} ${finalEls[0]} ${sizeWord}`,

    elements: finalEls,

    batRate: fusedBat,

    oreRate: fusedOre,

    prestige: newPrestige,

    prime: true,

    pinned: false

  };

  state.vaultShards.push(fusedShard);



  const evolvedNote = finalEls.length > minCount ? ` &amp; <b>EVOLVED into a ${finalEls.length}-Element ${sizeWord}</b>` : '';

  addLog(`<span style="color:#f472b6; font-weight:bold;">💥 VOID PRESTIGE FRACK! Fused [${s1.name}] + [${s2.name}] → <b>${fusedShard.name}</b> (${finalEls.join('/')})${evolvedNote}! Click <b>▶ Dive</b> on it for +${newPrestige} Chests, Deeper Cellars &amp; Rarer Events!</span>`);

  openVoidDraftModal();

  renderMosaic();

  updateHeaderUI();

}



export function openVoidDraftModal() {

  const pkgChoices = ['pkg_heaven_beam', 'pkg_origami_bomb', 'pkg_iron_counter', 'pkg_frost_snap'];

  const pickSkill = SKILLS[pkgChoices[Math.floor(Math.random() * pkgChoices.length)]];

  const knotKeys = Object.keys(CHAOS_KNOTS);

  const pickKnot = CHAOS_KNOTS[knotKeys[Math.floor(Math.random() * knotKeys.length)]];



  openModal(`

    <div style="font-size:15px; font-weight:900; color:#f472b6; margin-bottom:6px;">🌌 VOID FALLOUT DRAFT (PICK 1 OF 3)</div>

    <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">

      Nothing in Jigsaw World is ever truly destroyed—pick one displaced treasure ejected from the collapsed Sky-Shards:

    </div>

    <div style="display:flex; flex-direction:column; gap:8px;">

      <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">

        <div>

          <div style="font-weight:bold; color:#67e8f9;">📦 Skill Package: ${pickSkill.name} (${pickSkill.umbrella})</div>

          <div style="font-size:11px; color:var(--text-muted);">${pickSkill.desc}</div>

        </div>

        <button class="btn-cyan" onclick="claimVoidDraft('skill', '${pickSkill.id}')">Draft Package</button>

      </div>

      <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">

        <div>

          <div style="font-weight:bold; color:#fbcfe8;">🔮 Chaos Knot: ${pickKnot.name} (Splices onto Lead Hero)</div>

          <div style="font-size:11px; color:var(--text-muted);">${pickKnot.desc}</div>

        </div>

        <button class="btn-magenta" onclick="claimVoidDraft('knot', '${pickKnot.id}')">Draft Knot</button>

      </div>

      <div class="bevel-inset" style="padding:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">

        <div>

          <div style="font-weight:bold; color:#fde047;">⛩ Seal &amp; Battery Cache</div>

          <div style="font-size:11px; color:var(--text-muted);">+2📜 Chakra Teacher Seals, +1👹 Oni Ofuda, +25⚡ Shard Batteries!</div>

        </div>

        <button class="btn-gold" onclick="claimVoidDraft('cache', '')">Draft Cache</button>

      </div>

    </div>

  `);

}



export function claimVoidDraft(kind, id) {

  if (kind === 'skill') {

    state.armory.push(id);

    addLog(`<span style="color:#67e8f9;">🌌 Drafted <b>${SKILLS[id].name}</b> into your Clan Skill Armory!</span>`);

  } else if (kind === 'knot') {

    const hero = state.heroes.find(h => h.id === state.selectedLabHeroId) || state.heroes[0];

    hero.knot = id;

    addLog(`<span style="color:#f472b6;">🌌 Drafted & spliced <b>${CHAOS_KNOTS[id].name}</b> onto ${hero.name}!</span>`);

  } else {

    state.resources.seals += 2;

    state.resources.batteries += 25;

    state.sealCounts.oni_ofuda = (state.sealCounts.oni_ofuda || 0) + 1;

    addLog(`<span style="color:#fde047;">🌌 Drafted Void Cache: +2📜 Seals, +1 Oni Ofuda & +25⚡ Batteries!</span>`);

  }

  closeModal();

  updateHeaderUI();

  if (state.activeTab === 'mosaic') renderMosaic();

}



export function spinDreamsmithSlots(payWithBatteries = false) {

  if (payWithBatteries) {

    if (state.resources.batteries < 12) {

      addLog(`<span style="color:#fca5a5;">Need 12⚡ Shard Batteries to spin!</span>`);

      return;

    }

    state.resources.batteries -= 12;

  } else {

    if (state.resources.tokens < 1) {

      addLog(`<span style="color:#fca5a5;">No 🎰 Dreamsmith Tokens left! Use 12⚡ Batteries or badge a Rival.</span>`);

      return;

    }

    state.resources.tokens -= 1;

  }



  const roll = Math.random();

  if (roll < 0.30) {

    const armoryPool = ['pkg_gale_slash', 'pkg_grapple_wire', 'pkg_origami_bomb', 'pkg_frost_snap', 'pkg_beast_fang', 'pkg_citizen_aegis', 'pkg_heaven_beam', 'pkg_silk_snare', 'pkg_boiler_overdrive'];

    const won = armoryPool[Math.floor(Math.random() * armoryPool.length)];

    state.armory.push(won);

    state.slotReels = ['📦', '📦', '✨'];

    addLog(`<span style="color:#67e8f9;">🎰 DREAMSMITH SLOTS: Won Skill Package <b>[${SKILLS[won].name}]</b>!</span>`);

  } else if (roll < 0.56) {

    const sealPick = SHINTO_SEALS[Math.floor(Math.random() * SHINTO_SEALS.length)];

    state.sealCounts[sealPick.id] = (state.sealCounts[sealPick.id] || 0) + 1;

    state.resources.badges += 2;

    state.slotReels = ['⛩', '🏷', '⛩'];

    addLog(`<span style="color:#fde047;">🎰 DREAMSMITH SLOTS: Won <b>${sealPick.name}</b> + 2🏷 Role Badges!</span>`);

  } else if (roll < 0.78) {

    state.resources.seals += 2;

    state.resources.gold += 35;

    state.slotReels = ['📜', '📜', '🪙'];

    addLog(`<span style="color:#6ee7b7;">🎰 DREAMSMITH SLOTS: Won <b>+2📜 Chakra Seals</b> & +35🪙 Gold!</span>`);

  } else if (roll < 0.93) {

    state.resources.ore += 14;

    state.resources.batteries += 16;

    state.slotReels = ['⛏', '⚡', '⛏'];

    addLog(`<span style="color:#fcd34d;">🎰 DREAMSMITH SLOTS: Won Forge Cache (+14⛏ Ore & +16⚡ Batteries)!</span>`);

  } else {

    const jackpotKey = createRandomKey(Math.random() < 0.35 ? 3 : 2);

    state.keys.push(jackpotKey);

    const randEl = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];

    state.vaultShards.push({

      id: 'slot_sh_' + Date.now(),

      name: `Dreamsmith ${randEl} Shard`,

      elements: [randEl],

      batRate: 7,

      oreRate: 5,

      prestige: 0,

      prime: false,

      pinned: false

    });

    state.slotReels = ['🗝️', '💎', '🗝️'];

    addLog(`<span style="color:#f472b6; font-weight:bold;">🎰 DREAMSMITH JACKPOT (7%)! Won Rare 🗝️ <b>${jackpotKey.name}</b> + <b>Dreamsmith ${randEl} Shard</b>!</span>`);

  }



  updateHeaderUI();

  renderMosaic();

}



export function renderMosaic() {

  const rates = calculatePassiveRates();

  const socketMap = {};

  state.vaultShards.filter(s => s.pinned).forEach(s => {

    s.elements.forEach(el => { socketMap[el] = s; });

  });



  const socketsHtml = ELEMENTS.map(el => {

    const sh = socketMap[el];

    return `

      <div class="socket-card ${sh ? 'filled' : ''}">

        <div style="display:flex; justify-content:space-between; align-items:center;">

          <span class="el-tag el-${el}">${EL_ICONS[el]} ${el}</span>

          <span style="font-size:10px; color:${sh ? '#6ee7b7' : '#64748b'};">${sh ? 'ACTIVE' : 'EMPTY'}</span>

        </div>

        <div style="font-size:11px; margin-top:6px; font-weight:bold; color:${sh ? '#fff' : 'var(--text-dim)'};">

          ${sh ? sh.name : 'Snap matching Vault Shard'}

        </div>

      </div>

    `;

  }).join('');



  const benchHtml = state.benchRoster.map(b => `

    <div class="bevel-inset" style="padding:5px 7px; display:flex; justify-content:space-between; align-items:center; gap:6px;">

      <div>

        <div style="font-weight:bold; font-size:11.5px;">${b.icon} ${b.name}</div>

        <div style="font-size:10.5px; color:var(--text-muted);">${b.role}</div>

      </div>

      <button class="${b.assigned ? 'btn-emerald' : ''}" style="padding:3px 8px; font-size:10.5px;" onclick="toggleBenchAssign('${b.id}')">

        ${b.assigned ? '✓ Stationed' : 'Assign'}

      </button>

    </div>

  `).join('');



  const wallHtml = state.glassifiedMosaics.map(m => `

    <div class="bevel-inset" style="padding:6px 8px; border-color:#fde047; display:flex; justify-content:space-between; align-items:center; gap:8px;">

      <div>

        <div style="font-weight:bold; color:#fde047;">🌈 ${m.name} <span style="color:#f472b6;">[★P${m.prestige || 1}]</span></div>

        <div style="font-size:10.5px; color:#6ee7b7;">Permanent Yield: +${m.batRate}⚡/min, +${m.oreRate}⛏/min · Dive Bonuses Active!</div>

      </div>

      <button class="btn-cyan" style="padding:4px 8px; font-size:11px;" onclick="diveIntoMosaic('${m.id}')">▶ Dive Run</button>

    </div>

  `).join('');



  document.getElementById('mosaic-left-panel').innerHTML = `

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">

      <span style="font-weight:bold; color:#fde047;">🧩 6-ELEMENT CRYSTAL ARRAY (${rates.activeSocketCount}/6)</span>

      <span style="font-size:11.5px; color:#6ee7b7; font-weight:bold;">Yield: +${rates.batPerMin}⚡/m · +${rates.orePerMin}⛏/m</span>

    </div>

    <div style="font-size:11px; color:var(--text-muted); margin-bottom:6px;">

      Fill all 6 Elemental Sockets (${rates.isHarmonic ? '<b style="color:#fde047;">6/6 HARMONIC +50% ACTIVE!</b>' : '6/6 unlocks +50% Harmonic Bonus & Glassifying'}):

    </div>

    <div class="socket-grid" style="margin-bottom:8px;">${socketsHtml}</div>

    <button class="btn-gold" style="width:100%; padding:8px; margin-bottom:10px;" ${!rates.isHarmonic ? 'disabled' : ''} onclick="glassifyArray()">

      🌈 GLASSIFY 6/6 ARRAY INTO PERMANENT MOSAIC TILE

    </button>



    <div style="font-weight:bold; color:#67e8f9; margin-bottom:4px;">👷 BENCHWARMER LOGISTICS OFFICERS (${state.benchRoster.filter(b => b.assigned).length}/3)</div>

    <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;">${benchHtml}</div>



    <div style="font-weight:bold; color:#fde047; margin-bottom:4px;">🏛 PERMANENT GLASSIFIED MOSAIC WALL (${state.glassifiedMosaics.length})</div>

    <div style="display:flex; flex-direction:column; gap:5px;">

      ${wallHtml || `<div style="font-size:11px; color:var(--text-muted);">Snap all 6 elements above (e.g., Cinder-Salt + Gale-Prism + Abyssal Tidepool!) and click Glassify!</div>`}

    </div>

  `;



  const vaultHtml = state.vaultShards.map(s => {

    const isFrackSel = state.frackSelection.includes(s.id);

    const elPills = s.elements.map(e => `<span class="el-tag el-${e}">${EL_ICONS[e]} ${e}</span>`).join(' ');

    const sizeTag = s.elements.length >= 4 ? `Poly-${s.elements.length}` : (s.elements.length === 3 ? 'Triad' : (s.elements.length === 2 ? 'Pair' : 'Single'));

    const pLvl = s.prestige || 0;

    const pBadge = pLvl > 0 ? `<span class="u-tag u-Chaos" style="margin-left:4px;">★P${pLvl}</span>` : '';

    return `

      <div class="bevel-inset" style="padding:6px 8px; ${s.pinned ? 'border-color:#34d399;' : ''} ${isFrackSel ? 'outline:2px solid #f472b6;' : ''}">

        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">

          <div>

            <div style="font-weight:bold; color:${s.prime ? '#fbcfe8' : '#fff'};">${s.name} <span style="font-size:10.5px; color:var(--text-muted);">[${sizeTag}]</span>${pBadge}</div>

            <div style="margin-top:3px; display:flex; gap:4px; align-items:center; flex-wrap:wrap;">

              ${elPills}

              <span style="font-size:10.5px; color:#94a3c8;">+${s.batRate}⚡/m +${s.oreRate}⛏/m</span>

              ${pLvl > 0 ? `<span style="font-size:10px; color:#fde047;">(Dive: +${pLvl} Chests/Depth/Events)</span>` : ''}

            </div>

          </div>

          <div style="display:flex; gap:4px; flex-wrap:wrap;">

            <button class="btn-gold" style="padding:3px 7px; font-size:10.5px;" onclick="diveIntoVaultShard('${s.id}')" title="Play an active Dive Run inside this Shard!">

              ▶ Dive

            </button>

            <button class="${s.pinned ? 'btn-emerald' : 'btn-cyan'}" style="padding:3px 8px; font-size:10.5px;" onclick="togglePinShard('${s.id}')">

              ${s.pinned ? '✓ Pinned' : 'Pin'}

            </button>

            <button class="${isFrackSel ? 'btn-magenta' : ''}" style="padding:3px 7px; font-size:10.5px;" onclick="toggleFrackSelect('${s.id}')" title="Select 2 shards sharing an Element (or 2 ★P1+ shards) to Prestige & Evolve!">

              💥Frack

            </button>

          </div>

        </div>

      </div>

    `;

  }).join('');



  document.getElementById('mosaic-right-panel').innerHTML = `

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">

      <span style="font-weight:bold; color:#fde047;">🗺 STABILIZED SKY-SHARD VAULT (${state.vaultShards.length})</span>

      <button class="btn-magenta" style="padding:4px 9px; font-size:11px;" ${state.frackSelection.length !== 2 ? 'disabled' : ''} onclick="initiateVoidFrack()">

        💥 PRESTIGE FRACK (${state.frackSelection.length}/2)

      </button>

    </div>

    <div style="font-size:11px; color:var(--text-muted); margin-bottom:6px;">

      Frack 2 shards sharing an Element (or any 2 <b>★P1+</b> shards) to <b>Prestige Level Up</b> &amp; potentially evolve Pairs → <b>Triads / Poly-Shards</b>! Click <b>▶ Dive</b> to run any Vault Shard with Prestige bonuses!

    </div>

    <div style="display:flex; flex-direction:column; gap:5px; margin-bottom:12px;">${vaultHtml}</div>



    <div class="bevel" style="padding:10px; background:#191530; border-color:#f59e0b;">

      <div style="text-align:center; font-weight:900; color:#fde047; font-size:13px;">🎰 DREAMSMITH UNION RECLAMATION SLOTS</div>

      <div style="text-align:center; font-size:11px; color:var(--text-muted); margin-top:2px;">

        Recycle surplus tokens &amp; batteries into Skill Packages, Shinto Seals, Role Badges, or Jackpot Shards!

      </div>

      <div class="slot-reels">

        <div class="reel">${state.slotReels[0]}</div>

        <div class="reel">${state.slotReels[1]}</div>

        <div class="reel">${state.slotReels[2]}</div>

      </div>

      <div style="display:flex; gap:8px; justify-content:center;">

        <button class="btn-gold" onclick="spinDreamsmithSlots(false)">🎰 Spin (1 Token)</button>

        <button class="btn-cyan" onclick="spinDreamsmithSlots(true)">⚡ Spin (12 Batteries)</button>

      </div>

    </div>

  `;

}
