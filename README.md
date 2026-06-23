# The Black Tier — Private Acquisition Office

Ein vertrauliches, mehrsprachiges (DE / EN / FR) Front-End für ein privates
Akquisitionshaus: Off-Market-Liegenschaften, Grundstücke und ganze Projekte.
Kein Inserat, kein Konto — ein diskretes Suchprofil, persönlich bearbeitet.

> Front-End-Prototyp. Alle Daten leben in der Session (kein Backend).

## Design

Eine ruhige, couture-artige Oberfläche — warmes Noir, Punzen-Gold (metallischer
Verlauf), feine Cormorant-Garamond-Typografie und zurückhaltende Bewegung.
Diskretion als Handwerk:

- **Hallmark / Wappen** als wiederkehrendes Markenzeichen (Nav, Hero, Siegel, Footer)
- **Material & Atmosphäre** — Filmkorn, Vignette, weiche Gold-Lichthöfe
- **Bewegung** — Scroll-Reveal, edle Hover-Mikrointeraktionen, langsame Easings
- **Barrierefrei** — respektiert `prefers-reduced-motion`

## Struktur

- **Landing** — Hero, „So funktioniert es" (Dossier-Ledger), Diskretion
- **Suchprofil** — dreistufiges, vertrauliches Gesuch mit Validierung
- **Office (verstecktes CRM)** — nicht in der Navigation. Erreichbar über die
  geheime Route `#office` + Zugangscode (Demo: `4321`). Bestand, Gesuche,
  Matching-Agent und simulierter Postausgang (zensierte Dossiers).

## Entwicklung

```bash
npm install
npm run dev      # Vite Dev-Server
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

## Stack

React 18 · Vite. Die gesamte App liegt in `src/App.jsx` (Single-File-Komponente),
damit sie als sauberer Drop-in dient. Schriften werden in `index.html` geladen.
