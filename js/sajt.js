/* ===========================================================================
   Connect Software Solutions — sve što se na sajtu pomera.
   Bez biblioteka. Ko u sistemu ima „smanji pokret", dobija mirnu verziju:
   mreža se nacrta jednom, tri tačke stoje kao gotove kartice.
   =========================================================================== */
(function () {
  'use strict';
  var mirno = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var ogr = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var glatko = function (t) { t = ogr(t, 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- zaglavlje: staklo posle prvog skrola, sklanja se pri skrolu nadole ---------- */
  var zag = $('.zaglavlje');
  var traka = $('.napredak');
  var posl = 0;
  function naSkrol() {
    var y = window.scrollY;
    if (zag) {
      zag.classList.toggle('zalepljeno', y > 20);
      zag.classList.toggle('sakriveno', y > 500 && y > posl + 4 && !document.body.classList.contains('meni-otvoren'));
      if (y < posl - 4) zag.classList.remove('sakriveno');
    }
    if (traka) {
      var h = document.documentElement.scrollHeight - innerHeight;
      traka.style.setProperty('--napredak', h > 0 ? y / h : 0);
    }
    posl = y;
  }
  addEventListener('scroll', naSkrol, { passive: true });
  naSkrol();

  var burger = $('.burger');
  if (burger) burger.addEventListener('click', function () {
    var o = document.body.classList.toggle('meni-otvoren');
    burger.setAttribute('aria-expanded', o);
  });
  $$('.mob-meni a').forEach(function (a, i) { a.style.setProperty('--i', i); });

  /* ---------- naslovi reč po reč ---------- */
  $$('[data-split]').forEach(function (el) {
    var i = 0;
    (function obidji(cvor) {
      Array.prototype.slice.call(cvor.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (d) {
            if (!d) return;
            if (/^\s+$/.test(d)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'rec';
            var u = document.createElement('span'); u.textContent = d; s.style.setProperty('--i', i++);
            s.appendChild(u); frag.appendChild(s);
          });
          cvor.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') obidji(n);
      });
    })(el);
  });

  /* ---------- pojavljivanje na skrol ---------- */
  var posmatrac = new IntersectionObserver(function (st) {
    st.forEach(function (s) { if (s.isIntersecting) { s.target.classList.add('u'); posmatrac.unobserve(s.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('[data-r], [data-split]').forEach(function (el) { posmatrac.observe(el); });
  /* deca grupe dobiju redom kašnjenje */
  $$('[data-grupa]').forEach(function (g) { $$('[data-r]', g).forEach(function (el, i) { el.style.setProperty('--i', i); }); });

  /* ---------- reflektor ispod miša (kartice, dugmad) ---------- */
  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest && e.target.closest('.kartica, .dugme');
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- magnetna dugmad ---------- */
  if (!mirno && matchMedia('(hover: hover)').matches) {
    $$('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22) + 'px,' + ((e.clientY - r.top - r.height / 2) * .32) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- QR kodovi u mokapima (izgled, ne pravi sadržaj) ---------- */
  $$('.qr').forEach(function (q) {
    var n = 21, html = '', seme = 7;
    var slucaj = function () { seme = (seme * 9301 + 49297) % 233280; return seme / 233280; };
    var oko = function (x, y) {
      var u = function (ox, oy) {
        var dx = x - ox, dy = y - oy;
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return -1;
        return (dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5)) ? 1 : 0;
      };
      var a = u(0, 0); if (a < 0) a = u(n - 7, 0); if (a < 0) a = u(0, n - 7);
      return a;
    };
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var o = oko(x, y);
      var pun = o >= 0 ? o === 1 : slucaj() > .52;
      html += '<span' + (pun ? '' : ' class="p"') + '></span>';
    }
    q.innerHTML = html;
  });

  /* ---------- mokapi: animacija kreće kad su na ekranu, i ponavlja se ---------- */
  function pokreni(el) {
    el.classList.remove('igra'); void el.offsetWidth; el.classList.add('igra');
  }
  var mkPosmatrac = new IntersectionObserver(function (st) {
    st.forEach(function (s) {
      var el = s.target;
      if (s.isIntersecting && !el._tajmer) {
        if (!el.closest('.ekran') || el.closest('.ekran').classList.contains('akt')) pokreni(el);
        if (!mirno) el._tajmer = setInterval(function () {
          if (!el.closest('.ekran') || el.closest('.ekran').classList.contains('akt')) pokreni(el);
        }, +el.getAttribute('data-ponovi') || 9000);
      } else if (!s.isIntersecting && el._tajmer) { clearInterval(el._tajmer); el._tajmer = null; }
    });
  }, { threshold: .25 });
  $$('[data-mk]').forEach(function (el) { mkPosmatrac.observe(el); });

  /* nagib uređaja prema mišu */
  if (!mirno && matchMedia('(hover: hover)').matches) {
    $$('.uredjaj[data-nagib]').forEach(function (u) {
      var okvir = u.parentElement;
      okvir.addEventListener('pointermove', function (e) {
        var r = okvir.getBoundingClientRect();
        u.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 12 + 'deg');
        u.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 10 + 'deg');
      });
      okvir.addEventListener('pointerleave', function () { u.style.removeProperty('--ry'); u.style.removeProperty('--rx'); });
    });
  }

  /* ---------- vitrina: tekst levo vodi ekran desno ---------- */
  var vitrina = $('.vitrina');
  if (vitrina) {
    var ekrani = $$('.ekran', vitrina), paneli = $$('.panel', vitrina), sjaj = $('.sjaj', vitrina);
    var akt = -1;
    var postavi = function (i) {
      if (i === akt) return; akt = i;
      paneli.forEach(function (p, j) { p.classList.toggle('akt', j === i); });
      ekrani.forEach(function (e, j) {
        e.classList.toggle('akt', j === i);
        if (j === i) { var m = $('[data-mk]', e); if (m) pokreni(m); }
      });
      if (sjaj) sjaj.style.setProperty('--k', getComputedStyle(paneli[i]).getPropertyValue('--k'));
    };
    var vp = new IntersectionObserver(function (st) {
      st.forEach(function (s) { if (s.isIntersecting) postavi(paneli.indexOf(s.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    paneli.forEach(function (p) { vp.observe(p); });
    postavi(0);
  }

  /* ---------- vremenska linija koja se puni ---------- */
  var put = $('.put');
  if (put) {
    var koraci = $$('.korak', put);
    var puni = function () {
      var r = put.getBoundingClientRect();
      var p = ogr((innerHeight * .6 - r.top) / r.height, 0, 1);
      put.style.setProperty('--p', p);
      koraci.forEach(function (k) {
        var kr = k.getBoundingClientRect();
        k.classList.toggle('u', kr.top + 28 < innerHeight * .6);
      });
    };
    addEventListener('scroll', puni, { passive: true }); puni();
  }

  /* ---------- pitanja: glatko otvaranje ---------- */
  $$('.pitanja details').forEach(function (d) {
    var s = $('summary', d), o = $('.odg', d);
    if (!s || !o || mirno) return;
    s.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) {
        var h = o.scrollHeight;
        o.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease' })
          .onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        o.animate([{ height: '0px', opacity: 0 }, { height: o.scrollHeight + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.7,.1,1)' });
      }
    });
  });

  /* ---------- tekuća traka: duplira sadržaj za beskonačan krug ---------- */
  $$('.tekuca-red').forEach(function (r) { r.innerHTML += r.innerHTML; });

  /* ---------- kontakt forma: otvara mejl sa popunjenim upitom ---------- */
  var forma = $('#forma');
  if (forma) forma.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(forma);
    var vrsta = f.get('vrsta') || 'Upit';
    var telo = 'Ime i prezime: ' + f.get('ime') + '\nKompanija: ' + f.get('firma') + '\nTelefon: ' + f.get('tel') +
      '\nE-pošta: ' + f.get('mejl') + '\n\n' + (f.get('poruka') || '');
    location.href = 'mailto:office@connectsoftware.rs?subject=' + encodeURIComponent(vrsta + ' — ' + f.get('firma')) +
      '&body=' + encodeURIComponent(telo);
  });
  var izUrl = new URLSearchParams(location.search).get('upit');
  if (izUrl) { var r = $('input[name="vrsta"][value="' + izUrl + '"]'); if (r) r.checked = true; }

  /* ======================================================================
     HERO: mreža koja se povezuje. Tri veća narandžasta čvora su tri tačke
     iz znaka; po vezama putuju paketi — podaci koji idu kroz firmu.
     ====================================================================== */
  var platno = $('#mreza');
  if (platno) (function () {
    var c = platno.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
    var W, H, cvorovi = [], paketi = [], mis = { x: -9999, y: -9999 }, radi = true;
    function velicina() {
      W = platno.clientWidth; H = platno.clientHeight;
      platno.width = W * dpr; platno.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(ogr(W * H / 14000, 34, 110));
      cvorovi = [];
      for (var i = 0; i < n; i++) cvorovi.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.6 + .8 });
      /* tri glavne tačke, u redu kao u znaku */
      var cx = W > 900 ? W * .74 : W * .5, cy = W > 900 ? H * .42 : H * .78, d = Math.min(W, 1400) * .07;
      for (var t = 0; t < 3; t++) cvorovi.push({ x: cx + (t - 1) * d, y: cy, ox: cx + (t - 1) * d, oy: cy, vx: 0, vy: 0, r: 7, glavni: true, faza: t });
    }
    var DOMET = 150;
    function kadar(vreme) {
      if (!radi) return;
      c.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < cvorovi.length; i++) {
        a = cvorovi[i];
        if (a.glavni) {
          a.x = a.ox + Math.sin(vreme / 1400 + a.faza) * 6; a.y = a.oy + Math.cos(vreme / 1700 + a.faza * 1.3) * 6;
        } else {
          a.x += a.vx; a.y += a.vy;
          if (a.x < -20) a.x = W + 20; if (a.x > W + 20) a.x = -20;
          if (a.y < -20) a.y = H + 20; if (a.y > H + 20) a.y = -20;
          dx = mis.x - a.x; dy = mis.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 180) { a.x += dx / d * .6; a.y += dy / d * .6; }
        }
      }
      for (i = 0; i < cvorovi.length; i++) {
        a = cvorovi[i];
        for (j = i + 1; j < cvorovi.length; j++) {
          b = cvorovi[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
          var dom = (a.glavni || b.glavni) ? DOMET * 1.7 : DOMET;
          if (d < dom * dom) {
            d = Math.sqrt(d);
            var g = (a.glavni || b.glavni);
            c.strokeStyle = g ? 'rgba(245,128,43,' + (1 - d / dom) * .45 + ')' : 'rgba(170,185,210,' + (1 - d / dom) * .18 + ')';
            c.lineWidth = g ? 1 : .7;
            c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
            if (!mirno && Math.random() < (g ? .004 : .0006) && paketi.length < 40) paketi.push({ a: a, b: b, t: 0, v: .008 + Math.random() * .01, g: g });
          }
        }
        dx = mis.x - a.x; dy = mis.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200 && !a.glavni) {
          c.strokeStyle = 'rgba(245,128,43,' + (1 - d / 200) * .5 + ')'; c.lineWidth = .8;
          c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(mis.x, mis.y); c.stroke();
        }
      }
      for (i = paketi.length - 1; i >= 0; i--) {
        var p = paketi[i]; p.t += p.v;
        if (p.t >= 1) { paketi.splice(i, 1); continue; }
        var px = lerp(p.a.x, p.b.x, p.t), py = lerp(p.a.y, p.b.y, p.t);
        c.fillStyle = p.g ? '#ffb27a' : 'rgba(255,255,255,.8)';
        c.beginPath(); c.arc(px, py, p.g ? 2.2 : 1.5, 0, 6.283); c.fill();
      }
      for (i = 0; i < cvorovi.length; i++) {
        a = cvorovi[i];
        if (a.glavni) {
          var pul = (Math.sin(vreme / 600 - a.faza * .9) + 1) / 2;
          c.fillStyle = 'rgba(245,128,43,' + (.12 + pul * .12) + ')';
          c.beginPath(); c.arc(a.x, a.y, a.r * (2.6 + pul * 1.4), 0, 6.283); c.fill();
          c.fillStyle = '#f5802b';
        } else c.fillStyle = 'rgba(200,210,228,.55)';
        c.beginPath(); c.arc(a.x, a.y, a.r, 0, 6.283); c.fill();
      }
      if (!mirno) requestAnimationFrame(kadar);
    }
    velicina();
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(velicina, 150); });
    platno.parentElement.addEventListener('pointermove', function (e) { var r = platno.getBoundingClientRect(); mis.x = e.clientX - r.left; mis.y = e.clientY - r.top; });
    platno.parentElement.addEventListener('pointerleave', function () { mis.x = mis.y = -9999; });
    new IntersectionObserver(function (st) {
      var bio = radi; radi = st[0].isIntersecting;
      if (radi && !bio && !mirno) requestAnimationFrame(kadar);
    }).observe(platno);
    requestAnimationFrame(kadar);
  })();

  /* ======================================================================
     TRI TAČKE: znak firme → tri kruga u bojama proizvoda → tri kartice.
     Sve vodi napredak skrola kroz visok odeljak sa lepljivom scenom.
     ====================================================================== */
  var tacke = $('.tacke');
  if (tacke) (function () {
    var scena = $('.tacke-scena', tacke), el = $$('.tacka', tacke), naslovi = $$('.tacke-naslov .t', tacke);
    var BOJE = [[212, 103, 61], [91, 138, 166], [63, 154, 128]], NAR = [245, 128, 43];
    function kadar() {
      var r = tacke.getBoundingClientRect();
      var p = mirno ? 1 : ogr(-r.top / (r.height - innerHeight), 0, 1);
      var W = scena.clientWidth, H = scena.clientHeight, usko = W < 760;
      /* na telefonu je odeljak kraći, pa tačke ne stoje dugo same na sredini */
      var a = usko ? glatko((p - .04) / .26) : glatko((p - .12) / .28);   /* tačke → krugovi */
      var b = usko ? glatko((p - .4) / .32) : glatko((p - .48) / .3);     /* krugovi → kartice */
      var cw = usko ? W - 32 : Math.min((W - 120) / 3, 360);
      /* na telefonu kartice počinju ispod nadnaslova (naslov se tad skloni), da tekst stane */
      var vrh = usko ? 118 : 210, ch = usko ? Math.min((H - vrh - 36) / 3, 220) : Math.min(H * .52, 420);
      var krug = usko ? Math.min(W * .22, 96) : Math.min(W * .11, 150);
      el.forEach(function (t, i) {
        var o = i - 1;
        var mala = 18;
        var vel = lerp(mala, krug, a);
        var w = lerp(vel, cw, b), h = lerp(vel, ch, b);
        var xKrug = o * lerp(mala + 8, usko ? krug * 1.25 : krug * 1.6, a);
        var xKart = usko ? 0 : o * (cw + 22);
        var yKrug = usko ? 0 : 0;
        var yKart = usko ? (vrh + (H - vrh - 12) / 2) - H * .55 + o * (ch + 12) : H * .03;
        var x = lerp(xKrug, xKart, b), y = lerp(yKrug, yKart, b);
        t.style.width = w + 'px'; t.style.height = h + 'px';
        t.style.borderRadius = lerp(w / 2, 24, b) + 'px';
        t.style.transform = 'translate(' + (x - w / 2) + 'px,' + (y - h / 2) + 'px)';
        var bo = BOJE[i], k = a;
        t.style.background = 'rgb(' + Math.round(lerp(NAR[0], bo[0], k)) + ',' + Math.round(lerp(NAR[1], bo[1], k)) + ',' + Math.round(lerp(NAR[2], bo[2], k)) + ')';
        var ime = $('.tacka-ime', t), sad = $('.tacka-sadrzaj', t);
        ime.style.opacity = ogr(a * 2 - 1, 0, 1) * (1 - ogr(b * 3, 0, 1));
        sad.style.opacity = ogr((b - .6) / .4, 0, 1);
        t.style.pointerEvents = b > .8 ? 'auto' : 'none';
        t.style.overflow = b > .05 ? 'hidden' : 'visible';
      });
      var faza = b > (usko ? .2 : .5) ? 2 : (a > .45 ? 1 : 0);
      naslovi.forEach(function (n, i) { n.classList.toggle('sk', i !== faza); });
    }
    addEventListener('scroll', function () { requestAnimationFrame(kadar); }, { passive: true });
    addEventListener('resize', kadar);
    kadar();
  })();
})();

/* ===========================================================================
   Drugi krug (06.11.): zupčanici, nit, slagalica, vodoravni skrol,
   dekodiranje nadnaslova, tekuća traka po brzini skrola, terminal u heroju.
   =========================================================================== */
(function () {
  'use strict';
  var mirno = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var ogr = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* jedan rAF po kadru za sve što zavisi od skrola */
  var zadaci = [];
  var zakazano = false;
  function naSkrol() { if (!zakazano) { zakazano = true; requestAnimationFrame(function () { zakazano = false; zadaci.forEach(function (f) { f(); }); }); } }
  addEventListener('scroll', naSkrol, { passive: true });
  addEventListener('resize', naSkrol);

  /* ---------- zupčanici: veliki prati skrol, mali ide nazad po odnosu zuba ---------- */
  var zv = $('.z-veliki'), zm = $('.z-mali');
  if (zv && zm) {
    var cv = zv.getAttribute('data-c'), cm = zm.getAttribute('data-c');
    var odnos = (+zv.getAttribute('data-zubi')) / (+zm.getAttribute('data-zubi'));
    var ugao = 0, cilj = 0;
    var vrti = function () {
      ugao += (cilj - ugao) * .12;
      zv.setAttribute('transform', 'rotate(' + (1.5 + ugao).toFixed(2) + ' ' + cv.replace(',', ' ') + ')');
      zm.setAttribute('transform', 'rotate(' + (-3.86 - ugao * odnos).toFixed(2) + ' ' + cm.replace(',', ' ') + ')');
      if (Math.abs(cilj - ugao) > .05) requestAnimationFrame(vrti);
    };
    zadaci.push(function () { cilj = scrollY * .12; if (!mirno) requestAnimationFrame(vrti); });
    vrti();
  }

  /* ---------- nit: trag koji se crta niz celu stranu ---------- */
  var nit = $('.nit');
  if (nit) (function () {
    var NS = 'http://www.w3.org/2000/svg';
    var staza = $('.nit-staza', nit), tok = $('.nit-tok', nit), glava = $('.nit-glava', nit), grupa = $('.nit-cvorovi', nit);
    var main = nit.parentElement, uzorci = [], duz = 0, cvorovi = [], sada = 0, cilj = 0;

    function zaobli(t, r) {
      var d = 'M' + t[0][0] + ',' + t[0][1];
      for (var i = 1; i < t.length - 1; i++) {
        var p = t[i - 1], c = t[i], n = t[i + 1];
        var d1 = Math.hypot(c[0] - p[0], c[1] - p[1]), d2 = Math.hypot(n[0] - c[0], n[1] - c[1]);
        var rr = Math.min(r, d1 / 2, d2 / 2);
        var a = [c[0] - (c[0] - p[0]) / d1 * rr, c[1] - (c[1] - p[1]) / d1 * rr];
        var b = [c[0] + (n[0] - c[0]) / d2 * rr, c[1] + (n[1] - c[1]) / d2 * rr];
        d += 'L' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + 'Q' + c[0] + ',' + c[1] + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1);
      }
      var l = t[t.length - 1];
      return d + 'L' + l[0] + ',' + l[1];
    }

    function gradi() {
      var W = main.clientWidth;
      var sek = Array.prototype.filter.call(main.children, function (e) { return e !== nit && e.offsetHeight > 160; });
      if (sek.length < 2) return;
      var traka = W > 900 ? Math.max(22, Math.min(64, (W - 1200) / 4 + 30)) : 9;
      var strane = [traka, W - traka];
      var t = [], cv = [];
      var prvi = sek[0];
      var y0 = prvi.offsetTop + prvi.offsetHeight - 70;
      t.push([W / 2, y0]);
      var strana = 0;
      var x = W / 2;
      for (var i = 1; i < sek.length; i++) {
        var y = sek[i].offsetTop;
        if (i === 1 || i % 2 === 1) {
          /* prelaz na drugu stranu po spoju odeljaka */
          t.push([x, y]); x = strane[strana]; t.push([x, y]);
          strana = 1 - strana;
          cv.push({ x: x, y: y, smer: x < W / 2 ? 1 : -1 });
        } else {
          cv.push({ x: x, y: y, smer: x < W / 2 ? 1 : -1 });
        }
      }
      var kraj = main.offsetHeight;
      t.push([x, kraj - 2]);
      var d = zaobli(t, 28);
      staza.setAttribute('d', d); tok.setAttribute('d', d);
      duz = tok.getTotalLength();
      tok.style.strokeDasharray = duz + ' ' + duz;
      uzorci = [];
      for (var l = 0; l <= duz; l += 16) uzorci.push([l, tok.getPointAtLength(l).y]);
      uzorci.push([duz, tok.getPointAtLength(duz).y]);
      /* čvorovi: tačka na niti + kratka grana ka sadržaju, kao trag na ploči */
      grupa.innerHTML = '';
      cvorovi = cv.map(function (c) {
        var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'nit-cvor');
        var gx = c.x + c.smer * 34, gy = c.y + 34;
        g.innerHTML = '<path d="M' + c.x + ',' + c.y + ' L' + (c.x + c.smer * 14) + ',' + (c.y + 14) + ' L' + gx + ',' + (c.y + 14) + ' L' + (gx + c.smer * 20) + ',' + gy + '"/>' +
          '<circle class="pad" cx="' + (gx + c.smer * 20) + '" cy="' + gy + '" r="3.5"/>' +
          '<circle class="talas" cx="' + c.x + '" cy="' + c.y + '" r="5"/>' +
          '<circle cx="' + c.x + '" cy="' + c.y + '" r="5"/>';
        grupa.appendChild(g);
        return { el: g, y: c.y };
      });
      cilj = sada = duzinaZa(scrollY + innerHeight * .62);
      crtaj(true);
    }

    function duzinaZa(y) {
      if (!uzorci.length) return 0;
      var lo = 0, hi = uzorci.length - 1;
      if (y <= uzorci[0][1]) return 0;
      while (lo < hi) { var m = (lo + hi + 1) >> 1; if (uzorci[m][1] <= y) lo = m; else hi = m - 1; }
      return uzorci[lo][0];
    }
    function crtaj(odmah) {
      if (!duz) return;
      sada = odmah ? cilj : sada + (cilj - sada) * .14;
      tok.style.strokeDashoffset = duz - sada;
      var p = tok.getPointAtLength(Math.max(sada, .1));
      glava.setAttribute('cx', p.x); glava.setAttribute('cy', p.y);
      glava.style.opacity = sada > 2 && sada < duz - 2 ? 1 : 0;
      cvorovi.forEach(function (c) { c.el.classList.toggle('u', c.y <= p.y + 2); });
      if (!odmah && Math.abs(cilj - sada) > .5) requestAnimationFrame(function () { crtaj(false); });
    }
    zadaci.push(function () { cilj = duzinaZa(scrollY + innerHeight * .62); if (mirno) crtaj(true); else requestAnimationFrame(function () { crtaj(false); }); });
    var rt;
    var ponovo = function () { clearTimeout(rt); rt = setTimeout(gradi, 120); };
    if (window.ResizeObserver) new ResizeObserver(ponovo).observe(main); else addEventListener('resize', ponovo);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ponovo);
    addEventListener('load', ponovo);
    gradi();
  })();

  /* ---------- slagalica: prethodna karta se smanji i potamni ---------- */
  $$('.slagalica').forEach(function (s) {
    var karte = $$('.sl-karta', s);
    karte.forEach(function (k, i) { k.style.setProperty('--i', i); });
    zadaci.push(function () {
      karte.forEach(function (k, i) {
        var sl = karte[i + 1];
        if (!sl) return;
        var r = k.getBoundingClientRect(), rs = sl.getBoundingClientRect();
        var p = ogr(1 - (rs.top - r.top) / r.height, 0, 1);
        k.style.transform = 'scale(' + (1 - p * .06 * (karte.length - i - 1) / (karte.length - 1)).toFixed(4) + ')';
        k.style.filter = 'brightness(' + (1 - p * .35).toFixed(3) + ')';
      });
    });
  });

  /* ---------- vodoravni skrol: visina odeljka = dužina trake ---------- */
  $$('.horiz').forEach(function (h) {
    var traka = $('.horiz-traka', h), nap = $('.horiz-napredak', h);
    var visina = function () { h.style.height = (traka.scrollWidth - innerWidth + innerHeight) + 'px'; };
    visina(); addEventListener('resize', visina);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(visina);
    zadaci.push(function () {
      var r = h.getBoundingClientRect();
      var p = ogr(-r.top / (h.offsetHeight - innerHeight), 0, 1);
      traka.style.transform = 'translateX(' + (-p * (traka.scrollWidth - innerWidth)) + 'px)';
      if (nap) nap.style.setProperty('--p', p);
    });
  });

  /* ---------- nadnaslov se „dekodira" kad uđe u ekran ---------- */
  if (!mirno) {
    var ZN = 'ABCDEFGHIJKLMNOPRSTUVZ0123456789#<>/{}=*';
    var dekodiraj = function (el) {
      var cilj = el.textContent, n = cilj.length, kadar = 0, ukupno = 22;
      var korak = function () {
        kadar++;
        var gotovo = Math.floor(n * kadar / ukupno), s = '';
        for (var i = 0; i < n; i++) s += i < gotovo || cilj[i] === ' ' ? cilj[i] : ZN[(Math.random() * ZN.length) | 0];
        el.textContent = s;
        if (kadar < ukupno) setTimeout(korak, 34); else el.textContent = cilj;
      };
      korak();
    };
    var dp = new IntersectionObserver(function (st) {
      st.forEach(function (s) { if (s.isIntersecting) { dp.unobserve(s.target); setTimeout(function () { dekodiraj(s.target); }, 150); } });
    }, { threshold: .6 });
    $$('.nadnaslov').forEach(function (el) { if (!el.children.length) dp.observe(el); });
  }

  /* ---------- tekuća traka: ubrza kad se skroluje ---------- */
  var redovi = $$('.tekuca-red');
  if (redovi.length && !mirno) {
    var poz = redovi.map(function () { return 0; }), poslY = scrollY, brzina = 0;
    (function tece() {
      var dy = scrollY - poslY; poslY = scrollY;
      brzina += (dy - brzina) * .1;
      redovi.forEach(function (r, i) {
        var pola = r.scrollWidth / 2;
        poz[i] -= .6 + Math.abs(brzina) * .45;
        if (poz[i] <= -pola) poz[i] += pola;
        r.style.transform = 'translateX(' + poz[i].toFixed(1) + 'px)';
      });
      requestAnimationFrame(tece);
    })();
  }

  /* ---------- hero: sadržaj sporije od skrola, pa se rastapa ---------- */
  var heroOmot = $('.hero .omot'), terminal = $('.terminal');
  if (heroOmot && !mirno) zadaci.push(function () {
    var y = scrollY, h = innerHeight;
    /* na telefonu je heroj viši od ekrana: rastapanje bi sakrilo dugmad i brojke pre nego što se vide */
    if (innerWidth < 760) { heroOmot.style.transform = heroOmot.style.opacity = ''; return; }
    if (y > h * 1.2) return;
    heroOmot.style.transform = 'translateY(' + (y * .28) + 'px)';
    heroOmot.style.opacity = ogr(1 - y / (h * .8), 0, 1);
    if (terminal) terminal.style.transform = 'translateY(' + (y * .12) + 'px)';
  });

  /* ---------- narandžasti blok: svetlo prati miša ---------- */
  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest && e.target.closest('.narandzasto');
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- terminal u heroju: konektor pita PANTHEON, Vidik odgovara ---------- */
  var pre = $('.terminal pre');
  if (pre) {
    var LINIJE = [
      ['c', '// konektor → PANTHEON, samo čitanje'],
      ['k', 'SELECT '], ['', 'kupac, SUM(dug) '], ['k', 'FROM '], ['', 'saldakonti'], ['', '\n'],
      ['k', 'WHERE '], ['', 'dospelo < GETDATE()'], ['', '\n\n'],
      ['c', '// vidik → telefon direktora'], ['', '\n'],
      ['s', '✓ 4 kupca kasne više od 90 dana'], ['', '\n'],
      ['s', '✓ POPDV stariji od knjige 28 dana'], ['', '\n'],
      ['s', '✓ 0 otvorenih portova']
    ];
    LINIJE[0][1] += '\n';
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var kucaj = function () {
      var i = 0, j = 0, html = '';
      var korak = function () {
        if (i >= LINIJE.length) { pre.innerHTML = html + '<span class="kursor"></span>'; setTimeout(kucaj, 5200); return; }
        var l = LINIJE[i];
        j++;
        var deo = l[1].slice(0, j);
        pre.innerHTML = html + (l[0] ? '<span class="' + l[0] + '">' + esc(deo) + '</span>' : esc(deo)) + '<span class="kursor"></span>';
        if (j >= l[1].length) { html += l[0] ? '<span class="' + l[0] + '">' + esc(l[1]) + '</span>' : esc(l[1]); i++; j = 0; }
        setTimeout(korak, l[1] === '\n' || l[1] === '\n\n' ? 160 : 22 + Math.random() * 30);
      };
      korak();
    };
    if (mirno) pre.innerHTML = LINIJE.map(function (l) { return l[0] ? '<span class="' + l[0] + '">' + esc(l[1]) + '</span>' : esc(l[1]); }).join('');
    else setTimeout(kucaj, 1200);
  }

  naSkrol();
})();

