# Hinweise für Claude

- Max spricht Deutsch: Antworten, Commit-Messages und UI-Texte auf Deutsch.
- Quellcode liegt in `src/`, das Ergebnis ist die einzelne Datei `dist/goldfuchs-casino.html` (`npm run build`). `dist/` nicht committen.
- Nach Änderungen: `npm run smoke` (baut und prüft im Headless-Browser auf JS-Fehler).
- Die Skripte in `src/js/` teilen sich den globalen Scope; Reihenfolge = Dateinummer.
- Grafiken sind in `src/assets/img/*.webp`, Reihenfolge in `order.json`, im Code als `IMG[name]`.
- Die App ist ein Spielgeld-Spiel ohne echtes Geld, ohne Werbung und mit fairen, festen Gewinnchancen; das soll so bleiben.
