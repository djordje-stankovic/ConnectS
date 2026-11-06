/* ===========================================================================
   napravi.js — sastavlja strane sajta Connect Software Solutions.

   Sadržaj svake strane je u `strane/<ime>.html` (samo telo, bez zaglavlja).
   Prvi red je meta: <!--META {"naslov": "...", "opis": "...", "meni": "..."} -->
   Zaglavlje, podnožje, ikone i mokapi proizvoda su ovde, na jednom mestu,
   da se meni ne raziđe po stranama.

   Pokretanje: `node napravi.js` → gotove strane u korenu (index.html ...).
   Strane se otvaraju i duplim klikom — nema servera ni build alata.

   U tekstu strane:  {{ik:ime}}  = ikona,  {{mk:vidik|izlog|fioka}} = mokap,
                     {{demo:vidik|izlog|fioka}} = adresa demoa.
   =========================================================================== */
const fs = require('fs');
const path = require('path');

const FIRMA = {
  ime: 'Connect Software Solutions',
  adresa: 'Futoška 35, 21000 Novi Sad',
  tel: '+381 21 662 0000', telHref: '+381216620000',
  mejl: 'office@connectsoftware.rs',
  mapa: 'https://maps.google.com/?q=Futo%C5%A1ka+35,+Novi+Sad'
};

/* Aplikacije rade tamo gde i do sada; sajt samo vodi do njih. */
const DEMO = {
  vidik: 'https://vidik.sajtpro.rs/prijava.html?demo',
  izlog: 'https://izlog.sajtpro.rs/s/demo/',
  fioka: 'https://fioka.sajtpro.rs/'
};

const IK = {
  vidik: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  izlog: '<path d="M3 9l2-5h14l2 5"/><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>',
  fioka: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  proizvodnja: '<path d="M2 20h20"/><path d="M4 20V10l5 3v-3l5 3V6h4l2 14"/>',
  agencija: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8"/>',
  maloprodaja: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11l2-8H6.2"/>',
  javni: '<path d="M3 21h18M4 10h16M12 3l9 5H3z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
  veleprodaja: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  usluge: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>',
  baza: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  veza: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  stit: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  knjiga: '<path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/>',
  ljudi: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/><path d="M16 4.5a3.5 3.5 0 010 7M22 20c0-3-2-5.2-5-5.8"/>',
  osvezi: '<path d="M20 11a8 8 0 00-14.9-3.9L3 9"/><path d="M3 4v5h5"/><path d="M4 13a8 8 0 0014.9 3.9L21 15"/><path d="M21 20v-5h-5"/>',
  telefon: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A17 17 0 013 5a2 2 0 012-2"/>',
  mejl: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  igla: '<path d="M12 22s7-6.3 7-12a7 7 0 00-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  sat: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  oko: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  alat: '<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  graf: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  kamera: '<path d="M3 8h3l2-3h8l2 3h3v11H3z"/><circle cx="12" cy="13" r="3.5"/>',
  kljuc: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>'
};
const ikona = (k, d = 24) => `<svg viewBox="0 0 24 24" width="${d}" height="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[k] || ''}</svg>`;

const DRUSTVENE = {
  facebook: ['https://www.facebook.com/ConnectSoftware', '<path d="M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8.5a.5.5 0 01.5-.5z"/>'],
  linkedin: ['https://www.linkedin.com/company/connect-software-solutions-novi-sad/', '<rect x="3" y="9" width="4" height="12"/><circle cx="5" cy="5" r="2"/><path d="M10 9h4v2c.6-1.2 2-2.2 4-2.2 3 0 4 2 4 5.2V21h-4v-6.5c0-1.6-.6-2.5-2-2.5s-2 1-2 2.5V21h-4z"/>'],
  instagram: ['https://www.instagram.com/connectsoftware_/', '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>']
};

const PROIZVODI = [
  ['vidik', 'Vidik', 'Brojevi i kontrole iz PANTHEON-a, na telefonu', '--k:var(--vidik)'],
  ['izlog', 'Izlog', 'Online prodavnica koja se puni iz PANTHEON-a', '--k:var(--izlog)'],
  ['fioka', 'Fioka', 'Fiskalni računi sa telefona pravo u PANTHEON', '--k:var(--fioka)']
];

