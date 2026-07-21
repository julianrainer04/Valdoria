'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const dataFiles=['life-actions','scenarios','petitions','emergent','private-incidents','living-history','deep-strategy','deep-systems'];
let source=dataFiles.map(file=>fs.readFileSync(path.join(root,'data',file+'.js'),'utf8')).join('\n')+'\n'+fs.readFileSync(path.join(root,'game.js'),'utf8');
const uiBindings=source.indexOf("document.addEventListener('click',e=>{let b=e.target.closest('[data-view]')");
assert.ok(uiBindings>0,'Start der Browser-Bindungen wurde nicht gefunden');
source=source.slice(0,uiBindings)+`\nrender=function(){};persist=function(){};toast=function(){};flashDeltas=function(){};globalThis.__api={state,recordDecision,regionIdentityAction,characterPolicy,livingHistoryYearTick,settlePeace,peaceTermAvailable,realmView,privateView,chronicleView,diplomacyView,openPeaceConference,mapSvg,ensureDeepState,officePanel,appointOffice,governorPanel,appointGovernor,setGovernorStyle,applyOfficeAndLawRound,lawPanel,enactLaw,updateCoalition,coalitionPanel,resolveCoalition,economyPanel,advanceEconomy,investIndustry,startIntelOperation,advanceIntelOperations,intelligenceOperationsPanel,prepareDeepBattle,warPlanningPanel,processProjectRound,applyDeepProjectCompletion,openProjectPlanning,projectStrategyPanel,dynastyEducationPanel,setEducation,advanceDynastyEducation,advanceDeepSystems};`;
const element={innerHTML:'',close(){},showModal(){},classList:{add(){},remove(){}},querySelector(){return element},querySelectorAll(){return[]}};
const context={structuredClone,Intl,console,Math,Date,localStorage:{getItem(){return null},setItem(){},removeItem(){}},document:{querySelector(){return element},querySelectorAll(){return[]}},window:{scrollTo(){}},requestAnimationFrame(fn){fn()},setTimeout(){}};
vm.runInNewContext(source,context,{filename:'valdoria-system.js'});
const api=context.__api,state=api.state;
api.ensureDeepState();
assert.match(api.realmView(),/REGIONALE IDENTITÄT/,'Reichsansicht zeigt die Identität des ausgewählten Gebiets nicht');
assert.match(api.privateView(),/MENSCHEN MIT EIGENEM WILLEN/,'Privatleben rendert die eigenständigen Figuren nicht');
assert.match(api.chronicleView(),/WIRKUNGSKETTEN/,'Chronik rendert keine Ursachenketten');
const initialMap=api.mapSvg();
assert.equal((initialMap.match(/data-territory=/g)||[]).length,8,'Vektorkarte besitzt nicht für jede Region eine eigene Fläche');
assert.doesNotMatch(initialMap,/<image\s/i,'Karte hängt weiterhin von einem nicht exakt färbbaren Hintergrundbild ab');
for(const id of ['caerhaven','falkenkrone','nordhaven','ravengar','eldoria','aurelia','lysara','islands'])assert.match(initialMap,new RegExp(`data-territory="${id}"`),`Kartenfläche für ${id} fehlt`);

api.recordDecision('Schutzversprechen an Ravengar','Die Krone garantiert die örtliche Charta.',{kind:'region',target:'Ravengar',region:'ravengar'});
assert.equal(state.memories[0].type,'Versprechen','Konkrete Zusagen werden nicht als Erinnerung erkannt');
assert.equal(state.events[0].memoryId,state.memories[0].id,'Chronikeintrag ist nicht mit seiner Ursache verbunden');

const reserveBefore=state.reserve,loyaltyBefore=state.regions.caerhaven.loyalty;
api.regionIdentityAction('caerhaven:tradition');
assert.ok(state.reserve<reserveBefore&&state.regions.caerhaven.loyalty>loyaltyBefore,'Regionale Kulturentscheidung hat keine materiellen Folgen');
assert.equal(state.regionStories.caerhaven.policy,'traditionsnah');

const timeBefore=state.private.actionPoints;
api.characterPolicy('mother:listen');
assert.equal(state.private.actionPoints,timeBefore-1,'Persönliches Gespräch kostet keine private Zeit');
assert.ok(state.characterState.mother.trust>state.private.mother,'Die Figur erinnert sich nicht an persönliche Nähe');

