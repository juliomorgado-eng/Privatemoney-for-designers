const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const ARROW = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 2v9m0 0l-4-4m4 4l4-4M3 14h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const CSS = `
@font-face{font-family:Montreal;src:url(/brand/fonts/PPNeueMontreal-Regular.woff2) format("woff2");font-weight:400 500;font-display:swap}
@font-face{font-family:MontrealBook;src:url(/brand/fonts/PPNeueMontreal-Book.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:MontrealMono;src:url(/brand/fonts/PPNeueMontrealMono-Regular.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:Kepler;src:url(/brand/fonts/KeplerStd-MediumCnItDisp.woff2) format("woff2");font-weight:500;font-style:italic;font-display:swap}

:root{
  --paper:#f5f5f5;--panel:#ececec;--ink:#262626;--ink-2:#6c675f;--white:#fff;
  --line:rgb(28 25 23/.2);--line-strong:rgb(28 25 23/.5);
  --green:#00dc8d;--green-text:#1f6b45;--on-dark:#f5f4f1;--on-dark-2:rgb(245 244 241/.65);--line-on-dark:rgb(245 244 241/.18);
  --sans:Montreal,ui-sans-serif,system-ui,sans-serif;--text:MontrealBook,Montreal,ui-sans-serif,system-ui,sans-serif;
  --mono:MontrealMono,ui-monospace,monospace;--accent:Kepler,Georgia,serif;
  --r-sm:4px;--r-md:8px;--r-lg:16px;
  --m:clamp(20px,5.3vw,100px);
  /* escala de espaciado de n-cms (tokens.css §3) */
  --s2:8px;--s3:12px;--s4:16px;--s5:24px;--s6:32px;--s7:48px;--s8:64px;--s9:96px;
  --ease:cubic-bezier(.16,1,.3,1);--dur:320ms;
}
@media (prefers-reduced-motion:reduce){:root{--dur:0ms}}
*{box-sizing:border-box}
html{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
body{margin:0;background:var(--paper);color:var(--ink);font:400 1rem/1.55 var(--text)}
a{color:inherit}
/* branding: títulos en Montreal Book, acento en Kepler */
h1,h2,h3{font-family:var(--text);text-wrap:balance}
p{text-wrap:pretty}

/* Hero */
.hero{background:var(--ink);color:var(--on-dark);padding:0 var(--m)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px;border-bottom:1px solid var(--line-on-dark)}
.nav img{height:26px;display:block}
.label{font:400 .8125rem/1 var(--mono);letter-spacing:.2em;text-transform:uppercase}
.nav .label{color:var(--on-dark-2)}
.intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,440px);align-items:start;gap:var(--s7) var(--s8);padding:var(--s8) 0 var(--s7)}
.intro .label{color:var(--green);display:flex;gap:var(--s3);align-items:center;margin-bottom:var(--s5)}
.intro .label::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--green)}
h1{margin:0;font:400 clamp(3rem,1.514rem + 6.095vw,7rem)/.95 var(--text);letter-spacing:-.0185em}
h1 em{font-family:var(--accent);font-style:italic;font-weight:500;font-size:1.18em;letter-spacing:-.02em;color:var(--green);padding-right:.04em}
.count{font:400 clamp(1.125rem,.911rem + .446vw,1.3125rem)/1.4 var(--text);color:var(--on-dark-2);max-width:40ch;margin:var(--s5) 0 0}

.downloads{display:grid;gap:var(--s3)}
.intro .downloads .dl-head{color:var(--on-dark-2);margin-bottom:var(--s3)}
.intro .downloads .dl-head::before{background:var(--on-dark-2)}
.opt{display:grid;grid-template-columns:1fr auto;gap:var(--s2) var(--s5);align-items:center;padding:var(--s4) var(--s5);border-radius:var(--r-md);text-decoration:none;
  color:var(--on-dark);box-shadow:inset 0 0 0 1px var(--line-on-dark);transition:box-shadow var(--dur) var(--ease),background var(--dur) var(--ease),transform var(--dur) var(--ease)}
.opt:hover{box-shadow:inset 0 0 0 1px var(--green)}
.opt:active{transform:scale(.985)}
.opt:focus-visible{outline:2px solid var(--green);outline-offset:3px}
.opt .t{font:400 1.25rem/1.15 var(--text);letter-spacing:-.005em;display:flex;align-items:baseline;gap:10px}
.opt .tag{font:400 .75rem/1 var(--mono);letter-spacing:.12em;padding:5px 7px;border-radius:var(--r-sm);box-shadow:inset 0 0 0 1px currentColor;opacity:.7}
.opt .d{grid-column:1;font-size:.9rem;line-height:1.45;color:var(--on-dark-2)}
.opt .ic{grid-row:1/span 2;grid-column:2;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1px var(--line-on-dark);transition:background var(--dur) var(--ease),color var(--dur) var(--ease)}
.opt:hover .ic{background:var(--green);color:var(--ink);box-shadow:none}
.opt.primary{background:var(--green);color:var(--ink);box-shadow:none}
.opt.primary .d{color:rgb(38 38 38/.72)}
.opt.primary .ic{background:var(--ink);color:var(--green);box-shadow:none}
.opt.primary:hover{background:#3df0ae}
.dl-chip:focus-visible,.dl:focus-visible,.more:focus-visible{outline:2px solid var(--green);outline-offset:3px}

/* Grid */
main{padding:var(--s8) var(--m) var(--s9)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:var(--s7) var(--s5)}
.card{display:flex;flex-direction:column}
.photo{position:relative;aspect-ratio:4/5;border-radius:var(--r-md);overflow:hidden;background:var(--panel)}
.photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 900ms var(--ease)}
.card:hover .photo img{transform:scale(1.03)}
.photo .noimg{position:absolute;inset:0;display:grid;place-items:center;color:var(--ink-2)}
.dl-chip{position:absolute;right:12px;bottom:12px;height:40px;padding:0 16px;border-radius:999px;display:flex;align-items:center;gap:8px;background:var(--green);color:var(--ink);
  font:400 .875rem/1 var(--sans);text-decoration:none;
  opacity:0;transform:translateY(6px);transition:opacity var(--dur) var(--ease),transform var(--dur) var(--ease)}
.card:hover .dl-chip,.dl-chip:focus-visible{opacity:1;transform:none}
@media (hover:none){.dl-chip{opacity:1;transform:none}}
.idx{font:400 .8125rem/1 var(--mono);letter-spacing:.2em;color:var(--ink-2);margin:var(--s4) 0 var(--s3);display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:var(--s3)}
h2{margin:0;font:400 clamp(1.5rem,1.314rem + .762vw,2rem)/1.1 var(--text);letter-spacing:-.005em}
.role{margin:var(--s2) 0 0;font-size:.9375rem;color:var(--ink-2);line-height:1.4}
.role b{font-weight:400;color:var(--ink)}
.bio{margin:var(--s4) 0 0;font-size:.9375rem;line-height:1.6;color:#3b3833;white-space:pre-line;
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:5;overflow:hidden}
.card.open .bio{-webkit-line-clamp:unset;display:block}
.actions{display:flex;justify-content:space-between;align-items:center;gap:var(--s4);margin-top:auto;padding-top:var(--s4)}
.more{background:none;border:0;padding:0;font:400 .8125rem/1 var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--ink);cursor:pointer;
  border-bottom:1px solid var(--line-strong);padding-bottom:4px}
.more:hover{border-color:var(--ink)}
.dl{display:inline-flex;align-items:center;gap:.4rem;font:400 .8125rem/1 var(--mono);color:var(--green-text);text-decoration:none;padding-bottom:4px;border-bottom:1px solid transparent}
.dl:hover{border-color:var(--green-text)}

footer{border-top:1px solid var(--line);margin:0 var(--m);padding:var(--s5) 0 var(--s6);display:flex;justify-content:space-between;align-items:center;gap:1rem;color:var(--ink-2)}
footer img{height:22px;display:block}
footer a{color:var(--ink);text-underline-offset:3px}

@media (max-width:900px){.intro{grid-template-columns:1fr;padding:var(--s7) 0 var(--s6)}main{padding:var(--s7) var(--m) var(--s8)}}
@media (max-width:560px){.nav .label{display:none}}
`;