/* ---------------------------------------------------------------- mokapi */
const LINIJA = 'M0,86 C20,78 34,92 54,74 S88,44 110,54 S148,70 168,46 S206,30 228,40 S268,24 300,16';
const MK = {
  vidik: `<div class="mk" data-mk style="--k:var(--vidik)">
  <div class="mk-traka"><i></i><i></i><i></i><b>vidik · pregled</b><span class="mk-sk">● uživo</span></div>
  <div class="mk-telo" style="grid-template-rows:auto 1fr auto">
    <div class="mk-kpi">
      <div><small>Promet 12m</small><b>40,8 mil</b><em class="dole">▼ 30,0%</em></div>
      <div><small>Dospelo</small><b>135,9 mil</b><em class="siv">99% potraživanja</em></div>
      <div><small>Marža</small><b>54,2%</b><em class="gore">▲ 1,7 p.p.</em></div>
    </div>
    <div class="mk-red">
      <div class="mk-kartica"><small>Promet po mesecima</small>
        <svg class="mk-graf" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="gr-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4673d" stop-opacity=".45"/><stop offset="1" stop-color="#d4673d" stop-opacity="0"/></linearGradient></defs>
          <g class="mreza"><line x1="0" y1="30" x2="300" y2="30"/><line x1="0" y1="60" x2="300" y2="60"/><line x1="0" y1="90" x2="300" y2="90"/></g>
          <path class="pov" d="${LINIJA} L300,120 L0,120 Z"/><path class="lin" d="${LINIJA}"/>
        </svg>
      </div>
      <div class="mk-kartica"><small>Starost duga</small>
        <div class="mk-stubici"><span style="--h:38%;--i:0;--c:#5fcf9f"></span><span style="--h:56%;--i:1;--c:#e8c25a"></span><span style="--h:30%;--i:2;--c:#f0a05a"></span><span style="--h:92%;--i:3;--c:#ff7a5c"></span></div>
      </div>
    </div>
    <div class="mk-uzbuna"><i></i><span><b>POPDV je stariji 28 dana.</b> 10 dokumenata ne ulazi u oba obračuna.</span></div>
  </div>
</div>`,
  izlog: `<div class="mk" data-mk style="--k:var(--izlog)">
  <div class="mk-traka"><i></i><i></i><i></i><b>izlog · /s/vasa-firma</b><span class="mk-korpa">Korpa <b>3</b></span></div>
  <div class="mk-telo" style="grid-template-rows:auto 1fr">
    <div class="mk-rafovi">
      <div class="mk-art"><div class="sl" style="--a:#8a5a3c;--b:#c99a6e"></div><b>Kafa 250 g</b><small>690,00</small></div>
      <div class="mk-art izabran"><div class="sl" style="--a:#3d6e8c;--b:#8fc1d9"></div><b>Šolja, keramika</b><small>1.290,00</small></div>
      <div class="mk-art"><div class="sl" style="--a:#4c7a4f;--b:#a6cf8f"></div><b>Čaj, mešavina</b><small>480,00</small></div>
      <div class="mk-art"><div class="sl" style="--a:#7a4c6e;--b:#d29ac0"></div><b>Filter papir</b><small>220,00</small></div>
    </div>
    <div class="mk-kartica"><small>narudžbina sa sajta → PANTHEON</small>
      <div class="mk-tok">
        <div style="--i:0"><span>kupac poručio</span><span>WEB 683551397</span></div>
        <div style="--i:1"><span>zaliha proverena</span><span>skladište VP</span></div>
        <div style="--i:2"><span>narudžbina kupca</span><span>26-0100-000024</span></div>
        <div style="--i:3"><span>roba rezervisana</span><span>2 + 3 kom</span></div>
        <div style="--i:4" class="kraj"><span>mejl kupcu i firmi</span><span>poslat ✓</span></div>
      </div>
    </div>
  </div>
</div>`,
  fioka: `<div class="mk mk-fioka" data-mk data-ponovi="10000" style="--k:var(--fioka)">
  <div class="telefon"><div class="telefon-ekran">
    <div class="kamera">
      <div class="racun-papir"><i style="--w:55%"></i><i></i><i style="--w:80%"></i><i style="--w:70%"></i><i></i><div class="qr"></div></div>
      <div class="ram"><div class="zrak"></div></div>
    </div>
    <div class="list">
      <div class="st"><span>Prodavac</span><b>Gradski prevoz</b></div>
      <div class="st"><span>Iznos</span><b>100,00</b></div>
      <div class="st"><span>PDV 10%</span><b>9,09</b></div>
      <div class="vrste"><span>Gorivo</span><span class="da">Prevoz</span><span>Parking</span><span>Reprez.</span></div>
      <div class="potvrdi">U PANTHEON →</div>
    </div>
  </div></div>
  <div class="mk-tok">
    <div style="--i:0"><span>QR pročitan</span><span>gradski prevoz · 100,00</span></div>
    <div style="--i:1"><span>Poreska uprava</span><span>1 stavka · PDV 10%</span></div>
    <div style="--i:2"><span>dobavljač</span><span>nov — podaci iz APR-a</span></div>
    <div style="--i:3" class="kraj"><span>račun troška</span><span>90,91 + PDV 9,09 ✓</span></div>
  </div>
</div>`
};

