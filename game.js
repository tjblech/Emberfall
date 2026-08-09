(() => {
"use strict";

const SAVE_KEY = "emberfall-tactical-save-v1";
const OLD_SAVE_KEY = "emberfall-save";
const SAVE_VERSION = 3;
const TICK_MS = 80;

const $ = id => document.getElementById(id);
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const shuffle = arr => [...arr].sort(() => Math.random()-.5);

const ITEM_DEFS = {
  rustblade:{name:"Rustblade",glyph:"†",rarity:"common",type:"weapon",shape:[[0,0],[0,1],[0,2]],damage:7,interval:1150,value:8,desc:"Plain steel. Gains +1 damage for each empty cell touching its blade.",tags:["blade"],emptyBonus:1},
  dagger:{name:"Split Dagger",glyph:"⌁",rarity:"common",type:"weapon",shape:[[0,0],[0,1]],damage:4,interval:650,value:7,desc:"Fast. Gains +8% crit chance for each adjacent weapon.",tags:["blade","dagger"],adjacentWeaponCrit:8},
  buckler:{name:"Iron Buckler",glyph:"◉",rarity:"common",type:"armor",shape:[[0,0],[1,0],[0,1]],armor:5,value:8,desc:"Compact protection. Blocks a little damage every enemy strike."},
  whetstone:{name:"Whetstone",glyph:"▰",rarity:"common",type:"utility",shape:[[0,0]],value:7,desc:"Adjacent weapons deal 25% more damage.",adjacentDamage:0.25},
  luckycoin:{name:"Notched Coin",glyph:"◇",rarity:"common",type:"utility",shape:[[0,0]],value:9,desc:"+7% crit chance and +12% gold from victories.",crit:7,goldMult:0.12},
  quiver:{name:"Field Quiver",glyph:"≡",rarity:"common",type:"utility",shape:[[0,0],[0,1]],value:10,desc:"Adjacent bows attack 25% faster and deal 20% more damage.",bowSpeed:0.25,bowDamage:0.20},

  warhammer:{name:"Gate Hammer",glyph:"┳",rarity:"rare",type:"weapon",shape:[[0,0],[1,0],[2,0],[1,1]],damage:18,interval:2300,value:22,desc:"Slow, brutal swings. 30% chance to stagger the enemy's next attack.",tags:["heavy"],stunChance:0.30},
  longblade:{name:"Pilgrim Longblade",glyph:"‡",rarity:"rare",type:"weapon",shape:[[0,0],[0,1],[0,2],[0,3]],damage:13,interval:1250,value:24,desc:"Awkward length. Gains +1.5 damage for each empty cell touching it.",tags:["blade"],emptyBonus:1.5},
  hunterbow:{name:"Hunter's Bow",glyph:")",rarity:"rare",type:"weapon",shape:[[0,0],[0,1],[1,0],[2,0]],damage:10,interval:900,value:23,desc:"Efficient ranged weapon. Quivers affect it twice as strongly.",tags:["bow"],quiverDouble:true},
  towershield:{name:"Wall Shield",glyph:"▣",rarity:"rare",type:"armor",shape:[[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]],armor:10,value:24,desc:"+10 armor. Gains +5 more while touching the left edge of the bag.",leftEdgeArmor:5},
  glasscannon:{name:"Glass Cannon",glyph:"━",rarity:"rare",type:"weapon",shape:[[0,0],[1,0],[2,0],[3,0]],damage:27,interval:1550,value:29,desc:"Huge damage in one straight row. Enemy hits deal 20% more damage to you.",tags:["heavy"],damageTaken:0.20},
  ironcharm:{name:"Iron Charm",glyph:"✣",rarity:"rare",type:"utility",shape:[[0,0],[1,0]],value:20,desc:"+2 armor for every adjacent armor item.",armorPerAdjacentArmor:2},

  venomknife:{name:"Venom Knife",glyph:"ϟ",rarity:"rare",type:"weapon",unlock:"venom",shape:[[0,0],[0,1],[1,1]],damage:6,interval:750,value:25,desc:"Applies 2 Poison each hit. Poison damages the enemy every second.",tags:["blade","dagger"],poison:2},
  venomvial:{name:"Viper Vial",glyph:"♢",rarity:"rare",type:"utility",unlock:"venom",shape:[[0,0]],value:22,desc:"Adjacent weapons apply +1 Poison per hit.",adjacentPoison:1},
  leechjar:{name:"Leech Jar",glyph:"◒",rarity:"rare",type:"utility",unlock:"venom",shape:[[0,0],[0,1]],value:25,desc:"Heal for 30% of all Poison damage dealt.",poisonLeech:0.30},

  stormcoil:{name:"Storm Coil",glyph:"ϟ",rarity:"rare",type:"utility",unlock:"arcane",shape:[[0,0],[1,0],[1,1]],value:31,desc:"Adjacent weapons attack 20% faster.",adjacentSpeed:0.20},
  arcwand:{name:"Arc Wand",glyph:"⌇",rarity:"rare",type:"weapon",unlock:"arcane",shape:[[0,0],[0,1],[1,1]],damage:8,interval:820,value:30,desc:"Deals +4 damage for each adjacent utility item.",tags:["arcane"],utilityAdjDamage:4},

  bloodletter:{name:"Bloodletter",glyph:"†",rarity:"cursed",type:"weapon",unlock:"cursed",shape:[[0,0],[0,1],[0,2]],damage:19,interval:900,value:34,desc:"Very fast, very strong. Each attack costs you 1 HP.",tags:["blade"],selfDamage:1},
  cursedfang:{name:"Hunger Fang",glyph:"⌁",rarity:"cursed",type:"weapon",unlock:"cursed",shape:[[0,0],[1,0],[1,1]],damage:11,interval:800,value:36,desc:"Gains +1 damage every 3 killing blows it claims during the run.",tags:["blade","dagger"],killGrowth:true},
  bloodstone:{name:"Bloodstone",glyph:"◆",rarity:"cursed",type:"utility",unlock:"cursed",shape:[[0,0]],value:30,desc:"Adjacent weapons gain 15% lifesteal, but your maximum HP is reduced by 10.",adjacentLifesteal:0.15,maxHpPenalty:10},

  crownsplinter:{name:"Crown Splinter",glyph:"♜",rarity:"relic",type:"utility",unlock:"relics",shape:[[0,0]],value:48,desc:"Weapons sharing this row deal 35% more damage.",sameRowDamage:0.35},
  ashclock:{name:"Ash Clock",glyph:"⧖",rarity:"relic",type:"utility",unlock:"relics",shape:[[0,0],[0,1]],value:52,desc:"Every weapon attacks 10% faster. Focus recharges 25% faster.",globalSpeed:0.10,focusSpeed:0.25},
  oathblade:{name:"Oathblade",glyph:"‡",rarity:"relic",type:"weapon",unlock:"relics",shape:[[0,0],[0,1],[0,2],[1,2]],damage:16,interval:1050,value:55,desc:"Deals +40% damage while your bag has no loose gear.",tags:["blade"],cleanBagDamage:0.40}
};

const LEGACY_UNLOCKS = [
  {id:"blacksmith",name:"The Blacksmith",cost:8,desc:"Blacksmith routes can appear. Forge a weapon to permanently strengthen it for that run."},
  {id:"cursed",name:"Cursed Vaults",cost:14,desc:"Adds dangerous cursed equipment with unusually strong tradeoffs to the loot pool."},
  {id:"venom",name:"Venomcraft",cost:16,desc:"Adds Poison weapons, Viper Vials and Leech Jars to future runs."},
  {id:"scavenger",name:"Scavenger Style",cost:20,desc:"Unlocks a second starting style built around compact gear, gold and rerolls."},
  {id:"relics",name:"Relic Hunting",cost:24,desc:"Adds run-defining relics. Bosses become much more likely to offer them."},
  {id:"arcane",name:"Stormcraft",cost:30,desc:"Adds Arc Wands and Storm Coils for high-speed utility builds."}
];

const CLASSES = {
  wanderer:{name:"Wanderer",desc:"80 HP · Rustblade + Buckler · balanced start",hp:80,cols:5,rows:5,gold:0,rerolls:0,start:["rustblade","buckler"]},
  scavenger:{name:"Scavenger",desc:"72 HP · Dagger + Whetstone · 12 gold · 1 loot reroll",hp:72,cols:5,rows:5,gold:12,rerolls:1,start:["dagger","whetstone"],unlock:"scavenger"}
};

const ENEMIES = [
  ["Road Cutter","A patient bandit testing your guard."],
  ["Grave Hound","Fast attacks. Low armor."],
  ["Marsh Pilgrim","Carries a crude shield."],
  ["Bone Collector","Hits hard but slowly."],
  ["Lantern Thief","Erratic footwork. Higher dodge."],
  ["Iron Penitent","Armored against ordinary weapon damage."],
  ["Mire Stalker","Weak, quick and unpleasant."],
  ["Ash Marauder","A veteran with no obvious weakness."]
];
const BOSSES = [
  ["The Toll Warden","A plated brute guarding the ruined bridge."],
  ["Saint of Rust","A giant wrapped in chains and old armor."],
  ["The Hollow King","A dead monarch with a living blade."],
  ["The Furnace Beast","It does not stop once it starts moving."]
];
const ROUTE_DEFS = {
  shrine:{id:"shrine",sigil:"✧",name:"Quiet Shrine",risk:"SAFE",desc:"Heal 35% max HP and bless the next loot choice, improving its quality."},
  hunt:{id:"hunt",sigil:"†",name:"Marked Trail",risk:"DANGEROUS",desc:"The next enemy becomes Elite. Elite spoils are guaranteed afterward."},
  trader:{id:"trader",sigil:"¤",name:"Pack Trader",risk:"VARIABLE",desc:"Spend gold on one of three pieces of gear, or walk away."},
  forge:{id:"forge",sigil:"⊥",name:"Blacksmith",risk:"SAFE",desc:"Choose one equipped weapon and forge it: +20% damage for the rest of the run."},
  vault:{id:"vault",sigil:"☒",name:"Sealed Vault",risk:"CURSED",desc:"Lose 15% max HP now to receive a guaranteed Cursed item choice."}
};

function defaultMeta(){
  return {essence:0,unlocks:{},selectedClass:"wanderer",discovered:{},bestFloor:1,bossKills:0,runsEnded:0,itemsFound:0};
}
function newRun(classId="wanderer"){
  const c=CLASSES[classId] || CLASSES.wanderer;
  const run={floor:1,gold:c.gold,hp:c.hp,baseMaxHp:c.hp,cols:c.cols,rows:c.rows,stashCap:3,items:[],stash:[],nextUid:1,rerolls:c.rerolls,bossKills:0,eliteNext:false,blessing:0,awaitingRoute:false,routeChoices:null,encounter:null,combat:null,notice:"",pendingAfterBoss:false};
  for(const id of c.start) addNewItemToRun(run,id,true);
  return run;
}
function defaultState(){ return {version:SAVE_VERSION,meta:defaultMeta(),run:newRun("wanderer")}; }

let state = loadState();
let selected = null;
let currentScreen = "bagScreen";
let combatTimer = null;
let lastTick = 0;
let combatLogLines = [];

function loadState(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw){
      const parsed=JSON.parse(raw);
      return normalizeState(parsed);
    }
  }catch(e){console.warn("Save load failed",e);}
  const fresh=defaultState();
  try{
    const oldRaw=localStorage.getItem(OLD_SAVE_KEY);
    if(oldRaw){
      const old=JSON.parse(oldRaw);
      const grant=Math.max(0,Math.floor((old.highestLevel||1)/3)+(old.ascensions||0)*5+(old.embers||0)*2);
      if(grant>0){ fresh.meta.essence+=grant; fresh.run.notice=`Old Emberfall progress converted into ${grant} Essence.`; }
    }
  }catch(e){/* keep old save untouched */}
  return fresh;
}
function normalizeState(s){
  const out={version:SAVE_VERSION,meta:{...defaultMeta(),...(s.meta||{})},run:s.run||null};
  out.meta.unlocks={...(s.meta?.unlocks||{})};
  out.meta.discovered={...(s.meta?.discovered||{})};
  if(out.run){
    out.run={floor:1,gold:0,hp:80,baseMaxHp:80,cols:5,rows:5,stashCap:3,items:[],stash:[],nextUid:1,rerolls:0,bossKills:0,eliteNext:false,blessing:0,awaitingRoute:false,routeChoices:null,encounter:null,combat:null,notice:"",pendingAfterBoss:false,...out.run};
    out.run.items=Array.isArray(out.run.items)?out.run.items:[];
    out.run.stash=Array.isArray(out.run.stash)?out.run.stash:[];
    if(out.run.combat) out.run.combat.running=false;
  }
  return out;
}
function save(){ localStorage.setItem(SAVE_KEY,JSON.stringify(state)); }

