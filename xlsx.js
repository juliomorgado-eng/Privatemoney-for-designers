import ExcelJS from "exceljs";
import sharp from "sharp";

const INK = "FF262626";
const GREEN = "FF00DC8D";
const THUMB = 120; // px

// speakers: [{ name, company, role, bio, file, jpg: Buffer|null }]
export async function buildXlsx(speakers) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Privatemoney-for-designers";
  const ws = wb.addWorksheet("Speakers", { views: [{ state: "frozen", ySplit: 1 }] });

  ws.columns = [
    { header: "#", key: "n", width: 5 },
    { header: "Headshot", key: "photo", width: 18 },
    { header: "Nombre", key: "name", width: 24 },
    { header: "Empresa", key: "company", width: 26 },
    { header: "Cargo", key: "role", width: 30 },
    { header: "Bio", key: "bio", width: 80 },
    { header: "Archivo JPG", key: "file", width: 24 },
  ];

  const head = ws.getRow(1);
  head.height = 26;
  head.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Arial", size: 11 };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
    c.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    c.border = { bottom: { style: "medium", color: { argb: GREEN } } };
  });

  for (const [i, s] of speakers.entries()) {
    const row = ws.addRow({ n: i + 1, name: s.name, company: s.company, role: s.role, bio: s.bio, file: s.jpg ? s.file : "" });
    // alto de fila: lo que pida la foto o la bio, lo que sea mayor (Excel no autoajusta con imágenes)
    const bioLines = (s.bio || "").split("\n").reduce((n, l) => n + Math.max(1, Math.ceil(l.length / 88)), 0);
    row.height = Math.max(THUMB * 0.75 + 12, bioLines * 13 + 10); // pt
    row.eachCell({ includeEmpty: true }, (c) => {
      c.font = { name: "Arial", size: 10, color: { argb: INK } };
      c.alignment = { vertical: "top", wrapText: true, indent: c.col === 1 ? 0 : 1 };
      c.border = { bottom: { style: "thin", color: { argb: "FFDDDDDD" } } };
    });
    row.getCell("name").font = { name: "Arial", size: 11, bold: true, color: { argb: INK } };

    if (s.jpg) {
      const thumb = await sharp(s.jpg).resize(THUMB, THUMB, { fit: "cover", position: "attention" }).jpeg({ quality: 82 }).toBuffer();
      const id = wb.addImage({ buffer: thumb, extension: "jpeg" });
      ws.addImage(id, { tl: { col: 1.08, row: row.number - 1 + 0.06 }, ext: { width: THUMB, height: THUMB }, editAs: "oneCell" });
    }
  }

  ws.autoFilter = { from: "A1", to: "G1" };
  return Buffer.from(await wb.xlsx.writeBuffer());
}