state.season=0;state.year=1488;state.nameSeed=0;const eventCount=state.events.length;
api.livingHistoryYearTick();
assert.ok(state.events.length>=eventCount+1,'Figuren und Regionen entwickeln sich im Jahreswechsel nicht selbst weiter');

state.life.regency=false;state.diplo.Ravengar={war:true,campaign:{startedTurn:1,initialEnemy:12000}};state.countryPolicy={Ravengar:{occupied:true}};state.regions.ravengar.garrison=0;
assert.match(api.mapSvg(),/class="vector-region occupied [^"]*" data-region="ravengar"/,'Besetztes Land wird nicht auf seiner exakten Vektorfläche blau dargestellt');
assert.equal(api.peaceTermAvailable('Ravengar','ravengar','annex'),true,'Vollständig besetztes Land kann nicht in der Friedenskonferenz einverleibt werden');
assert.doesNotThrow(()=>api.openPeaceConference('ravengar'),'Friedenskonferenz kann aus der Länderansicht nicht geöffnet werden');
assert.match(element.innerHTML,/LAND EINVERLEIBEN/,'Friedenskonferenz zeigt die möglichen Vertragsziele nicht');
api.settlePeace('ravengar','annex');
assert.equal(state.regions.ravengar.realm,'Valdoria','Einverleibung überträgt das Land nicht an Valdoria');
assert.equal(state.diplo.Ravengar.war,false,'Krieg endet nach der Friedenskonferenz nicht');
assert.equal(state.countryPolicy.Ravengar.annexed,true,'Einverleibte Bevölkerung und Einnahmen werden nicht aktiviert');
assert.equal(state.peaceHistory[0].term,'annex','Friedensvertrag fehlt in der dauerhaften Geschichte');
assert.match(api.mapSvg(),/class="vector-region annexed [^"]*" data-region="ravengar"/,'Einverleibtes Land erhält nicht dauerhaft Königsblau');

assert.match(api.officePanel(),/ÄMTER DER KRONE/,'Ämterverwaltung kann nicht gerendert werden');
api.appointOffice('treasurer:advisor:2');
assert.equal(state.offices.treasurer,'advisor:2','Amt wird nicht mit einer konkreten Figur besetzt');
const treasuryBefore=state.reserve;api.applyOfficeAndLawRound();
assert.ok(state.reserve>treasuryBefore,'Kompetenter Schatzmeister wirkt nicht auf die laufende Regierung');

api.appointGovernor('caerhaven:advisor:0');api.setGovernorStyle('caerhaven:local');
assert.equal(state.governors.caerhaven.style,'local','Statthalter besitzt keinen dauerhaft gewählten Regierungsstil');
const governorLoyaltyBefore=state.regions.caerhaven.loyalty;api.applyOfficeAndLawRound();
assert.ok(state.regions.caerhaven.loyalty>governorLoyaltyBefore,'Örtlicher Regierungsstil verändert die Region nicht über Zeit');

assert.match(api.lawPanel(),/GESETZE UND STAATSORDNUNG/,'Gesetzesordnung kann nicht gerendert werden');
state.lawCooldown=0;api.enactLaw('trade_code:2');
assert.equal(state.laws.trade_code,2,'Beschlossenes Gesetz wird nicht dauerhaft gespeichert');

assert.match(api.economyPanel(),/WAREN, VERSORGUNG UND PREISE/,'Warenwirtschaft kann nicht gerendert werden');
const productionBefore=state.economy.investments.caerhaven.luxury||0;state.reserve+=3000000;api.investIndustry('caerhaven:luxury');
assert.ok(state.economy.investments.caerhaven.luxury>productionBefore,'Regionale Investition erhöht keine reale Produktion');
const grainBefore=state.economy.stock.grain;api.advanceEconomy();
assert.notEqual(state.economy.stock.grain,grainBefore,'Produktion und Verbrauch verändern die Lagerbestände nicht');