function itemDef(inst){ return ITEM_DEFS[inst.defId]; }
function rotatedShape(def,rotation=0){
  let pts=def.shape.map(([x,y])=>[x,y]);
  const turns=((rotation%4)+4)%4;
  for(let t=0;t<turns;t++){
    pts=pts.map(([x,y])=>[-y,x]);
    const minX=Math.min(...pts.map(p=>p[0])), minY=Math.min(...pts.map(p=>p[1]));
    pts=pts.map(([x,y])=>[x-minX,y-minY]);
  }
  return pts;
}
function itemCells(inst,x=inst.x,y=inst.y,rotation=inst.rotation){
  return rotatedShape(itemDef(inst),rotation).map(([dx,dy])=>[x+dx,y+dy]);
}
function cellKey(x,y){return `${x},${y}`;}
function occupiedMap(ignoreUid=null){
  const map=new Map();
  if(!state.run) return map;
  for(const it of state.run.items){
    if(it.uid===ignoreUid) continue;
    for(const [x,y] of itemCells(it)) map.set(cellKey(x,y),it.uid);
  }
  return map;
}
function canPlace(inst,x,y,rotation=inst.rotation){
  const r=state.run; if(!r) return false;
  const occ=occupiedMap(inst.uid);
  for(const [cx,cy] of itemCells(inst,x,y,rotation)){
    if(cx<0||cy<0||cx>=r.cols||cy>=r.rows||occ.has(cellKey(cx,cy))) return false;
  }
  return true;
}
function firstFit(inst){
  const r=state.run;
  for(let rot=0;rot<4;rot++) for(let y=0;y<r.rows;y++) for(let x=0;x<r.cols;x++) if(canPlace(inst,x,y,rot)) return {x,y,rotation:rot};
  return null;
}
function addNewItemToRun(run,defId,starting=false){
  const inst={uid:run.nextUid++,defId,x:null,y:null,rotation:0,forge:0,kills:0};
  const def=ITEM_DEFS[defId];
  const cellsTaken=new Set();
  run.items.forEach(it=>rotatedShape(ITEM_DEFS[it.defId],it.rotation).forEach(([dx,dy])=>cellsTaken.add(cellKey(it.x+dx,it.y+dy))));
  let fit=null;
  outer: for(let rot=0;rot<4;rot++) for(let y=0;y<run.rows;y++) for(let x=0;x<run.cols;x++){
    const pts=rotatedShape(def,rot).map(([dx,dy])=>[x+dx,y+dy]);
    if(pts.every(([cx,cy])=>cx>=0&&cy>=0&&cx<run.cols&&cy<run.rows&&!cellsTaken.has(cellKey(cx,cy)))){fit={x,y,rotation:rot};break outer;}
  }
  if(fit){Object.assign(inst,fit);run.items.push(inst);} else run.stash.push(inst);
  return inst;
}
function addLootItem(defId){
  const r=state.run; if(!r) return;
  const inst={uid:r.nextUid++,defId,x:null,y:null,rotation:0,forge:0,kills:0};
  const fit=firstFit(inst);
  if(fit){Object.assign(inst,fit);r.items.push(inst);r.notice=`${ITEM_DEFS[defId].name} fitted into the first open space. Rearrange it if you want.`;}
  else {r.stash.push(inst);r.notice=`${ITEM_DEFS[defId].name} went to Loose Gear. Fit or scrap gear before the pouch overflows.`;}
  state.meta.discovered[defId]=true; state.meta.itemsFound++; save();
}
function removeItem(uid){
  const r=state.run;
  let idx=r.items.findIndex(i=>i.uid===uid); if(idx>=0) return r.items.splice(idx,1)[0];
  idx=r.stash.findIndex(i=>i.uid===uid); if(idx>=0) return r.stash.splice(idx,1)[0];
  return null;
}
function findItem(uid){ return state.run?.items.find(i=>i.uid===uid)||state.run?.stash.find(i=>i.uid===uid)||null; }
function isPlaced(uid){ return !!state.run?.items.some(i=>i.uid===uid); }
function rarityClass(r){return r==="rare"?"rare":r==="relic"?"relic":r==="cursed"?"cursed":"";}
function rarityLabel(r){return r.toUpperCase();}
function itemValue(def){return def.value||8;}

