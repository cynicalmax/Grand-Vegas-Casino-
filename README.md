# Grand Vegas Casino

Custom Slots as they are supposed to be.

Offline-Slot-App (Stand: „Goldfuchs Casino“): Spielgeld, keine Werbung, kein Server. Die fertige App ist **eine einzige HTML-Datei**, die man im Browser öffnet (auch offline, auch auf dem Handy über „Zum Home-Bildschirm“).

## Loslegen

Voraussetzung: [Node.js](https://nodejs.org) 18 oder neuer. Weitere Pakete sind nicht nötig.

```bash
npm run build     # erzeugt dist/goldfuchs-casino.html
npm run watch     # baut bei jeder Änderung in src/ automatisch neu
```

Danach `dist/goldfuchs-casino.html` im Browser öffnen bzw. neu laden.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/index.html` | Grundgerüst der Seite mit Platzhaltern für CSS, Bilder und Skripte |
| `src/styles/main.css` | Alle Styles |
| `src/fonts/` | Schriften (Disp, Body, Num) |
| `src/assets/img/` | 191 Grafiken als WebP (darunter Spritesheets `an-*` mit 6×4 Animationsbildern), `order.json` legt die Reihenfolge fest |
| `src/js/01-game.js` | Spiel-Logik: Slots, Gewinntabellen, Features, Rundenauflöser für die RTP-Kalibrierung |
| `src/js/02-scale.js` | RTP-Skalierung pro Slot |
| `src/js/03-gfx.js` | Grafik-Runtime: 3D-Schriftzüge, gemalte Szenen |
| `src/js/04-fx.js` | Effekte: Münzregen, Partikel, fliegende Zahlen |
| `src/js/05-reels.js` | Canvas-Walzen mit Physik, Antizipation, Hold & Spin-Feld |
| `src/js/06-audio.js` | Synthetisierte Musik und Soundeffekte (WebAudio) |
| `src/js/07-app.js` | App: Lobby, Seiten, Spin-Ablauf, Boni, Shop, Quests, Speichern |
| `scripts/build.mjs` | Fügt alles zu `dist/goldfuchs-casino.html` zusammen |
| `scripts/smoke.mjs` | Startet die gebaute App headless und meldet JS-Fehler (braucht Playwright) |
| `archive/` | Ältere Vorstufe „Lucky Party Lobby“ (nur zum Nachschlagen) |

Die Skripte werden in der Reihenfolge der Dateinummern geladen und teilen sich den globalen Gültigkeitsbereich, genau wie vorher in der einzelnen Datei. Neue Grafiken: WebP in `src/assets/img/` ablegen und den Namen in `order.json` eintragen, dann ist sie im Code als `IMG.name` verfügbar.

Der Spielstand liegt im `localStorage` des Browsers unter `goldfuchs_casino_v1`.
