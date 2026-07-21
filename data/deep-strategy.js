'use strict';

const GOODS={
 grain:{label:'GETREIDE',icon:'♨',basePrice:18,need:1.25},timber:{label:'HOLZ',icon:'♜',basePrice:24,need:.45},iron:{label:'EISEN',icon:'⚒',basePrice:42,need:.24},wine:{label:'WEIN',icon:'♧',basePrice:36,need:.18},medicine:{label:'MEDIZIN',icon:'✚',basePrice:58,need:.12},luxury:{label:'LUXUSGÜTER',icon:'✦',basePrice:74,need:.1},spices:{label:'GEWÜRZE',icon:'❈',basePrice:66,need:.08}
};

const REGION_ECONOMY={
 caerhaven:{terrain:'Küstenebene und Großhafen',access:'sea',produces:{luxury:28,wine:12},demands:{grain:28,timber:9,iron:8},capacity:88},
 falkenkrone:{terrain:'Hügelland und königliche Straßen',access:'road',produces:{luxury:12,wine:8},demands:{grain:18,timber:10,iron:6},capacity:76},
 ravengar:{terrain:'Flusstäler und offene Kornfelder',access:'road',produces:{grain:54,wine:10},demands:{iron:7,luxury:5},capacity:62},
 nordhaven:{terrain:'Fjorde, Gebirge und Winterpässe',access:'sea',produces:{iron:34,timber:38},demands:{grain:28,wine:8,medicine:5},capacity:58},
 eldoria:{terrain:'Weinberge, alte Straßen und Festungsstädte',access:'road',produces:{wine:38,grain:18},demands:{iron:8,luxury:8},capacity:69},
 aurelia:{terrain:'Dichte Handelsstädte und geschützte Buchten',access:'sea',produces:{luxury:46,wine:16},demands:{grain:32,iron:12,timber:8},capacity:94},
 lysara:{terrain:'Klostergärten, Inselarchive und ruhige Häfen',access:'sea',produces:{medicine:36,luxury:8},demands:{grain:18,timber:5},capacity:82},
 islands:{terrain:'Weit verstreute Inseln und schmale Meerengen',access:'sea',produces:{spices:40,luxury:12},demands:{grain:20,timber:12,iron:5},capacity:48}
};

const OFFICE_DEFS={
 chancellor:{label:'REICHSKANZLER',duty:'Gesetze, Verwaltung und regionale Statthalter',skill:'administration',candidates:['advisor:0','advisor:2','family:mother']},
 treasurer:{label:'SCHATZMEISTER',duty:'Haushalt, Preise, Handel und Staatskredit',skill:'finance',candidates:['advisor:2','advisor:0','family:queen']},
 marshal:{label:'REICHSMARSCHALL',duty:'Heer, Versorgung, Feldzüge und Festungen',skill:'martial',candidates:['advisor:3','advisor:1','family:mother']},
 spymaster:{label:'MEISTER DER SCHATTEN',duty:'Aufklärung, Gegenspionage und geheime Operationen',skill:'intrigue',candidates:['advisor:4','advisor:0','family:princess']},
 admiral:{label:'ERSTER SEELORD',duty:'Flotte, Seewege, Blockaden und Konvois',skill:'naval',candidates:['advisor:1','advisor:3','family:queen']}
};

const LAW_DEFS={
 crown_power:{category:'KRONE',label:'Königliche Gewalt',levels:[
  {label:'Ständische Mitregierung',text:'Adel und Städte müssen großen Erlassen zustimmen.',support:['nobles','cities'],oppose:['officers']},
  {label:'Ausgewogene Prärogative',text:'Die Krone regiert, bindet aber Rat und Stände ein.',support:['cities'],oppose:[]},
  {label:'Ungeteiltes Königssiegel',text:'Königliche Erlasse stehen über den ständischen Vorrechten.',support:['officers'],oppose:['nobles','cities']}]},
 land_rights:{category:'REGIONEN',label:'Rechte der Provinzen',levels:[
  {label:'Örtliche Chartas',text:'Regionen behalten Recht, Rat und weite Steuerhoheit.',support:['people','cities'],oppose:['officers']},
  {label:'Gemeinsames Kronrecht',text:'Lokales Recht gilt unter einer königlichen Rahmenordnung.',support:['cities'],oppose:[]},
  {label:'Einheitliche Verwaltung',text:'Kronbeamte ersetzen regionale Sonderrechte.',support:['officers'],oppose:['people','nobles']}]},
 trade_code:{category:'HANDEL',label:'Handelsordnung',levels:[
  {label:'Geschützte Zünfte',text:'Zünfte kontrollieren Preise, Ausbildung und Marktzugang.',support:['cities'],oppose:['merchants']},
  {label:'Königliche Marktaufsicht',text:'Krone und Gilden teilen Aufsicht und Schiedsgerichte.',support:['people'],oppose:[]},
  {label:'Freier Kronhandel',text:'Binnenzölle und Zunftschranken werden aufgehoben.',support:['merchants'],oppose:['cities']}]},
 army_code:{category:'MILITÄR',label:'Heeresordnung',levels:[
  {label:'Adelsaufgebot',text:'Bannerherren stellen Truppen und behalten eigene Offiziere.',support:['nobles'],oppose:['officers']},
  {label:'Gemischtes Heer',text:'Krontruppen, Stadtmilizen und Aufgebote dienen gemeinsam.',support:['nobles','officers'],oppose:[]},
  {label:'Stehendes Kronheer',text:'Berufsoffiziere und zentrale Magazine tragen das Heer.',support:['officers'],oppose:['nobles','people']}]},
 succession:{category:'DYNASTIE',label:'Thronfolgeordnung',levels:[
  {label:'Wahl im Hausrat',text:'Dynastie und Hochadel bestätigen den geeignetsten Erben.',support:['nobles'],oppose:['people']},
  {label:'Erstgeburtsrecht',text:'Das älteste legitime Kind folgt ohne weitere Wahl.',support:['people'],oppose:[]},
  {label:'Bestimmung durch die Krone',text:'Der regierende Monarch ernennt den geeignetsten Nachfolger.',support:['officers'],oppose:['nobles']}]}
};

