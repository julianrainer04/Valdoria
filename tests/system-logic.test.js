'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const dataFiles=['life-actions','scenarios','petitions','emergent','private-incidents','living-history'];
let source=dataFiles.map(file=>fs.readFileSync(path.join(root,'data',file+'.js'),'utf8')).join('\n')+'\n'+fs.readFileSync(path.join(root,'game.js'),'utf8');
const uiBindings=source.indexOf("document.addEventListener('click',e=>{let b=e.target.closest('[data-view]')");
assert.ok(uiBindings>0,'Start der Browser-Bindungen wurde nicht gefunden');
source=source.slice(0,uiBindings)+`\nrender=function(){};persist=function(){};toast=function(){};flashDeltas=function(){};globalThis.__api={state,recordDecision,regionIdentityAction,characterPolicy,livingHistoryYearTick,settlePeace,peaceTermAvailable,realmView,privateView,chronicleView,diplomacyView,openPeaceConference};`;
const element={innerHTML:'',close(){},showModal(){},classList:{add(){},remove(){}},querySelector(){return element},querySelectorAll(){return[]}};
const context={structuredClone,Intl,console,Math,Date,localStorage:{getItem(){return null},setItem(){},removeItem(){}},document:{querySelector(){return element},querySelectorAll(){return[]}},window:{scrollTo(){}},requestAnimationFrame(fn){fn()},setTimeout(){}};
vm.runInNewContext(source,context,{filename:'valdoria-system.js'});
const api=context.__api,state=api.state;
assert.match(api.realmView(),/REGIONALE IDENTITÄT/,'Reichsansicht zeigt die Identität des ausgewählten Gebiets nicht');
assert.match(api.privateView(),/MENSCHEN MIT EIGENEM WILLEN/,'Privatleben rendert die eigenständigen Figuren nicht');
assert.match(api.chronicleView(),/WIRKUNGSKETTEN/,'Chronik rendert keine Ursachenketten');

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
assert.equal(api.peaceTermAvailable('Ravengar','ravengar','annex'),true,'Vollständig besetztes Land kann nicht in der Friedenskonferenz einverleibt werden');
assert.doesNotThrow(()=>api.openPeaceConference('ravengar'),'Friedenskonferenz kann aus der Länderansicht nicht geöffnet werden');
assert.match(element.innerHTML,/LAND EINVERLEIBEN/,'Friedenskonferenz zeigt die möglichen Vertragsziele nicht');
api.settlePeace('ravengar','annex');
assert.equal(state.regions.ravengar.realm,'Valdoria','Einverleibung überträgt das Land nicht an Valdoria');
assert.equal(state.diplo.Ravengar.war,false,'Krieg endet nach der Friedenskonferenz nicht');
assert.equal(state.countryPolicy.Ravengar.annexed,true,'Einverleibte Bevölkerung und Einnahmen werden nicht aktiviert');
assert.equal(state.peaceHistory[0].term,'annex','Friedensvertrag fehlt in der dauerhaften Geschichte');

console.log(`Systemlogik geprüft: ${state.memories.length} Erinnerungen, regionale Entscheidungen, Figurenentwicklung und Friedenskonferenz.`);
