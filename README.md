# VALDORIA – Crown of the Seas

Ein lokal spielbarer Singleplayer-Prototyp einer politischen Herrschafts-, Wirtschafts- und Lebenssimulation. Das Spiel läuft vollständig offline und benötigt keine kostenpflichtigen APIs oder externen Dienste.

## Start

Im Projektordner:

```bash
python3 -m http.server 8080
```

Danach im Browser `http://localhost:8080` öffnen. Alternativ kann `index.html` direkt geöffnet werden; der lokale Server ist für ein konsistentes Verhalten empfohlen.

## Enthaltene Systeme

- interaktive SVG-Weltkarte mit Politik-, Handels-, Loyalitäts- und Unruhemodus
- acht Regionen mit verbundenen Bevölkerungs-, Wohlstands-, Loyalitäts-, Infrastruktur- und Garnisonswerten
- transparente Finanzbuchhaltung und frei veränderbare Gewinnverteilung
- rundenbasierte Simulation mit Einnahmen, Ausgaben, regionaler Entwicklung und Ereignissen
- sechs rotierende, zustandsabhängige Krisen mit jeweils drei unterschiedlichen Lösungswegen
- unmittelbare, dauerhafte und verzögerte Entscheidungsfolgen über mehrere Runden
- Entscheidungen beeinflussen Fraktionen, Diplomatie, Unterhalt, Handel und regionale Entwicklung
- regelbasierter Parser für freie königliche Befehle
- Heer, Flotte, Haltungen und begrenzter Frostholm-Feldzug
- Diplomatie mit fünf Reichen
- sechs Bauprojekte mit festen Kosten, Bauzeit, Fortschritt und Wirkung
- Staatsrat, Fraktionen und persistente Chronik
- Autosave nach jeder Runde und drei manuelle Speicherplätze im lokalen Browser-Speicher
- illustrierte SVG-Karte mit organischen Küsten, Stadtbannern, Seewegen, Geländezeichen und Kompassrose
- Pergament-Kartenstil mit animierten Seerouten, Zielmarkierungen, Maßstab und klassischer Reichsfarbgebung
- eigenes Privatleben mit Gesundheit, Stress, Ehe, Thronfolge, Hofansehen und zwei persönlichen Aktionen pro Runde
- private Entscheidungen wirken auf Adel, Legitimität, Stabilität, Diplomatie und spätere Ereignisse
- sanfte Karten-, Seiten-, Dialog-, Fortschritts- und Interaktionsanimationen mit barrierearmer Bewegungsreduktion
- animierte Grundsteinlegung sowie sichtbar wachsende Fundamente, Gebäudekörper, Türme, Kräne, Arbeiter und Banner
- Bauprojekte erzeugen bereits während der Bauzeit regionale Effekte und eigene Meilensteinereignisse
- neue private Momente werden durch Palastvollendung, Thronreife und persönliches Ansehen freigeschaltet
- eigens mit ImageGen erstellte, lokale Küstenkulisse für die Baustelle von Meerfalkenruh
- interaktiver Reichsatlas auf Basis der bereitgestellten Valdoria-Kartenreferenz: klickbare Regionen, dynamische Modusüberlagerungen, animierte Zielmarkierung und Flottenmarker
- zusätzliche Entscheidungsketten für Expeditionen, Dynastie und die sieben Reeder
- ImageGen-Hofkulisse für das Privatleben von Meerfalkenruh

## Bedienung

Über die obere Navigation werden die Reichssysteme aufgerufen. Eine Runde kann beliebig viele Entscheidungen enthalten. Der goldene Knopf rechts oben rechnet die Runde vollständig ab und speichert automatisch. Das Befehlsfeld am unteren Rand akzeptiert freie deutsche Sätze; das Fragezeichen zeigt Beispiele.

## Architektur

Der Prototyp trennt Daten (`REGIONS`, `PROJECTS`, `ADVISORS`), Spielzustand, Simulation, Befehlsparser und Darstellung. Der Zustand ist reines JSON. Die größten Inhalts-Pools liegen als eigene, gemeinsam global-scoped `<script>`-Dateien unter `data/` (`life-actions.js`, `scenarios.js`, `petitions.js`, `emergent.js`, `private-incidents.js`), müssen in `index.html` vor `game.js` geladen werden und lassen sich unabhängig erweitern. Bewusst keine ES-Module (`type="module"`), damit `index.html` weiterhin auch direkt per `file://` geöffnet werden kann. Dadurch können später TypeScript-Modelle, ein React-Frontend, SQLite, ein externer Sprachmodell-Parser oder Multiplayer-Synchronisierung ergänzt werden, ohne die Spiellogik neu zu entwerfen.

Alle visuellen Elemente sind CSS- und SVG-basiert. Es werden keine Bildlizenzen benötigt.
