'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['data/life-actions.js','data/scenarios.js','data/petitions.js','data/emergent.js','data/private-incidents.js','data/depth-systems.js','data/grand-systems.js','data/living-world.js','data/private-world.js','game.js'];

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
source+='\n;globalThis.__runtime={state:()=>state,view:n=>{state.view=n;render(false);return document.querySelector("#view").innerHTML},goods:()=>goodsMarketPanel(),command:x=>parseCommand(x),tick:()=>{depthSystemsTurn();grandSystemsTurn();livingTurn();privateWorldTurn()},step:()=>{state.turn++;depthSystemsTurn();grandSystemsTurn();livingTurn();privateWorldTurn();normalizeState()},calendar:()=>advanceCalendar(),economy:()=>economySimulationTick(),world:()=>worldSimulationTick(),grand:()=>ensureGrand(),living:()=>ensureLiving(),privateWorld:()=>ensurePrivateWorld(),privatePath:x=>privateWorldPathAction(x),privateContact:x=>privateWorldContactAction(x),privateVenture:x=>privateWorldVentureAction(x),forceScandal:x=>privateWorldStartScandal(x,true),privateScandal:x=>privateWorldScandalAction(x),privateLegacy:x=>privateWorldLegacyAction(x),annex:id=>grandAnnexProvince(id),law:x=>grandGovernmentLawAction(x),plan:x=>grandCampaignPlanAction(x),build:x=>grandStartDevelopment(x),provinceTick:()=>grandProvinceTick(),decision:(a,b,m)=>recordDecision(a,b,m),battle:id=>depthBattleModifier(id),treaty:x=>livingTreatyAction(x),ratify:(n,p)=>livingRatifyTreaty(n,livingTreatyDraft(n,p)),capital:x=>livingCapitalAction(x),journeySetup:x=>livingJourneySetup(x),journey:x=>livingJourneyAction(x),tradition:x=>livingTraditionAction(x),civil:()=>livingStartCivilWar(true),civilAction:x=>livingCivilAction(x),chain:x=>livingChainAction(x)};';
vm.runInNewContext(source,context,{filename:'valdoria-runtime.js'});
const api=context.__runtime;
for(const [view,needles] of [['realm',['STAATSORDNUNG','INNERER FRIEDEN']],['finances',['KÖNIGLICHE SCHATZKAMMER','PRODUKTIONSKETTEN DES REICHES']],['council',['VERFASSUNG UND REICHSGESETZE','MENSCHEN, DIE SICH GEGENSEITIG ERINNERN']],['military',['KRIEGSRAT UND OBERBEFEHL']],['diplomacy',['DIE WELT HANDELT WEITER','VERTRÄGE, DIE DIE WELT BINDEN','HERRSCHERHÄUSER DER WELT']],['projects',['EPOCHEN UND ERNEUERUNG','DIE ZEIT VERÄNDERT DAS SPIEL']],['private',['LEBENSWEGE OHNE DREHBUCH','DER VERBORGENE HOF','NÄCHTE OHNE KRONE','GERÜCHTE, BEWEISE UND VERSPRECHEN','WO DER KÖNIG LEBT','FALKENKRONE BEGEHEN','TRADITIONEN DES HAUSES VALEDOR']],['chronicle',['DIE STRUKTUR EURER HERRSCHAFT','DIE LEBENDIGE DYNASTIE']]]){let html=api.view(view);for(const needle of needles)assert.match(html,new RegExp(needle),`${view} bindet „${needle}“ nicht ein`)}
assert.match(api.goods(),/WAREN, VORRÄTE UND HANDELSWEGE/,'Die Warenwirtschaft lässt sich im Finanzbereich nicht rendern');
assert.equal(api.command('Setze den Forschungsschwerpunkt auf Seemacht.').ok,true,'Freie Befehle steuern die neue Forschung nicht');
assert.equal(api.command('Kaufe Eisen für die königlichen Speicher.').ok,true,'Freie Befehle steuern den Warenmarkt nicht');
assert.equal(api.command('Mache das Reich irgendwie besser.').ok,false,'Ein unklarer freier Befehl darf nicht stillschweigend irgendetwas ausführen');
const s=api.state(),beforeKnowledge=s.depth.innovation.knowledge,beforeWorld=Object.values(s.depth.world).reduce((n,w)=>n+w.progress,0),beforeStocks=Object.values(s.depth.economy.goods).reduce((n,g)=>n+g.stock,0);
const startAge=s.life.age,startYear=s.year;api.calendar();assert.equal(s.life.age,startAge,'Nach nur einer Runde darf der König noch nicht altern');api.calendar();assert.equal(s.life.age,startAge+1,'Nach zwei Runden muss genau ein Lebensjahr vergangen sein');assert.equal(s.year,startYear+1,'Der Kalender braucht exakt zwei Runden pro Jahr');
assert.ok(api.living().people.length>=14,'Familie, Rat und große Häuser fehlen in der lebendigen Personenwelt');
const memoriesBefore=api.living().people.reduce((n,p)=>n+p.memories.length,0);api.decision('Hilfe für hungernde Familien','Die Krone schützt Kinder und versorgt die Armen.',{kind:'private'});assert.ok(api.living().people.reduce((n,p)=>n+p.memories.length,0)>memoriesBefore,'Entscheidungen hinterlassen keine persönlichen Erinnerungen');
api.tick();assert.ok(Object.keys(api.living().relations).length>=2,'Hofpersonen entwickeln untereinander keine Beziehungen');
assert.equal(api.capital('move:archive'),true,'Der König kann sich nicht durch Falkenkrone bewegen');assert.equal(api.capital('act:research'),true,'Hauptstadtorte besitzen keine wirklichen Handlungen');
assert.equal(api.tradition('education:books'),true,'Eine neue Dynastietradition lässt sich nicht prägen');assert.equal(api.living().traditions.adopted.education,'books','Dynastietraditionen bleiben nicht im Spielzustand');
assert.equal(api.treaty('Lysara:treaty:toggle:knowledge'),true,'Vertragsklauseln lassen sich nicht einzeln verhandeln');assert.ok(api.living().drafts['treaty:Lysara'].clauses.includes('knowledge'),'Die ausgewählte Klausel fehlt im Vertragsentwurf');
s.diplo.Lysara={war:true,treaty:'none'};api.living().drafts['peace:Lysara']={country:'Lysara',peace:true,clauses:['prisoners','nonaggression','knowledge'],duration:10,lastChanged:s.turn};api.ratify('Lysara',true);assert.equal(s.diplo.Lysara.war,false,'Ein ratifizierter Friedensvertrag beendet den Krieg nicht');assert.ok(api.living().treaties.some(t=>t.country==='Lysara'&&t.status==='active'),'Der Friedensvertrag besitzt keine dauerhafte Laufzeit');
assert.equal(api.grand().houses.length,6,'Es existieren nicht sechs eigenständige rivalisierende Häuser');
assert.equal(Object.keys(api.grand().government.laws).length,7,'Die Verfassung besitzt nicht alle Gesetzesfelder');
assert.equal(Object.keys(api.grand().provinces).length,8,'Die Provinzidentitäten decken die Karte nicht ab');
s.life.age=20;s.life.regency=false;s.reserve=60000000;s.militaryFund=20000000;s.grand.government.mandate=80;
assert.ok(Object.keys(api.privateWorld().contacts).length>=9,'Der verborgene Hof besitzt nicht genügend unterschiedliche Beziehungen');
assert.equal(api.privatePath('libertine'),true,'Ein eigener unkonventioneller Lebensweg lässt sich nicht einschlagen');
s.private.actionPoints=4;assert.equal(api.privateContact('meet:harbor_voice'),true,'Eine neue persönliche Bekanntschaft lässt sich nicht beginnen');api.privateWorld().contacts.harbor_voice.affection=45;assert.equal(api.privateContact('deepen:harbor_voice'),true,'Eine Bekanntschaft kann nicht zu einer langfristigen privaten Beziehung werden');assert.equal(api.privateWorld().contacts.harbor_voice.status,'intimate','Die Beziehung besitzt keinen dauerhaften Zustand');
s.private.actionPoints=3;assert.equal(api.privateContact('promise:harbor_voice'),true,'Eine private Beziehung kann kein echtes Versprechen erzeugen');assert.equal(api.privateContact('fulfill:harbor_voice'),true,'Ein gegebenes Versprechen kann nicht bewusst eingelöst werden');assert.equal(api.privateWorld().contacts.harbor_voice.promises.at(-1).kept,true,'Das erfüllte Versprechen bleibt nicht in der gemeinsamen Geschichte');
s.private.actionPoints=3;assert.equal(api.privateVenture('start:underground_ball'),true,'Eine mehrstufige private Unternehmung beginnt nicht');assert.equal(api.privateVenture('resolve:underground_ball:dance'),true,'Die private Unternehmung lässt sich nicht individuell entscheiden');assert.ok(api.privateWorld().ventureHistory.length,'Ungewöhnliche Nächte hinterlassen keine Geschichte');
api.privateWorld().exposure=85;api.privateWorld().evidence=60;assert.equal(api.forceScandal('masquerade'),true,'Ein privater Skandal lässt sich nicht aus den gesammelten Spuren erzeugen');assert.equal(api.privateScandal('confess'),true,'Die Skandalkrise besitzt keine spielbare Reaktion');assert.ok(api.privateWorld().scandalHistory.length,'Ein bewältigter Skandal verschwindet aus der Biografie');
s.private.purse=1000000;api.privateWorld().pendingLegacy={contact:'harbor_voice',childName:'Maris Bell',bornYear:s.year};assert.equal(api.privateLegacy('protect'),true,'Eine private Abstammungsfolge lässt sich nicht verantwortlich entscheiden');assert.equal(api.privateWorld().hiddenChildren.length,1,'Die verborgene Seitenlinie bleibt nicht über Runden bestehen');
assert.equal(api.chain('arms:invest'),true,'Produktionsketten lassen sich nicht ausbauen');assert.equal(api.living().production.chains.arms.level,2,'Der Ausbau verändert die Produktionskapazität nicht');
assert.equal(api.journeySetup('destination:caerhaven'),true,'Eine Königsreise erhält kein Ziel');assert.equal(api.journeySetup('route:road'),true,'Eine Königsreise erhält keine Route');assert.equal(api.journeySetup('companion:regent'),true,'Eine Königsreise erhält keine Begleitung');assert.equal(api.journey('start:journey'),true,'Die mehrstufige Königsreise beginnt nicht');for(let guard=0;api.living().journey&&guard<6;guard++){let choice=api.living().journey.event.choices[0].id;assert.equal(api.journey('choice:'+choice),true,'Eine Reiseetappe lässt sich nicht entscheiden')}assert.equal(api.living().journey,null,'Die Königsreise kommt nach ihren Etappen nicht ans Ziel');assert.ok(api.living().journeyHistory.length>0,'Die abgeschlossene Reise hinterlässt keine Geschichte');
assert.equal(api.civil(),true,'Eine erzwungene Thronkrise erzeugt keinen Bürgerkrieg');assert.ok(api.living().civilWar?.provinces.length,'Der Bürgerkrieg besitzt keine beteiligten Provinzen');assert.equal(api.civilAction('amnesty'),true,'Im Bürgerkrieg lässt sich keine politische Strategie wählen');
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
