'use strict';

const REGION_IDENTITIES={
 caerhaven:{motto:'Das Meer ernährt, das Meer richtet.',identity:'Weltoffene Hafenbürger, alte Reederfamilien und stolze Werften',elite:'Rat der Kapitäne',tradition:'Lichterprozession für heimkehrende Schiffe',aspiration:'Freihandel unter starkem königlichem Schutz',tension:'Händlerfreiheit gegen Kronzoll',image:'assets/project-dockyard.webp'},
 falkenkrone:{motto:'Wo die Krone ruht, schweigt kein Flüstern.',identity:'Hofbeamte, Handwerker des Palasts und konkurrierende Adelshäuser',elite:'Kammer der Siegel',tradition:'Öffentliche Audienz auf den Palaststufen',aspiration:'Ein berechenbarer Hof und Zugang zum jungen König',tension:'Höfische Privilegien gegen städtische Mitsprache',image:'assets/tab-council-chamber.webp'},
 islands:{motto:'Viele Inseln, ein Schwur.',identity:'Inselräte, Winzer, Fischer und eigenwillige Freihafenfamilien',elite:'Bund der Inselräte',tradition:'Jährlicher Schwur auf dem Wasser',aspiration:'Autonomie, sichere Seewege und faire Abgaben',tension:'Inselfreiheit gegen Verwaltung aus Falkenkrone',image:'assets/project-lighthouse.webp'},
 ravengar:{motto:'Ein Eid bindet länger als eine Kette.',identity:'Grenzadlige, Kornstädte und Dörfer mit eigener Rechtstradition',elite:'Versammlung der Bannerherren',tradition:'Erneuerung der Schutzcharta nach jeder Ernte',aspiration:'Anerkennung der örtlichen Charta und Schutz vor Hungerwintern',tension:'Alte Rechte gegen valdorische Zentralisierung',image:'assets/project-road.webp'},
 nordhaven:{motto:'Der Norden vergisst keinen Winter.',identity:'Fjordklans, Bergstädte und kampferprobte Seefahrer',elite:'Thing der sieben Fjorde',tradition:'Winterthing unter freiem Himmel',aspiration:'Ehre, sichere Handelsrouten und Unabhängigkeit',tension:'Klanrecht gegen dauerhafte Fremdherrschaft',image:'assets/story-war.webp'},
 eldoria:{motto:'Was alt ist, besitzt Gewicht.',identity:'Tempelstädte, alte Häuser und gelehrte Landgüter',elite:'Konklave der alten Häuser',tradition:'Prozession der Ahnenbanner',aspiration:'Bewahrung von Glauben, Landrecht und dynastischem Rang',tension:'Alte Ordnung gegen ausländische Reformen',image:'assets/project-cathedral.webp'},
 aurelia:{motto:'Gold reist weiter als ein Heer.',identity:'Bankhäuser, Werkstätten und kosmopolitische Handelsstädte',elite:'Konsortium der Neun',tradition:'Eröffnung der Wechselmesse',aspiration:'Offene Märkte und politischer Einfluss durch Kredit',tension:'Gewinninteressen gegen staatliche Souveränität',image:'assets/project-bank.webp'},
 lysara:{motto:'Wissen spricht leise und bleibt.',identity:'Heiler, Archivare, Klostergärten und zurückhaltende Hofgelehrte',elite:'Kollegium der Sieben Archive',tradition:'Nacht der offenen Bibliotheken',aspiration:'Neutralität, Forschung und Schutz des Wissens',tension:'Gelehrte Neutralität gegen Bündniszwang',image:'assets/project-academy.webp'}
};

