/* ============================================================================
   MASTER GAME STATE
   ============================================================================ */
export const state = {
  activeTab: 'explore',
  resources: { gold:165, batteries:55, ore:35, badges:3, seals:3, tokens:6 },
  badgePouch: ['rival', 'tutor', 'smuggler'], // Pre-Typed Role Badges (Refills to 3 each Sky-Shard, hard cap 5!)
  keyShards: 0, // Collect 3 Key Shards from Town Smugglers -> Forges 1 Attuned Key!
  fatigue: 0,
  wellRestedShield: 0,
  blessing: null,
  keys: [],
  lastCollectedTimestamp: Date.now() - 50000,
  sealCounts: { gladiator_writ:2, lantern_seal:2, hollow_earth:2, spider_silk:2, boiler_seal:2, oni_ofuda:2, geomancer:2, faultline:2 },
  selectedSeals: ['gladiator_writ', 'lantern_seal'],
  armory: ['pkg_gale_slash','pkg_iron_counter','pkg_grapple_wire','pkg_origami_bomb','pkg_mirror_ward','pkg_frost_snap','pkg_citizen_aegis','pkg_beast_fang','pkg_heaven_beam'],
  anchorVault: ['anc_tempest_sheath','anc_dynamo_coil','anc_alkahest_lens','anc_justice_buckler','anc_marionette_spool'],
  heroes: [
    { id:'kael', name:'KAEL', sprite:'🗡️', umbrella:'Ki', element:'Fire', leadChakra:'Sacral', row:'Front', level:1, xp:0, ascended:false, knot:null, baseHp:135, baseAtk:28, baseSpd:26,
      chakras:{ Root:'Open', Sacral:'Bloomed', Solar:'Open', Heart:'Blocked', Throat:'Open', ThirdEye:'Open', Crown:'Open' },
      folders:[['kael_iaido','kael_furnace','kael_guard'], [], ['kael_limiter'], ['throw_badge','basic_strike','focus_spirit']] },
    { id:'pip', name:'PIP & KETTLE', sprite:'🤖', umbrella:'Artifice', element:'Fire', leadChakra:'Root', row:'Front', level:1, xp:0, ascended:false, knot:null, baseHp:165, baseAtk:26, baseSpd:18,
      chakras:{ Root:'Bloomed', Sacral:'Open', Solar:'Open', Heart:'Open', Throat:'Blocked', ThirdEye:'Open', Crown:'Open' },
      folders:[['pip_napalm','pip_mortar'], [], ['pip_vent'], ['throw_badge','basic_strike','focus_spirit']] },
    { id:'lyra', name:'LYRA', sprite:'⚗️', umbrella:'Patterns', element:'Earth', leadChakra:'ThirdEye', row:'Back', level:1, xp:0, ascended:false, knot:null, baseHp:110, baseAtk:29, baseSpd:23,
      chakras:{ Root:'Blocked', Sacral:'Open', Solar:'Open', Heart:'Open', Throat:'Open', ThirdEye:'Bloomed', Crown:'Open' },
      folders:[['lyra_pillar','lyra_etch'], [], ['lyra_elixir'], ['throw_badge','basic_strike','focus_spirit']] },
    { id:'vane', name:'VANE', sprite:'🛡️', umbrella:'Mantles', element:'Light', leadChakra:'Heart', row:'Front', level:1, xp:0, ascended:false, knot:null, baseHp:155, baseAtk:25, baseSpd:20,
      chakras:{ Root:'Open', Sacral:'Open', Solar:'Open', Heart:'Bloomed', Throat:'Open', ThirdEye:'Open', Crown:'Blocked' },
      folders:[['vane_maul','vane_henshin'], [], ['vane_chorus'], ['throw_badge','basic_strike','focus_spirit']] },
    { id:'zappa', name:'ZAPPA-LIN', sprite:'👻', umbrella:'Tethers', element:'Dark', leadChakra:'Crown', row:'Back', level:1, xp:0, ascended:false, knot:null, baseHp:115, baseAtk:27, baseSpd:22,
      chakras:{ Root:'Open', Sacral:'Open', Solar:'Blocked', Heart:'Open', Throat:'Open', ThirdEye:'Open', Crown:'Bloomed' },
      folders:[['zappa_legion','zappa_oversoul'], [], ['zappa_kaiju'], ['throw_badge','basic_strike','focus_spirit']] }
  ],
  selectedLabHeroId: 'kael',
  map: { name:'', elements:[], attuned:[], stabilized:false, overclockedDen:false, crystalBoost:0, divePrestige:0, stageRule:'clear_sky', width:11, height:9, px:5, py:4, tiles:[] },
  overworldBackup: null,
  subMap: { active:false, kind:null, title:'', floor:1, maxFloors:1, divePrestige:0, stageRule:'damp_mist', townData:null, floorsCache:{} },
  battle: { active:false, mode:'manual', autoBadge:true, round:1, title:'Wild Shard Pack', stageRule:'clear_sky', judgeLaw:null, isArenaBattle:false, lastSkillElement:null, sourceTile:null, isBoss:false, guaranteesKeyDrop:false, lootMult:1, overdrive:35, chainElement:null, chainCount:0, canopy:{ turns:0, name:'', dmg:0 }, legionStacks:0, allies:[], foes:[], queue:[], activeUnitKey:null, selectedSkillId:null, timerId:null },
  vaultShards: [
    { id:'sh_start1', name:'Cinder-Salt Crags', elements:['Fire','Earth'], batRate:6, oreRate:5, prestige:0, prime:false, pinned:true },
    { id:'sh_start2', name:'Gale-Prism Spire',  elements:['Air','Light'],  batRate:7, oreRate:3, prestige:0, prime:false, pinned:true },
    { id:'sh_start3', name:'Blazing Caldera',   elements:['Fire','Air'],   batRate:5, oreRate:4, prestige:0, prime:false, pinned:false },
    { id:'sh_start4', name:'Abyssal Tidepool',  elements:['Water','Dark'], batRate:6, oreRate:4, prestige:0, prime:false, pinned:false }
  ],
  glassifiedMosaics: [],
  benchRoster: [
    { id:'b_goro', name:'Goro (Pacifist Referee)', icon:'⚖️', role:'+30% ⚡ Yield & +1 Badge/collect', batMult:0.30, oreMult:0, xpBonus:0, badgeBonus:1, assigned:true },
    { id:'b_mira', name:'Mira (Ore Magnate)',      icon:'⚒️', role:'+65% ⛏ Forge Ore Yield',          batMult:0,    oreMult:0.65, xpBonus:0, badgeBonus:0, assigned:true },
    { id:'b_tali', name:'Tali (Daycare Breeder)',  icon:'🥚', role:'+20% All Yield & Passive Squad XP', batMult:0.20, oreMult:0.20, xpBonus:20, badgeBonus:0, assigned:false }
  ],
  frackSelection: [],
  slotReels: ['⚡', '🎰', '📜']
};