export function page(speakers, { updatedAt = new Date() } = {}) {
  const pad = (n) => String(n).padStart(2, "0");
  const cards = speakers
    .map((s, i) => {
      const meta = [s.role ? esc(s.role) : "", s.company ? `<b>${esc(s.company)}</b>` : ""].filter(Boolean).join(" · ");
      return `
      <article class="card">
        <div class="photo">
          ${s.headshot ? `<img src="${s.headshot}" alt="${esc(s.name)}" loading="lazy" decoding="async">` : `<div class="noimg label">Sin foto</div>`}
          ${s.headshot ? `<a class="dl-chip" href="${s.headshot}?download=1" title="Descargar ${esc(s.file)}">${ARROW} Foto</a>` : ""}
        </div>
        <div class="idx"><span>${pad(i + 1)}</span><span>${esc(s.file)}</span></div>
        <h2>${esc(s.name)}</h2>
        <p class="role">${meta}</p>
        ${s.bio ? `<p class="bio">${esc(s.bio)}</p>` : ""}
        <div class="actions">
          ${s.bio ? `<button class="more" type="button" aria-expanded="false">Leer bio</button>` : "<span></span>"}
          ${s.headshot ? `<a class="dl" href="${s.pack}" title="ZIP con ${esc(s.file)} y la bio en texto">${ARROW} Foto + bio</a>` : ""}
        </div>
      </article>`;
    })
    .join("");

  const time = updatedAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Privatemoney for Designers · NEAR</title>
<link rel="icon" href="/brand/icon.svg" type="image/svg+xml">
<link rel="preload" href="/brand/fonts/PPNeueMontreal-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/brand/fonts/KeplerStd-MediumCnItDisp.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style></head><body>
<header class="hero">
  <nav class="nav"><img src="/brand/logo_rev.svg" alt="NEAR"><span class="label">Privatemoney for Designers</span></nav>
  <div class="intro">
    <div>
      <div class="label">Onboarded speakers</div>
      <h1>Los <em>speakers</em></h1>
      <p class="count">${speakers.length} speakers confirmados, con su bio y su headshot listos para descargar.</p>
    </div>
    <div class="downloads">
      <div class="label dl-head">Descargar los ${speakers.length}</div>
      <a class="opt" href="/speakers.xlsx">
        <span class="t">Solo la tabla <span class="tag">XLSX</span></span>
        <span class="d">Nombre, empresa, cargo y bio en un Excel, con fotos en miniatura. Para revisar o compartir.</span>
        <span class="ic">${ARROW}</span>
      </a>
      <a class="opt primary" href="/headshots.zip">
        <span class="t">Paquete completo <span class="tag">ZIP</span></span>
        <span class="d">El mismo Excel y los ${speakers.length} headshots en alta resolución (JPG), cada uno con el nombre del speaker. Para diseño y web.</span>
        <span class="ic">${ARROW}</span>
      </a>
    </div>
  </div>
</header>
<main><div class="grid">${cards}</div></main>
<footer>
  <img src="/brand/icon.svg" alt="">
  <span class="label">Actualizado ${esc(time)} · <a href="/?refresh=1">Refrescar</a></span>
</footer>
<script>
document.querySelectorAll(".more").forEach(b=>{
  const card=b.closest(".card"),bio=card.querySelector(".bio");
  if(bio&&bio.scrollHeight<=bio.clientHeight+2){b.style.visibility="hidden";return}
  b.addEventListener("click",()=>{const o=card.classList.toggle("open");b.setAttribute("aria-expanded",o);b.textContent=o?"Cerrar":"Leer bio"});
});
</script>
</body></html>`;
}