state.reserve+=3000000;api.startIntelOperation('nordhaven:reconnaissance');
assert.ok(state.intelOperations.length,'Geheimoperation wird nicht begonnen');
state.intelOperations[0].progress=state.intelOperations[0].turns-1;api.advanceIntelOperations();
assert.ok(state.intelHistory.length,'Mehrstufige Geheimoperation erhält kein Ergebnis');

state.diplo.Nordhaven={war:true,campaign:{initialEnemy:20000}};state.economy.stock.grain=100;state.economy.stock.iron=100;
const supplyBefore=state.economy.stock.grain,battle=api.prepareDeepBattle('nordhaven',6000);
assert.equal(battle.ok,true,'Versorgter Operationsplan kann nicht vorbereitet werden');
assert.ok(state.economy.stock.grain<supplyBefore,'Feldzug verbraucht keinen realen Nachschub');
assert.match(api.warPlanningPanel('nordhaven'),/OPERATIONSPLAN/,'Kriegsziel, Taktik und Befehlshaber sind nicht wählbar');

state.economy.stock.timber=100;state.economy.stock.iron=100;const build={id:'road',progress:0,cost:4200000,turns:2,quality:50,corruption:0,region:'falkenkrone',design:'local',contractor:'guild'};
assert.doesNotThrow(()=>api.openProjectPlanning('palace'),'Mehrstufige Bauplanung lässt sich nicht öffnen');
assert.match(element.innerHTML,/STANDORT/,'Bauplanung enthält keine Standortwahl');
assert.equal(api.processProjectRound(build,{id:'road',name:'Königsstraße',cost:4200000,turns:2}),true,'Versorgte Baustelle macht keinen Fortschritt');
const infrastructureBefore=state.regions.falkenkrone.infrastructure;api.applyDeepProjectCompletion(build,{name:'Königsstraße'});
assert.ok(state.regions.falkenkrone.infrastructure>infrastructureBefore,'Standort und Entwurf verändern die Region nach Vollendung nicht');

assert.match(api.dynastyEducationPanel(),/ERZIEHUNG DES HAUSES VALEDOR/,'Dynastische Erziehung kann nicht gerendert werden');
api.setEducation('princess:focus:scholar');state.season=0;api.advanceDynastyEducation();
assert.ok(state.dynastyEducation.princess.progress>0,'Erziehung entwickelt sich über Jahre nicht weiter');

state.factions.nobles=20;state.factions.cities=24;api.updateCoalition();
assert.ok(state.coalition.members.length>=2,'Unzufriedene Gruppen bilden keinen gemeinsamen Machtblock');
assert.match(api.coalitionPanel(),/MACHTBLÖCKE IM REICH/,'Innenpolitische Koalitionen werden nicht sichtbar gemacht');

for(const faction of Object.keys(state.factions))state.factions[faction]=60;state.coalition={members:[],pressure:0,demand:null,lastActionTurn:0,lastEventTurn:0};state.stats.stability=60;state.laws={crown_power:1,land_rights:1,trade_code:1,army_code:1,succession:1};
for(let i=0;i<80;i++){state.turn++;state.season=(state.season+1)%4;if(state.season===0)state.year++;api.advanceDeepSystems()}
for(const value of [...Object.values(state.economy.stock),...Object.values(state.economy.prices)])assert.ok(Number.isFinite(value)&&value>=0,'Langzeitsimulation erzeugt ungültige Wirtschaftsgrößen');
assert.ok(state.turn>=81,'Langzeitsimulation wurde nicht vollständig durchlaufen');
assert.ok(Number.isFinite(state.reserve)&&state.reserve>=0&&state.reserve<500000000,'Langzeitsimulation erzeugt eine ungültige oder explodierende Staatsreserve');
assert.ok(state.stats.stability>=35,'Ausgewogene Regierung kollabiert in der Langzeitsimulation ohne äußeren Grund');
assert.ok(state.coalition.pressure<70,'Ausgewogene Fraktionspolitik erzeugt zwangsläufig eine extreme Koalitionskrise');

console.log(`Systemlogik geprüft: ${state.memories.length} Erinnerungen, Ämter, Gesetze, Waren, Operationen, Kriegsversorgung, Bauten, Dynastie und 80 Langzeitrunden · Reserve ${Math.round(state.reserve/1000000)} Mio. · Stabilität ${state.stats.stability} · Koalitionsdruck ${state.coalition.pressure}.`);