function adjacentItems(inst){
  if(!state.run||!isPlaced(inst.uid)) return [];
  const own=new Set(itemCells(inst).map(([x,y])=>cellKey(x,y)));
  const ids=new Set();
  for(const [x,y] of itemCells(inst)){
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
      const k=cellKey(x+dx,y+dy); if(own.has(k)) return;
      const uid=occupiedMap(inst.uid).get(k); if(uid) ids.add(uid);
    });
  }
  return [...ids].map(findItem).filter(Boolean);
}
function emptyAdjacentCount(inst){
  if(!state.run||!isPlaced(inst.uid)) return 0;
  const occ=occupiedMap(); const own=new Set(itemCells(inst).map(([x,y])=>cellKey(x,y))); const empty=new Set();
  for(const [x,y] of itemCells(inst)) for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy,k=cellKey(nx,ny);
    if(nx>=0&&ny>=0&&nx<state.run.cols&&ny<state.run.rows&&!own.has(k)&&!occ.has(k)) empty.add(k);
  }
  return empty.size;
}
function sharesRow(a,b){
  const rowsA=new Set(itemCells(a).map(c=>c[1]));
  return itemCells(b).some(c=>rowsA.has(c[1]));
}

function getRunStats(){
  const r=state.run;
  if(!r) return {maxHp:0,armor:0,crit:0,dodge:0,goldMult:0,damageTaken:0,poisonLeech:0,globalSpeed:0,focusSpeed:0};
  let stats={maxHp:r.baseMaxHp,armor:0,crit:5,dodge:3,goldMult:0,damageTaken:0,poisonLeech:0,globalSpeed:0,focusSpeed:0};
  for(const it of r.items){
    const d=itemDef(it);
    stats.armor += d.armor||0; stats.crit += d.crit||0; stats.dodge += d.dodge||0; stats.goldMult += d.goldMult||0;
    stats.damageTaken += d.damageTaken||0; stats.maxHp -= d.maxHpPenalty||0; stats.poisonLeech += d.poisonLeech||0; stats.globalSpeed += d.globalSpeed||0; stats.focusSpeed += d.focusSpeed||0;
    if(d.leftEdgeArmor && itemCells(it).some(([x])=>x===0)) stats.armor+=d.leftEdgeArmor;
    if(d.armorPerAdjacentArmor) stats.armor += adjacentItems(it).filter(x=>itemDef(x).type==="armor").length*d.armorPerAdjacentArmor;
  }
  stats.maxHp=Math.max(20,stats.maxHp); stats.crit=clamp(stats.crit,0,75); stats.dodge=clamp(stats.dodge,0,50);
  return stats;
}
function weaponRuntime(inst){
  const d=itemDef(inst), stats=getRunStats();
  let damage=(d.damage||0)*(1+(inst.forge||0)*0.20), interval=d.interval||1000, crit=stats.crit, poison=d.poison||0, lifesteal=0;
  const adj=adjacentItems(inst);
  if(d.emptyBonus) damage += emptyAdjacentCount(inst)*d.emptyBonus;
  if(d.adjacentWeaponCrit) crit += adj.filter(x=>itemDef(x).type==="weapon").length*d.adjacentWeaponCrit;
  if(d.utilityAdjDamage) damage += adj.filter(x=>itemDef(x).type==="utility").length*d.utilityAdjDamage;
  if(d.killGrowth) damage += Math.floor((inst.kills||0)/3);
  for(const other of adj){
    const p=itemDef(other);
    if(p.adjacentDamage) damage*=1+p.adjacentDamage;
    if(p.adjacentSpeed) interval*=1-p.adjacentSpeed;
    if(p.adjacentPoison) poison+=p.adjacentPoison;
    if(p.adjacentLifesteal) lifesteal+=p.adjacentLifesteal;
    if(d.tags?.includes("bow") && p.bowSpeed){ const mult=d.quiverDouble?2:1; interval*=1-p.bowSpeed*mult; damage*=1+(p.bowDamage||0)*mult; }
  }
  for(const other of state.run.items){
    const p=itemDef(other);
    if(p.sameRowDamage && sharesRow(inst,other)) damage*=1+p.sameRowDamage;
  }
  if(d.cleanBagDamage && state.run.stash.length===0) damage*=1+d.cleanBagDamage;
  interval*=1-stats.globalSpeed;
  return {damage:Math.max(1,damage),interval:Math.max(240,interval),crit:clamp(crit,0,90),poison,lifesteal,stunChance:d.stunChance||0,selfDamage:d.selfDamage||0};
}
function packPower(){
  if(!state.run) return 0;
  return Math.round(state.run.items.filter(i=>itemDef(i).type==="weapon").reduce((sum,it)=>{const w=weaponRuntime(it);return sum+(w.damage*1000/w.interval);},0));
}
function effectDescriptions(){
  if(!state.run) return [];
  const out=[];
  const stats=getRunStats();
  if(stats.goldMult) out.push(["Scavenge",`+${Math.round(stats.goldMult*100)}% gold`]);
  if(stats.poisonLeech) out.push(["Leech",`${Math.round(stats.poisonLeech*100)}% poison heal`]);
  if(stats.globalSpeed) out.push(["Ash Clock",`+${Math.round(stats.globalSpeed*100)}% speed`]);
  const synergies=state.run.items.filter(i=>adjacentItems(i).length>0).length;
  if(synergies) out.push(["Links",`${synergies} items touching gear`]);
  if(!out.length) out.push(["None","Rearrange gear to create links"]);
  return out;
}

