/* ============================================================================
   CORE CONSTANTS, PRE-TYPED ROLE BADGES & DATA TABLES
   ============================================================================ */
export const ELEMENTS = ['Fire', 'Water', 'Air', 'Earth', 'Light', 'Dark'];
export const EL_ICONS = { Fire:'🔥', Water:'💧', Air:'🌪️', Earth:'🪨', Light:'☀️', Dark:'🌑', Neutral:'⚪', Chaos:'🌀' };
export const CHAKRA_LIST = [
  { id:'Root', name:'Root', desc:'Max HP & Row Stability' },
  { id:'Sacral', name:'Sacral', desc:'Turn Speed & Evasion' },
  { id:'Solar', name:'Solar Plexus', desc:'Direct ATK & Crit Ceiling' },
  { id:'Heart', name:'Heart', desc:'Heal & Shield Potency' },
  { id:'Throat', name:'Throat', desc:'Vow & Command Scaling' },
  { id:'ThirdEye', name:'Third Eye', desc:'Smart Gambit AI & Scan' },
  { id:'Crown', name:'Crown', desc:'Overdrive Charge Speed' }
];
export const CHAKRA_MULT = { Blocked:0.78, Open:1.00, Bloomed:1.28, Overbloomed:1.55 };

export const ROLE_BADGE_TYPES = {
  rival:     { id:'rival',     icon:'⚔️', name:'Rival Badge',     color:'#f472b6', short:'Rival',     desc:'Rolls monster up as a Playable Adventurer at Town Plaza for a 1v1 Recruitment Duel!' },
  tutor:     { id:'tutor',     icon:'🥋', name:'Tutor Badge',     color:'#67e8f9', short:'Tutor',     desc:'Sends Monster Sensei to Town Plaza to teach Signature Monster Moves & Chakra breakthroughs!' },
  smuggler:  { id:'smuggler',  icon:'💰', name:'Smuggler Badge',  color:'#fcd34d', short:'Smuggler',  desc:'Opens an Elemental Black Market & Attuned Key-Shard stall in Town Plaza!' },
  forgekin:  { id:'forgekin',  icon:'🔨', name:'Forge-Kin Badge', color:'#fb923c', short:'Forge-Kin', desc:'Transmutes 2 Armory skills into a rare scroll OR supercharges Sky-Shard Crystal yields!' },
  trickster: { id:'trickster', icon:'🎲', name:'Trickster Badge', color:'#c084fc', short:'Trickster', desc:'Opens a high-stakes Spirit Dice booth in Town Plaza for Keys, Seals, or Shard Clones!' }
};
export const ROLE_KEYS = Object.keys(ROLE_BADGE_TYPES);
export const MAX_BADGE_POUCH = 5;

export const CHAOS_KNOTS = {
  coil_rubber:   { id:'coil_rubber',   name:'Coil-Rubber Knot',     desc:'All Melee skills gain Back-Row reach & reflect 25% melee dmg; takes +30% Water dmg.' },
  glass_pendulum:{ id:'glass_pendulum',name:'Glass-Pendulum Knot',  desc:'Odd Rounds: Skills cost 0 AP & deal +65% dmg! Even Rounds: Crystal Statue (+32 Shield, halves dmg).' },
  seam_split:    { id:'seam_split',    name:'Seam-Split Knot',      desc:'When HP <= 60%, body splits—every offensive skill strikes a 2nd time at 50% power!' },
  inverted_heart:{ id:'inverted_heart',name:'Inverted Heart Knot',  desc:'Every Heal or Shield skill also fires a shield-piercing Dark hex at the weakest foe!' },
  mercury_mimic: { id:'mercury_mimic', name:'Liquid-Mercury Knot',  desc:'Shifts Element to match the last ally skill used (+20% sync dmg) & +14 Shield on Spells/Blasts!' },
  gravity_anchor:{ id:'gravity_anchor',name:'Event-Horizon Knot',   desc:'Single-target hits yank Back-Row foes to the Front & deal +30% dmg vs Front-Row targets (-3 SPD).' },
  fortune_dice:  { id:'fortune_dice',  name:"Gambler's Seven Knot", desc:'Attacks roll 1d6: [1-2] 0.85x · [3-5] 1.35x & +1 AP · [6] 2.2x JACKPOT CRIT & +8🪙!' },
  phoenix_ash:   { id:'phoenix_ash',   name:'Cinder-Molt Knot',     desc:'Once per battle at 0 HP, revives at 55% HP (+3 AP) and scorches all enemies for 32 Fire dmg!' }
};

