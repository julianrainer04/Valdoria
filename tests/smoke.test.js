'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const dataFiles = [
  'data/life-actions.js',
  'data/scenarios.js',
  'data/petitions.js',
  'data/emergent.js',
  'data/private-incidents.js',
  'data/depth-systems.js',
  'data/grand-systems.js',
  'data/living-world.js',
  'data/private-world.js',
  'data/crown-depth.js'
];
const scriptFiles = [...dataFiles, 'game.js'];

for (const file of scriptFiles) {
  assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), `${file} enthält einen Syntaxfehler`);
}

const html = read('index.html');
let lastScriptPosition = -1;
for (const file of scriptFiles) {
  const position = html.indexOf(`src="${file}"`);
  assert.ok(position > lastScriptPosition, `${file} fehlt oder wird in der falschen Reihenfolge geladen`);
  lastScriptPosition = position;
}

const poolSource = dataFiles.map(read).join('\n') + `
;globalThis.__pools={
  life:LIFE_ACTIONS,
  scenarios:SCENARIOS,
  petitions:PETITIONS,
  emergent:EMERGENT_TEMPLATES,
  privateIncidents:PRIVATE_INCIDENTS
};`;
const poolContext = {};
vm.runInNewContext(poolSource, poolContext, { filename: 'content-pools.js' });

const expectedMinimums = { life: 20, scenarios: 21, petitions: 26, emergent: 12, privateIncidents: 27 };
for (const [name, minimum] of Object.entries(expectedMinimums)) {
  const entries = poolContext.__pools[name];
  assert.ok(entries.length >= minimum, `${name} enthält nur ${entries.length} statt mindestens ${minimum} Einträge`);
  const ids = entries.map(entry => entry.id);
  assert.equal(new Set(ids).size, ids.length, `${name} enthält doppelte IDs`);
  for (const entry of entries) {
    if (!entry.choices) continue;
    const choiceIds = entry.choices.map(choice => choice.id).filter(Boolean);
    assert.equal(new Set(choiceIds).size, choiceIds.length, `${name}/${entry.id} enthält doppelte Entscheidungs-IDs`);
  }
}

const sourceFiles = ['index.html', 'style.css', 'game.js', ...dataFiles];
const assetReferences = new Set();
for (const file of sourceFiles) {
  for (const match of read(file).matchAll(/assets\/[A-Za-z0-9._-]+/g)) assetReferences.add(match[0]);
}
assert.ok(assetReferences.size >= 46, 'Zu wenige Bildreferenzen gefunden');
for (const asset of assetReferences) {
  assert.ok(fs.existsSync(path.join(root, asset)), `Bild fehlt: ${asset}`);
  assert.ok(fs.statSync(path.join(root, asset)).size > 1000, `Bild ist leer oder beschädigt: ${asset}`);
  assert.equal(path.extname(asset), '.webp', `Bild ist noch nicht als WebP optimiert: ${asset}`);
}
assert.equal(fs.readdirSync(path.join(root, 'assets')).some(file => file.endsWith('.png')), false, 'Nicht optimierte PNG-Dateien liegen noch im Bilderordner');

const gameSource = read('game.js');
const saveStart = gameSource.indexOf('const SAVE_VERSION=');
const saveEnd = gameSource.indexOf('let state=migrateState', saveStart);
assert.ok(saveStart >= 0 && saveEnd > saveStart, 'Speicherlogik konnte nicht gefunden werden');
const saveSource = read('data/depth-systems.js') + '\n' + read('data/grand-systems.js') + '\n' + gameSource.slice(saveStart, saveEnd) + '\n;globalThis.__saveApi={SAVE_VERSION,isCompatibleSave,migrateState};';
const saveContext = {
  structuredClone,
  REGIONS: {
    caerhaven: { name: 'Caerhaven', path: 'M0 0', x: 1, y: 2, color: '#123', loyalty: 87, unrest: 8 }
  },
  ADVISORS: [['Mara', 'Kanzlerin', '', 82]]
};
vm.runInNewContext(saveSource, saveContext, { filename: 'save-migration.js' });
const { SAVE_VERSION, isCompatibleSave, migrateState } = saveContext.__saveApi;
assert.equal(SAVE_VERSION, 16, 'Unerwartete Speicherstandsversion');
assert.equal(isCompatibleSave({ saveVersion: 15 }), true, 'Version 15 muss weiterhin ladbar sein');
assert.equal(isCompatibleSave({ saveVersion: 16 }), true, 'Aktuelle Version muss ladbar sein');
assert.equal(isCompatibleSave({ saveVersion: 17 }), false, 'Neuere unbekannte Version darf nicht überschrieben werden');