/* ---------------------------------------------------------------- zupčanici
   Dva zupčanika istog modula, pa se zubi stvarno poklapaju; js/sajt.js ih
   okreće sa skrolom (mali brže, u suprotnom smeru, po odnosu broja zuba). */
function zupcanik(cx, cy, z, m, klasa) {
  const r = m * z / 2, ro = r + m, rr = r - 1.25 * m, p = 2 * Math.PI / z;
  const t = (a, rad) => (cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1);
  let d = '';
  for (let i = 0; i < z; i++) {
    const a = i * p;
    d += (i ? 'L' : 'M') + t(a, rr) + 'L' + t(a + p * .12, rr) + 'L' + t(a + p * .3, ro) + 'L' + t(a + p * .5, ro) + 'L' + t(a + p * .68, rr) + 'L' + t(a + p, rr);
  }
  const rupe = [];
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; rupe.push(`<circle cx="${(cx + r * .52 * Math.cos(a)).toFixed(1)}" cy="${(cy + r * .52 * Math.sin(a)).toFixed(1)}" r="${(r * .14).toFixed(1)}"/>`); }
  return `<g class="${klasa}" data-zubi="${z}" data-c="${cx},${cy}"><path d="${d}Z"/><circle cx="${cx}" cy="${cy}" r="${(r * .78).toFixed(1)}"/><circle cx="${cx}" cy="${cy}" r="${(r * .2).toFixed(1)}"/>${rupe.join('')}</g>`;
}
/* veliki: 24 zuba, centar (380,260); mali: 14 zuba, na rastojanju 12.5*(24+14)/2 = 237.5 */
const ZUPCANICI = `<div class="zupcanici" aria-hidden="true"><svg viewBox="0 0 680 680">${zupcanik(400, 250, 24, 12.5, 'z-veliki')}${zupcanik(232, 418, 14, 12.5, 'z-mali')}</svg></div>`;
const NIT = `<svg class="nit" aria-hidden="true"><defs><linearGradient id="nit-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb27a"/><stop offset="1" stop-color="#f5802b"/></linearGradient></defs><path class="nit-staza"/><path class="nit-tok"/><g class="nit-cvorovi"></g><circle class="nit-glava" r="4.5" cx="-20" cy="-20"/></svg>`;

/* ---------------------------------------------------------------- delovi */
const LOGO = `<a class="logo" href="index.html" aria-label="${FIRMA.ime} — početna"><span class="logo-w"><b>connect</b>software</span><span class="logo-d"><i></i><i></i><i></i></span><span class="logo-s">SOLUTIONS</span></a>`;
const strelica = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>';

function zaglavlje(meni) {
  const a = (f, t) => `<a href="${f}"${meni === f ? ' class="akt" aria-current="page"' : ''}>${t}</a>`;
  const proizvodAkt = PROIZVODI.some(p => meni === p[0] + '.html');
  return `<div class="napredak" aria-hidden="true"></div>
<header class="zaglavlje"><div class="omot">
  ${LOGO}
  <nav class="meni" aria-label="Glavni meni">
    ${a('pantheon.html', 'PANTHEON')}
    <div class="pod${proizvodAkt ? ' akt' : ''}"><button type="button" aria-haspopup="true">Naši proizvodi ${strelica}</button>
      <div class="pod-ploca">
        ${PROIZVODI.map(p => `<a href="${p[0]}.html" style="${p[3]}"><span class="znak-p">${ikona(p[0])}</span><span><b>${p[1]}</b><small>${p[2]}</small></span></a>`).join('\n        ')}
      </div>
    </div>
    ${a('implementacija.html', 'Implementacija')}
    ${a('podrska.html', 'Podrška')}
    ${a('kontakt.html', 'Kontakt')}
    <a class="dugme mag" href="kontakt.html">Zakažite razgovor</a>
  </nav>
  <button class="burger" type="button" aria-label="Meni" aria-expanded="false"><span></span><span></span><span></span></button>
</div></header>
<nav class="mob-meni" aria-label="Meni na telefonu">
  <a href="index.html">Početna</a>
  <a href="pantheon.html">PANTHEON</a>
  ${PROIZVODI.map(p => `<a class="pr" href="${p[0]}.html" style="${p[3]}">${p[1]}<small>${p[2].split(' ').slice(0, 3).join(' ')}…</small></a>`).join('\n  ')}
  <a href="implementacija.html">Implementacija</a>
  <a href="podrska.html">Podrška</a>
  <a href="kontakt.html">Kontakt</a>
</nav>`;
}

