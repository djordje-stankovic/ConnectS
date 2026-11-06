# Connect Software Solutions — novi sajt (predlog)

Statičan sajt, bez biblioteka i bez build alata. Strane se otvaraju i duplim klikom
na `index.html`; za pregled kao na serveru: `node pregled.js` → http://localhost:8095

PANTHEON partner (rešenja, implementacija, podrška) + tri sopstvena proizvoda
nad PANTHEON-om: **Vidik**, **Izlog**, **Fioka**. Aplikacije rade gde i do sada
(vidik/izlog/fioka.sajtpro.rs) — sajt samo vodi do demoa.

## Strane

| Strana | Šta je |
|---|---|
| `index.html` | početna: mreža u heroju, „tri tačke iz znaka" → tri proizvoda, ekrani proizvoda uživo, rešenja, konektor, kako radimo, reference |
| `pantheon.html` | PANTHEON: delatnosti, zašto PANTHEON, verzije SE / LT / LX / Hybrid |
| `implementacija.html` | 13 stvari pre izbora ERP-a + naš postupak |
| `podrska.html` | šta podrška uključuje, načini rada |
| `vidik.html`, `izlog.html`, `fioka.html` | strane proizvoda |
| `kontakt.html` | podaci, mapa, upit (otvara mejl sa popunjenim upitom; `?upit=Vidik` unapred izabere vrstu) |

## Kako se menja

Sadržaj je u `strane/*.html` (samo telo strane). Zaglavlje, podnožje, ikone,
mokapi proizvoda, adrese demoa i podaci firme su u `napravi.js`. Posle izmene:

```
node napravi.js
```

U tekstu strane: `{{ik:ime}}` ikona, `{{mk:vidik|izlog|fioka}}` animirani ekran
proizvoda, `{{demo:vidik}}` adresa demoa, `{{tel}}` `{{mejl}}` `{{adresa}}` podaci firme.

| Fajl | Šta radi |
|---|---|
| `css/sajt.css` | ceo izgled; paleta u `:root` (narandžasta i teget iz znaka, boje proizvoda) |
| `js/sajt.js` | sve animacije: mreža, tri tačke, vitrina, pojavljivanje, linija koraka, forma |

Ko u sistemu ima uključeno „smanji pokret", dobija mirnu verziju bez animacija.

## Objavljivanje

GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
