/* Offene Regentschaft: Diese Lagen gehören keinem festen Handlungsstrang an.
   Sie werden immer neu aus dem Zustand des Reiches zusammengesetzt. */

const EMERGENT_TEMPLATES=[
 {id:'regional_voice',category:'REGION & RECHT',when:()=>true,make:(s,c)=>({title:`Die Stimmen von ${c.region.name}`,text:`Abgesandte aus ${c.region.name} verlangen eine Ordnung, die zu ihrer Loyalität von ${Math.round(c.region.loyalty)}% und ihrer eigenen Kultur passt.`,choices:[
  {label:'LOKALE CHARTA',hint:'Loyalität +7 · Städte +3 · Kronkurs lockerer',apply:x=>{c.region.loyalty+=7;c.region.unrest-=3;x.factions.cities+=3;nudge(x,{crown:-6,commons:3})}},
  {label:'KÖNIGLICHE BEAMTE',hint:'Legitimität +2 · Geheimdienst +2 · Unruhe +3',apply:x=>{x.stats.legitimacy+=2;x.stats.intelligence+=2;c.region.unrest+=3;nudge(x,{crown:7})}},
  {label:'EIGENE LÖSUNG AUSHANDELN',hint:'1 Mio. ₲ · Loyalität +4 · Stabilität +2',apply:x=>{x.reserve-=1000000;c.region.loyalty+=4;x.stats.stability+=2;nudge(x,{commons:2})}}]})},
 {id:'guild_credit',category:'HANDEL & MACHT',when:s=>s.stats.trade>50,make:(s,c)=>({title:'Kapital sucht Einfluss',text:`Caerhavens Gilden bieten der Krone frisches Kapital. Ihr Preis ist Mitsprache, während ${c.target} Valdorias Entscheidung aufmerksam beobachtet.`,choices:[
  {label:'GILDEN BETEILIGEN',hint:'+6 Mio. ₲ · Händler +6 · Kronautorität −2',apply:x=>{x.reserve+=6000000;x.debt+=3000000;x.factions.merchants+=6;x.stats.legitimacy-=2;nudge(x,{coin:7,crown:-3})}},
  {label:'KRONFONDS GRÜNDEN',hint:'5 Mio. ₲ · Handelsfonds +5 Mio. · Legitimität +2',apply:x=>{x.reserve-=5000000;x.tradeFund+=5000000;x.stats.legitimacy+=2;nudge(x,{crown:4,coin:3})}},
  {label:'FREIE HÄFEN ZULASSEN',hint:'Handel +3 · Städte +4 · Zolleinnahmen sinken',apply:x=>{x.stats.trade+=3;x.factions.cities+=4;x.financePolicy.customs='open';nudge(x,{coin:5,commons:2})}}]})},
 {id:'veterans',category:'HEER & GESELLSCHAFT',when:s=>s.stats.army>55,make:(s,c)=>({title:`Veteranen vor den Toren von ${c.region.name}`,text:'Ausgediente Soldaten verlangen Land, Sold oder eine neue Aufgabe. Ihre Loyalität kann das Reich tragen oder gegen es stehen.',choices:[
  {label:'LAND ZUTEILEN',hint:'2 Mio. ₲ · Loyalität +5 · Volk +2',apply:x=>{x.reserve-=2000000;c.region.loyalty+=5;x.factions.people+=2;nudge(x,{commons:4})}},
  {label:'GRENZWACHE BILDEN',hint:'Militärfonds −2 Mio. · Garnison +8 · Offiziere +2',apply:x=>{x.militaryFund=Math.max(0,x.militaryFund-2000000);c.region.garrison+=8;x.factions.officers+=2;nudge(x,{crown:4})}},
  {label:'ENTLASSUNGSGELD ZAHLEN',hint:'1 Mio. ₲ · Stabilität +2 · Heeresmoral −1',apply:x=>{x.reserve-=1000000;x.stats.stability+=2;x.armies[0].morale-=1}}]})},
 {id:'royal_house',category:'HAUS & KRONE',when:()=>true,make:(s,c)=>({title:'Die Familie spricht ohne Zeugen',text:'Ein privates Gespräch berührt zugleich Erziehung, Ehe und Staatsräson. Niemand am Tisch verlangt dieselbe Zukunft.',choices:[
  {label:'DER FAMILIE ZEIT GEBEN',hint:'Belastung −10 · Beziehungen + · Rat verliert Zeit',apply:x=>{x.private.stress-=10;x.private.queen+=4;x.private.heir+=3;x.stats.stability-=1;nudge(x,{commons:2})}},
  {label:'DIE DYNASTIE POLITISCH NUTZEN',hint:'Legitimität +3 · Thronreife +4 · Belastung +6',apply:x=>{x.stats.legitimacy+=3;x.private.heir+=4;x.private.stress+=6;nudge(x,{crown:5})}},
  {label:'JEDEM EINEN EIGENEN WEG LASSEN',hint:'Zuneigung +5 · Adel −2 · Städte +2',apply:x=>{x.private.queen+=5;x.private.princess+=5;x.factions.nobles-=2;x.factions.cities+=2;nudge(x,{crown:-4,commons:3})}}]})},
 {id:'new_method',category:'WISSEN & WANDEL',when:s=>s.stats.intelligence>50,make:(s,c)=>({title:'Eine Erfindung ohne Gesetz',text:'Gelehrte präsentieren ein Verfahren, das Verwaltung und Handel verändern könnte. Gilden, Kirche und Beamte streiten bereits um die Kontrolle.',choices:[
  {label:'FREI VERÖFFENTLICHEN',hint:'Städte +5 · Handel +2 · Krone gibt Kontrolle ab',apply:x=>{x.factions.cities+=5;x.stats.trade+=2;nudge(x,{crown:-5,commons:3})}},
  {label:'ALS KRONGEHEIMNIS BEWAHREN',hint:'Geheimdienst +4 · Legitimität +1 · Gelehrte −',apply:x=>{x.stats.intelligence+=4;x.stats.legitimacy+=1;x.factions.cities-=2;nudge(x,{crown:6})}},
  {label:'GEMEINSAME AKADEMIE GRÜNDEN',hint:'3 Mio. ₲ · Baufonds +2 Mio. · Stabilität +2',apply:x=>{x.reserve-=3000000;x.buildingFund+=2000000;x.stats.stability+=2;x.relations.Lysara+=3}}]})},
 {id:'border_signal',category:'AUSSENPOLITIK',when:()=>true,make:(s,c)=>({title:`Unklare Signale aus ${c.target}`,text:`Kundschafter melden gleichzeitig Truppenbewegungen und Friedensbotschaften aus ${c.target}. Valdoria kann drohen, prüfen oder die Initiative teilen.`,choices:[
  {label:'MACHT DEMONSTRIEREN',hint:`${c.target} −8 · Militärmacht +2 · Stabilität −1`,apply:x=>{x.relations[c.target]-=8;x.stats.army+=2;x.stats.stability-=1;nudge(x,{crown:5})}},
  {label:'GEHEIME SONDIERUNG',hint:'1 Mio. ₲ · Geheimdienst +3 · Beziehung +3',apply:x=>{x.reserve-=1000000;x.stats.intelligence+=3;x.relations[c.target]+=3}},
  {label:'GRENZMARKT ÖFFNEN',hint:'Handel +2 · Beziehung +6 · Offiziere −2',apply:x=>{x.stats.trade+=2;x.relations[c.target]+=6;x.factions.officers-=2;nudge(x,{coin:4})}}]})},
 {id:'labor_bargain',category:'ARBEIT & HÄFEN',when:s=>s.stats.trade>60,make:(s,c)=>({title:'Die Lastträger legen die Seile nieder',text:'In den Häfen stockt die Arbeit. Höhere Löhne, Zwang oder Selbstverwaltung würden jeweils ein anderes Valdoria schaffen.',choices:[
  {label:'LÖHNE ERHÖHEN',hint:'2 Mio. ₲ · Volk +5 · Handel +1',apply:x=>{x.reserve-=2000000;x.factions.people+=5;x.stats.trade+=1;nudge(x,{commons:5})}},
  {label:'GILDEN VERANTWORTLICH MACHEN',hint:'Händler −5 · Stabilität +2 · Zölle +',apply:x=>{x.factions.merchants-=5;x.stats.stability+=2;x.modifiers.guildTax+=.01;nudge(x,{crown:3})}},
  {label:'HAFENRÄTE ZULASSEN',hint:'Städte +6 · Kronkurs lockerer · Handel +2',apply:x=>{x.factions.cities+=6;x.stats.trade+=2;nudge(x,{crown:-7,commons:4})}}]})},
 {id:'builders_choice',category:'BAU & ZUKUNFT',when:s=>s.projects.length>0,make:(s,c)=>({title:'Die Baustellen verändern das Land',text:`Material, Arbeiter und Erwartungen sammeln sich um ${PROJECTS.find(p=>p.id===s.projects[0].id)?.name||'das neue Werk'}. Wer soll den entstehenden Wohlstand lenken?`,choices:[
  {label:'LOKALE ARBEITER BEVORZUGEN',hint:'Volk +4 · Bauunterhalt +0,5 Mio. · Unruhe sinkt',apply:x=>{x.factions.people+=4;x.reserve-=500000;for(const r of Object.values(x.regions))r.unrest-=1;nudge(x,{commons:4})}},
  {label:'GILDENVERTRÄGE',hint:'Händler +4 · Baufonds +1 Mio. · Städte −1',apply:x=>{x.factions.merchants+=4;x.buildingFund+=1000000;x.factions.cities-=1;nudge(x,{coin:4})}},
  {label:'KRONBAUHÜTTE',hint:'Legitimität +2 · Geheimdienst +1 · 1 Mio. ₲',apply:x=>{x.reserve-=1000000;x.stats.legitimacy+=2;x.stats.intelligence+=1;nudge(x,{crown:5})}}]})},
 {id:'storm_damage',category:'NATURGEWALT',when:()=>true,make:(s,c)=>({title:`Sturmflut über ${c.region.name}`,text:`Eine Sturmflut hat Kais, Dächer und Speicher in ${c.region.name} beschädigt. Die Infrastruktur der Region ist auf ${Math.round(c.region.infrastructure)}% gesunken, und jede Stunde ohne Hilfe treibt die Unruhe weiter.`,choices:[
  {label:'SOFORTHILFE ENTSENDEN',hint:'2 Mio. ₲ · Infrastruktur der Region +5 · Unruhe −4',apply:x=>{x.reserve-=2000000;c.region.infrastructure+=5;c.region.unrest-=4;nudge(x,{commons:3})}},
  {label:'GILDEN ZUM WIEDERAUFBAU VERPFLICHTEN',hint:'Händler −4 · Infrastruktur +3 · Reserve geschont',apply:x=>{x.factions.merchants-=4;c.region.infrastructure+=3;nudge(x,{crown:3})}},
  {label:'DEN WINTER ÜBER WARTEN',hint:'Reserve geschont · Unruhe +6 · Wohlstand sinkt',apply:x=>{c.region.unrest+=6;c.region.wealth-=3;nudge(x,{coin:2})}}]})},
 {id:'faith_question',category:'GLAUBE & FEST',when:()=>true,make:(s,c)=>({title:'Der Hohepriester bittet um ein Urteil',text:'Zwei Auslegungen der Sieben Glocken stehen gegeneinander — die eine predigt Demut vor der Krone, die andere Mitsprache des Volkes. Beide Seiten erwarten, dass Ihr Partei ergreift.',choices:[
  {label:'DIE DEMÜTIGE AUSLEGUNG STÜTZEN',hint:'Legitimität +3 · Adel +2 · Volk −2',apply:x=>{x.stats.legitimacy+=3;x.factions.nobles+=2;x.factions.people-=2;nudge(x,{crown:5})}},
  {label:'DIE VOLKSNAHE AUSLEGUNG STÜTZEN',hint:'Volk +5 · Adel −2 · Stabilität +1',apply:x=>{x.factions.people+=5;x.factions.nobles-=2;x.stats.stability+=1;nudge(x,{commons:5})}},
  {label:'BEIDE SEITEN ZU EINEM KONZIL LADEN',hint:'1 Mio. ₲ · Stabilität +3 · keine endgültige Antwort',apply:x=>{x.reserve-=1000000;x.stats.stability+=3;nudge(x,{crown:-2,commons:2})}}]})},
 {id:'foreign_scholars',category:'KULTUR & AUSTAUSCH',when:s=>s.stats.intelligence>40,make:(s,c)=>({title:`Gelehrte aus ${c.target} suchen Aufnahme`,text:`Eine kleine Gruppe von Gelehrten, Ärzten und Künstlern aus ${c.target} bittet um Aufnahme an Valdorias Hof. Ihr Wissen ist wertvoll, ihre Herkunft am Hof nicht unumstritten.`,choices:[
  {label:'MIT OFFENEN ARMEN AUFNEHMEN',hint:'Geheimdienst +3 · Beziehung +6 · Adel −2',apply:x=>{x.stats.intelligence+=3;x.relations[c.target]+=6;x.factions.nobles-=2}},
  {label:'NUR AUSGEWÄHLTE ZULASSEN',hint:'Geheimdienst +1 · Adel +1 · Beziehung +2',apply:x=>{x.stats.intelligence+=1;x.factions.nobles+=1;x.relations[c.target]+=2}},
  {label:'HÖFLICH ABWEISEN',hint:'Beziehung −5 · Adel +2 · Autorität der Krone',apply:x=>{x.relations[c.target]-=5;x.factions.nobles+=2;nudge(x,{crown:4})}}]})},
 {id:'succession_rumor',category:'HAUS & NACHFOLGE',when:s=>s.life&&!s.life.regency,make:(s,c)=>({title:'Gerüchte über die Nachfolge',text:'Am Hof kursiert offen die Frage, wer im Falle Eures plötzlichen Todes das Reich führen würde. Manche Adlige nutzen die Unsicherheit bereits, um eigene Ansprüche vorzubereiten.',choices:[
  {label:'DIE NACHFOLGE ÖFFENTLICH KLÄREN',hint:'Legitimität +3 · Thronreife +5 · Adel −2',apply:x=>{x.stats.legitimacy+=3;x.private.heir+=5;x.factions.nobles-=2;nudge(x,{crown:3})}},
  {label:'DIE FRAGE BEWUSST OFFEN LASSEN',hint:'Adel +3 · Legitimität −2 · Spielraum bewahrt',apply:x=>{x.factions.nobles+=3;x.stats.legitimacy-=2}},
  {label:'GERÜCHTE VERFOLGEN LASSEN',hint:'1 Mio. ₲ · Geheimdienst +3 · Adel −3',apply:x=>{x.reserve-=1000000;x.stats.intelligence+=3;x.factions.nobles-=3;nudge(x,{crown:4})}}]})},
 {id:'smuggling_network',category:'SCHATTENWIRTSCHAFT',when:s=>s.stats.intelligence<50,make:(s,c)=>({title:`Schmuggelpfade um ${c.region.name}`,text:`Die Schattenmeisterin meldet ein wachsendes Netz aus Schmugglern, das Zölle in ${c.region.name} umgeht. Ihre Beweise sind lückenhaft, ihr Verdacht deutlich.`,choices:[
  {label:'RAZZIEN ANORDNEN',hint:'2 Mio. Militärfonds · Region Unruhe +4 · Zolleinnahmen +',apply:x=>{x.militaryFund-=2000000;c.region.unrest+=4;x.reserve+=1800000;nudge(x,{crown:3})}},
  {label:'ZÖLLE STILLSCHWEIGEND SENKEN',hint:'Handel +2 · Schmuggel verliert Reiz · Einnahmen sinken',apply:x=>{x.stats.trade+=2;x.modifiers.guildTax=(x.modifiers.guildTax||0)-0.01;nudge(x,{coin:-2,commons:2})}},
  {label:'INFORMANTEN KAUFEN',hint:'1 Mio. ₲ · Geheimdienst +3 · Region Loyalität +2',apply:x=>{x.reserve-=1000000;x.stats.intelligence+=3;c.region.loyalty+=2}}]})},
 {id:'alliance_proposal',category:'HOF & BÜNDNIS',when:()=>true,make:(s,c)=>({title:`Ein Bündnisangebot aus ${c.target}`,text:`Gesandte aus ${c.target} bieten einen förmlichen Beistandspakt an — Schutz und Handel im Austausch für Verpflichtungen, die Valdoria im Ernstfall teuer zu stehen kommen könnten.`,choices:[
  {label:'PAKT UNTERZEICHNEN',hint:`${c.target} +10 · Legitimität +1 · Verpflichtung im Kriegsfall`,apply:x=>{x.relations[c.target]+=10;x.stats.legitimacy+=1;nudge(x,{crown:3})}},
  {label:'NUR HANDELSTEIL ANNEHMEN',hint:`${c.target} +4 · Handel +2 · keine Bindung`,apply:x=>{x.relations[c.target]+=4;x.stats.trade+=2}},
  {label:'HÖFLICH VERTAGEN',hint:'Keine Bindung · Geheimdienst +1',apply:x=>{x.stats.intelligence+=1}}]})},
 {id:'foreign_relief',category:'AUSLÄNDISCHE HILFE',when:s=>Object.values(s.regions).some(r=>r.wealth<50),make:(s,c)=>({title:`Hilfsangebot aus ${c.target}`,text:`Nach schlechten Ernten bietet der Hof von ${c.target} Getreide und Gold für ${c.region.name} an — eine Geste, die auch als Einflussnahme verstanden werden kann.`,choices:[
  {label:'HILFE ANNEHMEN',hint:`Region Wohlstand +4 · ${c.target} +5 · Abhängigkeit`,apply:x=>{c.region.wealth+=4;x.relations[c.target]+=5;x.modifiers.aurelianDependence=(x.modifiers.aurelianDependence||0)+0.01}},
  {label:'NUR GOLD, KEINE BEDINGUNGEN',hint:'1,5 Mio. ₲ · geringere Bindung',apply:x=>{x.reserve+=1500000;x.relations[c.target]+=2}},
  {label:'DANKEND ABLEHNEN',hint:'Stolz gewahrt · Region bleibt unversorgt',apply:x=>{x.stats.legitimacy+=1;c.region.unrest+=2;nudge(x,{crown:2})}}]})},
 {id:'artisan_rivalry',category:'HANDWERK & STOLZ',when:s=>s.factions.cities>50,make:(s,c)=>({title:`Zwei Meister, ein Auftrag in ${c.region.name}`,text:`Zwei rivalisierende Meisterhandwerker bewerben sich um einen prestigeträchtigen Kronauftrag in ${c.region.name}. Beide haben mächtige Fürsprecher.`,choices:[
  {label:'DEM ÄLTEREN MEISTER GEBEN',hint:'Region Infrastruktur +3 · Adel +2',apply:x=>{c.region.infrastructure+=3;x.factions.nobles+=2}},
  {label:'DEM JÜNGEREN MEISTER GEBEN',hint:'Städte +4 · Risiko eines Rückschlags',apply:x=>{x.factions.cities+=4;x.delayed.push({due:x.turn+2,title:'Der junge Meister liefert',text:'Das gewagte Werk übertrifft alle Erwartungen und macht seinen Schöpfer berühmt.',effects:{legitimacy:2}})}},
  {label:'WETTSTREIT VOR DEM HOF',hint:'1 Mio. ₲ · beide zufrieden · Ansehen +2',apply:x=>{x.reserve-=1000000;x.private.reputation+=2;x.factions.cities+=1;x.factions.nobles+=1}}]})},
 {id:'garrison_unrest',category:'MILITÄR & TREUE',when:s=>s.factions.officers<50,make:(s,c)=>({title:`Unmut in der Garnison von ${c.region.name}`,text:`Offiziere in ${c.region.name} murren über ausbleibenden Sold und fehlende Beförderungen. Ihre Treue ist nicht mehr selbstverständlich.`,choices:[
  {label:'SOLD SOFORT NACHZAHLEN',hint:'2 Mio. ₲ · Offiziere +5 · Garnison +2',apply:x=>{x.reserve-=2000000;x.factions.officers+=5;c.region.garrison+=2}},
  {label:'BEFÖRDERUNGEN AUSSPRECHEN',hint:'Offiziere +3 · keine Kosten · Adel −1',apply:x=>{x.factions.officers+=3;x.factions.nobles-=1}},
  {label:'DISZIPLIN DURCHSETZEN',hint:'Offiziere −2 · Stabilität +2 · Garnison −1',apply:x=>{x.factions.officers-=2;x.stats.stability+=2;c.region.garrison-=1}}]})},
 {id:'pilgrimage_route',category:'GLAUBE & REISE',when:()=>true,make:(s,c)=>({title:`Pilgerzüge durch ${c.region.name}`,text:`Hunderte Pilger wollen zu den Sieben Glocken durch ${c.region.name} ziehen. Die Bewohner fürchten Diebstahl und volle Straßen, der Klerus erwartet Segen.`,choices:[
  {label:'SICHERES GELEIT STELLEN',hint:'1 Mio. ₲ · Region Loyalität +3 · Stabilität +1',apply:x=>{x.reserve-=1000000;c.region.loyalty+=3;x.stats.stability+=1}},
  {label:'ROUTE UMLEITEN',hint:'Region Unruhe −2 · Klerus verstimmt',apply:x=>{c.region.unrest-=2;x.factions.nobles-=1}},
  {label:'PILGERMAUT ERHEBEN',hint:'800.000 ₲ · Volk −2',apply:x=>{x.reserve+=800000;x.factions.people-=2}}]})},
 {id:'court_rumor_mill',category:'HOF & GERÜCHTE',when:()=>true,make:(s,c)=>({title:'Gerüchte hinter vorgehaltener Hand',text:'Am Hof kursieren Geschichten über das Privatleben der Krone — teils wahr, teils erfunden, aber jeder scheint sie zu kennen.',choices:[
  {label:'GERÜCHTE DEMENTIEREN',hint:'Ansehen +2 · Belastung +3',apply:x=>{x.private.reputation+=2;x.private.stress+=3}},
  {label:'IGNORIEREN',hint:'Keine Kosten · Gerüchte wuchern weiter',apply:x=>{x.private.reputation-=1}},
  {label:'QUELLE AUFSPÜREN LASSEN',hint:'800.000 ₲ · Geheimdienst +2',apply:x=>{x.reserve-=800000;x.stats.intelligence+=2;x.private.secret+=1}}]})},
 {id:'tax_farmers',category:'STEUERPACHT',when:s=>s.reserve<15000000,make:(s,c)=>({title:`Steuerpächter bieten sich für ${c.region.name} an`,text:`Private Pächter bieten der Krone sofortiges Gold gegen das Recht, in ${c.region.name} selbst Steuern einzutreiben — ein schneller Gewinn, der oft in Willkür endet.`,choices:[
  {label:'PACHT VERGEBEN',hint:'4 Mio. ₲ sofort · Region Unruhe +5',apply:x=>{x.reserve+=4000000;c.region.unrest+=5;x.factions.people-=2}},
  {label:'BEGRENZT VERPACHTEN',hint:'2 Mio. ₲ · Region Unruhe +2',apply:x=>{x.reserve+=2000000;c.region.unrest+=2}},
  {label:'ABLEHNEN',hint:'Kein Gold · Region Loyalität +2',apply:x=>{c.region.loyalty+=2}}]})}
];
