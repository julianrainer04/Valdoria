/* Petitionen des Hoftags — jede Runde muss der König mehrere davon entscheiden.
   Jede Wahl wirkt quer durchs Reich; Nichtstun (neglect) hat ebenfalls Folgen. */

const PETITIONS=[
 {id:'taxroll',category:'FISKALPOLITIK',title:'Die Steuerrolle des Frühjahrs',text:'Die Schatzmeisterin legt die Steuerrolle vor. Wie streng soll die Krone eintreiben lassen?',choices:[
  {id:'hard',label:'STRENG EINTREIBEN',hint:'+3 Mio. ₲ · Volk −4 · Unruhe +2 überall',apply:s=>{s.reserve+=3000000;s.factions.people-=4;for(const r of Object.values(s.regions))r.unrest+=2;nudge(s,{coin:6,crown:4})}},
  {id:'measured',label:'MASSVOLL',hint:'Stabilität +1 · ausgewogener Kurs',apply:s=>{s.stats.stability+=1;s.factions.people+=1;nudge(s,{coin:2})}},
  {id:'relief',label:'STEUERERLASS',hint:'−2 Mio. ₲ · Volk +5 · Händler +2',apply:s=>{s.reserve-=2000000;s.factions.people+=5;s.factions.merchants+=2;nudge(s,{commons:8,coin:-4})}}],
  neglect:s=>{s.factions.people-=2;for(const r of Object.values(s.regions))r.unrest+=1}},
 {id:'courtday',category:'HOFTAG',title:'Bittsteller am Hoftag',text:'Adel, Städte und einfache Bittsteller drängen sich im Thronsaal. Wem schenkt der König sein Ohr?',choices:[
  {id:'nobles',label:'DEM ADEL',hint:'Adel +6 · Volk −2 · Legitimität −1',apply:s=>{s.factions.nobles+=6;s.factions.people-=2;s.stats.legitimacy-=1;nudge(s,{crown:-5})}},
  {id:'commons',label:'DEM VOLK',hint:'Volk +6 · Adel −3 · Loyalität steigt',apply:s=>{s.factions.people+=6;s.factions.nobles-=3;for(const r of Object.values(s.regions))r.loyalty+=1;nudge(s,{commons:7})}},
  {id:'distance',label:'HÖFISCHE DISTANZ',hint:'Legitimität +2 · alle Fraktionen −1',apply:s=>{s.stats.legitimacy+=2;for(const k in s.factions)s.factions[k]-=1;nudge(s,{crown:6})}}],
  neglect:s=>{s.factions.nobles-=2;s.factions.people-=2}},
 {id:'garrison',category:'MILITÄRVERWALTUNG',title:'Der Sold der Garnisonen',text:'Hauptleute melden ausstehenden Sold. Unbezahlte Garnisonen werden schnell zu einem Risiko.',when:s=>s.factions.officers<82||Object.values(s.regions).some(r=>r.garrison<40),choices:[
  {id:'pay',label:'SOLD ERHÖHEN',hint:'−3 Mio. ₲ · Offiziere +5 · Militärmacht +2',apply:s=>{s.reserve-=3000000;s.factions.officers+=5;s.stats.army+=2;nudge(s,{coin:-3})}},
  {id:'delay',label:'VERTRÖSTEN',hint:'Offiziere −4 · Garnisonen sinken',apply:s=>{s.factions.officers-=4;for(const r of Object.values(s.regions))r.garrison-=2;nudge(s,{coin:3})}},
  {id:'settle',label:'VETERANEN ANSIEDELN',hint:'−1 Mio. ₲ · Kernland-Loyalität +3 · Heer +1',apply:s=>{s.reserve-=1000000;s.regions.caerhaven.loyalty+=3;s.regions.falkenkrone.loyalty+=3;s.stats.army+=1;nudge(s,{commons:3})}}],
  neglect:s=>{s.factions.officers-=3;s.stats.army-=1}},
 {id:'tariffs',category:'HANDELSPOLITIK',title:'Die Zollordnung der Häfen',text:'Reeder und Zollmeister streiten über die Hafenzölle. Jede Ordnung verschiebt Gold und Gunst.',when:s=>s.stats.trade>55,choices:[
  {id:'lower',label:'ZÖLLE SENKEN',hint:'Handel +3 · Händler +4 · weniger Zolleinnahmen',apply:s=>{s.stats.trade+=3;s.factions.merchants+=4;s.modifiers.guildTax=(s.modifiers.guildTax||0)-0.01;nudge(s,{coin:6})}},
  {id:'crown',label:'KRONZOLL ERHEBEN',hint:'+2 Mio. ₲ · Händler −4',apply:s=>{s.reserve+=2000000;s.factions.merchants-=4;s.modifiers.guildTax=(s.modifiers.guildTax||0)+0.02;nudge(s,{crown:5})}},
  {id:'freeport',label:'FREIHÄFEN ÖFFNEN',hint:'Städte +5 · Handel +2',apply:s=>{s.factions.cities+=5;s.stats.trade+=2;nudge(s,{commons:4,coin:3})}}],
  neglect:s=>{s.factions.merchants-=2;s.stats.trade-=1}},
 {id:'festival',category:'HOF & KULTUR',title:'Das Fest der sieben Glocken',text:'Das Frühlingsfest steht bevor. Prunk stärkt den Mythos der Krone, kostet aber Gold.',choices:[
  {id:'grand',label:'PRUNKVOLL',hint:'−2 Mio. ₲ · Volk +5 · Ansehen +3 · Legitimität +2',apply:s=>{s.reserve-=2000000;s.factions.people+=5;s.private.reputation+=3;s.stats.legitimacy+=2;nudge(s,{crown:4})}},
  {id:'modest',label:'BESCHEIDEN',hint:'Volk +1 · Reserve geschont',apply:s=>{s.factions.people+=1;nudge(s,{coin:2})}},
  {id:'cancel',label:'ABSAGEN',hint:'+1 Mio. ₲ · Volk −4 · Unruhe +3',apply:s=>{s.reserve+=1000000;s.factions.people-=4;for(const r of Object.values(s.regions))r.unrest+=1;nudge(s,{coin:4,commons:-4})}}],
  neglect:s=>{s.factions.people-=2}},
 {id:'justice',category:'RECHTSPRECHUNG',title:'Ein Urteil der Krone',text:'Eine unruhige Region verlangt ein königliches Urteil. Milde oder Härte prägen das Ansehen der Krone.',when:s=>Object.values(s.regions).some(r=>r.unrest>22),choices:[
  {id:'mercy',label:'MILDE ÜBEN',hint:'Aufständische Region: Loyalität +5 · Unruhe −4 · Adel −2',apply:s=>{let id=topUnrest(s);s.regions[id].loyalty+=5;s.regions[id].unrest-=4;s.factions.nobles-=2;nudge(s,{commons:5})}},
  {id:'harsh',label:'HÄRTE ZEIGEN',hint:'Unruhe −8 dort · Volk −4 · Legitimität +2',apply:s=>{let id=topUnrest(s);s.regions[id].unrest-=8;s.factions.people-=4;s.stats.legitimacy+=2;nudge(s,{crown:6})}},
  {id:'local',label:'LOKALGERICHT',hint:'Städte +3 · Stabilität −1 · Autonomie steigt',apply:s=>{s.factions.cities+=3;s.stats.stability-=1;nudge(s,{crown:-4})}}],
  neglect:s=>{let id=topUnrest(s);s.regions[id].unrest+=3}},
 {id:'roads',category:'INFRASTRUKTUR',title:'Instandhaltung der Königsstraßen',text:'Boten melden verfallende Straßen und Brücken. Vernachlässigung bremst Handel und Verwaltung.',choices:[
  {id:'invest',label:'INVESTIEREN',hint:'−2 Mio. ₲ · Infrastruktur +3 · Handel +1',apply:s=>{s.reserve-=2000000;s.regions.ravengar.infrastructure+=3;s.regions.caerhaven.infrastructure+=3;s.stats.trade+=1;nudge(s,{coin:2})}},
  {id:'defer',label:'AUFSCHIEBEN',hint:'Reserve geschont · Unruhe +1 · Infrastruktur sinkt',apply:s=>{for(const r of Object.values(s.regions)){r.infrastructure-=1;r.unrest+=0}s.regions.ravengar.unrest+=1;nudge(s,{coin:3})}},
  {id:'corvee',label:'FRONDIENST',hint:'Volk −3 · Infrastruktur +2 · kein Gold',apply:s=>{s.factions.people-=3;s.regions.ravengar.infrastructure+=2;s.regions.caerhaven.infrastructure+=2;nudge(s,{crown:3,commons:-3})}}],
  neglect:s=>{s.regions.ravengar.infrastructure-=1;s.regions.caerhaven.infrastructure-=1}},
 {id:'corsairs',category:'MARITIME SICHERHEIT',title:'Kapermeldungen von den Inseln',text:'Freibeuter bedrängen die südlichen Routen. Die Reeder verlangen Schutz der Krone.',when:s=>s.regions.islands.unrest>12||s.stats.trade>60,choices:[
  {id:'patrol',label:'PATROUILLEN',hint:'−2 Mio. Militärfonds · Piraterie sinkt · Inseln +3',apply:s=>{s.militaryFund-=2000000;s.modifiers.piracy=Math.min(0,(s.modifiers.piracy||0)-0.03);s.regions.islands.loyalty+=3;nudge(s,{crown:2})}},
  {id:'letters',label:'KAPERBRIEFE',hint:'Handel +2 · Ansehen −2 · riskant',apply:s=>{s.stats.trade+=2;s.private.reputation-=2;nudge(s,{coin:5})}},
  {id:'ignore',label:'GEWÄHREN LASSEN',hint:'Inseln Unruhe +4 · Handel −2',apply:s=>{s.regions.islands.unrest+=4;s.stats.trade-=2;nudge(s,{coin:-2})}}],
  neglect:s=>{s.regions.islands.unrest+=3;s.stats.trade-=1}},
 {id:'granary',category:'VERSORGUNG',title:'Die Kornspeicher der Krone',text:'Die Ernte ist eingebracht. Der Rat streitet über Vorrat, freien Markt oder gewinnbringenden Export.',choices:[
  {id:'store',label:'VORRÄTE ANLEGEN',hint:'−2 Mio. ₲ · Volk +3 · Puffer gegen Krisen',apply:s=>{s.reserve-=2000000;s.factions.people+=3;s.modifiers.welfare=(s.modifiers.welfare||0)+0.01;nudge(s,{commons:4})}},
  {id:'market',label:'FREIER MARKT',hint:'Handel +2 · Unruhe +2',apply:s=>{s.stats.trade+=2;for(const r of Object.values(s.regions))r.unrest+=1;nudge(s,{coin:4})}},
  {id:'export',label:'EXPORT ERLAUBEN',hint:'+3 Mio. ₲ · Volk −3 · Händler +3',apply:s=>{s.reserve+=3000000;s.factions.people-=3;s.factions.merchants+=3;nudge(s,{coin:6,commons:-3})}}],
  neglect:s=>{s.factions.people-=2}},
 {id:'envoyletter',category:'DIPLOMATIE',title:'Ein Brief von einem fremden Hof',text:'Ein versiegelter Brief eines Nachbarreiches trifft ein. Annäherung, Zurückhaltung oder Stolz?',when:s=>true,choices:[
  {id:'embrace',label:'GESANDTSCHAFT',hint:'−1 Mio. ₲ · zwei Höfe +5',apply:s=>{s.reserve-=1000000;let ks=Object.keys(s.relations).sort((a,b)=>s.relations[b]-s.relations[a]).slice(0,2);ks.forEach(k=>s.relations[k]+=5);nudge(s,{coin:3})}},
  {id:'neutral',label:'ZURÜCKHALTUNG',hint:'Geheimdienst +2 · keine Bindung',apply:s=>{s.stats.intelligence+=2;nudge(s,{crown:2})}},
  {id:'rebuff',label:'STOLZ ZURÜCKWEISEN',hint:'Legitimität +1 · ein Hof −5',apply:s=>{s.stats.legitimacy+=1;let k=Object.keys(s.relations).sort((a,b)=>s.relations[a]-s.relations[b])[0];s.relations[k]-=5;nudge(s,{crown:4})}}],
  neglect:s=>{let k=Object.keys(s.relations).sort((a,b)=>s.relations[a]-s.relations[b])[0];s.relations[k]-=3}},
 {id:'census',category:'VERWALTUNG',title:'Die Musterung des Reiches',text:'Die Kanzlerin schlägt eine Volks- und Steuerzählung vor. Sie bringt Ordnung und Gold — doch das Volk fürchtet den Blick der Krone.',choices:[
  {id:'full',label:'VOLLE MUSTERUNG',hint:'+2 Mio. ₲ · Geheimdienst +2 · Volk −3',apply:s=>{s.reserve+=2000000;s.stats.intelligence+=2;s.factions.people-=3;nudge(s,{crown:4})}},
  {id:'light',label:'MASSVOLL ZÄHLEN',hint:'+1 Mio. ₲ · Stabilität +1',apply:s=>{s.reserve+=1000000;s.stats.stability+=1;nudge(s,{crown:2})}},
  {id:'none',label:'DARAUF VERZICHTEN',hint:'Volk +3 · keine neuen Daten',apply:s=>{s.factions.people+=3;nudge(s,{commons:3})}}],
  neglect:s=>{s.stats.intelligence-=1}},
 {id:'mercpay',category:'MILITÄR',title:'Werber vor den Toren',text:'Söldnerkompanien bieten der Krone ihre Dienste an. Rasche Stärke gegen bares Gold — und geteilte Loyalität.',when:s=>s.stats.army<80,choices:[
  {id:'hire',label:'ANWERBEN',hint:'−4 Mio. ₲ · Militärmacht +4 · Offiziere −2',apply:s=>{s.reserve-=4000000;s.stats.army+=4;s.factions.officers-=2;INC(s,'mercenaries');nudge(s,{coin:-2})}},
  {id:'drill',label:'EIGENE TRUPPEN DRILLEN',hint:'−2 Mio. ₲ · Militärmacht +2 · Offiziere +2',apply:s=>{s.reserve-=2000000;s.stats.army+=2;s.factions.officers+=2}},
  {id:'refuse',label:'WEGSCHICKEN',hint:'Reserve geschont · keine Verstärkung',apply:s=>{s.factions.people+=1;nudge(s,{coin:2})}}],
  neglect:s=>{s.stats.army-=1}},
 {id:'monument',category:'HOF & KULTUR',title:'Ein Denkmal der Krone',text:'Baumeister schlagen ein prächtiges Monument für die Ewigkeit vor — ein Zeichen der Macht, doch teuer und nicht jedem genehm.',choices:[
  {id:'build',label:'ERRICHTEN LASSEN',hint:'−3 Mio. ₲ · Legitimität +3 · Ansehen +3',apply:s=>{s.reserve-=3000000;s.stats.legitimacy+=3;s.private.reputation+=3;nudge(s,{crown:4})}},
  {id:'temple',label:'DEN GLOCKEN WEIHEN',hint:'−2 Mio. ₲ · Volk +5 · Glaube',apply:s=>{s.reserve-=2000000;s.factions.people+=5;nudge(s,{commons:4})}},
  {id:'skip',label:'GOLD SPAREN',hint:'Reserve geschont · Adel −1',apply:s=>{s.factions.nobles-=1;nudge(s,{coin:2})}}],
  neglect:s=>{}},
 {id:'spyring',category:'GEHEIMDIENST',title:'Ein Netz aus Ohren',text:'Die Meisterin der Schatten will ein Netz von Informanten in den Höfen der Welt knüpfen. Wissen hat seinen Preis.',when:s=>s.reserve>5000000,choices:[
  {id:'fund',label:'GROSSZÜGIG AUSSTATTEN',hint:'−3 Mio. ₲ · Geheimdienst +5',apply:s=>{s.reserve-=3000000;s.stats.intelligence+=5;INC(s,'shadow_web');nudge(s,{crown:2})}},
  {id:'modest',label:'BESCHEIDEN',hint:'−1 Mio. ₲ · Geheimdienst +2',apply:s=>{s.reserve-=1000000;s.stats.intelligence+=2}},
  {id:'counter',label:'LIEBER ABWEHR',hint:'Stabilität +2 · Spionageabwehr',apply:s=>{s.stats.stability+=2;s.stats.intelligence+=1}}],
  neglect:s=>{s.stats.intelligence-=1}},
 {id:'faminerelief',category:'VERSORGUNG',title:'Ein karger Winter',text:'Ein harter Winter leert die Speicher der Landbevölkerung. Ohne Hilfe droht Hunger — und Hunger gebiert Aufruhr.',when:s=>Object.values(s.regions).some(r=>r.unrest>18)||s.factions.people<70,choices:[
  {id:'relief',label:'KORN VERTEILEN',hint:'−3 Mio. ₲ · Volk +6 · Unruhe −3',apply:s=>{s.reserve-=3000000;s.factions.people+=6;for(const r of Object.values(s.regions))r.unrest-=2;INC(s,'benevolence');nudge(s,{commons:5})}},
  {id:'loan',label:'HÄNDLER BITTEN',hint:'Händler −4 · Volk +4 · geliehene Hilfe',apply:s=>{s.factions.merchants-=4;s.factions.people+=4;nudge(s,{commons:2})}},
  {id:'nothing',label:'DER NATUR ÜBERLASSEN',hint:'Unruhe +4 · Reserve geschont',apply:s=>{for(const r of Object.values(s.regions))r.unrest+=3;nudge(s,{crown:2,commons:-3})}}],
  neglect:s=>{s.factions.people-=3;for(const r of Object.values(s.regions))r.unrest+=2}},
 {id:'lawreform',category:'RECHTSPRECHUNG',title:'Ein neues Gesetzbuch',text:'Gelehrte legen ein neues Gesetzbuch vor. Klare Regeln stärken die Ordnung — doch jede Reform beschneidet alte Privilegien.',choices:[
  {id:'crownlaw',label:'KRONRECHT STÄRKEN',hint:'Legitimität +3 · Adel −4 · Zentralismus',apply:s=>{s.stats.legitimacy+=3;s.factions.nobles-=4;nudge(s,{crown:6})}},
  {id:'common',label:'GEMEINES RECHT',hint:'Volk +4 · Städte +3 · Gerechtigkeit',apply:s=>{s.factions.people+=4;s.factions.cities+=3;INC(s,'benevolence');nudge(s,{commons:5})}},
  {id:'noble',label:'ADELSPRIVILEGIEN WAHREN',hint:'Adel +6 · Volk −2',apply:s=>{s.factions.nobles+=6;s.factions.people-=2;nudge(s,{crown:-3})}}],
  neglect:s=>{s.stats.stability-=1}}
];
PETITIONS.push(
 {id:'midwives',category:'GESUNDHEIT',title:'Die Hebammen von Caerhaven',text:'Hebammen bitten um ein festes Haus für Geburten, Ausbildung und die Versorgung armer Mütter.',when:s=>s.turn>3,choices:[
  {id:'house',label:'GEBURTSHAUS STIFTEN',intent:'Ein leerstehendes Kronhaus wird mit Betten, Kräuterküche und Ausbildungsräumen ausgestattet.',apply:s=>{s.reserve-=1200000;s.factions.people+=4;s.regions.caerhaven.loyalty+=2}},
  {id:'guild',label:'HEBAMMENGILDE ANERKENNEN',intent:'Erfahrene Hebammen dürfen Ausbildung, Prüfung und Gebühren in einer eigenen Gilde regeln.',apply:s=>{s.factions.cities+=4;s.factions.people+=2;nudge(s,{crown:-2})}},
  {id:'parishes',label:'DEN PFARREIEN ÜBERTRAGEN',intent:'Kirchliche Gemeinden organisieren Räume und Hilfe; die Krone stellt lediglich eine Schutzurkunde aus.',apply:s=>{s.stats.stability+=2;s.factions.nobles+=1}}],neglect:s=>{s.factions.people-=2}},
 {id:'forest',category:'LAND & NATUR',title:'Die letzten Arvenwälder',text:'Schiffbauer verlangen mehr Eichen, während Dörfer vor kahlen Hängen und Überschwemmungen warnen.',when:s=>s.stats.navy>50,choices:[
  {id:'cut',label:'SCHLAGRECHTE VERGEBEN',intent:'Ausgewählte Werften dürfen festgelegte Waldstücke roden und das Holz direkt abtransportieren.',apply:s=>{s.buildingFund+=1200000;s.factions.merchants+=3;s.regions.falkenkrone.unrest+=2}},
  {id:'reserve',label:'KRONWALD SCHÜTZEN',intent:'Alte Waldgebiete werden vermessen; Rodung und Jagd sind dort nur noch mit königlicher Erlaubnis möglich.',apply:s=>{s.reserve-=400000;s.factions.people+=3;s.factions.nobles-=2}},
  {id:'plant',label:'FÜR JEDEN STAMM NEU PFLANZEN',intent:'Wer Holz schlägt, muss junge Bäume setzen und ihre Pflege mehrere Jahre finanzieren.',apply:s=>{s.factions.cities+=2;s.stats.stability+=2;s.stats.trade-=1}}],neglect:s=>{s.regions.falkenkrone.infrastructure-=1}},
 {id:'nightwatch',category:'STADTORDNUNG',title:'Laternen in den Hafengassen',text:'Nächtliche Überfälle nehmen zu. Wirte wollen Laternen, Händler bezahlte Wachen und Anwohner weniger Patrouillen vor ihren Türen.',when:s=>s.turn>2,choices:[
  {id:'lanterns',label:'LATERNENNETZ BAUEN',intent:'An Kreuzungen und Kais werden feste Öllaternen mit städtischen Lampenwärtern eingerichtet.',apply:s=>{s.reserve-=700000;s.regions.caerhaven.infrastructure+=2;s.factions.cities+=2}},
  {id:'watch',label:'BÜRGERWACHE ERLAUBEN',intent:'Jedes Viertel darf Bewohner für nächtliche Rundgänge wählen und aus einer gemeinsamen Kasse bezahlen.',apply:s=>{s.factions.cities+=4;s.regions.caerhaven.loyalty+=2;nudge(s,{crown:-2})}},
  {id:'soldiers',label:'SOLDATEN PATROUILLIEREN LASSEN',intent:'Garnisonstrupps kontrollieren jede Nacht Tore, Tavernen und dunkle Kais.',apply:s=>{s.regions.caerhaven.garrison+=2;s.factions.officers+=2;s.factions.people-=2}}],neglect:s=>{s.regions.caerhaven.unrest+=2}},
 {id:'orphans',category:'FÜRSORGE',title:'Die Kinder des Sturmwinters',text:'Nach dem Winter leben zahlreiche Waisen in Hafenlagern. Klöster, Handwerker und Marine bieten unterschiedliche Zukunftswege.',when:s=>s.turn>4,choices:[
  {id:'homes',label:'PFLEGEHÄUSER FINANZIEREN',intent:'Geprüfte Familien erhalten Unterstützung, wenn sie ein Kind aufnehmen und regelmäßig besucht werden.',apply:s=>{s.reserve-=1000000;s.factions.people+=4;s.stats.stability+=1}},
  {id:'craft',label:'LEHRSTELLEN VERMITTELN',intent:'Werkstätten erhalten Ausbildungsverträge und müssen Unterkunft, Essen und Unterricht gewährleisten.',apply:s=>{s.factions.cities+=4;s.stats.trade+=1;s.factions.people+=2}},
  {id:'navy',label:'MARINESCHULE ÖFFNEN',intent:'Ältere Waisen dürfen freiwillig in eine Schule für Navigation, Handwerk und Seedienst eintreten.',apply:s=>{s.stats.navy+=2;s.factions.officers+=2;s.factions.people-=1}}],neglect:s=>{s.factions.people-=3}},
 {id:'wineweights',category:'MARKTRECHT',title:'Falsche Maße auf dem Weinmarkt',text:'Käufer klagen über manipulierte Fässer und Gewichte. Händler nennen es alte Gewohnheit, die Zunft fordert ein einheitliches Maß.',when:s=>s.stats.trade>45,choices:[
  {id:'royal',label:'KRONMASS EINFÜHREN',intent:'Alle Märkte müssen versiegelte Gewichte und ein einheitliches Fassmaß der Krone verwenden.',apply:s=>{s.stats.trade+=2;s.stats.legitimacy+=2;s.factions.merchants-=2}},
  {id:'guild',label:'ZUNFT SELBST PRÜFEN LASSEN',intent:'Die Weinhändler kontrollieren Mitglieder selbst und veröffentlichen Namen verurteilter Betrüger.',apply:s=>{s.factions.merchants+=3;s.factions.cities+=1;nudge(s,{crown:-2})}},
  {id:'local',label:'ÖRTLICHE MASSE BEHALTEN',intent:'Jede Stadt darf ihre Maße behalten, muss sie aber am Markttor deutlich bekanntmachen.',apply:s=>{s.factions.cities+=3;s.stats.stability+=1}}],neglect:s=>{s.stats.trade-=1}},
 {id:'graveyard',category:'GLAUBE & STADT',title:'Der überfüllte Friedhof',text:'Caerhavens alter Friedhof ist voll. Geistliche, Anwohner und Baumeister streiten über einen neuen Ort für die Toten.',when:s=>s.turn>5,choices:[
  {id:'garden',label:'GEDENKGARTEN ANLEGEN',intent:'Außerhalb der Mauern entsteht ein begrünter Friedhof mit Kapelle und gemeinsam gepflegten Wegen.',apply:s=>{s.reserve-=900000;s.factions.people+=3;s.private.reputation+=1}},
  {id:'crypt',label:'GRUFTEN ERWEITERN',intent:'Unter der Kathedrale werden neue Grüfte für zahlende Familien und verdiente Amtsträger gebaut.',apply:s=>{s.reserve+=400000;s.factions.nobles+=3;s.factions.people-=1}},
  {id:'villages',label:'HEIMATDÖRFER VERPFLICHTEN',intent:'Verstorbene ohne Familiengrab werden zur Beisetzung in ihre Herkunftsgemeinden zurückgebracht.',apply:s=>{s.stats.stability+=1;s.factions.cities-=2}}],neglect:s=>{s.regions.caerhaven.unrest+=1}},
 {id:'bridgeinns',category:'REISE & POST',title:'Herbergen an der Königsstraße',text:'Boten beklagen unsichere Nächte zwischen den Städten. Wirte bieten feste Stationen gegen besondere Rechte an.',when:s=>s.turn>3,choices:[
  {id:'charter',label:'POSTHERBERGEN LIZENZIEREN',intent:'Ausgewählte Herbergen erhalten ein Schild der Krone und müssen Boten, Pferde und Reisende versorgen.',apply:s=>{s.reserve-=500000;s.regions.ravengar.infrastructure+=2;s.stats.intelligence+=1}},
  {id:'crown',label:'EIGENE POSTHÄUSER BAUEN',intent:'Die Krone errichtet bewachte Stationen mit Pferdestall, Schlafraum und Schreiber an den Hauptwegen.',apply:s=>{s.reserve-=1600000;s.regions.ravengar.infrastructure+=3;s.stats.legitimacy+=1}},
  {id:'monastery',label:'KLÖSTER EINBINDEN',intent:'Klöster entlang der Straße müssen Boten aufnehmen und erhalten dafür Befreiungen von Wegeabgaben.',apply:s=>{s.stats.stability+=2;s.factions.nobles+=1}}],neglect:s=>{s.stats.intelligence-=1}},
 {id:'widows',category:'HEER & FAMILIEN',title:'Die Witwen der Westflotte',text:'Familien ertrunkener Seeleute warten seit Monaten auf zugesagten Sold. Die Admirale fürchten einen Präzedenzfall.',when:s=>s.turn>5,choices:[
  {id:'pensions',label:'DAUERHAFTE RENTEN ZAHLEN',intent:'Eingetragene Familien erhalten regelmäßig einen Anteil des früheren Soldes.',apply:s=>{s.reserve-=1200000;s.factions.people+=4;s.armies[1].morale+=3}},
  {id:'jobs',label:'ARBEIT IN DEN WERFTEN GEBEN',intent:'Erwachsene Angehörige erhalten bevorzugt Stellen in Lager, Segelmacherei und Verwaltung.',apply:s=>{s.factions.merchants+=2;s.factions.people+=3;s.stats.navy+=1}},
  {id:'once',label:'EINMALIGE ABFINDUNG',intent:'Jede anerkannte Familie erhält eine einmalige Zahlung und schließt damit ihren Anspruch ab.',apply:s=>{s.reserve-=700000;s.factions.people+=1;s.armies[1].morale+=1}}],neglect:s=>{s.armies[1].morale-=2;s.factions.people-=2}},
 {id:'language',category:'BILDUNG & REGIONEN',title:'Welche Sprache in den Schulen?',text:'Neue Provinzen sprechen anders als Caerhaven. Lehrer bitten um klare Regeln für Unterricht, Urkunden und Prüfungen.',when:s=>Object.values(s.countryPolicy||{}).some(p=>p.annexed),choices:[
  {id:'valdor',label:'VALDORISCH VERPFLICHTEND',intent:'Unterricht und Prüfungen finden überall auf Valdorisch statt; örtliche Sprachen bleiben Privatsache.',apply:s=>{s.stats.legitimacy+=2;for(const [n,p] of Object.entries(s.countryPolicy))if(p.annexed){let id=countryRegionId(n);s.regions[id].unrest+=2;p.integration+=3}}},
  {id:'bilingual',label:'ZWEISPRACHIGE SCHULEN',intent:'Kinder lernen sowohl ihre Regionalsprache als auch Valdorisch; Urkunden werden doppelt geführt.',apply:s=>{s.reserve-=800000;s.factions.cities+=3;for(const [n,p] of Object.entries(s.countryPolicy))if(p.annexed){let id=countryRegionId(n);s.regions[id].loyalty+=3}}},
  {id:'local',label:'REGIONEN ENTSCHEIDEN LASSEN',intent:'Jede Provinz bestimmt ihre Unterrichtssprache selbst; nur die königliche Verwaltung nutzt Valdorisch.',apply:s=>{s.factions.cities+=4;nudge(s,{crown:-4})}}],neglect:s=>{s.stats.stability-=1}},
 {id:'clock',category:'HANDWERK & ZEIT',title:'Die Uhr im Hafenturm',text:'Uhrmacher bieten eine große mechanische Uhr an. Hafenarbeiter hoffen auf klare Schichten, Geistliche fürchten Konkurrenz zu den Glocken.',when:s=>s.turn>6,choices:[
  {id:'build',label:'TURMUHR BAUEN',intent:'Der Hafenturm erhält ein öffentliches Zifferblatt und ein Schlagwerk für Arbeits- und Gezeitenstunden.',apply:s=>{s.reserve-=900000;s.stats.trade+=2;s.factions.cities+=2}},
  {id:'bells',label:'MIT DEN KIRCHENGLOCKEN KOPPELN',intent:'Uhrmacher und Geistliche legen gemeinsam fest, wann Uhrwerk und Glocken den Tag anzeigen.',apply:s=>{s.stats.stability+=2;s.factions.nobles+=1;s.factions.cities+=1}},
  {id:'decline',label:'BEIM ALTEN RHYTHMUS BLEIBEN',intent:'Schichten und Märkte richten sich weiterhin nach Sonnenstand, Glocken und den Gezeiten.',apply:s=>{s.factions.people+=1;s.stats.trade-=1}}],neglect:s=>{s.factions.cities-=1}}
);
PETITIONS.push(
 {id:'shipwrights',category:'WERFTPOLITIK',title:'Streit um die Königswerft',text:'Zwei rivalisierende Schiffbaumeister bitten beide um den königlichen Bauauftrag für die neue Kriegsflotte. Nur einer kann den Zuschlag erhalten.',when:s=>s.stats.navy>45,choices:[
  {id:'veteran',label:'DEM ERFAHRENEN MEISTER',intent:'Der ältere Baumeister erhält den Auftrag — bewährte Technik, aber wenig Neuerung.',apply:s=>{s.stats.navy+=3;s.factions.officers+=2}},
  {id:'innovator',label:'DEM JUNGEN ERFINDER',intent:'Der jüngere Baumeister darf seine neuartigen Rumpfformen erproben — riskanter, aber vielversprechend.',apply:s=>{s.reserve-=800000;s.stats.navy+=1;s.stats.intelligence+=3;s.delayed.push({due:s.turn+3,title:'Die neuen Rümpfe bewähren sich',text:'Die ungewöhnlichen Bauformen erweisen sich auf See als schneller und wendiger als erwartet.',effects:{navy:4}})}},
  {id:'both',label:'BEIDE BETEILIGEN',intent:'Beide Werften teilen sich den Auftrag und liefern sich einen offenen Wettstreit um Qualität.',apply:s=>{s.reserve-=1500000;s.stats.navy+=2;s.factions.merchants+=2}}],neglect:s=>{s.stats.navy-=1}},
 {id:'poachers',category:'JAGDRECHT',title:'Wilderer in den Königswäldern',text:'Förster fassen wiederholt arme Dorfbewohner beim Wildern in den königlichen Jagdgründen. Der Adel verlangt Strenge, das Volk Nachsicht.',when:s=>s.turn>4,choices:[
  {id:'harsh',label:'STRENGE STRAFEN',intent:'Wilderei wird mit hohen Bußen und öffentlicher Bloßstellung geahndet.',apply:s=>{s.factions.nobles+=4;s.factions.people-=4}},
  {id:'allow',label:'JAGD IN NOTZEITEN ERLAUBEN',intent:'Arme Familien dürfen in klar begrenzten Zeiten und Gebieten legal jagen.',apply:s=>{s.factions.people+=5;s.factions.nobles-=3;nudge(s,{commons:4})}},
  {id:'buyout',label:'WILDBRET ABKAUFEN',intent:'Die Krone kauft erlegtes Wild zu einem festen Preis auf, statt es zu bestrafen.',apply:s=>{s.reserve-=500000;s.factions.people+=3;s.factions.nobles+=1}}],neglect:s=>{s.factions.nobles-=1}},
 {id:'mintreform',category:'MÜNZWESEN',title:'Leichte Münzen im Umlauf',text:'Händler beklagen beschnittene und gestreckte Münzen. Die Münzmeisterin schlägt eine Reform der Prägung vor.',when:s=>s.stats.trade>50,choices:[
  {id:'reform',label:'NEUE PRÄGUNG EINFÜHREN',intent:'Alle Münzen werden neu geprägt, mit schwerer fälschbarem Rand und königlichem Siegel.',apply:s=>{s.reserve-=2500000;s.stats.trade+=3;s.inflation-=.2;s.factions.merchants+=2}},
  {id:'partial',label:'NUR GROSSE MÜNZEN ERSETZEN',intent:'Nur hochwertige Münzen werden neu geprägt, kleine Scheidemünzen bleiben unverändert.',apply:s=>{s.reserve-=900000;s.stats.trade+=1;s.inflation-=.1}},
  {id:'ignore',label:'DEM MARKT ÜBERLASSEN',intent:'Händler und Wechsler sollen selbst über Wert und Vertrauen der Münzen entscheiden.',apply:s=>{s.inflation+=.2;s.factions.merchants-=2}}],neglect:s=>{s.inflation+=.1}},
 {id:'foreignmerchant',category:'HANDELSRECHT',title:'Ein aurelisches Handelshaus wirbt um Sonderrechte',text:'Ein mächtiges aurelisches Handelshaus bietet der Krone Kapital für ein alleiniges Kontor in Caerhaven — gegen ein Vorkaufsrecht auf den wertvollsten Waren.',when:s=>s.relations.Aurelia>5,choices:[
  {id:'grant',label:'MONOPOL GEWÄHREN',intent:'Das Haus erhält ein exklusives Kontor gegen eine große Vorauszahlung an die Krone.',apply:s=>{s.reserve+=4000000;s.relations.Aurelia+=6;s.factions.merchants-=5}},
  {id:'limited',label:'BEFRISTETE LIZENZ',intent:'Das Kontor wird nur für wenige Jahre und begrenzte Warenarten zugelassen.',apply:s=>{s.reserve+=1500000;s.relations.Aurelia+=3;s.factions.merchants-=1}},
  {id:'refuse',label:'HEIMISCHEN HÄNDLERN VORRANG GEBEN',intent:'Die Krone lehnt das Angebot ab und stärkt stattdessen valdorische Kaufleute.',apply:s=>{s.factions.merchants+=6;s.relations.Aurelia-=3;nudge(s,{commons:3})}}],neglect:s=>{s.relations.Aurelia-=2}},
 {id:'plaguewatch',category:'GESUNDHEITSVORSORGE',title:'Ständige Quarantänehäuser',text:'Ärzte der Krone schlagen feste Quarantänehäuser an den Häfen vor, um künftige Seuchen früh einzudämmen — teuer im Unterhalt, aber ein dauerhafter Schutz.',when:s=>s.turn>7,choices:[
  {id:'build',label:'HÄUSER ERRICHTEN',intent:'An den größten Häfen entstehen feste, ständig besetzte Quarantänestationen.',apply:s=>{s.reserve-=2600000;s.stats.stability+=2;s.modifiers.welfare=(s.modifiers.welfare||0)+0.01}},
  {id:'volunteer',label:'AUF FREIWILLIGE ÄRZTE SETZEN',intent:'Statt fester Bauten verpflichtet die Krone reisende Ärzte auf Abruf.',apply:s=>{s.reserve-=700000;s.stats.stability+=1}},
  {id:'skip',label:'GOLD SPAREN',intent:'Die Krone verlässt sich weiterhin auf Einzelmaßnahmen im Ernstfall.',apply:s=>{s.factions.people-=1}}],neglect:s=>{s.stats.stability-=1}},
 {id:'noblewards',category:'VORMUNDSCHAFT',title:'Ein minderjähriger Erbe ohne Vormund',text:'Nach dem Tod eines Grafen bleibt dessen minderjähriger Sohn ohne anerkannten Vormund zurück. Mehrere Verwandte bewerben sich — nicht ganz uneigennützig.',when:s=>s.factions.nobles>40&&s.turn>6,choices:[
  {id:'crown',label:'KRONVORMUNDSCHAFT',intent:'Die Krone selbst verwaltet Erbe und Erziehung des Jungen bis zur Volljährigkeit.',apply:s=>{s.reserve+=800000;s.stats.legitimacy+=2;s.factions.nobles-=2;nudge(s,{crown:4})}},
  {id:'uncle',label:'DEM ONKEL ÜBERTRAGEN',intent:'Der nächste männliche Verwandte erhält Vormundschaft und Verwaltung des Erbes.',apply:s=>{s.factions.nobles+=5;nudge(s,{crown:-2})}},
  {id:'council',label:'EINEN VORMUNDSCHAFTSRAT EINSETZEN',intent:'Drei unabhängige Adlige teilen sich die Aufsicht und sollen einander kontrollieren.',apply:s=>{s.stats.stability+=1;s.factions.nobles+=2}}],neglect:s=>{s.factions.nobles-=2}},
 {id:'harborfees',category:'HAFENABGABEN',title:'Streit um die Liegegebühren',text:'Kapitäne und Hafenmeister streiten über neue Liegegebühren für fremde Schiffe. Zu hoch, und Handelsschiffe meiden Caerhaven; zu niedrig, und die Krone verliert Einnahmen.',when:s=>s.stats.trade>48,choices:[
  {id:'raise',label:'GEBÜHREN ANHEBEN',intent:'Fremde Schiffe zahlen künftig deutlich mehr für jeden Tag am Kai.',apply:s=>{s.reserve+=1800000;s.stats.trade-=2;s.factions.merchants-=2}},
  {id:'keep',label:'GEBÜHREN UNVERÄNDERT LASSEN',intent:'Der Hafenmeister behält die bisherige, bewährte Gebührenordnung bei.',apply:s=>{s.stats.stability+=1}},
  {id:'lower',label:'GEBÜHREN SENKEN',intent:'Niedrigere Gebühren sollen mehr fremde Schiffe nach Caerhaven locken.',apply:s=>{s.reserve-=600000;s.stats.trade+=3;s.factions.merchants+=3}}],neglect:s=>{s.stats.trade-=1}},
 {id:'scholarsstipend',category:'BILDUNGSFÖRDERUNG',title:'Stipendien für begabte Kinder',text:'Ein Gelehrter schlägt vor, begabte Kinder aus einfachen Familien mit königlichen Stipendien an die Akademie zu holen — gegen den Widerstand mancher Adliger.',when:s=>s.stats.intelligence>35,choices:[
  {id:'fund',label:'STIPENDIEN EINRICHTEN',intent:'Jährlich werden mehrere Plätze an der Akademie für begabte Kinder aus dem Volk reserviert.',apply:s=>{s.reserve-=1400000;s.stats.intelligence+=3;s.factions.people+=4;s.factions.nobles-=2;nudge(s,{commons:3})}},
  {id:'partial',label:'NUR EINZELFÄLLE FÖRDERN',intent:'Besonders herausragende Kinder werden künftig von Fall zu Fall gefördert.',apply:s=>{s.reserve-=400000;s.stats.intelligence+=1;s.factions.people+=1}},
  {id:'decline',label:'BEI ADELSPRIVILEG BLEIBEN',intent:'Die Akademie bleibt weiterhin überwiegend adligen Familien vorbehalten.',apply:s=>{s.factions.nobles+=3;s.factions.people-=2}}],neglect:s=>{s.stats.intelligence-=1}},
 {id:'falconry',category:'HOFBRAUCH',title:'Die königliche Falknerei',text:'Der Falkenmeister bittet um Mittel für neue Vögel und Käfige — ein Zeichen höfischer Pracht, das Nachbarhöfe stets beeindruckt hat.',when:s=>s.turn>3,choices:[
  {id:'grand',label:'GROSSZÜGIG AUSSTATTEN',intent:'Seltene Falken aus Lysara und neue Volieren sollen den Hof schmücken.',apply:s=>{s.reserve-=900000;s.private.reputation+=2;s.factions.nobles+=2}},
  {id:'modest',label:'BESCHEIDEN AUFSTOCKEN',intent:'Nur die dringendsten Ausbesserungen an Käfigen und Ausrüstung werden bezahlt.',apply:s=>{s.reserve-=250000;s.factions.nobles+=1}},
  {id:'skip',label:'MITTEL VERWEIGERN',intent:'Der Falkenmeister muss mit dem bestehenden Bestand auskommen.',apply:s=>{s.factions.nobles-=2}}],neglect:s=>{}},
 {id:'coastalwatch',category:'KÜSTENSCHUTZ',title:'Signaltürme entlang der Küste',text:'Admirale schlagen eine Kette von Signaltürmen vor, die Piratenüberfälle künftig weit vor der Küste melden würden — ein dauerhafter, aber teurer Schutz.',when:s=>s.stats.navy>40,choices:[
  {id:'build',label:'TURMKETTE ERRICHTEN',intent:'Entlang der gesamten Küste entstehen bemannte Signaltürme mit Feuer- und Flaggenzeichen.',apply:s=>{s.buildingFund-=2400000;s.modifiers.piracy=Math.min(0,(s.modifiers.piracy||0)-0.02);s.stats.navy+=2}},
  {id:'partial',label:'NUR GEFÄHRDETE ABSCHNITTE',intent:'Türme entstehen zunächst nur an den beiden am stärksten bedrohten Küstenabschnitten.',apply:s=>{s.buildingFund-=900000;s.modifiers.piracy=Math.min(0,(s.modifiers.piracy||0)-0.01)}},
  {id:'skip',label:'AUF DIE FLOTTE VERTRAUEN',intent:'Patrouillenschiffe sollen weiterhin allein für Sicherheit auf See sorgen.',apply:s=>{s.stats.navy+=1}}],neglect:s=>{s.modifiers.piracy=(s.modifiers.piracy||0)+0.01}}
);