export const SKILLS = {
  kael_iaido:   { id:'kael_iaido', name:'Ember Iaido', umbrella:'Ki', pips:1, ap:2, element:'Fire', type:'active', target:'any_foe', tags:['Melee','Fire'], desc:'Fire blade draw reaching Back Row (+1 Momentum).', power:1.25 },
  kael_furnace: { id:'kael_furnace', name:'Inner Furnace', umbrella:'Ki', pips:2, ap:0, element:'Fire', type:'passive', passiveKind:'quiet', tags:['Fire'], desc:'Passive: +30% Fire skill potency; Fire shields scorch melee attackers.' },
  kael_guard:   { id:'kael_guard', name:'Eight-Breath Guard', umbrella:'Ki', pips:1, ap:0, element:'Fire', type:'active', target:'self', tags:['Shield','Fire'], desc:'0 AP: Gain +2 AP, Fire Barrier, and +1 Momentum.', shield:28 },
  kael_limiter: { id:'kael_limiter', name:'Limiter Release', umbrella:'Ki', pips:2, ap:4, element:'Fire', type:'active', target:'front_foe', tags:['Melee','Fire'], desc:'Anchor (Weighted Gi): Consumes Momentum for massive Fire burst (-10% Spd).', power:2.1 },
  pip_napalm:   { id:'pip_napalm', name:'Boiler Napalm Sweep', umbrella:'Artifice', pips:2, ap:3, element:'Fire', type:'active', target:'foe_front_row', tags:['Blast','Fire'], desc:'Heavy Fire AoE across enemy Front Row (+1 Overheat).', power:1.35 },
  pip_mortar:   { id:'pip_mortar', name:'Slag Mortar', umbrella:'Artifice', pips:2, ap:3, element:'Fire', type:'active', target:'back_foe', tags:['Blast','Fire'], desc:'Snipes enemy Back Row with molten slag (+1 Overheat).', power:1.55 },
  pip_vent:     { id:'pip_vent', name:'Steam Curtain Vent', umbrella:'Artifice', pips:2, ap:0, element:'Water', type:'active', target:'ally_front_row', tags:['Shield'], desc:'Anchor (Copper Core): Clears all Overheat, +2 AP, shields Front Row.', shield:26 },
  lyra_pillar:  { id:'lyra_pillar', name:'Grand Pillar Transmute', umbrella:'Patterns', pips:3, ap:5, element:'Earth', type:'active', target:'all_foes', tags:['Spell','Earth'], desc:'Earth AoE all foes. Consumes [Residue] for 2x Dmg & Armor Break!', power:1.25 },
  lyra_etch:    { id:'lyra_etch', name:'Salt-Rune Etch', umbrella:'Patterns', pips:1, ap:1, element:'Earth', type:'active', target:'any_foe', tags:['Spell','Earth'], desc:'Earth strike + places [Residue] + grants +1 AP to lowest-AP ally.', power:0.95 },
  lyra_elixir:  { id:'lyra_elixir', name:'Refracting Elixir', umbrella:'Patterns', pips:2, ap:2, element:'Water', type:'active', target:'lowest_ally', tags:['Heal','Shield'], desc:'Anchor (Bandolier): Heals lowest-HP ally & grants barrier.', heal:42, shield:18 },
  vane_maul:    { id:'vane_maul', name:'Ancestral Storm-Maul', umbrella:'Mantles', pips:2, ap:4, element:'Light', type:'active', target:'highest_foe', tags:['Melee','Light'], desc:'Light smash. VOW: Target highest-HP foe for +1 Conviction & +1 AP (else 0.5x).', power:1.85 },
  vane_henshin: { id:'vane_henshin', name:'Prism Henshin Strike', umbrella:'Mantles', pips:2, ap:3, element:'Light', type:'active', target:'front_foe', tags:['Melee','Light','Shield'], desc:'Light strike + VOW: Intercepts single-target hits aimed at allies <60% HP!', power:1.35, shield:22 },
  vane_chorus:  { id:'vane_chorus', name:'Radiant Chorus', umbrella:'Mantles', pips:2, ap:3, element:'Light', type:'active', target:'all_allies', tags:['Shield','Light'], desc:'Anchor (Oath Ring): Squad-wide Light shield + +1 AP to Front Row.', shield:22 },
  zappa_legion: { id:'zappa_legion', name:'Call Shikigami Legion', umbrella:'Tethers', pips:2, ap:3, element:'Dark', type:'active', target:'self', tags:['Summon','Dark'], desc:'Reserves 2 Max AP: Spawns Paper Legion x3 in Front Row to swarm & block!' },
  zappa_oversoul:{ id:'zappa_oversoul', name:'Haunting Oversoul', umbrella:'Tethers', pips:1, ap:2, element:'Dark', type:'active', target:'any_foe', tags:['Spell','Dark'], desc:'Dark spirit bolt + possesses highest-ATK ally (+25% ATK buff).', power:1.15 },
  zappa_kaiju:  { id:'zappa_kaiju', name:'Invoke Kaiju Shadow', umbrella:'Tethers', pips:3, ap:6, element:'Dark', type:'active', target:'all_foes', tags:['Summon','Dark'], desc:'Anchor (Spirit Bell): Fills CANOPY SLOT for 2 rounds, raining Dark AoE!', power:1.4 },
  throw_badge:  { id:'throw_badge', name:'Throw Role Badge', umbrella:'Clan', pips:1, ap:0, element:'Light', type:'active', target:'unmoored_foe', tags:['Badge'], desc:'0 AP: Stamp a Pre-Typed Role Badge onto an [UNMOORED] (<=35% HP) foe — sends them to Town Plaza!' },
  basic_strike: { id:'basic_strike', name:'Basic Strike', umbrella:'Clan', pips:1, ap:0, element:'Neutral', type:'active', target:'front_foe', tags:['Melee'], desc:'0 AP: Crisp martial/weapon strike. Restores +2 AP.', power:0.85 },
  focus_spirit: { id:'focus_spirit', name:'Focus Spirit', umbrella:'Clan', pips:1, ap:0, element:'Neutral', type:'active', target:'self', tags:['Shield'], desc:'0 AP: Center breath to restore +3 AP and gain light guard.', shield:14 },
  anc_tempest_sheath:  { id:'anc_tempest_sheath', name:'Tempest Iaido Draw', umbrella:'Ki', pips:2, ap:3, element:'Air', type:'active', target:'back_foe', tags:['Melee','Air','Shield'], desc:'Anchor (Tempest Sheath): Snipes Back Row + +18 Shield & +1 Momentum (-6% HP).', power:1.65, shield:18 },
  anc_dynamo_coil:     { id:'anc_dynamo_coil', name:'Dynamo Arc Discharge', umbrella:'Artifice', pips:2, ap:2, element:'Light', type:'active', target:'all_foes', tags:['Blast','Light'], desc:'Anchor (Arc Capacitor): Light AoE all foes; drains 1 Overheat into +2 AP!', power:1.25 },
  anc_alkahest_lens:   { id:'anc_alkahest_lens', name:'Prism Alkahest Ray', umbrella:'Patterns', pips:2, ap:3, element:'Fire', type:'active', target:'any_foe', tags:['Spell','Fire'], desc:'Anchor (Alkahest Lens): Piercing Fire ray that distills +2 [Residue]!', power:1.45 },
  anc_justice_buckler: { id:'anc_justice_buckler', name:'Citizen Justice Crash', umbrella:'Mantles', pips:2, ap:2, element:'Earth', type:'active', target:'front_foe', tags:['Melee','Shield','Earth'], desc:'Anchor (Justice Buckler): Bash + VOW: Intercept hurt allies, +26 Shield & +1 Vow!', power:1.25, shield:26 },
  anc_marionette_spool:{ id:'anc_marionette_spool', name:'Ironwood Wire Waltz', umbrella:'Tethers', pips:2, ap:2, element:'Earth', type:'active', target:'lowest_ally', tags:['Summon','Heal','Earth'], desc:'Anchor (Marionette Spool): Spawns +2 Paper Legion & mends lowest-HP ally!', heal:30, shield:14 },
  pkg_gale_slash:      { id:'pkg_gale_slash', name:'Gale-Step Cut', umbrella:'Ki', pips:1, ap:2, element:'Air', type:'active', target:'any_foe', tags:['Melee','Air'], desc:'Nimble Air wind-blade reaching any row (+1 Momentum).', power:1.2 },
  pkg_iron_counter:    { id:'pkg_iron_counter', name:'Iron Body Counter', umbrella:'Ki', pips:2, ap:0, element:'Earth', type:'passive', passiveKind:'reaction', tags:['Melee'], desc:'Reaction (Max 1): 55% chance to counter Front-Row strikes & gain +1 AP.' },
  pkg_grapple_wire:    { id:'pkg_grapple_wire', name:'Night-Wire Grapple', umbrella:'Artifice', pips:1, ap:2, element:'Air', type:'active', target:'back_foe', tags:['Gadget','Air'], desc:'Yanks a Back-Row enemy into Front Row & cracks guard (+1 Heat).', power:1.15 },
  pkg_origami_bomb:    { id:'pkg_origami_bomb', name:'Origami Shrike Cluster', umbrella:'Artifice', pips:2, ap:3, element:'Fire', type:'active', target:'all_foes', tags:['Blast','Fire'], desc:'Paper kite-drones carpet-bomb all enemies with Fire (+1 Heat).', power:1.15 },
  pkg_mirror_ward:     { id:'pkg_mirror_ward', name:'Geometric Mirror Ward', umbrella:'Patterns', pips:2, ap:0, element:'Light', type:'passive', passiveKind:'start', tags:['Shield'], desc:'Start-of-Fight (Max 1): Grants +28 Shield & spawns 1 [Residue] on Turn 0.' },
  pkg_frost_snap:      { id:'pkg_frost_snap', name:'Cryo-Lattice Snap', umbrella:'Patterns', pips:2, ap:3, element:'Water', type:'active', target:'any_foe', tags:['Spell','Water'], desc:'Water lance; consumes [Residue] for 1.8x dmg & self-heal.', power:1.35 },
  pkg_citizen_aegis:   { id:'pkg_citizen_aegis', name:'Citizen Oath Mantle', umbrella:'Mantles', pips:2, ap:0, element:'Light', type:'passive', passiveKind:'quiet', tags:['Shield'], desc:'Passive: +30% Shield/Heal output & starts every fight with +2 Conviction.' },
  pkg_beast_fang:      { id:'pkg_beast_fang', name:'Feral Beast-Knit', umbrella:'Tethers', pips:1, ap:2, element:'Earth', type:'active', target:'front_foe', tags:['Melee','Earth'], desc:'Claw-knit strike that leeches 40% of damage dealt as HP.', power:1.25 },
  pkg_heaven_beam:     { id:'pkg_heaven_beam', name:'Astral Aura Cannon', umbrella:'Ki', pips:3, ap:5, element:'Light', type:'active', target:'all_foes', tags:['Blast','Light'], desc:'3-Pip Capstone: Sweeping Light Ki wave hitting all foes!', power:1.65 },
  pkg_silk_snare:      { id:'pkg_silk_snare', name:'Venom-Silk Snare', umbrella:'Tethers', pips:2, ap:2, element:'Dark', type:'active', target:'any_foe', tags:['Spell','Dark'], desc:'Dungeon Scroll: Wraps any foe in silk, cracking armor & -4 SPD.', power:1.35 },
  pkg_boiler_overdrive:{ id:'pkg_boiler_overdrive', name:'Furnace Meltdown Slam', umbrella:'Artifice', pips:3, ap:4, element:'Fire', type:'active', target:'all_foes', tags:['Blast','Fire'], desc:'Foundry Capstone: Slag AoE across all foes (+25% dmg per Heat stack)!', power:1.6 },
  pkg_lotus_palm:      { id:'pkg_lotus_palm', name:'Tempest Lotus Palm', umbrella:'Ki', pips:2, ap:3, element:'Water', type:'active', target:'front_foe', tags:['Melee','Water','Heal'], desc:'Dojo Scroll: Fluid strike + heals lowest-HP ally for 24 HP (+1 Momentum).', power:1.4, heal:24 },
  pkg_starlight_vow:   { id:'pkg_starlight_vow', name:'Starlight Lance Oath', umbrella:'Mantles', pips:2, ap:3, element:'Air', type:'active', target:'any_foe', tags:['Melee','Air'], desc:'Dojo Scroll: Piercing Air lance reaching Back Row (+1 Conviction & +15 Shield).', power:1.45, shield:15 },
  /* Monster Signature Moves (Rolled onto Badged Rivals & Tutors!) */
  mon_slag_crush:      { id:'mon_slag_crush', name:'Ogre Magma-Crush', umbrella:'Ki', pips:2, ap:3, element:'Fire', type:'active', target:'front_foe', tags:['Melee','Fire'], desc:'Monster Signature: Brutal volcanic slam that cracks armor (+1 Momentum).', power:1.7 },
  mon_gale_fan:        { id:'mon_gale_fan', name:'Tengu Cyclone-Fan', umbrella:'Patterns', pips:2, ap:3, element:'Air', type:'active', target:'all_foes', tags:['Spell','Air'], desc:'Monster Signature: Razor wind-gust across all foes + +1 [Residue].', power:1.3 },
  mon_shell_fortress:  { id:'mon_shell_fortress', name:'Tortoise Adamant Stance', umbrella:'Mantles', pips:2, ap:2, element:'Earth', type:'active', target:'all_allies', tags:['Shield','Earth'], desc:'Monster Signature: Grants +26 Earth Shield to all allies & activates Intercept Vow!', shield:26 },
  mon_kappa_torrent:   { id:'mon_kappa_torrent', name:'Kappa Tidal Surge', umbrella:'Ki', pips:2, ap:2, element:'Water', type:'active', target:'any_foe', tags:['Melee','Water','Heal'], desc:'Monster Signature: Pressurized Water strike + mends self for 26 HP.', power:1.4, heal:26 },
  mon_umbral_strings:  { id:'mon_umbral_strings', name:'Puppet Shadow-Strings', umbrella:'Tethers', pips:2, ap:3, element:'Dark', type:'active', target:'back_foe', tags:['Spell','Dark'], desc:'Monster Signature: Snipes Back Row & weaves +2 Paper Legion!', power:1.45 }
};