/* ---------- implementacija: tabla prati tačku na ekranu i broji štiklirane ---------- */
(function () {
  'use strict';
  var tabla = document.querySelector('.tabla');
  if (!tabla) return;
  var faktori = Array.prototype.slice.call(document.querySelectorAll('.faktor'));
  var red = tabla.querySelector('.tabla-br-red'), naslov = tabla.querySelector('.tabla-naslov');
  var prov = tabla.querySelector('.tabla-prov'), tok = tabla.querySelector('.pr-tok'), traka = tabla.querySelector('.tabla-traka');
  var akt = 0, OBIM = 326.7, tajmer;
  function postavi(i) {
    if (i === akt || i < 0) return;
    akt = i;
    faktori.forEach(function (f, j) { f.classList.toggle('akt', j === i); });
    traka.style.setProperty('--p', (i + 1) / faktori.length);
    clearTimeout(tajmer);
    red.classList.add('ide');
    tajmer = setTimeout(function () {
      red.textContent = String(i + 1).padStart(2, '0');
      naslov.textContent = faktori[i].getAttribute('data-naslov');
      red.classList.remove('ide'); red.classList.add('dolazi');
      void red.offsetWidth; red.classList.remove('dolazi');
    }, 200);
  }
  var io = new IntersectionObserver(function (st) {
    st.forEach(function (s) { if (s.isIntersecting) postavi(faktori.indexOf(s.target)); });
  }, { rootMargin: '-40% 0px -50% 0px' });
  faktori.forEach(function (f) { io.observe(f); });

  function brojanje() {
    var n = faktori.filter(function (f) { return f.classList.contains('ok'); }).length;
    prov.textContent = n;
    tok.style.strokeDashoffset = OBIM * (1 - n / faktori.length);
    tabla.classList.toggle('sve', n === faktori.length);
  }
  faktori.forEach(function (f) {
    var b = f.querySelector('.f-dugme');
    b.addEventListener('click', function () {
      var da = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(da));
      b.textContent = da ? 'Provereno ✓' : 'Provereno';
      f.classList.toggle('ok', da);
      brojanje();
    });
  });
  faktori[0].classList.add('akt');
  traka.style.setProperty('--p', 1 / faktori.length);
})();
