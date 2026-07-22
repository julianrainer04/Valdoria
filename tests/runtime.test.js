'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['data/life-actions.js','data/scenarios.js','data/petitions.js','data/emergent.js','data/private-incidents.js','data/depth-systems.js','data/grand-systems.js','game.js'];

class FakeElement{
 constructor(){this.innerHTML='';this.textContent='';this.value='';this.dataset={};this.children=[];this.open=false;this.className='';this.classList={add(){},remove(){},contains(){return false}}}
 append(){ } appendChild(){ } remove(){ } insertAdjacentElement(){ } insertAdjacentHTML(){ }
 showModal(){this.open=true} close(){this.open=false} addEventListener(){ } matches(){return false} closest(){return null}
}
const elements=new Map(),element=key=>{if(!elements.has(key))elements.set(key,new FakeElement());return elements.get(key)};
const store=new Map();
const context={
 structuredClone,Intl,Date,Math,JSON,Number,String,Object,Array,Set,Map,RegExp,Error,
 console,setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(fn){fn()},
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
 document:{querySelector:element,querySelectorAll(){return []},getElementById:id=>elements.get('#'+id)||null,createElement(){return new FakeElement()},createTextNode(v){return String(v)},addEventListener(){},body:element('body')},
 window:{scrollTo(){}},
};
context.globalThis=context;
let source=files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
source+='\n;globalThis.__runtime={state:()=>state,view:n=>{state.view=n;render(false);return document.querySelector("#view").innerHTML},goods:()=>goodsMarketPanel(),command:x=>parseCommand(x),tick:()=>{depthSystemsTurn();grandSystemsTurn()},step:()=>{state.turn++;depthSystemsTurn();grandSystemsTurn();normalizeState()},economy:()=>economySimulationTick(),world:()=>worldSimulationTick(),grand:()=>ensureGrand(),annex:id=>grandAnnexProvince(id),law:x=>grandGovernmentLawAction(x),plan:x=>grandCampaignPlanAction(x),build:x=>grandStartDevelopment(x),provinceTick:()=>grandProvinceTick(),decision:(a,b,m)=>recordDecision(a,b,m),battle:id=>depthBattleModifier(id)};';
vm.runInNewContext(source,context,{filename:'valdoria-runtime.js'});
const api=context.__runtime;
for(const [view,needle] of [['realm','STAATSORDNUNG'],['finances','KÖNIGLICHE SCHATZKAMMER'],['council','VERFASSUNG UND REICHSGESETZE'],['military','KRIEGSRAT UND OBERBEFEHL'],['diplomacy','DIE WELT HANDELT WEITER'],['projects','EPOCHEN UND ERNEUERUNG'],['private','WO DER KÖNIG LEBT'],['chronicle','DIE STRUKTUR EURER HERRSCHAFT']])assert.match(api.view(view),new RegExp(needle),`${view} bindet das neue System nicht ein`);
assert.match(api.goods(),/WAREN, VORRÄTE UND HANDELSWEGE/,'Die Warenwirtschaft lässt sich im Finanzbereich nicht rendern');
assert.equal(api.command('Setze den Forschungsschwerpunkt auf Seemacht.').ok,true,'Freie Befehle steuern die neue Forschung nicht');
assert.equal(api.command('Kaufe Eisen für die königlichen Speicher.').ok,true,'Freie Befehle steuern den Warenmarkt nicht');
assert.equal(api.command('Mache das Reich irgendwie besser.').ok,false,'Ein unklarer freier Befehl darf nicht stillschweigend irgendetwas ausführen');
const s=api.state(),beforeKnowledge=s.depth.innovation.knowledge,beforeWorld=Object.values(s.depth.world).reduce((n,w)=>n+w.progress,0),beforeStocks=Object.values(s.depth.economy.goods).reduce((n,g)=>n+g.stock,0);
assert.equal(api.grand().houses.length,6,'Es existieren nicht sechs eigenständige rivalisierende Häuser');
assert.equal(Object.keys(api.grand().government.laws).length,7,'Die Verfassung besitzt nicht alle Gesetzesfelder');
assert.equal(Object.keys(api.grand().provinces).length,8,'Die Provinzidentitäten decken die Karte nicht ab');
s.life.age=20;s.life.regency=false;s.reserve=60000000;s.militaryFund=20000000;s.grand.government.mandate=80;
assert.equal(api.law('faith:secular'),true,'Ein gültiges Reichsgesetz lässt sich nicht beschließen');
assert.equal(s.grand.government.laws.faith,'secular','Das neue Glaubensrecht bleibt nicht im Spielstand');
s.diplo.Ravengar={war:true,treaty:'none'};
assert.equal(api.plan('ravengar:route:highland'),true,'Die Marschroute lässt sich nicht planen');
assert.equal(api.plan('ravengar:doctrine:shock'),true,'Die Feldzugsdoktrin lässt sich nicht planen');
assert.equal(api.plan('ravengar:objective:capital'),true,'Das Kriegsziel lässt sich nicht planen');
assert.equal(api.plan('ravengar:issue:plan'),true,'Der vollständige Feldzugsplan lässt sich nicht besiegeln');
assert.equal(s.grand.campaigns.Ravengar.active,true,'Der besiegelte Feldzugsplan wird nicht aktiv');
assert.ok(Number.isFinite(api.battle('ravengar'))&&api.battle('ravengar')>0,'Feldzugsplan und Wetter ergeben keinen gültigen Kampfmodifikator');
const fortBefore=s.grand.provinces.caerhaven.buildings.fort;
assert.equal(api.build('caerhaven:fort'),true,'Ein Provinzbau lässt sich nicht beginnen');
s.grand.provinces.caerhaven.construction.progress=99;api.provinceTick();
assert.equal(s.grand.provinces.caerhaven.buildings.fort,fortBefore+1,'Der Provinzbau wird nicht fertiggestellt');
for(let i=0;i<6;i++)api.decision('Neue Königsstraße bauen','Schulen, Häfen und Straßen werden gemeinsam ausgebaut.',{kind:'development'});
assert.equal(s.grand.traits.earned.includes('builder'),true,'Wiederholte Entscheidungen erzeugen keinen Herrschercharakter');
api.tick();
assert.ok(s.depth.innovation.knowledge>beforeKnowledge,'Forschung schreitet pro Runde nicht voran');
assert.ok(Object.values(s.depth.world).reduce((n,w)=>n+w.progress,0)>beforeWorld,'Nachbarreiche verfolgen ihre Pläne nicht');
assert.notEqual(Object.values(s.depth.economy.goods).reduce((n,g)=>n+g.stock,0),beforeStocks,'Warenproduktion und Verbrauch laufen nicht');
assert.equal(s.depth.court.length,8,'Hofpersonen gingen im laufenden Spiel verloren');
for(let i=0;i<60;i++)api.step();
assert.ok(s.depth.innovation.unlocked.length>=2,'Langfristige Forschung erzeugt keine Durchbrüche');
assert.ok(s.depth.news.length<=36,'Die erzählten Folgen wachsen unbegrenzt im Speicher');
assert.ok(Object.values(s.depth.world).every(w=>Number.isFinite(w.power)&&w.power>=10&&w.power<=100),'Weltmächte verlassen gültige Wertebereiche');
assert.ok(Object.values(s.depth.economy.goods).every(g=>Number.isFinite(g.stock)&&g.stock>=0&&g.price>=4),'Warenwerte werden nach vielen Runden ungültig');
assert.ok(api.grand().houses.every(h=>Number.isFinite(h.relation)&&h.relation>=0&&h.relation<=100),'Dynastien verlassen nach vielen Runden gültige Wertebereiche');
assert.ok(Object.values(api.grand().provinces).every(p=>p.acceptance>=0&&p.acceptance<=100&&p.harmony>=0&&p.harmony<=100),'Kultur- oder Glaubenswerte werden ungültig');
console.log('Valdoria-Laufzeit geprüft: Tiefensysteme, Verfassung, Dynastien, Provinzen, Orte und Eigenschaften simulieren.');