export const ANCHOR_RELICS = {
  kael_limiter:         { id:'kael_limiter', relicName:'Weighted Sect Gi', umbrella:'Ki', note:'-10% SPD until unleashed; huge Momentum burst' },
  anc_tempest_sheath:   { id:'anc_tempest_sheath', relicName:'Lacquered Tempest Sheath', umbrella:'Ki', note:'-6% Max HP; Back-Row wind snipe + Shield' },
  pip_vent:             { id:'pip_vent', relicName:'Copper Core Reactor', umbrella:'Artifice', note:'Clears all Overheat, +2 AP & Front-Row Shield' },
  anc_dynamo_coil:      { id:'anc_dynamo_coil', relicName:'Dynamo Arc Capacitor', umbrella:'Artifice', note:'Drains 1 Overheat into +2 AP + Light AoE' },
  lyra_elixir:          { id:'lyra_elixir', relicName:'Apothecary Bandolier', umbrella:'Patterns', note:'Targeted ally emergency Heal + Barrier' },
  anc_alkahest_lens:    { id:'anc_alkahest_lens', relicName:'Prism Alkahest Lens', umbrella:'Patterns', note:'Generates +2 Elemental Residue on hit' },
  vane_chorus:          { id:'vane_chorus', relicName:'Radiant Oath Ring', umbrella:'Mantles', note:'Squad-wide Light Shield + Vanguard AP' },
  anc_justice_buckler:  { id:'anc_justice_buckler', relicName:"Citizen's Justice Buckler", umbrella:'Mantles', note:'Activates Ally-Intercept Vow + heavy Shield' },
  zappa_kaiju:          { id:'zappa_kaiju', relicName:'Abyssal Spirit Bell', umbrella:'Tethers', note:'Reserves 2 AP to summon Canopy Kaiju' },
  anc_marionette_spool: { id:'anc_marionette_spool', relicName:'Ironwood Marionette Spool', umbrella:'Tethers', note:'Reinforces Paper Legion x2 + Ally Mend' }
};

