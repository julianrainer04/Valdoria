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
- 21 rotierende, zustandsabhängige Krisen und Szenarien mit unterschiedlichen Lösungswegen
- 26 Petitionen, 12 dynamische offene Lagen und 27 altersabhängige private Zwischenfälle
- unmittelbare, dauerhafte und verzögerte Entscheidungsfolgen über mehrere Runden
- Entscheidungen beeinflussen Fraktionen, Diplomatie, Unterhalt, Handel und regionale Entwicklung
- regelbasierter Parser für freie königliche Befehle
- Heer, Flotte, Haltungen und begrenzter Frostholm-Feldzug
- Diplomatie mit fünf Reichen
- zwölf Bauprojekte mit festen Kosten, Bauzeit, Fortschritt und Wirkung
- Staatsrat, Fraktionen und persistente Chronik
- Autosave nach jeder Runde und drei manuelle Speicherplätze im lokalen Browser-Speicher
- illustrierter Reichsatlas mit klickbaren SVG-Flächen, Stadtbannern, Seewegen, Geländezeichen und Kompassrose
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

Die Oberfläche kombiniert HTML, CSS und SVG mit 43 lokal gespeicherten WebP-Illustrationen. Die Karten-, Porträt-, Bauwerks- und Szenenbilder wurden für dieses Valdoria-Projekt mit ImageGen erstellt beziehungsweise aus den bereitgestellten Valdoria-Referenzen abgeleitet. Vor einer externen kommerziellen Veröffentlichung sollten Herkunft und Nutzungsbedingungen der Bildquellen nochmals dokumentiert werden.

## Speicherstände

Spielstände liegen ausschließlich im lokalen Browser-Speicher. Ab Version 16 akzeptiert das Spiel auch ältere Speicherstände und ergänzt neue Felder beim Laden automatisch. Ein Spielstand einer neueren, dem geöffneten Spiel unbekannten Version wird nicht überschrieben.

## Automatische Prüfung

Das Projekt benötigt keine Laufzeit-Abhängigkeiten. Für den lokalen Struktur- und Inhaltstest genügt Node.js 20 oder neuer:

```bash
npm test
```

Der Test kontrolliert die JavaScript-Syntax, die Ladereihenfolge, Mindestgrößen und eindeutigen IDs aller Inhalts-Pools, sämtliche Bildreferenzen sowie die Migration älterer Speicherstände. Derselbe Test läuft bei jedem Push und Pull Request über GitHub Actions.