function ensureEncounter(){
  const r=state.run; if(!r||r.awaitingRoute) return null;
  if(r.encounter && r.encounter.floor===r.floor) return r.encounter;
  const boss=r.floor%10===0;
  const elite=!boss&&r.eliteNext;
  const source=boss?BOSSES:ENEMIES;
  const idx=(r.floor-1)%source.length;
  const [name,note]=source[idx];
  const hpBase=26+r.floor*9+Math.pow(r.floor,1.25)*2;
  const damageBase=4+r.floor*1.05;
  const interval= boss?1450: elite?1250: 1550-Math.min(300,r.floor*7);
  const traits=[];
  if(!boss && r.floor%6===0) traits.push("armored");
  if(!boss && r.floor%5===0) traits.push("quick");
  if(!boss && r.floor%7===0) traits.push("evasive");
  const mult=boss?3.0:elite?1.8:1;
  r.encounter={floor:r.floor,name,note,boss,elite,maxHp:Math.round(hpBase*mult),hp:Math.round(hpBase*mult),damage:Math.round(damageBase*(boss?1.45:elite?1.25:1)),interval:traits.includes("quick")?Math.round(interval*.78):interval,traits,poison:0,bleed:0};
  r.eliteNext=false; save(); return r.encounter;
}
function biomeName(floor){
  const biomes=["THE OLD ROAD","MIRE HOLLOW","THE BARROW FIELDS","RUSTWOOD","BLACK KEEP"];
  return biomes[Math.floor((floor-1)/8)%biomes.length];
}

function renderAll(){
  renderHeader(); renderBag(); renderStats(); renderInspect(); renderStash(); renderBattle(); renderPath(); renderLegacy(); renderCodex(); renderSystem();
  if(state.run?.notice){$("bagHint").textContent=state.run.notice; state.run.notice=""; save();}
}
function renderHeader(){
  const r=state.run;
  $("floorTop").textContent=r?`FLOOR ${r.floor}`:"BETWEEN RUNS";
  $("biomeTop").textContent=r?biomeName(r.floor):"THE EMBERS REMAIN";
  $("goldTop").textContent=r?r.gold:0; $("essenceTop").textContent=state.meta.essence;
}
function renderStats(){
  const r=state.run;
  if(!r){$("hpText").textContent="—";return;}
  const s=getRunStats(); if(r.hp>s.maxHp) r.hp=s.maxHp;
  $("hpText").textContent=`${Math.ceil(r.hp)} / ${s.maxHp}`; $("hpFill").style.width=`${clamp(r.hp/s.maxHp*100,0,100)}%`;
  $("powerStat").textContent=packPower(); $("armorStat").textContent=s.armor; $("critStat").textContent=`${s.crit}%`; $("dodgeStat").textContent=`${s.dodge}%`;
  $("effectsList").innerHTML=effectDescriptions().map(([a,b])=>`<div class="effect-line"><span>${a}</span><b>${b}</b></div>`).join("");
}
function renderBag(){
  const grid=$("bagGrid"); const r=state.run;
  if(!r){grid.innerHTML='<div class="muted">Begin a new run from Legacy.</div>';return;}
  grid.style.setProperty("--cols",r.cols); grid.style.aspectRatio=`${r.cols}/${r.rows}`; grid.innerHTML="";
  const occ=occupiedMap(); const selectedItem=selected?findItem(selected.uid):null;
  for(let y=0;y<r.rows;y++) for(let x=0;x<r.cols;x++){
    const cell=document.createElement("div"); cell.className="bag-cell"; cell.dataset.x=x;cell.dataset.y=y;
    const uid=occ.get(cellKey(x,y));
    if(uid){
      const it=findItem(uid),d=itemDef(it),cells=itemCells(it),anchor=cells[0][0]===x&&cells[0][1]===y;
      const node=document.createElement("div"); node.className=`item-cell ${rarityClass(d.rarity)} ${selected?.uid===uid?"selected":""} ${anchor?"anchor":""}`; node.dataset.uid=uid; node.dataset.glyph=d.glyph;
      if(anchor){const lab=document.createElement("span");lab.className="item-label";lab.textContent=d.name;node.appendChild(lab);}
      cell.appendChild(node);
    }
    cell.addEventListener("click",()=>handleBagCellClick(x,y,uid)); grid.appendChild(cell);
  }
  const used=r.items.reduce((n,it)=>n+itemCells(it).length,0); $("bagUsage").textContent=`${used} / ${r.cols*r.rows} CELLS`;
  if(selectedItem && !isPlaced(selectedItem.uid)) previewPlacementHighlights(selectedItem);
}
function previewPlacementHighlights(inst){
  // Stashed gear can be placed by selecting it and tapping a potential top-left cell.
  document.querySelectorAll(".bag-cell").forEach(cell=>{
    const x=+cell.dataset.x,y=+cell.dataset.y;
    if(canPlace(inst,x,y,inst.rotation)) cell.classList.add("valid-target");
  });
}
function renderInspect(){
  const it=selected?findItem(selected.uid):null;
  $("inspectEmpty").classList.toggle("hidden",!!it); $("inspectCard").classList.toggle("hidden",!it);
  ["rotateBtn","stashBtn","dropBtn"].forEach(id=>$(id).disabled=!it);
  if(!it) return;
  const d=itemDef(it); $("stashBtn").disabled=!isPlaced(it.uid); $("inspectRarity").textContent=rarityLabel(d.rarity); $("inspectName").textContent=d.name; $("inspectIcon").textContent=d.glyph; $("inspectDesc").textContent=d.desc;
  const stats=[];
  if(d.type==="weapon"){const w=weaponRuntime(it);stats.push(["DAMAGE",w.damage.toFixed(1)],["INTERVAL",`${(w.interval/1000).toFixed(2)}s`],["CRIT",`${w.crit}%`]);if(w.poison)stats.push(["POISON",`+${w.poison}/hit`]);}
  if(d.armor) stats.push(["ARMOR",`+${d.armor}`]);
  if(it.forge) stats.push(["FORGE",`+${it.forge} (${it.forge*20}% dmg)`]);
  if(d.killGrowth) stats.push(["KILLING BLOWS",it.kills||0]);
  stats.push(["SCRAP VALUE",`${itemValue(d)}g`]);
  $("inspectStats").innerHTML=stats.map(([a,b])=>`<div><span>${a}</span><span>${b}</span></div>`).join("");
  const shape=rotatedShape(d,it.rotation); const w=Math.max(...shape.map(p=>p[0]))+1,h=Math.max(...shape.map(p=>p[1]))+1; $("inspectShape").textContent=`${shape.length} CELLS · ${w}×${h} CURRENT SHAPE`;
}
function renderStash(){
  const el=$("stashList"),r=state.run; if(!r){el.innerHTML="";return;}
  el.innerHTML=r.stash.map(it=>{const d=itemDef(it);return `<button class="stash-card ${selected?.uid===it.uid?"selected":""}" data-uid="${it.uid}"><b>${d.glyph} ${d.name}</b><span>${rarityLabel(d.rarity)} · ${d.shape.length} cells</span></button>`;}).join("") || '<div class="muted" style="font-size:10px">No loose gear.</div>';
  el.querySelectorAll(".stash-card").forEach(b=>b.onclick=()=>{selected={uid:+b.dataset.uid};renderBag();renderInspect();renderStash();});
  if(r.stash.length>r.stashCap) el.insertAdjacentHTML("afterbegin",`<div class="stash-card" style="border-color:#7a443d;color:#d59589"><b>POUCH OVERFULL</b><span>${r.stash.length}/${r.stashCap}. Fit or scrap gear before fighting.</span></div>`);
}
function handleBagCellClick(x,y,uid){
  if(uid){ selected={uid}; renderBag();renderInspect();renderStash();return; }
  if(!selected) return;
  const it=findItem(selected.uid); if(!it) return;
  if(canPlace(it,x,y,it.rotation)){
    const wasPlaced=isPlaced(it.uid); if(wasPlaced){it.x=x;it.y=y;} else {state.run.stash=state.run.stash.filter(i=>i.uid!==it.uid);it.x=x;it.y=y;state.run.items.push(it);}
    state.run.notice=`Placed ${itemDef(it).name}.`; save(); renderAll();
  } else {$("bagHint").textContent="That shape does not fit there.";}
}
function rotateSelected(){
  const it=selected?findItem(selected.uid):null;if(!it)return;const next=(it.rotation+1)%4;
  if(isPlaced(it.uid)&&!canPlace(it,it.x,it.y,next)){state.run.notice="No room to rotate it here.";renderAll();return;}
  it.rotation=next;save();renderAll();
}
function stashSelected(){
  const it=selected?findItem(selected.uid):null;if(!it||!isPlaced(it.uid))return;
  state.run.items=state.run.items.filter(i=>i.uid!==it.uid);it.x=null;it.y=null;state.run.stash.push(it);save();renderAll();
}
function scrapSelected(){
  const it=selected?findItem(selected.uid):null;if(!it)return;const d=itemDef(it);
  if(!confirm(`Scrap ${d.name} for ${itemValue(d)} gold?`)) return;
  removeItem(it.uid);state.run.gold+=itemValue(d);selected=null;save();renderAll();
}