export const STAGE_RULES = {
  clear_sky:          { id:'clear_sky', icon:'☀️', name:'Clear Sky', css:'', desc:'Balanced footing: All heroes start battle with +1 bonus Spirit AP.' },
  leyline_hum:        { id:'leyline_hum', icon:'💎', name:'Crystal Leyline Hum', css:'', desc:'Resonant ground: +1 extra Spirit AP regen on Round 2+ & stronger Crystal Chain bursts!' },
  damp_mist:          { id:'damp_mist', icon:'🌫️', name:'Damp Cavern Mist', css:'', desc:'Cool cellar fog: All units gain +10 starting Shield; Water & Dark skills deal +20% dmg.' },
  sticky_webs:        { id:'sticky_webs', icon:'🕸️', name:'Sticky Web Floor', css:'hazard-web', desc:'Non-Air/Non-Spider units suffer -25% SPD; Back-Row snipe skills cost +1 Spirit AP!' },
  superheated_grates: { id:'superheated_grates', icon:'🔥', name:'Superheated Grates', css:'hazard-heat', desc:'+25% Fire & Artifice dmg, +1 extra Overheat stack, and 6 end-of-round burn to unshielded units!' }
};

export const JUDGE_LAWS = {
  honorable_duel:     { id:'honorable_duel', icon:'⚖️', name:'Law of the Duelist', desc:'Single-target attacks deal +35% dmg! AoE attacks deal -40% dmg & incur a -1 AP Referee Fine.' },
  element_flux:       { id:'element_flux', icon:'🌈', name:'Law of Prismatic Flux', desc:'Alternating Elements grants +30% dmg & +1 AP refund! Repeating Elements costs +1 AP.' },
  featherweight_blitz:{ id:'featherweight_blitz', icon:'⚡', name:'Law of Blitz Tempo', desc:'1-Pip light techniques deal +45% dmg & +10% Overdrive! Heavy 3-Pip skills cost +1 Spirit AP.' },
  guardian_mercy:     { id:'guardian_mercy', icon:'🛡️', name:'Law of Sanctuary', desc:'Shield & Heal skills grant +16 bonus Shield & +1 AP! Striking Unmoored foes deals -30% dmg.' }
};

