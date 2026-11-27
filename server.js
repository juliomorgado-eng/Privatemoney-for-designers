import http from "node:http";
import sharp from "sharp";
import archiver from "archiver";
import { readFile } from "node:fs/promises";
import { page } from "./page.js";
import { buildXlsx } from "./xlsx.js";

const BRAND = {
  "/brand/logo_rev.svg": "image/svg+xml",
  "/brand/icon.svg": "image/svg+xml",
  "/brand/icon_rev.svg": "image/svg+xml",
  "/brand/fonts/PPNeueMontreal-Regular.woff2": "font/woff2",
  "/brand/fonts/PPNeueMontreal-Book.woff2": "font/woff2",
  "/brand/fonts/PPNeueMontrealMono-Regular.woff2": "font/woff2",
  "/brand/fonts/KeplerStd-MediumCnItDisp.woff2": "font/woff2",
};

const { AIRTABLE_TOKEN, AIRTABLE_BASE, AIRTABLE_TABLE } = process.env;
const PORT = Number(process.env.PORT) || 3000;
if (!AIRTABLE_TOKEN || !AIRTABLE_BASE || !AIRTABLE_TABLE) {
  console.error("Faltan AIRTABLE_TOKEN / AIRTABLE_BASE / AIRTABLE_TABLE en .env");
  process.exit(1);
}

const FIELDS = ["First Name", "Last Name", "Company", "Role or Title", "Bio", "Headshot"];
const CACHE_MS = 5 * 60 * 1000;

let cache = { at: 0, speakers: [] };
const jpgCache = new Map(); // attachment id -> Buffer

function slug(first = "", last = "") {
  const base = `${first} ${last}`
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 _-]/g, "")
    .trim().replace(/\s+/g, "-");
  return base || "speaker";
}

async function fetchAllRecords() {
  const records = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`);
    FIELDS.forEach((f) => url.searchParams.append("fields[]", f));
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);
  return records;
}

async function getSpeakers(force = false) {
  if (!force && Date.now() - cache.at < CACHE_MS) return cache.speakers;
  const records = await fetchAllRecords();
  const used = new Map();
  const speakers = records
    .map((r) => {
      const f = r.fields;
      const first = (f["First Name"] || "").trim();
      const last = (f["Last Name"] || "").trim();
      let file = slug(first, last);
      const n = (used.get(file) || 0) + 1;
      used.set(file, n);
      if (n > 1) file += `-${n}`;
      const att = (f.Headshot || [])[0];
      return {
        name: `${first} ${last}`.trim(),
        company: f.Company || "",
        role: f["Role or Title"] || "",
        bio: f.Bio || "",
        file: `${file}.jpg`,
        headshot: att ? `/headshots/${encodeURIComponent(file)}.jpg` : null,
        pack: `/speakers/${encodeURIComponent(file)}.zip`,
        _att: att ? { id: att.id, url: att.url } : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  cache = { at: Date.now(), speakers };
  return speakers;
}

async function getJpg(att) {
  if (jpgCache.has(att.id)) return jpgCache.get(att.id);
  const res = await fetch(att.url);
  if (!res.ok) throw new Error(`Headshot ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const out = await sharp(input)
    .rotate()
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
  jpgCache.set(att.id, out);
  return out;
}

async function withJpgs(force) {
  const speakers = await getSpeakers(force);
  return Promise.all(speakers.map(async (s) => ({ ...s, jpg: s._att ? await getJpg(s._att) : null })));
}

const publicView = (s) => ({ name: s.name, company: s.company, role: s.role, bio: s.bio, headshot: s.headshot, pack: s.pack });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const force = url.searchParams.has("refresh");
  try {
    if (BRAND[url.pathname]) {
      const buf = await readFile(new URL("." + url.pathname, import.meta.url));
      res.writeHead(200, { "Content-Type": BRAND[url.pathname], "Cache-Control": "public, max-age=86400" });
      return res.end(buf);
    }

    if (url.pathname === "/") {
      const speakers = await getSpeakers(force);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(page(speakers, { updatedAt: new Date(cache.at) }));
    }

    if (url.pathname === "/api/speakers") {
      const speakers = await getSpeakers(force);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify(speakers.map(publicView), null, 2));
    }

    if (url.pathname === "/speakers.xlsx") {
      const xlsx = await buildXlsx(await withJpgs(force));
      res.writeHead(200, {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="speakers.xlsx"',
      });
      return res.end(xlsx);
    }

    if (url.pathname === "/headshots.zip") {
      const all = await withJpgs(force);
      const files = all.filter((s) => s.jpg).map((s) => [`headshots/${s.file}`, s.jpg]);
      files.unshift(["speakers.xlsx", await buildXlsx(all)]);
      res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="headshots.zip"',
      });
      const zip = archiver("zip", { store: true });
      zip.on("error", (e) => res.destroy(e));
      zip.pipe(res);
      for (const [name, buf] of files) zip.append(buf, { name });
      return zip.finalize();
    }

    const pk = url.pathname.match(/^\/speakers\/([^/]+)\.zip$/);
    if (pk) {
      const base = decodeURIComponent(pk[1]);
      const s = (await withJpgs(force)).find((x) => x.file === `${base}.jpg`);
      if (!s) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("No encontrado");
      }
      const txt = [s.name, [s.role, s.company].filter(Boolean).join(" · "), "", s.bio, ""].join("\n");
      res.writeHead(200, { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${base}.zip"` });
      const zip = archiver("zip", { store: true });
      zip.on("error", (e) => res.destroy(e));
      zip.pipe(res);
      if (s.jpg) zip.append(s.jpg, { name: s.file });
      zip.append(txt, { name: `${base}.txt` });
      return zip.finalize();
    }

    const m = url.pathname.match(/^\/headshots\/([^/]+)\.jpg$/);
    if (m) {
      const file = `${decodeURIComponent(m[1])}.jpg`;
      let s = (await getSpeakers(force)).find((x) => x.file === file);
      if (s && !s._att) s = null;
      if (!s) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("No encontrado");
      }
      let buf;
      try {
        buf = await getJpg(s._att);
      } catch {
        // URL de Airtable expirada: refrescar y reintentar una vez
        s = (await getSpeakers(true)).find((x) => x.file === file);
        buf = await getJpg(s._att);
      }
      const headers = { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=300" };
      if (url.searchParams.has("download")) headers["Content-Disposition"] = `attachment; filename="${file}"`;
      res.writeHead(200, headers);
      return res.end(buf);
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("No encontrado");
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Error: " + e.message);
  }
});

server.listen(PORT, () => console.log(`Speakers en http://localhost:${PORT}`));