function renderBattle(){
  const r=state.run;
  if(!r){$("fightBtn").disabled=true;$("combatLog").textContent="Begin a new run from Legacy.";return;}
  if(r.awaitingRoute){$("fightBtn").disabled=true;$("combatLog").textContent="The road has forked. Choose a route before the next fight.";return;}
  const e=ensureEncounter(); const stats=getRunStats();
  $("enemyName").textContent=e.name; $("enemyType").textContent=e.boss?"BOSS":e.elite?"ELITE":"HOSTILE"; $("enemyTrait").textContent=e.traits.length?e.traits.map(t=>t.toUpperCase()).join(" · "):"NO SPECIAL TRAIT"; $("floorStamp").textContent=String(r.floor).padStart(2,"0");
  $("enemyHpText").textContent=`${Math.max(0,Math.ceil(e.hp))} / ${e.maxHp}`; $("enemyHpFill").style.width=`${clamp(e.hp/e.maxHp*100,0,100)}%`; $("enemyHpLabel").textContent=e.name.toUpperCase();
  $("enemySilhouette").className=`enemy-silhouette ${e.boss?"boss":e.elite?"elite":""}`; $("encounterNotes").textContent=e.note+(e.traits.includes("armored")?" Ordinary hits are reduced by 18%.":"")+(e.traits.includes("evasive")?" It may avoid attacks.":"");
  const weapons=r.items.filter(i=>itemDef(i).type==="weapon");
  $("combatItems").innerHTML=weapons.map(it=>{const d=itemDef(it),w=weaponRuntime(it);return `<div class="combat-item"><div class="sigil">${d.glyph}</div><div><b>${d.name}</b><small>${w.damage.toFixed(0)} dmg${w.poison?` · ${w.poison} poison`:""}</small></div><div class="cool">${(w.interval/1000).toFixed(2)}s</div></div>`;}).join("")||'<div class="muted" style="font-size:10px">No weapon equipped.</div>';
  const blocked=r.stash.length>r.stashCap||weapons.length===0;
  $("fightBtn").disabled=blocked||!!r.combat?.running; $("fightBtn").textContent=r.combat?.running?"FIGHTING…":e.hp<e.maxHp?"RESUME FIGHT":"START FIGHT";
  $("focusBtn").disabled=!r.combat?.running; $("combatLog").textContent=combatLogLines.length?combatLogLines.join("\n"):(blocked?(weapons.length===0?"Fit at least one weapon into your bag.":"Your loose-gear pouch is over capacity. Fit or scrap something."):"Your pack is ready. Start when you are.");
  renderFocusCooldown();
}
function logCombat(line){combatLogLines.unshift(line);combatLogLines=combatLogLines.slice(0,4);$("combatLog").textContent=combatLogLines.join("\n");}
function startFight(){
  const r=state.run,e=ensureEncounter(); if(!r||r.awaitingRoute||r.stash.length>r.stashCap)return;
  const weapons=r.items.filter(i=>itemDef(i).type==="weapon");if(!weapons.length)return;
  const cooldowns={};weapons.forEach(it=>cooldowns[it.uid]=Math.random()*250);
  r.combat={running:true,cooldowns,enemyTimer:450,poisonTimer:1000,focusUntil:0,focusReadyAt:0,lastHitUid:null};
  combatLogLines=[];logCombat("Steel out. The fight begins.");lastTick=performance.now();clearInterval(combatTimer);combatTimer=setInterval(combatTick,TICK_MS);save();renderBattle();
}
function stopCombat(){clearInterval(combatTimer);combatTimer=null;if(state.run?.combat)state.run.combat.running=false;}
function combatTick(){
  const r=state.run,e=r?.encounter,c=r?.combat;if(!r||!e||!c?.running)return;
  const now=performance.now(),dt=Math.min(250,now-lastTick);lastTick=now;const stats=getRunStats();const focusMult=Date.now()<c.focusUntil?1.8:1;
  for(const it of r.items.filter(i=>itemDef(i).type==="weapon")){
    c.cooldowns[it.uid]=(c.cooldowns[it.uid]??0)-dt*focusMult;
    if(c.cooldowns[it.uid]<=0){
      const w=weaponRuntime(it),d=itemDef(it);let dmg=w.damage;let crit=Math.random()*100<w.crit;
      if(e.traits.includes("evasive")&&Math.random()<0.12){logCombat(`${d.name} misses.`);c.cooldowns[it.uid]+=w.interval;continue;}
      if(crit)dmg*=1.7;if(e.traits.includes("armored")&&!d.tags?.includes("arcane"))dmg*=0.82;
      dmg=Math.max(1,Math.round(dmg));e.hp-=dmg;c.lastHitUid=it.uid;
      if(w.poison)e.poison+=w.poison;if(w.lifesteal)r.hp=Math.min(stats.maxHp,r.hp+dmg*w.lifesteal);
      if(w.selfDamage){r.hp-=w.selfDamage;if(r.hp<=0){playerDeath();return;}}
      if(w.stunChance&&Math.random()<w.stunChance){c.enemyTimer+=500;logCombat(`${d.name} staggers ${e.name}.`);} else logCombat(`${d.name} ${crit?"CRITS for":"hits for"} ${dmg}.`);
      c.cooldowns[it.uid]+=w.interval;
      if(e.hp<=0){victory();return;}
    }
  }
  c.poisonTimer-=dt;
  if(c.poisonTimer<=0){
    if(e.poison>0){const pd=Math.max(1,Math.floor(e.poison));e.hp-=pd;if(stats.poisonLeech)r.hp=Math.min(stats.maxHp,r.hp+pd*stats.poisonLeech);logCombat(`Poison burns for ${pd}.`);e.poison=Math.max(0,e.poison-1);if(e.hp<=0){victory();return;}}
    c.poisonTimer+=1000;
  }
  c.enemyTimer-=dt;
  if(c.enemyTimer<=0){
    if(Math.random()*100<stats.dodge){logCombat(`You evade ${e.name}'s strike.`);} else {
      let dmg=Math.max(1,Math.round((e.damage-stats.armor*.42)*(1+stats.damageTaken)));r.hp-=dmg;logCombat(`${e.name} hits you for ${dmg}.`);
      if(r.hp<=0){playerDeath();return;}
    }
    c.enemyTimer+=e.interval;
  }
  $("enemyHpText").textContent=`${Math.max(0,Math.ceil(e.hp))} / ${e.maxHp}`;$("enemyHpFill").style.width=`${clamp(e.hp/e.maxHp*100,0,100)}%`;$("hpText").textContent=`${Math.max(0,Math.ceil(r.hp))} / ${stats.maxHp}`;$("hpFill").style.width=`${clamp(r.hp/stats.maxHp*100,0,100)}%`;renderFocusCooldown();
  if(Math.random()<.03)save();
}
function useFocus(){
  const r=state.run,c=r?.combat;if(!c?.running)return;const now=Date.now();if(now<c.focusReadyAt)return;
  const stats=getRunStats();c.focusUntil=now+4000;c.focusReadyAt=now+Math.round(12000*(1-stats.focusSpeed));logCombat("FOCUS — your whole pack accelerates.");renderFocusCooldown();
}
function renderFocusCooldown(){
  const c=state.run?.combat;if(!c?.running){$("focusCooldown").textContent="";return;}const left=Math.max(0,c.focusReadyAt-Date.now());$("focusBtn").disabled=left>0;$("focusCooldown").textContent=left>0?` ${Math.ceil(left/1000)}s`:" READY";
}
function victory(){
  const r=state.run,e=r.encounter,c=r.combat;stopCombat();const stats=getRunStats();
  if(c?.lastHitUid){const it=findItem(c.lastHitUid);if(it)it.kills=(it.kills||0)+1;}
  const gold=Math.round((7+r.floor*2.3)*(e.elite?1.7:e.boss?2.4:1)*(1+stats.goldMult));r.gold+=gold;
  if(e.boss){r.bossKills++;state.meta.bossKills++;r.pendingAfterBoss=true;}
  state.meta.bestFloor=Math.max(state.meta.bestFloor,r.floor);logCombat(`${e.name} falls. +${gold} gold.`);save();renderAll();
  const rewardDue=e.boss||e.elite||r.floor%3===0;
  setTimeout(()=>{if(rewardDue)showLootReward(e.boss?"boss":e.elite?"elite":"normal");else finishBattleAdvance();},250);
}
function finishBattleAdvance(){
  const r=state.run;if(!r)return;const completed=r.floor;r.floor++;r.encounter=null;r.combat=null;
  if(completed%4===0&&completed%10!==0){r.awaitingRoute=true;save();showScreen("pathScreen");renderAll();}
  else {save();showScreen("battleScreen");renderAll();}
}
function playerDeath(){
  const r=state.run;if(!r)return;stopCombat();const earned=Math.max(3,Math.floor(r.floor*.85)+r.bossKills*5);state.meta.essence+=earned;state.meta.runsEnded++;state.meta.bestFloor=Math.max(state.meta.bestFloor,r.floor);const summary={floor:r.floor,gold:r.gold,earned,bosses:r.bossKills};state.run=null;selected=null;save();renderAll();
  openModal(`<div class="eyebrow">RUN ENDED</div><h2>The road takes what it is owed.</h2><p>You reached floor <b>${summary.floor}</b>, killed <b>${summary.bosses}</b> boss(es), and carried <b>${summary.gold}</b> gold when you fell.</p><div class="rule"></div><h2>+${summary.earned} Essence</h2><p>Essence survives. Spend it on new item pools, routes and starting styles.</p><button class="btn primary full" id="toLegacy">OPEN LEGACY</button>`,false);
  $("toLegacy").onclick=()=>{closeModal();showScreen("legacyScreen");};
}