export const SHINTO_SEALS = [
  { id:'gladiator_writ', name:"Gladiator's Arena Writ", icon:'🏟️', desc:'Guarantees Boss-Rush Arena + +35% Arena Loot' },
  { id:'lantern_seal',   name:'Wayfarer Lantern Seal',  icon:'🏮', desc:'Bustling 5-Building Town + 25% off Town Inn/Shop/School' },
  { id:'hollow_earth',   name:'Hollow-Earth Ofuda',     icon:'🏛️', desc:'Upgrades ALL Cellars into multi-floor Big Cellars (+Key odds)' },
  { id:'spider_silk',    name:"Spider-Queen's Silk Tag",icon:'🕸️', desc:'Guarantees 3-Floor Lair of the Orb-Weaver Dungeon' },
  { id:'boiler_seal',    name:'Clockwork Boiler Seal',  icon:'⚙️', desc:'Guarantees 3-Floor Sunken Copper Foundry Dungeon' },
  { id:'oni_ofuda',      name:'Crimson Oni Ofuda',      icon:'👹', desc:'Spawns 4x-Loot Enraged Elite Rival on map' },
  { id:'geomancer',      name:'Geomancer Dowsing Slip', icon:'⛏',  desc:'Triples natural Ore & Salt veins' },
  { id:'faultline',      name:'Faultline Overclock Tag',icon:'🐉', desc:'Overclocks Kaiju Den (+2x Boss Loot)' }
];

