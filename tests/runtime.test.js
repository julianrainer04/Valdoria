'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['data/life-actions.js','data/scenarios.js','data/petitions.js','data/emergent.js','data/private-incidents.js','data/depth-systems.js','game.js'];

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
source+='\n;globalThis.__runtime={state:()=>state,view:n=>{state.view=n;render(false);return document.querySelector("#view").innerHTML},goods:()=>goodsMarketPanel(),command:x=>parseCommand(x),tick:()=>depthSystemsTurn(),step:()=>{state.turn++;depthSystemsTurn();normalizeState()},economy:()=>economySimulationTick(),world:()=>worldSimulationTick()};';
vm.runInNewContext(source,context,{filename:'valdoria-runtime.js'});
const api=context.__runtime;
for(const [view,needle] of [['realm','DAS REICH ANTWORTET'],['finances','KÖNIGLICHE SCHATZKAMMER'],['council','DER LEBENDIGE HOF'],['military','Frontbefehle statt nur Angriff'],['diplomacy','DIE WELT HANDELT WEITER'],['projects','EPOCHEN UND ERNEUERUNG'],['chronicle','DIE TIEFE EURES REICHES']])assert.match(api.view(view),new RegExp(needle),`${view} bindet das neue System nicht ein`);
assert.match(api.goods(),/WAREN, VORRÄTE UND HANDELSWEGE/,'Die Warenwirtschaft lässt sich im Finanzbereich nicht rendern');
assert.equal(api.command('Setze den Forschungsschwerpunkt auf Seemacht.').ok,true,'Freie Befehle steuern die neue Forschung nicht');
assert.equal(api.command('Kaufe Eisen für die königlichen Speicher.').ok,true,'Freie Befehle steuern den Warenmarkt nicht');
assert.equal(api.command('Mache das Reich irgendwie besser.').ok,false,'Ein unklarer freier Befehl darf nicht stillschweigend irgendetwas ausführen');
const s=api.state(),beforeKnowledge=s.depth.innovation.knowledge,beforeWorld=Object.values(s.depth.world).reduce((n,w)=>n+w.progress,0),beforeStocks=Object.values(s.depth.economy.goods).reduce((n,g)=>n+g.stock,0);
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
console.log('Valdoria-Laufzeit geprüft: alle acht Tiefensysteme rendern und simulieren.');
