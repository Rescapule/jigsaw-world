import { state } from '../state.js';
import { ELEMENTS, EL_ICONS, CHAKRA_LIST, CHAKRA_MULT, CHAOS_KNOTS, SKILLS, ANCHOR_RELICS, STAGE_RULES, JUDGE_LAWS, SHINTO_SEALS, TOWN_BUILDINGS } from '../data/constants.js';

/* ============================================================================

   TAB 3: SQUAD & 4x4 LOADOUT LAB (CHAKRAS, ASCENSION, ELEMENT & PRIORITY)

   ============================================================================ */

export function selectLabHero(heroId) {

  state.selectedLabHeroId = heroId;

  renderLab();

}



export function toggleHeroRow(heroId) {

  const h = state.heroes.find(x => x.id === heroId);

  if (!h) return;

  h.row = h.row === 'Front' ? 'Back' : 'Front';

  addLog(`<span>↔ Moved <b>${h.name}</b> to the <b>${h.row} Row</b>.</span>`);

  renderLab();

}



export function reattuneHeroElement(heroId, newEl) {

  const h = state.heroes.find(x => x.id === heroId);

  if (!h || h.element === newEl) return;

  if (state.resources.batteries < 5) {

    addLog(`<span style="color:#fca5a5;">Need 5⚡ Shard Batteries to re-attune element!</span>`);

    return;

  }

  state.resources.batteries -= 5;

  h.element = newEl;

  addLog(`<span style="color:#fde047;">💎 Re-attuned <b>${h.name}</b>'s Anchor Shard to ${EL_ICONS[newEl]} <b>${newEl}</b>!</span>`);

  updateHeaderUI();

  renderLab();

}



export function trainChakra(heroId, chakraId, useHellish = false) {

  const h = state.heroes.find(x => x.id === heroId);

  if (!h) return;

  const cur = h.chakras[chakraId];

  if (cur === 'Overbloomed') return;



  if (useHellish) {

    if (state.resources.batteries < 18) {

      addLog(`<span style="color:#fca5a5;">Need 18⚡ Batteries to Overbloom a Chakra!</span>`);

      return;

    }

    state.resources.batteries -= 18;

    h.chakras[chakraId] = 'Overbloomed';

    addLog(`<span style="color:#f472b6;">🔥 <b>${h.name}</b>'s ${chakraId} Chakra OVERBLOOMED (1.55x stat, -8% Max HP volatility)!</span>`);

  } else {

    if (state.resources.seals > 0) {

      state.resources.seals -= 1;

    } else if (state.resources.batteries >= 14) {

      state.resources.batteries -= 14;

    } else {

      addLog(`<span style="color:#fca5a5;">Need 1📜 Teacher Seal (or 14⚡ Batteries) to advance a Chakra!</span>`);

      return;

    }

    h.chakras[chakraId] = cur === 'Blocked' ? 'Open' : 'Bloomed';

    addLog(`<span style="color:#6ee7b7;">🧘 <b>${h.name}</b>'s ${chakraId} Chakra shifted to <b>${h.chakras[chakraId]}</b>!</span>`);

  }

  updateHeaderUI();

  renderLab();

}



export function ascendHero(heroId) {

  const h = state.heroes.find(x => x.id === heroId);

  if (!h || h.ascended) return;

  if (state.resources.batteries < 25 || state.resources.ore < 15) {

    addLog(`<span style="color:#fca5a5;">Ascension 1 requires 25⚡ Batteries & 15⛏ Forge Ore!</span>`);

    return;

  }

  state.resources.batteries -= 25;

  state.resources.ore -= 15;

  h.ascended = true;

  addLog(`<span style="color:#fde047; font-weight:bold;">🌟 ASCENSION 1 UNLOCKED! <b>${h.name}</b> is now Dual-Awakened and can equip ANY Umbrella package in Folder 2!</span>`);

  updateHeaderUI();

  renderLab();

}



export function moveSkillInFolder(heroId, fIdx, sIdx, dir) {

  const h = state.heroes.find(x => x.id === heroId);

  if (!h) return;

  const arr = h.folders[fIdx];

  const targetIdx = sIdx + dir;

  if (targetIdx < 0 || targetIdx >= arr.length) return;

  const tmp = arr[sIdx];

  arr[sIdx] = arr[targetIdx];

  arr[targetIdx] = tmp;

  renderLab();

}



export function unequipSkillFromFolder(heroId, fIdx, sIdx) {

  if (fIdx === 2 || fIdx === 3) return;

  const h = state.heroes.find(x => x.id === heroId);

  if (!h) return;

  const removed = h.folders[fIdx].splice(sIdx, 1)[0];

  if (removed) state.armory.push(removed);

  renderLab();

}