export const TOWN_BUILDINGS = [
  { type:'bldg_tavern',   icon:'🍺', name:'Wayfarer Tavern',      desc:'Draft 1 of 3 random Adventurers & swap into Squad' },
  { type:'bldg_inn',      icon:'🛏️', name:'Hearthstone Inn',      desc:'Clear Overworld Fatigue & gain Well-Rested Shield' },
  { type:'bldg_shop',     icon:'🛒', name:'Peddler Bazaar',       desc:'Buy Rations, Pre-Typed Badges, Seals & rare Keys' },
  { type:'bldg_school',   icon:'🥋', name:'Technique School',     desc:'Learn Skill Packages for Clan Armory' },
  { type:'bldg_shrine',   icon:'⛩️', name:'Town Blessing Shrine', desc:'Receive a Sky-Shard Map Blessing' },
  { type:'bldg_keysmith', icon:'🔨', name:'Reliquary Keysmith',   desc:'Upgrade Key Level or Re-attune Key Element' }
];

export const UMBRELLA_GESTALTS = {
  Ki:       { name:'Grand Sect Echo Array',        short3:'3+ Ki: +1 Start Momentum & +10% SPD',              short5:'5/5 KI GESTALT: +2 Start Momentum, +15% SPD & 5-Strike Sect Echo Overdrive!' },
  Artifice: { name:'Voltron Super-Frame Combiner', short3:'3+ Artifice: +18 Start Shield & +1 Start AP',      short5:'5/5 ARTIFICE GESTALT: Voltron Combiner Overdrive (96 AoE + Clears All Heat + +40🛡)!' },
  Patterns: { name:'Grand Transmutation Circle',   short3:'3+ Patterns: +1 Start Residue',                    short5:'5/5 PATTERNS GESTALT: Transmutation Overdrive (88 AoE + Armor Break ALL + +2 Residue)!' },
  Mantles:  { name:'Sacred Arena Domain',          short3:'3+ Mantles: +1 Start Conviction & +14 Shield',     short5:'5/5 MANTLES GESTALT: Sacred Domain Overdrive (82 Light AoE + +45 Squad Shield + +2 Vow)!' },
  Tethers:  { name:'Great Beast Manifest',         short3:'3+ Tethers: Spawns +2 Paper Legion on Round 1',    short5:'5/5 TETHERS GESTALT: Great Beast Overdrive (3-Rnd Canopy Kaiju + +3 Legion + 82 Dark AoE)!' }
};