function eligibleDefs(){
  return Object.entries(ITEM_DEFS).filter(([id,d])=>!d.unlock||state.meta.unlocks[d.unlock]).map(([id])=>id);
}
function randomLoot(tier="normal"){
  const ids=eligibleDefs();
  const weights={normal:{common:70,rare:26,relic:3,cursed:5},elite:{common:25,rare:62,relic:8,cursed:12},boss:{common:0,rare:60,relic:35,cursed:12}}[tier];
  const pool=ids.map(id=>({id,w:weights[ITEM_DEFS[id].rarity]||0})).filter(x=>x.w>0);
  const choices=[];
  while(choices.length<3&&pool.length){
    const total=pool.reduce((s,x)=>s+x.w,0);let roll=Math.random()*total,index=0;
    for(;index<pool.length;index++){roll-=pool[index].w;if(roll<=0)break;}
    choices.push(pool[Math.min(index,pool.length-1)].id);pool.splice(Math.min(index,pool.length-1),1);
  }
  return choices;
}
function shapeAscii(def){
  const pts=rotatedShape(def,0),w=Math.max(...pts.map(p=>p[0]))+1,h=Math.max(...pts.map(p=>p[1]))+1,set=new Set(pts.map(([x,y])=>cellKey(x,y)));let lines=[];
  for(let y=0;y<h;y++){let line="";for(let x=0;x<w;x++)line+=set.has(cellKey(x,y))?"■ ":"  ";lines.push(line.trimEnd());}return lines.join("\n");
}
function showLootReward(tier,after=null){
  const r=state.run;if(!r)return;
  let effectiveTier=tier;
  if(r.blessing>0){ effectiveTier=tier==="normal"?"elite":tier==="elite"?"boss":tier; r.blessing--; save(); }
  const choices=randomLoot(effectiveTier);
  const title=tier==="boss"?"BOSS CACHE":tier==="elite"?"ELITE SPOILS":"CHOOSE ONE";
  const html=`<div class="eyebrow">${title}</div><h2>What earns a place in your pack?</h2><p>You can rearrange it after choosing. If it cannot fit, it goes to Loose Gear.</p><div class="loot-grid">${choices.map(id=>{const d=ITEM_DEFS[id];return `<button class="loot-card ${rarityClass(d.rarity)}" data-loot="${id}"><div class="rarity">${rarityLabel(d.rarity)}</div><div class="loot-shape">${shapeAscii(d)}</div><h3>${d.glyph} ${d.name}</h3><p>${d.desc}</p></button>`;}).join("")}</div>${r.rerolls>0?`<button class="btn secondary full" style="margin-top:8px" id="rerollLoot">REROLL (${r.rerolls})</button>`:""}`;
  openModal(html,false);
  document.querySelectorAll("[data-loot]").forEach(b=>b.onclick=()=>{addLootItem(b.dataset.loot);closeModal();if(after){after();}else if(r.pendingAfterBoss){r.pendingAfterBoss=false;showBagExpansion();}else finishBattleAdvance();});
  if($("rerollLoot")) $("rerollLoot").onclick=()=>{r.rerolls--;save();showLootReward(tier,after);};
}
function showBagExpansion(){
  const r=state.run;if(!r)return;const choices=[];
  if(r.rows<6)choices.push({id:"row",name:"Sew a New Row",desc:`Bag becomes ${r.cols}×${r.rows+1}. More room, more possible builds.`});
  if(r.cols<7)choices.push({id:"col",name:"Widen the Pack",desc:`Bag becomes ${r.cols+1}×${r.rows}. Long weapons become easier to fit.`});
  choices.push({id:"pouch",name:"Add Side Pouches",desc:"Loose Gear capacity +2. Carry more options between fights."});
  choices.push({id:"reinforce",name:"Reinforce the Harness",desc:"+12 base max HP and heal 20 HP. Less space, more survival."});
  openModal(`<div class="eyebrow">BOSS REWARD</div><h2>Alter the pack itself.</h2><p>This choice lasts for the rest of the run.</p><div class="choice-list">${shuffle(choices).slice(0,3).map(c=>`<button class="choice-btn" data-expand="${c.id}"><b>${c.name}</b><span>${c.desc}</span></button>`).join("")}</div>`,false);
  document.querySelectorAll("[data-expand]").forEach(b=>b.onclick=()=>{const id=b.dataset.expand;if(id==="row")r.rows++;if(id==="col")r.cols++;if(id==="pouch")r.stashCap+=2;if(id==="reinforce"){r.baseMaxHp+=12;r.hp=Math.min(getRunStats().maxHp,r.hp+20);}save();closeModal();finishBattleAdvance();});
}