function podnozje() {
  return `<footer class="podnozje"><div class="omot">
  <div class="podnozje-gore">
    <div>
      ${LOGO}
      <p>Premium partner za PANTHEON™ ERP više od 15 godina. Implementacija, podrška, razvoj — i sopstveni proizvodi nad PANTHEON-om.</p>
      <div class="drustvene">${Object.entries(DRUSTVENE).map(([k, [u, d]]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">${d}</svg></a>`).join('')}</div>
    </div>
    <div><h4>PANTHEON</h4><ul>
      <li><a href="pantheon.html">Rešenja po delatnosti</a></li>
      <li><a href="pantheon.html#verzije">Verzije</a></li>
      <li><a href="implementacija.html">Implementacija</a></li>
      <li><a href="podrska.html">Podrška</a></li>
    </ul></div>
    <div><h4>Naši proizvodi</h4><ul>
      ${PROIZVODI.map(p => `<li><a href="${p[0]}.html">${p[1]}</a></li>`).join('\n      ')}
    </ul></div>
    <div><h4>Kontakt</h4><ul>
      <li><a href="${FIRMA.mapa}" target="_blank" rel="noopener">${FIRMA.adresa}</a></li>
      <li><a href="tel:${FIRMA.telHref}">${FIRMA.tel}</a></li>
      <li><a href="mailto:${FIRMA.mejl}">${FIRMA.mejl}</a></li>
    </ul></div>
  </div>
  <div class="veliki-znak" aria-hidden="true">connect software</div>
  <div class="podnozje-dole">
    <span>Copyright © 2020 ${FIRMA.ime}. All Rights Reserved.</span>
    <span class="jezici"><a href="https://connectsoftware.biz" hreflang="en">EN</a><a href="https://hu.connectsoftware.rs/" hreflang="hu">HU</a><a href="https://css-pantheon.hr/" hreflang="hr">HR</a></span>
  </div>
</div></footer>`;
}

function strana(meta, telo, fajl) {
  return `<!doctype html>
<html lang="sr-Latn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.naslov}</title>
<meta name="description" content="${meta.opis}">
<meta name="theme-color" content="#0a101c">
<meta property="og:title" content="${meta.naslov}">
<meta property="og:description" content="${meta.opis}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='#0a101c'/><circle cx='8' cy='16' r='4' fill='#f5802b'/><circle cx='16' cy='16' r='4' fill='#f5802b'/><circle cx='24' cy='16' r='4' fill='#f5802b'/></svg>`)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="css/sajt.css">
</head>
<body${meta.telo ? ` class="${meta.telo}"` : ''}>
${zaglavlje(meta.meni || fajl)}
${ZUPCANICI}
<main>
${NIT}
${telo}
</main>
${podnozje()}
<script src="js/sajt.js" defer></script>
</body>
</html>
`;
}

/* ---------------------------------------------------------------- sastavljanje */
const izvori = fs.readdirSync(path.join(__dirname, 'strane')).filter(f => f.endsWith('.html'));
for (const f of izvori) {
  let src = fs.readFileSync(path.join(__dirname, 'strane', f), 'utf8');
  const m = src.match(/^<!--META\s*([\s\S]*?)\s*-->/);
  if (!m) throw new Error(f + ': nema META reda');
  const meta = JSON.parse(m[1]);
  src = src.slice(m[0].length)
    .replace(/\{\{ik:(\w+)\}\}/g, (_, k) => ikona(k))
    .replace(/\{\{mk:(\w+)\}\}/g, (_, k) => MK[k])
    .replace(/\{\{demo:(\w+)\}\}/g, (_, k) => DEMO[k])
    .replace(/\{\{(tel|telHref|mejl|adresa|mapa)\}\}/g, (_, k) => FIRMA[k]);
  const neizvrseno = src.match(/\{\{[^}]+\}\}/);
  if (neizvrseno) throw new Error(f + ': nepoznato ' + neizvrseno[0]);
  fs.writeFileSync(path.join(__dirname, f), strana(meta, src.trim(), f));
  console.log('  ' + f);
}
console.log(izvori.length + ' strana.');
