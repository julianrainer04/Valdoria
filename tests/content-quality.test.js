'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['life-actions.js','scenarios.js','petitions.js','emergent.js','private-incidents.js','living-history.js','deep-strategy.js'];
const source=files.map(file=>fs.readFileSync(path.join(root,'data',file),'utf8')).join('\n')+`\n;globalThis.__content={life:LIFE_ACTIONS,scenarios:SCENARIOS,petitions:PETITIONS,emergent:EMERGENT_TEMPLATES,incidents:PRIVATE_INCIDENTS,regions:REGION_IDENTITIES,peace:PEACE_TERMS,tutorials:TUTORIAL_STEPS,goods:GOODS,regionEconomy:REGION_ECONOMY,offices:OFFICE_DEFS,laws:LAW_DEFS,operations:INTEL_OPERATIONS,objectives:WAR_OBJECTIVES,tactics:WAR_TACTICS,designs:PROJECT_DESIGNS,contractors:PROJECT_CONTRACTORS,education:DYNASTY_FOCI,tutors:DYNASTY_TUTORS};`;
const context={};
vm.runInNewContext(source,context,{filename:'valdoria-content.js'});
const c=context.__content;
const normalized=value=>String(value||'').toLocaleLowerCase('de-DE').replace(/[^a-zäöüß0-9]+/g,' ').trim();

for(const [poolName,pool] of Object.entries({scenarios:c.scenarios,petitions:c.petitions,incidents:c.incidents})){
 const titles=pool.map(entry=>normalized(entry.title));
 assert.equal(new Set(titles).size,titles.length,`${poolName}: doppelte Titel erzeugen repetitive Situationen`);
 for(const entry of pool){
  assert.equal(entry.choices.length,3,`${poolName}/${entry.id}: eine Lage braucht genau drei klar verschiedene Wege`);
  assert.equal(new Set(entry.choices.map(choice=>normalized(choice.label))).size,3,`${poolName}/${entry.id}: Wahlmöglichkeiten wiederholen sich`);
  for(const choice of entry.choices){
   assert.ok(normalized(choice.label).length>=4,`${poolName}/${entry.id}: unklare Bezeichnung`);
   assert.equal(typeof choice.apply,'function',`${poolName}/${entry.id}/${choice.id}: Entscheidung hat keine Spielwirkung`);
  }
 }
}

for(const action of c.life){
 assert.ok(Number.isFinite(action.min)&&Number.isFinite(action.max)&&action.min<=action.max,`Privatleben/${action.id}: ungültige Altersgrenze`);
 assert.equal(typeof action.apply,'function',`Privatleben/${action.id}: Handlung hat keine Wirkung`);
 assert.ok(normalized(action.text).length>=20,`Privatleben/${action.id}: zu wenig erzählerischer Kontext`);
}
for(const age of [12,14,16,18,21])assert.ok(c.life.filter(action=>age>=action.min&&age<=action.max).length>=3,`Privatleben: mit ${age} Jahren gibt es zu wenig Auswahl`);

const expectedRegions=['caerhaven','falkenkrone','ravengar','nordhaven','eldoria','aurelia','lysara','islands'];
assert.deepEqual(Object.keys(c.regions).sort(),expectedRegions.sort(),'Regionale Identitäten decken die Karte nicht vollständig ab');
for(const [id,region] of Object.entries(c.regions))for(const field of ['motto','identity','elite','tradition','aspiration','tension','image'])assert.ok(region[field],`Region ${id}: ${field} fehlt`);

let previous=-1;
for(const [id,term] of Object.entries(c.peace)){
 assert.ok(term.label&&term.summary,`Friedensziel ${id} ist unvollständig`);
 assert.ok(term.need>=previous,`Friedensziel ${id} ist nicht nachvollziehbar nach Verhandlungsmacht geordnet`);
 previous=term.need;
}
assert.equal(c.peace.annex.need,100,'Einverleibung darf nur nach vollständigem Sieg möglich sein');
for(const view of ['realm','finances','council','military','diplomacy','projects','private','chronicle'])assert.ok(c.tutorials[view]?.title&&c.tutorials[view]?.text,`Einführung für ${view} fehlt`);

assert.ok(Object.keys(c.goods).length>=7,'Warenwirtschaft besitzt zu wenige unterschiedliche Güter');
assert.deepEqual(Object.keys(c.regionEconomy).sort(),expectedRegions.sort(),'Warenproduktion deckt die Karte nicht vollständig ab');
for(const [id,e] of Object.entries(c.regionEconomy)){assert.ok(Object.keys(e.produces).length,`Region ${id} produziert kein Gut`);for(const good of [...Object.keys(e.produces),...Object.keys(e.demands)])assert.ok(c.goods[good],`Region ${id} verweist auf unbekanntes Gut ${good}`)}
assert.equal(Object.keys(c.offices).length,5,'Die Regierung braucht fünf klar getrennte Kronämter');
for(const [id,office] of Object.entries(c.offices)){assert.ok(office.candidates.length>=3,`Amt ${id} hat zu wenige personelle Alternativen`);assert.equal(new Set(office.candidates).size,office.candidates.length,`Amt ${id} enthält doppelte Kandidaten`)}
for(const [id,law] of Object.entries(c.laws)){assert.equal(law.levels.length,3,`Gesetz ${id} braucht drei echte Staatsmodelle`);assert.equal(new Set(law.levels.map(x=>normalized(x.label))).size,3,`Gesetz ${id} enthält redundante Stufen`)}
assert.ok(Object.keys(c.operations).length>=6,'Geheimdienst besitzt zu wenige Operationstypen');
for(const [id,op] of Object.entries(c.operations)){assert.ok(op.turns>=2,`Operation ${id} ist nicht mehrstufig`);assert.ok(op.cost>0&&op.risk>=0,`Operation ${id} besitzt keine echten Kosten oder Risiken`)}
assert.ok(Object.keys(c.objectives).length>=4&&Object.keys(c.tactics).length>=4,'Kriegsplanung bietet zu wenige Ziele oder Taktiken');
assert.ok(Object.keys(c.designs).length>=4&&Object.keys(c.contractors).length>=3,'Bauplanung bietet zu wenige Entwürfe oder Auftragnehmer');
assert.ok(Object.keys(c.education).length>=5&&Object.keys(c.tutors).length>=4,'Dynastische Erziehung ist nicht vielfältig genug');

console.log(`Inhaltsqualität geprüft: ${c.scenarios.length+c.petitions.length+c.incidents.length} Lagen, ${c.life.length} Lebenshandlungen, ${expectedRegions.length} Regionen, ${Object.keys(c.goods).length} Güter, ${Object.keys(c.laws).length} Gesetze und ${Object.keys(c.operations).length} Geheimoperationen.`);