function routePool(){
  const ids=["shrine","hunt","trader"];
  if(state.meta.unlocks.blacksmith) ids.push("forge");
  if(state.meta.unlocks.cursed) ids.push("vault");
  return shuffle(ids).slice(0,3).map(id=>ROUTE_DEFS[id]);
}
function renderPath(){
  const el=$("routeChoices"),r=state.run;
  if(!r){el.innerHTML='<div class="muted">No active run.</div>';return;}
  if(!r.awaitingRoute){el.innerHTML='<div class="muted">No fork right now. The next route appears after several fights.</div>';return;}
  if(!Array.isArray(r.routeChoices)||!r.routeChoices.length){r.routeChoices=routePool().map(x=>x.id);save();}
  const routes=r.routeChoices.map(id=>ROUTE_DEFS[id]).filter(Boolean);el.innerHTML=routes.map(x=>`<button class="route-card" data-route="${x.id}"><div class="route-sigil">${x.sigil}</div><div class="risk">${x.risk}</div><h3>${x.name}</h3><p>${x.desc}</p></button>`).join("");el.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>chooseRoute(b.dataset.route));
}
function finishRoute(){state.run.awaitingRoute=false;state.run.routeChoices=null;save();showScreen("battleScreen");renderAll();}
function chooseRoute(id){
  const r=state.run;if(!r)return;
  if(id==="shrine"){const s=getRunStats();r.hp=Math.min(s.maxHp,r.hp+s.maxHp*.35);r.blessing++;r.notice="The shrine restored you. Your next loot cache is blessed.";finishRoute();return;}
  if(id==="hunt"){r.eliteNext=true;r.gold+=8;r.notice="You take the marked trail. The next enemy is Elite.";finishRoute();return;}
  if(id==="forge"){showForgeModal();return;}
  if(id==="trader"){showTraderModal();return;}
  if(id==="vault"){const s=getRunStats();r.hp=Math.max(1,r.hp-s.maxHp*.15);save();showLootReward("elite",()=>finishRoute());return;}
}
function showForgeModal(){
  const weapons=state.run.items.filter(i=>itemDef(i).type==="weapon");
  if(!weapons.length){state.run.gold+=15;state.run.notice="The smith finds nothing to forge and pays 15 gold for scrap stories.";finishRoute();return;}
  openModal(`<div class="eyebrow">BLACKSMITH</div><h2>Choose a weapon to forge.</h2><div class="choice-list">${weapons.map(it=>{const d=itemDef(it);return `<button class="choice-btn" data-forge="${it.uid}"><b>${d.glyph} ${d.name}</b><span>Forge ${it.forge||0} → ${(it.forge||0)+1} · +20% base damage</span></button>`;}).join("")}</div>`,false);
  document.querySelectorAll("[data-forge]").forEach(b=>b.onclick=()=>{const it=findItem(+b.dataset.forge);it.forge=(it.forge||0)+1;closeModal();state.run.notice=`${itemDef(it).name} was forged.`;finishRoute();});
}
function showTraderModal(){
  const choices=randomLoot("normal"),r=state.run;
  openModal(`<div class="eyebrow">PACK TRADER</div><h2>Gold talks. Space argues.</h2><p>You have ${r.gold} gold.</p><div class="loot-grid">${choices.map(id=>{const d=ITEM_DEFS[id],cost=Math.round(itemValue(d)*1.4);return `<button class="loot-card ${rarityClass(d.rarity)}" data-buy="${id}" data-cost="${cost}" ${r.gold<cost?"disabled":""}><div class="rarity">${cost} GOLD</div><div class="loot-shape">${shapeAscii(d)}</div><h3>${d.glyph} ${d.name}</h3><p>${d.desc}</p></button>`;}).join("")}</div><button class="btn secondary full" style="margin-top:8px" id="walkAway">WALK AWAY</button>`,false);
  document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{const cost=+b.dataset.cost;if(r.gold<cost)return;r.gold-=cost;addLootItem(b.dataset.buy);closeModal();finishRoute();});$("walkAway").onclick=()=>{closeModal();finishRoute();};
}

