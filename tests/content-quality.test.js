'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['life-actions.js','scenarios.js','petitions.js','emergent.js','private-incidents.js','living-history.js'];
const source=files.map(file=>fs.readFileSync(path.join(root,'data',file),'utf8')).join('\n')+`\n;globalThis.__content={life:LIFE_ACTIONS,scenarios:SCENARIOS,petitions:PETITIONS,emergent:EMERGENT_TEMPLATES,incidents:PRIVATE_INCIDENTS,regions:REGION_IDENTITIES,peace:PEACE_TERMS,tutorials:TUTORIAL_STEPS};`;
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

console.log(`Inhaltsqualität geprüft: ${c.scenarios.length+c.petitions.length+c.incidents.length} Lagen, ${c.life.length} Lebenshandlungen, ${expectedRegions.length} Regionen und ${Object.keys(c.peace).length} Friedensziele.`);
