import './style.css';
import * as constants from './data/constants.js';
import { state } from './state.js';
import * as core from './engine/core.js';
import * as explore from './engine/explore.js';
import * as battle from './engine/battle.js';
import * as lab from './engine/lab.js';
import * as mosaic from './engine/mosaic.js';

// Register exports onto window so inline HTML onclick="..." handlers & cross-module calls work seamlessly
Object.assign(window, constants, { state }, core, explore, battle, lab, mosaic);

/* ============================================================================

   BOOT INITIALIZATION & REAL-TIME HEARTH TICKER

   ============================================================================ */

export function bootGame() {

  const loadedSave = loadGameFromStorage();



  addLog(`<span style="color:#fde047; font-weight:bold;">🧩 Welcome to JIGSAW WORLD v0.2e!</span>`);

  addLog(`<span style="color:#6ee7b7;">• <b>Auto-Badge Fixed &amp; Map Tooltips Added</b>: Auto-Gambit now immediately prioritizes <b>🏷 Throw Role Badge</b> whenever an enemy hits <b>[UNMOORED] (&lt;=35% HP)</b>, and every Overworld/Cellar/Town/Dungeon icon now has hover descriptions!</span>`);

  addLog(`<span style="color:#fbcfe8;">• <b>Auto-Save, Swappable Anchor Relics &amp; Umbrella Gestalts</b>: Swap Folder 3 Anchor Gear in Tab 3, draft varied Tavern kits toward <b>3/5 &amp; 5/5 Umbrella Gestalts</b>, and persist progress automatically via <b>💾 Save</b>!</span>`);



  if (!loadedSave) {

    generateNewSkyShard(null, false);

  } else {

    addLog(`<span style="color:#67e8f9;">💾 Restored your saved Clan Chronicle &amp; real-time Hearth timer!</span>`);

  }

  renderExplore();

  updateHeaderUI();



  setInterval(() => {

    updateHeaderUI();

    saveGameToStorage();

  }, 1000);

};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGame);
} else {
  bootGame();
}