function renderLegacy(){
  $("legacyUnlocks").innerHTML=LEGACY_UNLOCKS.map(u=>{const unlocked=!!state.meta.unlocks[u.id];return `<div class="unlock-card ${unlocked?"unlocked":""}"><div class="eyebrow">${unlocked?"UNLOCKED":`${u.cost} ESSENCE`}</div><h3>${u.name}</h3><p>${u.desc}</p><button class="btn secondary full" data-unlock="${u.id}" ${unlocked||state.meta.essence<u.cost?"disabled":""}>${unlocked?"OWNED":"UNLOCK"}</button></div>`;}).join("");
  $("legacyUnlocks").querySelectorAll("[data-unlock]").forEach(b=>b.onclick=()=>unlockLegacy(b.dataset.unlock));
  $("classChoices").innerHTML=Object.entries(CLASSES).map(([id,c])=>{const locked=c.unlock&&!state.meta.unlocks[c.unlock];return `<button class="class-card ${state.meta.selectedClass===id?"selected":""} ${locked?"locked":""}" data-class="${id}" ${locked?"disabled":""}><b>${c.name}</b><span>${locked?"LOCKED · ":""}${c.desc}</span></button>`;}).join("");
  $("classChoices").querySelectorAll("[data-class]").forEach(b=>b.onclick=()=>{state.meta.selectedClass=b.dataset.class;save();renderLegacy();});
  $("newRunBtn").textContent=state.run?"ABANDON RUN & START NEW":"BEGIN NEW RUN";
}
function unlockLegacy(id){
  const u=LEGACY_UNLOCKS.find(x=>x.id===id);if(!u||state.meta.unlocks[id]||state.meta.essence<u.cost)return;state.meta.essence-=u.cost;state.meta.unlocks[id]=true;save();renderAll();
}
function beginNewRun(){
  if(state.run&&!confirm("Abandon the current run and start over? Your Legacy progress stays."))return;
  stopCombat();state.run=newRun(state.meta.selectedClass);selected=null;combatLogLines=[];[...state.run.items,...state.run.stash].forEach(i=>state.meta.discovered[i.defId]=true);save();showScreen("bagScreen");renderAll();
}

function renderCodex(){
  const ids=Object.keys(ITEM_DEFS);const known=ids.filter(id=>state.meta.discovered[id]).length;$("codexCount").textContent=`${known} / ${ids.length}`;
  $("codexGrid").innerHTML=ids.map(id=>{const d=ITEM_DEFS[id],seen=!!state.meta.discovered[id];return `<div class="codex-card ${seen?"":"unknown"}"><div class="codex-sigil">${seen?d.glyph:"?"}</div><b>${seen?d.name:"Unknown Gear"}</b><span>${seen?`${rarityLabel(d.rarity)} · ${d.type.toUpperCase()}`:"Find it during a run."}</span></div>`;}).join("");
}
function renderSystem(){
  $("bestFloor").textContent=state.meta.bestFloor;$("bossKills").textContent=state.meta.bossKills;$("runsEnded").textContent=state.meta.runsEnded;$("itemsFound").textContent=state.meta.itemsFound;
}

function exportSave(){
  try{save();const payload={game:"Emberfall",format:"tactical-backpack",version:SAVE_VERSION,exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`emberfall-save-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$("saveNotice").textContent="Save exported.";}catch(e){console.error(e);$("saveNotice").textContent="Could not export save.";}
}
function importSaveFile(file){
  if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const incoming=parsed.state||parsed;if(!incoming.meta)throw new Error("Invalid save");if(!confirm("Replace your current Emberfall progress with this backup?"))return;stopCombat();state=normalizeState(incoming);selected=null;save();renderAll();$("saveNotice").textContent="Save imported.";}catch(e){console.error(e);$("saveNotice").textContent="That file is not a valid Emberfall tactical save.";}finally{$("importInput").value="";}};reader.readAsText(file);
}
function eraseAll(){if(!confirm("Erase ALL Emberfall progress, including Legacy unlocks and records?"))return;stopCombat();localStorage.removeItem(SAVE_KEY);state=defaultState();selected=null;save();renderAll();showScreen("bagScreen");}

function showScreen(id){currentScreen=id;document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===id));if(id==="battleScreen")renderBattle();if(id==="pathScreen")renderPath();}
function openModal(html,closable=true){$("modalBody").innerHTML=html;$("modal").classList.remove("hidden");$("modalClose").classList.toggle("hidden",!closable);}
function closeModal(){$("modal").classList.add("hidden");$("modalBody").innerHTML="";}

function wire(){
  document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));
  $("rotateBtn").onclick=rotateSelected;$("stashBtn").onclick=stashSelected;$("dropBtn").onclick=scrapSelected;$("fightBtn").onclick=startFight;$("focusBtn").onclick=useFocus;$("newRunBtn").onclick=beginNewRun;$("modalClose").onclick=closeModal;
  $("exportBtn").onclick=exportSave;$("importBtn").onclick=()=>$("importInput").click();$("importInput").onchange=e=>importSaveFile(e.target.files[0]);$("resetBtn").onclick=eraseAll;
}

wire();
if(state.run){
  // Discover starting gear so the Codex never shows equipment in your actual bag as unknown.
  [...state.run.items,...state.run.stash].forEach(i=>state.meta.discovered[i.defId]=true);
  const stats=getRunStats();state.run.hp=Math.min(state.run.hp,stats.maxHp);
}
save();renderAll();
if(state.run?.notice){$("bagHint").textContent=state.run.notice;}

if(new URLSearchParams(location.search).has("debug")){
  window.__EMBER_DEBUG={
    getState:()=>JSON.parse(JSON.stringify(state)),
    forceVictory:()=>{const e=ensureEncounter();if(e){e.hp=0;victory();}},
    forceDeath:()=>{if(state.run)playerDeath();},
    setFloor:n=>{if(state.run){stopCombat();state.run.floor=n;state.run.encounter=null;state.run.awaitingRoute=false;state.run.routeChoices=null;save();renderAll();}},
    showLoot:t=>showLootReward(t||"normal")
  };
}

})();