const migrated = migrateState({
  saveVersion: 15,
  turn: 40,
  life: { age: 22 },
  private: { stress: 73 },
  regions: { caerhaven: { loyalty: 44 } }
});
assert.equal(migrated.saveVersion, 16);
assert.equal(migrated.turn, 40, 'Rundenfortschritt ging bei der Migration verloren');
assert.equal(migrated.life.age, 22, 'Alter ging bei der Migration verloren');
assert.equal(Array.isArray(migrated.life.children), true, 'Fehlende Lebensfelder wurden nicht ergänzt');
assert.equal(migrated.life.children.length, 0, 'Neue Kinderliste muss bei alten Spielständen leer beginnen');
assert.equal(migrated.private.stress, 73, 'Privatwerte gingen bei der Migration verloren');
assert.equal(migrated.depth.court.length, 8, 'Der lebendige Hof wurde bei der Migration nicht ergänzt');
assert.equal(Object.keys(migrated.depth.world).length, 5, 'Autonome Nachbarreiche fehlen im migrierten Spielstand');
assert.equal(Object.keys(migrated.depth.economy.goods).length, 7, 'Warenwirtschaft fehlt im migrierten Spielstand');
assert.equal(Array.isArray(migrated.depth.innovation.unlocked), true, 'Forschungsfortschritt ist nicht speicherbar');
assert.equal(migrated.grand.houses.length, 6, 'Rivalisierende Dynastien wurden bei der Migration nicht ergänzt');
assert.equal(Object.keys(migrated.grand.government.laws).length, 7, 'Verfassung und Reichsgesetze fehlen im Spielstand');
assert.equal(Object.keys(migrated.grand.provinces).length, 8, 'Kultur-, Glaubens- und Ausbauwerte der Provinzen fehlen');
assert.equal(migrated.regions.caerhaven.loyalty, 44, 'Regionenfortschritt ging bei der Migration verloren');
assert.equal(migrated.regions.caerhaven.name, 'Caerhaven', 'Fehlende Regionsdaten wurden nicht ergänzt');

assert.match(gameSource, /escapeHtml\(h\.raw\)/, 'Freie Befehle werden in der Historie nicht sicher maskiert');
assert.doesNotMatch(gameSource, /n\.innerHTML=`<b>\$\{title\}/, 'Toast-Texte werden noch als ungeprüftes HTML eingesetzt');
assert.match(gameSource, /REGION_RENDER_SHAPES/, 'Die Kartenpolygone werden nicht zu sauberen Grenzen geglättet');
assert.match(gameSource, /assets\/map-painted-atlas-v2\.webp/, 'Der exakt ausgeschnittene Grenzatlas ist nicht eingebunden');
assert.match(gameSource, /vector-territories/, 'Länderbild und interaktive Spielflächen sind nicht verbunden');
assert.match(gameSource, /depthSystemsTurn\(\)/, 'Die tiefen Systeme laufen beim Rundenwechsel nicht mit');
assert.match(gameSource, /warLogisticsPanel/, 'Kriegslogistik ist nicht in die Länderkarte eingebunden');
assert.match(gameSource, /goodsMarketPanel/, 'Die Warenwirtschaft fehlt im Finanzbereich');
assert.match(gameSource, /grandSystemsTurn\(\)/, 'Die großen Reichssysteme laufen beim Rundenwechsel nicht mit');
assert.match(gameSource, /grandWarCouncilPanel/, 'Der interaktive Kriegsrat fehlt an der Front');
assert.match(gameSource, /grandSelectedProvincePanel/, 'Provinzkultur und Religion sind nicht in die Karte eingebunden');
assert.match(gameSource, /advanceCalendar\(\)/, 'Der beschleunigte Kalender ist nicht mit dem Rundenwechsel verbunden');
assert.match(gameSource, /livingTurn\(\)/, 'Die lebendige Welt läuft beim Rundenwechsel nicht mit');
assert.match(gameSource, /livingTreatyPanel/, 'Klauselverträge sind nicht mit den Ländern verbunden');
assert.match(gameSource, /privateWorldTurn\(\)/, 'Das vertiefte Privatleben läuft beim Rundenwechsel nicht mit');
assert.match(gameSource, /privateWorldView/, 'Die offenen privaten Lebenswege fehlen im Privatbereich');
assert.match(gameSource, /crownDepthTurn\(\)/, 'Die zehn verbundenen Tiefensysteme laufen beim Rundenwechsel nicht mit');
assert.match(gameSource, /crownLawPanel/, 'Der freie Gesetzesbaukasten fehlt im Staatsrat');
assert.match(gameSource, /crownExpeditionPanel/, 'Mehrjährige Expeditionen fehlen in der Diplomatie');
assert.match(gameSource, /crownLegacyPanel/, 'Das mehrstimmige Vermächtnis fehlt in der Chronik');

console.log(`Valdoria geprüft: ${scriptFiles.length} Skripte, ${assetReferences.size} Bilder und kompatible Speicherstände bis Version ${SAVE_VERSION}.`);