export function swapHeroAnchorRelic(heroId, vaultIdx) {

  const h = state.heroes.find(x => x.id === heroId);

  const newAnchorId = state.anchorVault[vaultIdx];

  const sk = SKILLS[newAnchorId];

  if (!h || !sk) return;



  if (sk.umbrella !== h.umbrella && !h.ascended) {

    addLog(`<span style="color:#fcd34d;">🔒 Ascend <b>${h.name}</b> first to equip cross-Umbrella Anchor Relics (${sk.umbrella})!</span>`);

    return;

  }



  const oldAnchorId = h.folders[2][0];

  state.anchorVault.splice(vaultIdx, 1);

  if (oldAnchorId) state.anchorVault.push(oldAnchorId);

  h.folders[2] = [newAnchorId];



  const rMeta = ANCHOR_RELICS[newAnchorId];

  addLog(`<span style="color:#fde047; font-weight:bold;">⚓ Equipped Anchor Relic <b>[${rMeta ? rMeta.relicName : sk.name}]</b> onto ${h.name}!</span>`);

  saveGameToStorage();

  renderLab();

}



export function equipArmorySkill(heroId, armoryIdx, targetFolderIdx) {

  const h = state.heroes.find(x => x.id === heroId);

  const sid = state.armory[armoryIdx];

  const sk = SKILLS[sid];

  if (!h || !sk) return;



  if (targetFolderIdx === 0 && sk.umbrella !== h.umbrella) {

    addLog(`<span style="color:#fca5a5;">Folder 1 only holds ${h.umbrella} skills! Ascend ${h.name} to slot cross-Umbrella skills into Folder 2.</span>`);

    return;

  }

  if (targetFolderIdx === 1 && sk.umbrella !== h.umbrella && !h.ascended) {

    addLog(`<span style="color:#fcd34d;">🔒 Unlock <b>Ascension 1</b> on ${h.name} first to equip ${sk.umbrella} packages in Folder 2!</span>`);

    return;

  }



  const used = getFolderPipsUsed(h.folders[targetFolderIdx]);

  if (used + sk.pips > 4) {

    addLog(`<span style="color:#fca5a5;">Not enough pips in Folder ${targetFolderIdx + 1} (${used}/4 used, ${sk.name} needs ${sk.pips}■)!</span>`);

    return;

  }



  if (sk.passiveKind === 'reaction' && h.folders.flat().some(id => SKILLS[id]?.passiveKind === 'reaction')) {

    addLog(`<span style="color:#fca5a5;">Reaction Budget: Max 1 Reaction skill per hero!</span>`);

    return;

  }

  if (sk.passiveKind === 'start' && h.folders.flat().some(id => SKILLS[id]?.passiveKind === 'start')) {

    addLog(`<span style="color:#fca5a5;">Trigger Budget: Max 1 Start-of-Fight passive per hero!</span>`);

    return;

  }



  state.armory.splice(armoryIdx, 1);

  h.folders[targetFolderIdx].push(sid);

  addLog(`<span style="color:#6ee7b7;">⚙ Equipped <b>${sk.name}</b> into ${h.name}'s Folder ${targetFolderIdx + 1}!</span>`);

  renderLab();

}