const CHARACTER_AMBITIONS={
 mother:{title:'Das Vermächtnis des verstorbenen Königs schützen',fear:'Euch an einen rücksichtslosen Hof zu verlieren',gift:'kennt die alten Bündnisse und die Schwächen des Adels'},
 regent:{title:'Die Regentschaft unentbehrlich machen',fear:'nach Eurer Volljährigkeit bedeutungslos zu werden',gift:'beherrscht Kanzlei, Siegel und tägliche Regierung'},
 queen:{title:'Ein eigenes Netz am valdorischen Hof aufbauen',fear:'nur als Teil eines Vertrages gesehen zu werden',gift:'öffnet Türen zu ihrem Herkunftshof und seinen Verbündeten'},
 heir:{title:'Auf eine Krone vorbereitet werden, ohne Kindheit zu verlieren',fear:'dem Namen Valedor niemals zu genügen',gift:'verkörpert die Zukunft der Dynastie'},
 princess:{title:'Mehr sein als eine Figur in fremden Heiratsplänen',fear:'für Staatsräson fortgeschickt zu werden',gift:'bemerkt Spannungen am Hof früher als die meisten Räte'}
};

const PEACE_TERMS={
 statusquo:{label:'FRIEDEN OHNE SIEGER',summary:'Grenzen bleiben bestehen; Gefangene und Schiffe kehren zurück.',need:0,stance:'versöhnlich'},
 trade:{label:'HANDELSRECHTE SICHERN',summary:'Valdoria erhält bevorzugte Häfen, Zölle und Handelswege.',need:25,stance:'wirtschaftlich'},
 reparations:{label:'REPARATIONEN FORDERN',summary:'Der Gegner trägt einen Teil der valdorischen Kriegskosten.',need:35,stance:'hart'},
 demilitarize:{label:'GRENZE ENTWAFFNEN',summary:'Festungen und Truppen des Gegners werden deutlich verkleinert.',need:55,stance:'strategisch'},
 vassal:{label:'SCHUTZSTAAT ERRICHTEN',summary:'Der Hof bleibt bestehen, schuldet Valdoria aber Tribut und Gefolgschaft.',need:75,stance:'hegemonial'},
 annex:{label:'LAND EINVERLEIBEN',summary:'Das besetzte Reich wird mit Bevölkerung und Einnahmen Teil Valdorias.',need:100,stance:'endgültig'}
};

const TUTORIAL_STEPS={
 realm:{title:'Die Karte ist Euer wichtigstes Werkzeug',text:'Wählt ein Land oder Kronland. Rechts erscheinen Lage, Geschichte und alle möglichen Befehle. Offene Pflichtentscheidungen stehen unter der Karte.'},
 finances:{title:'Gold ist in Reserve und Zweckfonds getrennt',text:'Die Staatsreserve ist sofort verfügbar. Zweckfonds binden Mittel für Handel, Militär, Bauten, Diplomatie oder Krisen.'},
 council:{title:'Jeder Rat besitzt eigene Interessen',text:'Minister helfen, erinnern sich aber an Nähe, Zurückweisung und Macht. Pro Runde kann jeder Berater nur einmal wirksam eingesetzt werden.'},
 military:{title:'Heere brauchen Geld, Moral und Zeit',text:'Haltung, Stärke und Nachschub entscheiden gemeinsam. Der Kriegsbericht zeigt Frontverlauf und bekannte Feindstärke.'},
 diplomacy:{title:'Ein Auftrag braucht Ziel und Vorgehen',text:'Gesandtschaften sind keine automatischen Boni: Wählt erst das konkrete Ziel und danach Auftreten und Einsatz.'},
 projects:{title:'Bauwerke verändern Regionen dauerhaft',text:'Bauten benötigen mehrere Runden. Nach der Vollendung beeinflussen sie Finanzen, Menschen, Politik und private Möglichkeiten.'},
 private:{title:'Familie und Freunde handeln auch selbst',text:'Wählt eine Person, lernt ihre Hoffnung und Furcht kennen und entscheidet, wie viel Nähe, Ehre oder Aufsicht Ihr ihr gebt.'},
 chronicle:{title:'Die Chronik erklärt Ursachen statt nur Ergebnisse',text:'Filtert nach Thema. Unter Einträgen wird sichtbar, aus welchem früheren Versprechen, Konflikt oder Erlass sie entstanden sind.'}
};