const INTEL_OPERATIONS={
 reconnaissance:{label:'MILITÄRISCH AUFKLÄREN',cost:700000,turns:2,risk:14,effect:'Präzisere Stärke-, Festungs- und Versorgungsberichte'},
 network:{label:'AGENTENNETZ AUFBAUEN',cost:1400000,turns:3,risk:24,effect:'Dauerhaft bessere Informationen und neue Geheimoptionen'},
 sabotage:{label:'VERSORGUNG SABOTIEREN',cost:1800000,turns:3,risk:42,effect:'Magazine, Straßen oder Werften des Ziels schwächen'},
 propaganda:{label:'UNZUFRIEDENHEIT SCHÜREN',cost:1200000,turns:2,risk:32,effect:'Unruhe erhöhen und Regierungstreue untergraben'},
 claimant:{label:'THRONANWÄRTER FÖRDERN',cost:2600000,turns:4,risk:56,effect:'Eine langfristige innere Krise und valdorischen Einfluss schaffen'},
 counterintel:{label:'GEGENSPIONAGE VERSTÄRKEN',cost:1000000,turns:2,risk:8,effect:'Feindliche Agenten im eigenen Reich aufdecken'}
};

const WAR_OBJECTIVES={
 border:{label:'GRENZGEBIET SICHERN',supply:.85,pressure:.8,occupation:false},capital:{label:'HAUPTSTADT ERZWINGEN',supply:1.25,pressure:1.35,occupation:true},ports:{label:'HÄFEN UND HANDEL',supply:1.05,pressure:1.05,occupation:false},break_army:{label:'FEINDHEER ZERSCHLAGEN',supply:1.15,pressure:1.2,occupation:false}
};
const WAR_TACTICS={
 cautious:{label:'VORSICHTIGER VORSTOSS',attack:.88,loss:.65,supply:.8},balanced:{label:'GEORDNETE OFFENSIVE',attack:1,loss:1,supply:1},shock:{label:'ENTSCHEIDUNGSSCHLACHT',attack:1.28,loss:1.5,supply:1.3},siege:{label:'BELAGERUNG & BLOCKADE',attack:1.08,loss:.78,supply:1.18}
};

const PROJECT_DESIGNS={
 practical:{label:'ZWECKMÄSSIG',cost:.82,turns:-1,quality:-4,effect:'Schneller und günstiger, aber weniger repräsentativ'},
 balanced:{label:'AUSGEWOGEN',cost:1,turns:0,quality:0,effect:'Solide Ausführung ohne besondere Risiken'},
 monumental:{label:'MONUMENTAL',cost:1.35,turns:1,quality:12,effect:'Teurer und langsamer; starke politische und kulturelle Wirkung'},
 local:{label:'REGIONALER STIL',cost:1.08,turns:0,quality:6,effect:'Örtliche Materialien, Identität und Handwerker stärken'}
};
const PROJECT_CONTRACTORS={
 guild:{label:'FREIE BAUGILDEN',speed:0,corruption:10,support:'cities',effect:'Verlässlich und städtisch verankert'},
 crown:{label:'KÖNIGLICHES BAUAMT',speed:0,corruption:4,support:'officers',effect:'Strenge Aufsicht, hohe Verwaltungslast'},
 noble:{label:'REGIONALER ADEL',speed:-1,corruption:24,support:'nobles',effect:'Schneller Baubeginn, aber Patronage und Unterschlagung drohen'}
};

const DYNASTY_FOCI={
 scholar:{label:'GELEHRSAMKEIT',growth:{education:3,diplomacy:1},trait:'gelehrt'},steward:{label:'VERWALTUNG',growth:{finance:3,empathy:1},trait:'umsichtig'},diplomat:{label:'HOF & SPRACHEN',growth:{diplomacy:3,empathy:1},trait:'gewinnend'},warrior:{label:'WAFFEN & PFLICHT',growth:{martial:3,courage:2},trait:'wehrhaft'},free:{label:'FREIE KINDHEIT',growth:{empathy:2,courage:1},trait:'eigenwillig'}
};
const DYNASTY_TUTORS={
 cleric:{label:'GELEHRTER DES ARCHIVS',skill:'scholar',risk:'dogmatisch'},courtier:{label:'ERFAHRENE HÖFLINGIN',skill:'diplomat',risk:'ehrgeizig'},captain:{label:'VETERAN DER GARDE',skill:'warrior',risk:'streng'},merchant:{label:'MEISTER DER GILDE',skill:'steward',risk:'geschäftstüchtig'}
};

const FACTION_AGENDAS={
 merchants:{label:'HANDELSGILDEN',want:'offene Märkte, sichere Seewege und berechenbare Münze'},nobles:{label:'KRONADEL',want:'Ämter, regionale Vorrechte und Einfluss auf die Thronfolge'},officers:{label:'OFFIZIERSKORPS',want:'Sold, ein stehendes Heer und eine entschlossene Krone'},cities:{label:'FREIE STÄDTE',want:'Chartas, Zunftrechte und Mitsprache bei Steuern'},people:{label:'LANDBEVÖLKERUNG',want:'bezahlbares Brot, Schutz und maßvolle Abgaben'}
};