export function renderLab() {

  const h = state.heroes.find(x => x.id === state.selectedLabHeroId) || state.heroes[0];

  const st = getHeroStats(h);

  const syn = getSquadSynergyInfo(state.heroes);



  const heroTabs = state.heroes.map(u => `

    <button class="${u.id === h.id ? 'btn-gold' : ''}" onclick="selectLabHero('${u.id}')">

      ${u.sprite} ${u.name}

    </button>

  `).join('');



  const elButtons = ELEMENTS.map(el => `

    <button style="padding:3px 6px; font-size:10.5px; ${h.element === el ? 'border-color:#fde047; background:#2e3b68;' : ''}"

            onclick="reattuneHeroElement('${h.id}', '${el}')">${EL_ICONS[el]} ${el}</button>

  `).join('');



  const chakrasHtml = CHAKRA_LIST.map(c => {

    const rawVal = h.chakras[c.id];

    const effVal = getEffectiveChakraState(h, c.id);

    const isSuppressed = effVal !== rawVal;

    const color = effVal === 'Blocked' ? '#f87171' : (effVal === 'Bloomed' ? '#34d399' : (effVal === 'Overbloomed' ? '#f472b6' : '#cbd5e1'));

    return `

      <div class="chakra-row">

        <div>

          <div style="font-weight:bold;">${c.name} ${h.leadChakra === c.id ? '<span style="color:#fde047;">★Lead</span>' : ''}</div>

          <div style="font-size:10px; color:var(--text-muted);">${c.desc}</div>

        </div>

        <div style="display:flex; align-items:center; gap:4px;">

          <span style="font-weight:bold; color:${color};">${isSuppressed ? `🥾Fatigued (${rawVal})` : rawVal}</span>

          ${(rawVal === 'Blocked' || rawVal === 'Open') ? `<button class="btn-emerald" style="padding:2px 6px; font-size:10px;" onclick="trainChakra('${h.id}','${c.id}',false)" title="1📜 Seal or 14⚡">Bloom</button>` : ''}

          ${rawVal === 'Bloomed' ? `<button class="btn-magenta" style="padding:2px 6px; font-size:10px;" onclick="trainChakra('${h.id}','${c.id}',true)" title="18⚡ Hellish Overbloom">Over</button>` : ''}

        </div>

      </div>

    `;

  }).join('');



  document.getElementById('lab-hero-sheet').innerHTML = `

    <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:8px;">${heroTabs}</div>

    <div class="bevel-inset" style="padding:6px 8px; margin-bottom:8px; border-color:${syn.tier >= 5 ? '#fde047' : '#38bdf8'};">

      <div style="font-size:11px; font-weight:bold; color:#fde047;">🧩 SQUAD SYNERGY: ${syn.label}</div>

      <div style="font-size:10.5px; color:var(--text-muted); margin-top:2px;">${syn.desc}</div>

    </div>

    <div class="bevel-inset" style="padding:8px; margin-bottom:8px;">

      <div style="display:flex; justify-content:space-between; align-items:center;">

        <span style="font-size:15px; font-weight:900;">${h.sprite} ${h.name} (Lv.${h.level})</span>

        <span class="u-tag u-${h.umbrella}">${h.umbrella}</span>

      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">

        <span style="font-size:11.5px;">HP: <b>${st.maxHp}</b> | ATK: <b>${st.atk}</b> | SPD: <b>${st.spd}</b></span>

        <button class="btn-cyan" style="padding:3px 8px; font-size:11px;" onclick="toggleHeroRow('${h.id}')">Row: ${h.row}</button>

      </div>

      <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">

        <span style="font-size:11px; color:#fde047; font-weight:bold;">

          ${h.ascended ? '🌟 Ascension 1: Dual-Awakened (Any Umbrella in F2!)' : 'Ascension 0: Pure Umbrella'}

        </span>

        ${!h.ascended ? `<button class="btn-gold" style="padding:3px 7px; font-size:10.5px;" onclick="ascendHero('${h.id}')">Ascend (25⚡ 15⛏)</button>` : ''}

      </div>

    </div>



    <div style="font-size:11px; font-weight:bold; color:var(--text-muted); margin-bottom:4px;">💎 PERSONAL CRYSTAL SHARD (5⚡ to Re-attune):</div>

    <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:8px;">${elButtons}</div>



    <div class="bevel-inset" style="padding:6px; margin-bottom:8px;">

      <div style="font-size:11px; font-weight:bold; color:#f472b6;">🔮 CHAOS KNOT MUTATOR:</div>

      <div style="font-size:11px; color:var(--text-main); margin-top:2px;">

        ${h.knot ? `<b>${CHAOS_KNOTS[h.knot].name}:</b> ${CHAOS_KNOTS[h.knot].desc}` : '<span style="color:var(--text-muted);">None spliced — find a ❓ Chaos Well on a Sky-Shard!</span>'}

      </div>

    </div>



    <div style="font-size:11.5px; font-weight:bold; color:#fde047; margin-bottom:4px;">🧘 THE 7 CHAKRAS (1📜 Seal or 14⚡ to Bloom):</div>

    ${chakrasHtml}

  `;



  const folderNames = [

    `FOLDER 1: PRIMARY (${h.umbrella})`,

    `FOLDER 2: SECONDARY (${h.ascended ? 'ANY UMBRELLA!' : h.umbrella + ' / Ascend for All'})`,

    `FOLDER 3: ANCHOR GEAR (${ANCHOR_RELICS[h.folders[2][0]]?.relicName || 'Swappable Relic'})`,

    `FOLDER 4: CLAN & BADGES (Reorderable)`

  ];



  const renderPips = (used) => {

    let s = '';

    for (let i = 0; i < 4; i++) s += `<span class="pip-box ${i < used ? 'filled' : ''}"></span>`;

    return s;

  };



  const foldersEditorHtml = h.folders.map((fArr, fIdx) => {

    const used = getFolderPipsUsed(fArr);

    const rows = fArr.map((sid, sIdx) => {

      const sk = SKILLS[sid];

      const code = `${fIdx + 1}${String.fromCharCode(65 + sIdx)}`;

      return `

        <div class="bevel-inset" style="padding:5px 7px; display:flex; justify-content:space-between; align-items:center; gap:6px;">

          <div>

            <div>

              <b style="color:#fde047;">[${code}]</b> <b>${sk.name}</b>

              <span class="u-tag u-${sk.umbrella === 'Clan' ? 'Mantles' : sk.umbrella}">${sk.umbrella}</span>

              <span style="font-size:11px; color:#93c5fd;">${sk.type === 'passive' ? 'PASSIVE' : sk.ap + ' AP'} · ${sk.pips}■</span>

            </div>

            <div style="font-size:10.5px; color:var(--text-muted);">${sk.desc}</div>

          </div>

          <div style="display:flex; gap:3px;">

            <button style="padding:2px 5px;" onclick="moveSkillInFolder('${h.id}',${fIdx},${sIdx},-1)" title="Higher Auto-Gambit Priority">▲</button>

            <button style="padding:2px 5px;" onclick="moveSkillInFolder('${h.id}',${fIdx},${sIdx},1)" title="Lower Auto-Gambit Priority">▼</button>

            ${(fIdx === 0 || fIdx === 1) ? `<button class="btn-crimson" style="padding:2px 6px;" onclick="unequipSkillFromFolder('${h.id}',${fIdx},${sIdx})" title="Unequip to Armory">✕</button>` : ''}

          </div>

        </div>

      `;

    }).join('');



    const anchorSwapBar = fIdx === 2 ? `

      <div style="margin-top:5px; padding-top:5px; border-top:1px dashed #2c3963; display:flex; gap:5px; align-items:center; flex-wrap:wrap;">

        <span style="font-size:10.5px; color:#fde047; font-weight:bold;">⚓ Swap Relic:</span>

        ${state.anchorVault.map((aid, aIdx) => {

          const rm = ANCHOR_RELICS[aid];

          const ask = SKILLS[aid];

          if (!ask) return '';

          return `<button class="btn-gold" style="padding:2px 6px; font-size:10px;" title="${ask.desc}" onclick="swapHeroAnchorRelic('${h.id}', ${aIdx})">${rm ? rm.relicName : ask.name} (${ask.umbrella})</button>`;

        }).join('') || `<span style="font-size:10.5px; color:var(--text-muted);">No spare relics in vault</span>`}

      </div>

    ` : '';



    return `

      <div class="bevel" style="padding:7px; margin-bottom:7px; background:#151c33;">

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">

          <span style="font-weight:bold; color:#67e8f9; font-size:12px;">${folderNames[fIdx]}</span>

          <span>${renderPips(used)} (${used}/4 Pips)</span>

        </div>

        <div style="display:flex; flex-direction:column; gap:4px;">

          ${rows || `<div style="font-size:11px; color:var(--text-muted); padding:4px;">No packages slotted. Equip from Clan Armory below!</div>`}

        </div>

        ${anchorSwapBar}

      </div>

    `;

  }).join('');



  const armoryHtml = state.armory.map((sid, idx) => {

    const sk = SKILLS[sid];

    if (!sk) return '';

    return `

      <div class="bevel-inset" style="padding:6px 8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">

        <div>

          <div>

            <b>${sk.name}</b>

            <span class="u-tag u-${sk.umbrella}">${sk.umbrella}</span>

            <span class="el-tag el-${sk.element}">${EL_ICONS[sk.element] || ''} ${sk.element}</span>

            <span style="font-size:11px; color:#fde047;">${sk.pips}■ ${sk.type === 'passive' ? 'PASSIVE' : sk.ap + 'AP'}</span>

          </div>

          <div style="font-size:10.5px; color:var(--text-muted);">${sk.desc}</div>

        </div>

        <div style="display:flex; gap:4px; white-space:nowrap;">

          <button class="btn-cyan" style="padding:3px 7px; font-size:10.5px;" onclick="equipArmorySkill('${h.id}',${idx},0)">+ F1</button>

          <button class="btn-emerald" style="padding:3px 7px; font-size:10.5px;" onclick="equipArmorySkill('${h.id}',${idx},1)">+ F2</button>

        </div>

      </div>

    `;

  }).join('');



  document.getElementById('lab-folder-editor').innerHTML = `

    <div style="font-weight:bold; color:#fde047; margin-bottom:4px;">

      ⚙ 4×4 SKILL MATRIX &amp; AUTO-GAMBIT PRIORITY QUEUE (Scans 1A → 4D)

    </div>

    <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">

      Reorder skills with ▲/▼ to script ${h.name}'s exact Auto-Gambit priority! Actives &amp; Passives share each folder's 4-pip capacity.

    </div>

    ${foldersEditorHtml}

    <div style="font-weight:bold; color:#fde047; margin:10px 0 5px;">📦 CLAN SKILL ARMORY (${state.armory.length} Packages Available)</div>

    <div style="display:flex; flex-direction:column; gap:5px;">

      ${armoryHtml || `<div style="font-size:11px; color:var(--text-muted);">All packages equipped! Spin Dreamsmith Slots or Void Frack shards to draft more.</div>`}

    </div>

  `;

}
